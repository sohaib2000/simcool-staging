'use client';

import React, { useCallback, useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { BASE_URL } from '@/config/constant';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { RootState } from '@/redux/store/store';
import { Stripe, loadStripe } from '@stripe/stripe-js';

import Alert from '../Alert';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';

// Types
export interface PaymentGateway {
    image: string;
    value: string;
    status: string | number; // "1" or "0" or 1 or 0
}

export interface PaymentGatewayData {
    [key: string]: PaymentGateway;
}

export interface PaymentGatewayResponse {
    success: boolean;
    data: string; // JSON string
    message: string;
}

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    esimPackageId: number;
    iccid?: string;
}

export interface EsimOrderData {
    esim_order_id: number;
    gateway_order_id: string;
    client_secret?: string; // For Stripe
    checkout_url?: string; // For Cashfree/other redirects
    payment_session_id?: string; // For Cashfree drop checkout
    amount: number;
    currency: string;
    gateway_key: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    iccid: string | null;
}

export interface EsimOrderResponse {
    success: boolean;
    data: EsimOrderData;
    message: string;
}

// Razorpay types
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    modal: {
        ondismiss: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    payment_gateway: 'Razorpay';
}

interface RazorpayInstance {
    open(): void;
}

// Cashfree types
interface CashfreeCheckoutOptions {
    paymentSessionId: string | undefined;
    redirectTarget: string;
    gateway_order_id: string;
    appearance?: {
        width?: string;
        height?: string;
    };
}

interface CashfreeResult {
    error?: {
        message?: string;
    };
    paymentDetails?: {
        paymentId: string;
        orderId: string;
    };
}

interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<CashfreeResult>;
}

// Payment success payload types
interface RazorpayPaymentPayload {
    payment_gateway: 'Razorpay';
    razorpay_payment_id: string;
    gateway_order_id: string;
    razorpay_signature: string;
}

interface StripePaymentPayload {
    payment_gateway: 'Stripe';
    gateway_order_id: string;
    client_secret?: string;
}

interface CashfreePaymentPayload {
    payment_gateway: 'Cashfree';
    payment_id: string;
    gateway_order_id: string;
}

type PaymentPayload = RazorpayPaymentPayload | StripePaymentPayload | CashfreePaymentPayload;

// Declare payment gateways on window object
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
        Cashfree: (config: { mode: string }) => CashfreeInstance;
    }
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onOpenChange, esimPackageId, iccid }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const userRedux = useSelector((state: RootState) => state.user.user);

    const { data: paymentPageList, isLoading } = useProtectedApiHandler<PaymentGatewayResponse>({
        url: '/payment/gateways'
    });

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    const parsedData = React.useMemo<PaymentGatewayData>(() => {
        if (!paymentPageList?.data) return {};
        try {
            return JSON.parse(paymentPageList.data) as PaymentGatewayData;
        } catch {
            return {};
        }
    }, [paymentPageList]);

    const { mutateAsync: createOrder } = useUserMutation<EsimOrderResponse>({
        url: '/orders',
        method: 'POST'
    });

    const { mutateAsync: verifyPaymentAsync } = useUserMutation<{ success: boolean; message?: string }>({
        url: '/payment/verifyPayment',
        method: 'POST'
    });

    // Load external scripts dynamically
    const loadScript = (src: string): Promise<boolean> => {
        return new Promise((resolve) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                console.error(`❌ Failed to load: ${src}`);
                resolve(false);
            };
            document.head.appendChild(script);
        });
    };

    const handleConfirm = async (): Promise<void> => {
        if (!selected) return;
        setLoading(true);
        setProcessingPayment(true);
        onOpenChange(false);
        setSelected(null);

        try {
            const data = await createOrder({
                esim_package_id: esimPackageId,
                payment_gateway: selected,
                iccid: iccid || null
            });

            if (!data?.success) {
                throw new Error(data?.message || 'Order creation failed');
            }

            const order = data?.data;
            if (!order) {
                throw new Error('No order data returned');
            }

            // Open relevant gateway checkout
            switch (selected) {
                case 'Razorpay':
                    await openRazorpay(order);
                    break;
                case 'Stripe':
                    await openStripe(order);
                    break;
                case 'Cashfree':
                    await openCashfree(order);
                    break;
                default:
                    throw new Error(`Unsupported gateway: ${selected}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            showAlertMessage(errorMessage, 'error');
            // alert(errorMessage);
            setProcessingPayment(false);
        } finally {
            setLoading(false);
        }
    };

    // Razorpay Checkout
    const openRazorpay = async (order: EsimOrderData): Promise<void> => {
        try {
            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!scriptLoaded) {
                    throw new Error('Failed to load Razorpay SDK');
                }
            }

            const options: RazorpayOptions = {
                key: order.gateway_key,
                amount: order.amount * 100, // Convert to paise
                currency: order.currency,
                name: order.name,
                description: order.description,
                order_id: order.gateway_order_id,
                handler: async function (response: RazorpayResponse) {
                    await handlePaymentSuccess({
                        payment_gateway: 'Razorpay',
                        gateway_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });
                },
                prefill: {
                    name: order.name,
                    email: order.email,
                    contact: order.phone
                },
                theme: {
                    color: '#3399cc'
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Razorpay error:', error);
            throw error;
        }
    };

    // Stripe Checkout - Fixed Implementation
    const openStripe = async (order: EsimOrderData): Promise<void> => {
        try {
            // If there's a checkout URL, redirect to it (recommended approach)
            if (order.checkout_url) {
                window.location.href = order.checkout_url;
                return;
            }

            // If there's a client_secret, use Stripe Payment Element
            if (order.client_secret) {
                // Load Stripe.js
                const stripe = await loadStripe(order.gateway_key);
                if (!stripe) {
                    throw new Error('Failed to load Stripe');
                }

                // Create overlay and container
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                    backdrop-filter: blur(4px);
                `;

                const paymentContainer = document.createElement('div');
                paymentContainer.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90%;
                    max-width: 500px;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;

                // Add elements to DOM
                document.body.appendChild(overlay);
                document.body.appendChild(paymentContainer);

                // Create Stripe Elements
                const elements = stripe.elements({
                    clientSecret: order.client_secret,
                    appearance: {
                        theme: 'stripe',
                        variables: {
                            colorPrimary: '#0570de',
                            colorBackground: '#ffffff',
                            colorText: '#30313d',
                            colorDanger: '#df1b41',
                            fontFamily: 'Ideal Sans, system-ui, sans-serif',
                            spacingUnit: '2px',
                            borderRadius: '4px'
                        }
                    }
                });

                const paymentElement = elements.create('payment');

                // Create form HTML
                paymentContainer.innerHTML = `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">Complete Payment</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">Amount: ${order.currency} ${(order.amount / 100).toFixed(2)}</p>
                    </div>
                    <div id="payment-element" style="margin-bottom: 20px;"></div>
                    <div id="stripe-error" style="color: #df1b41; margin-bottom: 16px; text-align: center; font-size: 14px; min-height: 20px;"></div>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="stripe-cancel" style="
                            padding: 12px 24px; 
                            border: 1px solid #d1d5db; 
                            background: white; 
                            color: #374151;
                            border-radius: 6px; 
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                        ">Cancel</button>
                        <button id="stripe-submit" style="
                            padding: 12px 24px; 
                            background: #635BFF; 
                            color: white; 
                            border: none; 
                            border-radius: 6px; 
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            min-width: 120px;
                        ">Pay Now</button>
                    </div>
                `;

                // Mount payment element
                paymentElement.mount('#payment-element');

                // Get elements
                const submitButton = paymentContainer.querySelector('#stripe-submit') as HTMLButtonElement;
                const cancelButton = paymentContainer.querySelector('#stripe-cancel') as HTMLButtonElement;
                const errorElement = paymentContainer.querySelector('#stripe-error') as HTMLDivElement;

                const cleanup = () => {
                    try {
                        if (document.body.contains(overlay)) document.body.removeChild(overlay);
                        if (document.body.contains(paymentContainer)) document.body.removeChild(paymentContainer);
                    } catch (e) {
                        console.error('Cleanup error:', e);
                    }
                    setProcessingPayment(false);
                };

                // Event handlers
                cancelButton.addEventListener('click', cleanup);
                overlay.addEventListener('click', cleanup);

                submitButton.addEventListener('click', async (e) => {
                    e.preventDefault();

                    if (!submitButton || submitButton.disabled) return;

                    submitButton.disabled = true;
                    submitButton.textContent = 'Processing...';
                    errorElement.textContent = '';

                    try {
                        const { error, paymentIntent } = await stripe.confirmPayment({
                            elements,
                            redirect: 'if_required',
                            confirmParams: {
                                return_url: `${window.location.origin}/payment/success`
                            }
                        });

                        if (error) {
                            console.error('Stripe payment error:', error);
                            errorElement.textContent = error.message || 'Payment failed. Please try again.';
                            submitButton.disabled = false;
                            submitButton.textContent = 'Pay Now';
                        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                            cleanup();
                            await handlePaymentSuccess({
                                payment_gateway: 'Stripe',
                                gateway_order_id: paymentIntent.id,
                                client_secret: order.client_secret
                            });
                        } else {
                            errorElement.textContent = 'Payment processing failed. Please try again.';
                            submitButton.disabled = false;
                            submitButton.textContent = 'Pay Now';
                        }
                    } catch (confirmError) {
                        console.error('Payment confirmation error:', confirmError);
                        errorElement.textContent = 'An unexpected error occurred. Please try again.';
                        submitButton.disabled = false;
                        submitButton.textContent = 'Pay Now';
                    }
                });

                // Handle hover effects
                cancelButton.addEventListener('mouseenter', () => {
                    cancelButton.style.backgroundColor = '#f3f4f6';
                });
                cancelButton.addEventListener('mouseleave', () => {
                    cancelButton.style.backgroundColor = 'white';
                });

                submitButton.addEventListener('mouseenter', () => {
                    if (!submitButton.disabled) {
                        submitButton.style.backgroundColor = '#5a52d5';
                    }
                });
                submitButton.addEventListener('mouseleave', () => {
                    if (!submitButton.disabled) {
                        submitButton.style.backgroundColor = '#635BFF';
                    }
                });
            } else {
                throw new Error('No Stripe checkout URL or client secret provided');
            }
        } catch (error) {
            console.error('Stripe error:', error);
            setProcessingPayment(false);
            throw error;
        }
    };

    // Cashfree Checkout
    const openCashfree = async (order: EsimOrderData): Promise<void> => {
        try {
            if (order.checkout_url) {
                // Store order info for callback handling
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    sessionStorage.setItem(
                        'pending_order',
                        JSON.stringify({
                            order_id: order.gateway_order_id,
                            payment_getway: 'Cashfree'
                        })
                    );
                }

                window.location.href = order.checkout_url;
                return;
            }

            // Try to load Cashfree SDK and use drop checkout
            const scriptLoaded = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');

            if (!scriptLoaded || !window.Cashfree) {
                throw new Error('Cashfree SDK not available and no checkout URL provided');
            }

            const cashfree = window.Cashfree({
                mode: 'sandbox' // Change to "production" for live
            });

            const checkoutOptions: CashfreeCheckoutOptions = {
                gateway_order_id: order.gateway_order_id,
                paymentSessionId: order.payment_session_id,
                redirectTarget: '_modal',
                appearance: {
                    width: '400px',
                    height: '700px'
                }
            };

            const result = await cashfree.checkout(checkoutOptions);

            if (result.error) {
                console.error('Cashfree error:', result.error);
                throw new Error(result.error.message || 'Cashfree payment failed');
            }

            if (result.paymentDetails) {
                await handlePaymentSuccess({
                    payment_gateway: 'Cashfree',
                    payment_id: result.paymentDetails.paymentId,
                    gateway_order_id: order.gateway_order_id
                });
            }
        } catch (error) {
            console.error('Cashfree error:', error);
            setProcessingPayment(false);
            throw error;
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (payload: PaymentPayload): Promise<void> => {
        try {
            const result = await verifyPaymentAsync(payload);

            if (result?.success) {
                alert('Payment Verified Successfully! ✅');
                showAlertMessage('Payment Verified Successfully! ✅', 'success');
                onOpenChange(false);
                setSelected(null);
                // Refresh or redirect as needed
                window.location.reload();
            } else {
                throw new Error(result?.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            alert(`${errorMessage}. Please contact support.`);
            showAlertMessage(`${errorMessage}. Please contact support.`, 'error');
        } finally {
            setProcessingPayment(false);
        }
    };

    // Handle modal close
    const handleClose = (): void => {
        if (!processingPayment) {
            onOpenChange(false);
            setSelected(null);
        }
    };

    // Mapping of which currencies are supported by each gateway using currency **names**
    const gatewayCurrencySupport: Record<string, string[]> = {
        Stripe: ['AUD', 'BRL', 'GBP', 'CAD', 'EUR', 'INR', 'IDR', 'ILS', 'JPY', 'MYR', 'MXN', 'SGD', 'USD'],
        Razorpay: ['GBP', 'EUR', 'INR', 'CAD', 'AUD', 'SGD', 'JPY', 'USD'],
        Cashfree: ['GBP', 'EUR', 'INR', 'CAD', 'AUD', 'SGD', 'USD']
    };

    // Filter active gateways and currency support
    const activeGateways = React.useMemo(() => {
        if (!parsedData || !userRedux?.currency?.name) return [];

        return Object.entries(parsedData).filter(([key, gateway]) => {
            // Check if gateway is active
            const isActive = gateway.status === '1' || gateway.status === 1;

            // Check if this gateway supports the user's selected currency
            const supportsCurrency = gatewayCurrencySupport[key]?.includes(userRedux?.currency?.name || '');

            return isActive && supportsCurrency;
        });
    }, [parsedData, userRedux?.currency?.name]);

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className='max-w-lg rounded-2xl p-6'>
                    <DialogHeader>
                        <DialogTitle className='text-lg font-semibold text-gray-800'>
                            Choose Your Payment Gateway
                        </DialogTitle>
                        <DialogDescription></DialogDescription>
                        <p className='text-sm text-gray-500'>
                            {processingPayment
                                ? 'Processing payment...'
                                : 'Select a gateway below to proceed with payment'}
                        </p>
                    </DialogHeader>

                    {isLoading ? (
                        <div className='flex items-center justify-center py-6'>
                            <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                        </div>
                    ) : (
                        <div className='mt-4 space-y-4'>
                            {activeGateways.length === 0 ? (
                                <div className='py-6 text-center text-gray-500'>No payment gateways available</div>
                            ) : (
                                activeGateways.map(([key, gateway]) => (
                                    <Card
                                        key={key}
                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                                            selected === gateway.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white'
                                        } ${processingPayment ? 'pointer-events-none opacity-50' : ''}`}
                                        onClick={() => !processingPayment && setSelected(gateway.value)}>
                                        <div className='flex items-center gap-4'>
                                            <div className='flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-50'>
                                                <Image
                                                    src={gateway.image}
                                                    alt={gateway.value}
                                                    width={40}
                                                    height={40}
                                                    className='h-auto w-full object-contain'
                                                />
                                            </div>
                                            <span className='text-base font-medium text-gray-800'>{gateway.value}</span>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    <DialogFooter className='mt-6 flex justify-end gap-3'>
                        <Button
                            variant='outline'
                            onClick={handleClose}
                            className='rounded-lg'
                            disabled={processingPayment}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selected || loading || processingPayment}
                            className='rounded-lg bg-blue-600 px-6 hover:bg-blue-700'>
                            {loading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Processing...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={4000} />
            )}
        </>
    );
};

export default PaymentModal;
