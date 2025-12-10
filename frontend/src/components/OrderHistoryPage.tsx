'use client';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { RootState } from '@/redux/store/store';
// Add translation hook
import { Order, OrdersResponse } from '@/types/type';

import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Database,
    Download,
    ExternalLink,
    Eye,
    Globe,
    Package,
    QrCode,
    Settings,
    Signal,
    Smartphone,
    Truck
} from 'lucide-react';
import moment from 'moment';
import { useSelector } from 'react-redux';

// Type definitions
type OrderStatus = 'delivered' | 'shipped' | 'processing' | 'cancelled' | 'pending' | 'completed';

interface StatusConfig {
    color: string;
    label: string;
}

const OrderHistoryPage = () => {
    const userRedux = useSelector((state: RootState) => state.user.user);
    const currency = userRedux?.currency?.symbol;
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: ordersData, isLoading } = useProtectedApiHandler<OrdersResponse>({
        url: `/orders?page=${page}`
    });

    const apiData = ordersData?.data;
    const orders = apiData?.data || [];

    // Status configuration with translations
    const statusConfig: Record<OrderStatus, StatusConfig> = {
        delivered: {
            color: 'bg-green-100 text-green-700',
            label: t('profile.pages.orderHistory.status.delivered')
        },
        shipped: {
            color: 'bg-blue-100 text-blue-700',
            label: t('profile.pages.orderHistory.status.shipped')
        },
        processing: {
            color: 'bg-yellow-100 text-yellow-700',
            label: t('profile.pages.orderHistory.status.processing')
        },
        cancelled: {
            color: 'bg-red-100 text-red-700',
            label: t('profile.pages.orderHistory.status.cancelled')
        },
        completed: {
            color: 'bg-green-100 text-green-700',
            label: t('profile.pages.orderHistory.status.completed')
        },
        pending: {
            color: 'bg-orange-100 text-orange-700',
            label: t('profile.pages.orderHistory.status.pending')
        }
    } as const;

    // Helper function to get status icon
    const getStatusIcon = (status: OrderStatus) => {
        const iconMap = {
            delivered: CheckCircle,
            shipped: Truck,
            processing: Clock,
            cancelled: AlertCircle,
            pending: Clock,
            completed: CheckCircle
        };
        return iconMap[status];
    };

    // Date formatting with locale support
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Copy to clipboard function
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // You can add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Open order details modal
    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setSelectedOrder(null);
        setIsModalOpen(false);
    };

    // Render order details modal
    const renderOrderDetailsModal = () => {
        if (!selectedOrder || !selectedOrder.activation_details) return null;

        const activation = selectedOrder.activation_details;
        const sim = activation.sims?.[0]; // Assuming first SIM for now

        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Package className='h-5 w-5' />
                            Order Details - {selectedOrder.order_ref}
                        </DialogTitle>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* Order Summary */}
                        <div className='grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2'>
                            <div>
                                <h3 className='mb-2 font-semibold text-gray-900'>Order Information</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Order Reference:</span>
                                        <span className='font-medium'>{selectedOrder.order_ref}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Status:</span>
                                        <Badge className='bg-green-100 text-green-700'>{selectedOrder.status}</Badge>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Total Amount:</span>
                                        <span className='font-medium'>
                                            {currency} {selectedOrder.total_amount}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Order Date:</span>
                                        <span>{moment(selectedOrder.created_at).format('MMM DD, YYYY, h:mm A')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='mb-2 font-semibold text-gray-900'>Package Information</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Package:</span>
                                        <span className='font-medium'>{activation.package}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Data:</span>
                                        <span>{activation.data}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Validity:</span>
                                        <span>{activation.validity} days</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Type:</span>
                                        <span>{activation.esim_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* eSIM Details */}
                        {sim && (
                            <div className='space-y-4'>
                                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                                    <Smartphone className='h-5 w-5' />
                                    eSIM Details
                                </h3>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    {/* QR Code Section */}
                                    <div className='space-y-4'>
                                        <div className='rounded-lg border p-4'>
                                            <h4 className='mb-2 flex items-center gap-2 font-medium'>
                                                <QrCode className='h-4 w-4' />
                                                QR Code Installation
                                            </h4>
                                            <div className='rounded border bg-white p-2 text-center'>
                                                <img
                                                    src={sim.qrcode_url}
                                                    alt='QR Code'
                                                    className='mx-auto max-h-32 max-w-32'
                                                />
                                            </div>
                                            <div className='mt-2 space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-sm text-gray-600'>QR Data:</span>
                                                    <code className='flex-1 truncate rounded bg-gray-100 p-1 text-xs'>
                                                        {sim.qrcode}
                                                    </code>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        onClick={() => copyToClipboard(sim.qrcode)}>
                                                        <Copy className='h-3 w-3' />
                                                    </Button>
                                                </div>
                                                {sim.direct_apple_installation_url && (
                                                    <Button
                                                        size='sm'
                                                        className='w-full'
                                                        onClick={() =>
                                                            window.open(sim.direct_apple_installation_url, '_blank')
                                                        }>
                                                        <ExternalLink className='mr-1 h-3 w-3' />
                                                        Install on iPhone
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Setup Section */}
                                    <div className='space-y-4'>
                                        <div className='rounded-lg border p-4'>
                                            <h4 className='mb-2 flex items-center gap-2 font-medium'>
                                                <Settings className='h-4 w-4' />
                                                Manual Setup
                                            </h4>
                                            <div className='space-y-2 text-sm'>
                                                <div>
                                                    <span className='text-gray-600'>ICCID:</span>
                                                    <div className='mt-1 flex items-center gap-2'>
                                                        <code className='flex-1 rounded bg-gray-100 p-1 text-xs'>
                                                            {sim.iccid}
                                                        </code>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() => copyToClipboard(sim.iccid)}>
                                                            <Copy className='h-3 w-3' />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className='text-gray-600'>SM-DP+ Address:</span>
                                                    <div className='mt-1 flex items-center gap-2'>
                                                        <code className='flex-1 rounded bg-gray-100 p-1 text-xs'>
                                                            {sim.lpa}
                                                        </code>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() => copyToClipboard(sim.lpa)}>
                                                            <Copy className='h-3 w-3' />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className='text-gray-600'>Activation Code:</span>
                                                    <div className='mt-1 flex items-center gap-2'>
                                                        <code className='flex-1 rounded bg-gray-100 p-1 text-xs'>
                                                            {sim.matching_id}
                                                        </code>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() => copyToClipboard(sim.matching_id)}>
                                                            <Copy className='h-3 w-3' />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* APN Settings */}
                                <div className='rounded-lg border p-4'>
                                    <h4 className='mb-2 flex items-center gap-2 font-medium'>
                                        <Database className='h-4 w-4' />
                                        APN Settings
                                    </h4>
                                    <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                                        <div>
                                            <span className='text-gray-600'>iOS APN:</span>
                                            <div className='mt-1 flex items-center gap-2'>
                                                <code className='rounded bg-gray-100 p-1'>
                                                    {sim.apn?.ios?.apn_value || sim.apn_value}
                                                </code>
                                                <Badge variant='outline' className='text-xs'>
                                                    {sim.apn?.ios?.apn_type || 'manual'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className='text-gray-600'>Android APN:</span>
                                            <div className='mt-1 flex items-center gap-2'>
                                                <code className='rounded bg-gray-100 p-1'>
                                                    {sim.apn?.android?.apn_value || sim.apn_value}
                                                </code>
                                                <Badge variant='outline' className='text-xs'>
                                                    {sim.apn?.android?.apn_type || sim.apn_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-2 flex items-center gap-2 text-sm'>
                                        <Signal className='h-4 w-4 text-gray-400' />
                                        <span className='text-gray-600'>
                                            Data Roaming: {sim.is_roaming ? 'Required' : 'Not Required'}
                                        </span>
                                    </div>
                                </div>

                                {/* Installation Instructions */}
                                <div className='rounded-lg border p-4'>
                                    <h4 className='mb-2 flex items-center gap-2 font-medium'>
                                        <Globe className='h-4 w-4' />
                                        Installation Guide
                                    </h4>
                                    {activation.installation_guides?.en && (
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => window.open(activation.installation_guides.en, '_blank')}>
                                            <ExternalLink className='mr-1 h-3 w-3' />
                                            View Installation Guide
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    // Render individual order card
    const renderOrderCard = (order: Order) => {
        const StatusIcon = getStatusIcon(order.status);
        const statusData = statusConfig[order.status];

        return (
            <Card key={order.id} className='transition-shadow duration-200 hover:shadow-lg'>
                <CardContent className='p-4 sm:p-6'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-center'>
                        {/* Order Reference */}
                        <div className='space-y-1'>
                            <p className='text-xs text-gray-500 sm:text-sm'>
                                {t('profile.pages.orderHistory.fields.orderRef')}
                            </p>
                            <p className='text-sm font-medium break-all text-gray-900 sm:text-base'>
                                {order.order_ref}
                            </p>
                        </div>

                        {/* Order Status */}
                        <div className='space-y-2'>
                            <p className='text-xs text-gray-500 sm:text-sm'>
                                {t('profile.pages.orderHistory.fields.status')}
                            </p>
                            <Badge className={`flex w-fit items-center gap-1 text-xs`}>
                                <span>{order.status}</span>
                            </Badge>
                        </div>

                        {/* Total Amount */}
                        <div className='space-y-1'>
                            <p className='text-xs text-gray-500 sm:text-sm'>
                                {t('profile.pages.orderHistory.fields.amount')}
                            </p>
                            <p className='text-sm text-gray-900 sm:text-base'>
                                {order.total_amount ? ` ${currency} ${order.total_amount}` : '-'}
                            </p>
                        </div>

                        {/* Ordered On Date */}
                        <div className='space-y-1'>
                            <p className='text-xs text-gray-500 sm:text-sm'>
                                {t('profile.pages.orderHistory.fields.orderedOn')}
                            </p>
                            <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 flex-shrink-0 text-gray-400' />
                                <p className='text-sm text-gray-900 sm:text-sm'>
                                    {/* {moment(order.created_at).format('YYYY-MM-DD HH:mm:ss')} */}
                                    {moment(order.created_at).format('MMM DD, YYYY, h:mm A')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Actions */}
                    <div className='mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4'>
                        {order.status.toLowerCase() === 'completed' && order.activation_details && (
                            <Button
                                variant='outline'
                                size='sm'
                                className='text-xs'
                                onClick={() => openOrderDetails(order)}>
                                <Eye className='mr-1 h-3 w-3' />
                                View Details
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className='space-y-6'>
            {/* Page Header */}
            <div className='flex items-center gap-2'>
                <Package className='h-5 w-5 text-gray-700 sm:h-6 sm:w-6' />
                <h2 className='text-xl font-bold text-gray-900 sm:text-2xl'>{t('profile.pages.orderHistory.title')}</h2>
            </div>

            {/* Stats Summary */}
            {orders.length > 0 && (
                <div className='rounded-lg bg-gray-50 p-4'>
                    <p className='text-sm text-gray-600'>
                        {t('profile.pages.orderHistory.summary', {
                            total: apiData?.total || 0,
                            showing: orders.length
                        })}
                    </p>
                </div>
            )}

            {/* Orders List */}
            <div className='space-y-4'>
                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
                        <p className='ml-3 text-center text-gray-500'>{t('profile.pages.orderHistory.loading')}</p>
                    </div>
                ) : orders.length > 0 ? (
                    orders.map(renderOrderCard)
                ) : (
                    <Card>
                        <CardContent className='p-8 text-center sm:p-12'>
                            <Package className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                            <h3 className='mb-2 text-lg font-medium text-gray-900'>
                                {t('profile.pages.orderHistory.empty.title')}
                            </h3>
                            <p className='mb-4 text-gray-500'>{t('profile.pages.orderHistory.empty.description')}</p>
                            <Button onClick={() => (window.location.href = '/all-packages')} className='mt-2'>
                                {t('profile.pages.orderHistory.empty.browsePlans')}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {apiData && apiData.last_page > 1 && (
                <div className='flex items-center justify-center gap-4 pt-6'>
                    <Button
                        variant='outline'
                        disabled={!apiData?.prev_page_url || isLoading}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                        {t('profile.pages.orderHistory.pagination.previous')}
                    </Button>
                    <span className='text-sm text-gray-700'>
                        {t('profile.pages.orderHistory.pagination.pageInfo', {
                            current: apiData.current_page,
                            total: apiData.last_page
                        })}
                    </span>
                    <Button
                        variant='outline'
                        disabled={!apiData?.next_page_url || isLoading}
                        onClick={() => setPage((prev) => prev + 1)}>
                        {t('profile.pages.orderHistory.pagination.next')}
                    </Button>
                </div>
            )}

            {/* Order Details Modal */}
            {renderOrderDetailsModal()}
        </div>
    );
};

export default OrderHistoryPage;
