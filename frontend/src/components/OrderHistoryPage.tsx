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
                <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 text-xl'>
                            <Package className='text-primary h-6 w-6' />
                            Order Details - {selectedOrder.order_ref}
                        </DialogTitle>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* Order Summary - Unified Design */}
                        <div className='grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 shadow-sm md:grid-cols-2'>
                            <div className='space-y-4'>
                                <h3 className='flex items-center gap-2 text-base font-semibold text-gray-900'>
                                    <div className='bg-primary/10 rounded-lg p-2'>
                                        <Package className='text-primary h-4 w-4' />
                                    </div>
                                    Order Information
                                </h3>
                                <div className='space-y-3 text-sm'>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Order Reference</span>
                                        <span className='font-semibold text-gray-900'>{selectedOrder.order_ref}</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Status</span>
                                        <Badge className='bg-green-100 text-green-700 hover:bg-green-100'>
                                            {selectedOrder.status}
                                        </Badge>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Total Amount</span>
                                        <span className='font-bold text-gray-900'>
                                            {currency} {selectedOrder.total_amount}
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Order Date</span>
                                        <span className='text-gray-900'>
                                            {moment(selectedOrder.created_at).format('MMM DD, YYYY, h:mm A')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <h3 className='flex items-center gap-2 text-base font-semibold text-gray-900'>
                                    <div className='bg-primary/10 rounded-lg p-2'>
                                        <Smartphone className='text-primary h-4 w-4' />
                                    </div>
                                    Package Information
                                </h3>
                                <div className='space-y-3 text-sm'>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Package</span>
                                        <span className='font-semibold text-gray-900'>{activation.package}</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Data</span>
                                        <span className='text-gray-900'>{activation.data}</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Validity</span>
                                        <span className='text-gray-900'>{activation.validity} days</span>
                                    </div>
                                    <div className='flex items-center justify-between rounded-lg bg-white/80 p-3 shadow-sm'>
                                        <span className='font-medium text-gray-600'>Type</span>
                                        <span className='text-gray-900'>{activation.esim_type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* eSIM Details */}
                        {sim && (
                            <div className='space-y-5'>
                                <div className='flex items-center gap-2 border-b pb-3'>
                                    <div className='bg-primary/10 rounded-lg p-2'>
                                        <Smartphone className='text-primary h-5 w-5' />
                                    </div>
                                    <h3 className='text-lg font-semibold text-gray-900'>eSIM Details</h3>
                                </div>

                                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                                    {/* QR Code Section */}
                                    <div className='space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'>
                                        <h4 className='flex items-center gap-2 font-semibold text-gray-900'>
                                            <QrCode className='text-primary h-5 w-5' />
                                            QR Code Installation
                                        </h4>
                                        <div className='flex justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6'>
                                            <img
                                                src={sim.qrcode_url}
                                                alt='QR Code'
                                                className='h-40 w-40 rounded-lg shadow-sm'
                                            />
                                        </div>
                                        <div className='space-y-3'>
                                            <div className='space-y-2'>
                                                <span className='text-xs font-medium text-gray-500'>QR Data</span>
                                                <div className='flex items-center gap-2'>
                                                    <code className='flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800'>
                                                        {sim.qrcode}
                                                    </code>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='shrink-0'
                                                        onClick={() => copyToClipboard(sim.qrcode)}>
                                                        <Copy className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                            {sim.direct_apple_installation_url && (
                                                <Button
                                                    size='sm'
                                                    className='w-full gap-2'
                                                    onClick={() =>
                                                        window.open(sim.direct_apple_installation_url, '_blank')
                                                    }>
                                                    <ExternalLink className='h-4 w-4' />
                                                    Install on iPhone
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Manual Setup Section */}
                                    <div className='space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'>
                                        <h4 className='flex items-center gap-2 font-semibold text-gray-900'>
                                            <Settings className='text-primary h-5 w-5' />
                                            Manual Setup
                                        </h4>
                                        <div className='space-y-4 text-sm'>
                                            <div className='space-y-2'>
                                                <span className='text-xs font-medium text-gray-500'>ICCID</span>
                                                <div className='flex items-center gap-2'>
                                                    <code className='flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800'>
                                                        {sim.iccid}
                                                    </code>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='shrink-0'
                                                        onClick={() => copyToClipboard(sim.iccid)}>
                                                        <Copy className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <span className='text-xs font-medium text-gray-500'>
                                                    SM-DP+ Address
                                                </span>
                                                <div className='flex items-center gap-2'>
                                                    <code className='flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800'>
                                                        {sim.lpa}
                                                    </code>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='shrink-0'
                                                        onClick={() => copyToClipboard(sim.lpa)}>
                                                        <Copy className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <span className='text-xs font-medium text-gray-500'>
                                                    Activation Code
                                                </span>
                                                <div className='flex items-center gap-2'>
                                                    <code className='flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800'>
                                                        {sim.matching_id}
                                                    </code>
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        className='shrink-0'
                                                        onClick={() => copyToClipboard(sim.matching_id)}>
                                                        <Copy className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* APN Settings */}
                                <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
                                    <h4 className='mb-4 flex items-center gap-2 font-semibold text-gray-900'>
                                        <Database className='text-primary h-5 w-5' />
                                        APN Settings
                                    </h4>
                                    <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                                        <div className='space-y-2 rounded-lg bg-gray-50 p-4'>
                                            <span className='text-xs font-medium text-gray-500'>iOS APN</span>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <code className='rounded-lg bg-white px-3 py-1.5 font-mono text-gray-900 shadow-sm'>
                                                    {sim.apn?.ios?.apn_value || sim.apn_value}
                                                </code>
                                                <Badge variant='outline' className='text-xs'>
                                                    {sim.apn?.ios?.apn_type || 'manual'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className='space-y-2 rounded-lg bg-gray-50 p-4'>
                                            <span className='text-xs font-medium text-gray-500'>Android APN</span>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <code className='rounded-lg bg-white px-3 py-1.5 font-mono text-gray-900 shadow-sm'>
                                                    {sim.apn?.android?.apn_value || sim.apn_value}
                                                </code>
                                                <Badge variant='outline' className='text-xs'>
                                                    {sim.apn?.android?.apn_type || sim.apn_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm'>
                                        <Signal className='h-4 w-4 text-blue-600' />
                                        <span className='font-medium text-blue-900'>
                                            Data Roaming: {sim.is_roaming ? 'Required' : 'Not Required'}
                                        </span>
                                    </div>
                                </div>

                                {/* Installation Instructions */}
                                <div className='from-primary/5 to-primary/10 rounded-xl border border-gray-200 bg-gradient-to-br p-5 shadow-sm'>
                                    <h4 className='mb-3 flex items-center gap-2 font-semibold text-gray-900'>
                                        <Globe className='text-primary h-5 w-5' />
                                        Installation Guide
                                    </h4>
                                    {activation.installation_guides?.en && (
                                        <Button
                                            variant='default'
                                            size='sm'
                                            className='gap-2'
                                            onClick={() => window.open(activation.installation_guides.en, '_blank')}>
                                            <ExternalLink className='h-4 w-4' />
                                            View Full Installation Guide
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
