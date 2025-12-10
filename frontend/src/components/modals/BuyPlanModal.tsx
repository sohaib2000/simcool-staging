'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';
import { formatDataType } from '@/utils/formatData ';

import PaymentModal from './PaymentModal';
import { Infinity, AlertTriangle, Calendar, CreditCard, Database, DollarSign, ShoppingCart } from 'lucide-react';
import { FaMoneyCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';

interface Country {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    laravel_through_key: number;
}

interface Operator {
    id: number;
    name: string;
    country_id: number;
    region_id: number;
    airaloOperatorId: number;
    type: string;
    is_prepaid: number;
    esim_type: string;
    apn_type: string;
    apn_value: string;
    info: string;
    image: string;
    plan_type: string;
    activation_policy: string;
    is_kyc_verify: number;
    rechargeability: number;
    is_active: boolean;
    airalo_active: number;
    created_at: string;
    updated_at: string;
}

interface PackageData {
    id: number;
    operator_id: number;
    airalo_package_id: string;
    name: string;
    type: string;
    day: number;
    is_unlimited: boolean;
    short_info: string | null;
    net_price: number;
    data: string;
    price: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    is_fair_usage_policy: boolean;
    fair_usage_policy: string;
    qr_installation: string;
    manual_installation: string;
    country: Country;
    operator: Operator;
}

interface ApiResponse {
    data: PackageData;
    success: boolean;
    message: string;
}

interface BuyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageId: number;
    onPurchase?: () => void | undefined;
}

const BuyPlanModal: React.FC<BuyPlanModalProps> = ({ isOpen, onClose, packageId, onPurchase }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [esimPackageId, setesimPackageId] = useState(0);

    const userRedux = useSelector((state: RootState) => state.user.user);
    const userToken = useSelector((state: RootState) => state.user.userToken);

    const {
        data: packageData,
        isLoading,
        refetch
    } = userToken === null
        ? usePublicApiHandler<ApiResponse>({
              url: `/packages/${packageId}`,
              enabled: isOpen && packageId > 0
          })
        : useProtectedApiHandler<ApiResponse>({
              url: `/packages/${packageId}`,
              enabled: isOpen && packageId > 0
          });

    useEffect(() => {
        refetch();
    });

    // Memoize package details for performance optimization
    const packageDetails = useMemo(() => {
        return packageData?.success ? packageData.data : null;
    }, [packageData]);

    // Helper function to get country flag emoji
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) {
            return '🌍';
        }

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    const handleOpenChange = (open: boolean): void => {
        if (!open) {
            onClose();
        }
    };

    const handlePurchase = async (): Promise<void> => {
        if (!packageId) return;

        setIsProcessing(true);
        try {
            // Simply call parent "buy now" handler
            onClose(); // close BuyPlanModal after purchase click
            if (onPurchase) {
                onPurchase(); // trigger payment modal
            }
        } catch (error) {
            console.error('Purchase failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle PaymentModal close
    const handlePaymentModalClose = (open: boolean) => {
        setShowPaymentModal(open);
        // If payment modal is being closed and we want to show BuyPlan again
        // The BuyPlan modal will automatically show since isOpen prop controls it
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent && packageDetails?.country?.country_code) {
            parent.innerHTML = `<span class="text-lg">${getCountryFlag(packageDetails.country.country_code)}</span>`;
        }
    };

    // Loading state component
    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='w-full max-w-sm'>
                    <DialogTitle className='sr-only'>Loading Checkout</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <div className='flex flex-col items-center justify-center py-8'>
                        <div
                            className='mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'
                            aria-label='Loading'></div>
                        <p className='text-sm text-gray-600'>Loading...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Error or no data state component
    if (!packageData?.success || !packageDetails) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='w-full max-w-sm'>
                    <DialogTitle className='sr-only'>Plan Not Found</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <div className='flex flex-col items-center justify-center py-8'>
                        <AlertTriangle className='mx-auto mb-3 h-8 w-8 text-red-500' aria-hidden='true' />
                        <h3 className='mb-2 font-bold text-gray-900'>Plan Not Available</h3>
                        <p className='mb-4 text-center text-sm text-gray-600'>
                            {packageData?.message || 'Unable to load plan details.'}
                        </p>
                        <Button onClick={onClose} size='sm'>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const subtotal = packageDetails.net_price;
    const tax = 0;
    const total = subtotal + tax;

    return (
        <>
            {/* Only show BuyPlanModal when PaymentModal is not open */}
            {!showPaymentModal && (
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogContent className='w-full max-w-sm p-0'>
                        {/* Header */}
                        <DialogHeader className='px-6 pt-6 pb-4'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                                    <ShoppingCart className='h-5 w-5 text-blue-600' aria-hidden='true' />
                                </div>
                                <div>
                                    <DialogTitle className='text-lg font-semibold text-gray-900'>
                                        Purchase Plan
                                    </DialogTitle>
                                    <DialogDescription className='text-sm text-gray-600'>
                                        Confirm your order
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Content */}
                        <div className='space-y-4 px-6 pb-6'>
                            {/* Plan Info */}
                            <div className='rounded-lg border p-4'>
                                <div className='mb-3 flex items-center gap-3'>
                                    {packageDetails.country?.image ? (
                                        <div className='relative h-8 w-8 overflow-hidden rounded-full border border-gray-200'>
                                            <Image
                                                src={packageDetails.country.image}
                                                alt={`${packageDetails.country.name} flag`}
                                                width={32}
                                                height={32}
                                                className='h-full w-full object-cover'
                                                unoptimized
                                                onError={handleImageError}
                                            />
                                        </div>
                                    ) : (
                                        <span className='text-lg' aria-label={`${packageDetails.country?.name} flag`}>
                                            {getCountryFlag(packageDetails.country?.country_code || '')}
                                        </span>
                                    )}
                                    <div className='flex-1'>
                                        <h3 className='text-sm font-medium text-gray-900'>{packageDetails.name}</h3>
                                        <p className='text-xs text-gray-600'>{packageDetails.country?.name}</p>
                                    </div>
                                    <Badge
                                        variant={packageDetails.is_unlimited ? 'default' : 'secondary'}
                                        className='text-xs'>
                                        {packageDetails.is_unlimited ? 'Unlimited' : 'Limited'}
                                    </Badge>
                                </div>

                                <div className='grid grid-cols-3 gap-2 text-center'>
                                    <div className='rounded bg-gray-50 p-2'>
                                        {packageDetails.is_unlimited ? (
                                            <Infinity
                                                className='mx-auto mb-1 h-4 w-4 text-blue-600'
                                                aria-hidden='true'
                                            />
                                        ) : (
                                            <Database
                                                className='mx-auto mb-1 h-4 w-4 text-blue-600'
                                                aria-hidden='true'
                                            />
                                        )}
                                        <p className='text-xs font-medium text-gray-900'>
                                            {formatDataType(packageDetails.data)}
                                        </p>
                                    </div>

                                    <div className='rounded bg-gray-50 p-2'>
                                        <Calendar className='mx-auto mb-1 h-4 w-4 text-green-600' aria-hidden='true' />
                                        <p className='text-xs font-medium text-gray-900'>{packageDetails.day} days</p>
                                    </div>

                                    <div className='rounded bg-gray-50 p-2'>
                                        <FaMoneyCheck
                                            className='mx-auto mb-1 h-4 w-4 text-gray-400'
                                            aria-hidden='true'
                                        />
                                        <p className='text-xs font-medium text-gray-900'>
                                            {userRedux?.currency?.symbol || '$'}
                                            {(packageDetails.net_price / packageDetails.day).toFixed(2)}/day
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className='rounded-lg border p-4'>
                                <h4 className='mb-3 font-medium text-gray-900'>Order Summary</h4>

                                <div className='space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>Plan Price</span>
                                        <span className='text-gray-900'>
                                            {userRedux?.currency?.symbol || '$'}
                                            {subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>Tax & Fees</span>
                                        <span className='text-gray-900'>
                                            {userRedux?.currency?.symbol || '$'}
                                            {tax.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <Separator className='my-3' />

                                <div className='flex items-center justify-between'>
                                    <span className='font-semibold text-gray-900'>Total</span>
                                    <span className='text-lg font-bold text-green-600'>
                                        {userRedux?.currency?.symbol || '$'}
                                        {total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className='flex gap-3 pt-2'>
                                <Button variant='outline' onClick={onClose} disabled={isProcessing} className='flex-1'>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePurchase}
                                    disabled={isProcessing}
                                    className='flex-1 bg-blue-600 hover:bg-blue-700'>
                                    {isProcessing ? (
                                        <>
                                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className='mr-2 h-4 w-4' aria-hidden='true' />
                                            Buy {userRedux?.currency?.symbol || '$'}
                                            {total.toFixed(2)}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* PaymentModal */}
        </>
    );
};

export default BuyPlanModal;
