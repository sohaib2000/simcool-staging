'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
// Add translation hook
import { PackageApiResponse } from '@/types/type';

import Loader from './common/Loader';
import PaymentModal from './modals/PaymentModal';
import TopupModal from './modals/TopupModal';
import { Globe, MessageCircle, Phone } from 'lucide-react';

export default function PackageCard() {
    const { t } = useTranslation(); // Translation hook
    const [open, setOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const { data, isLoading } = useProtectedApiHandler<PackageApiResponse>({
        url: '/getUsage'
    });

    if (isLoading) return <Loader />;

    const pkg = data?.data?.[0];
    if (!pkg) {
        return (
            <div className='my-4 w-full rounded-xl border bg-gradient-to-b from-gray-50 to-white p-6 shadow-sm'>
                <div className='text-center'>
                    <Globe className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                    <h3 className='mb-2 text-lg font-medium text-gray-900'>
                        {t('profile.pages.accountInfo.packageCard.noPackage.title')}
                    </h3>
                    <p className='text-sm text-gray-500'>
                        {t('profile.pages.accountInfo.packageCard.noPackage.description')}
                    </p>
                </div>
            </div>
        );
    }

    const totalData = pkg.usage.total;
    const remainingData = pkg.usage.remaining;
    const usedData = totalData - remainingData;
    const progressPercent = totalData ? (usedData / totalData) * 100 : 0;

    const expiryDate = new Date(pkg.usage.expired_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
    };

    const onBuyClick = () => {
        setOpen(false);
        setShowPaymentModal(true);
    };

    // Format data usage text
    const getDataUsageText = () => {
        if (pkg.usage.is_unlimited) {
            return t('profile.pages.accountInfo.packageCard.usage.unlimited');
        }
        return t('profile.pages.accountInfo.packageCard.usage.dataRemaining', {
            remaining: remainingData,
            total: totalData
        });
    };

    // Format SMS text
    const getSmsText = () => {
        if (pkg.usage.remaining_text > 0) {
            return t('profile.pages.accountInfo.packageCard.usage.smsLeft', {
                count: pkg.usage.remaining_text
            });
        }
        return t('profile.pages.accountInfo.packageCard.usage.smsNotAvailable');
    };

    // Format Call text
    const getCallText = () => {
        if (pkg.usage.remaining_voice > 0) {
            return t('profile.pages.accountInfo.packageCard.usage.callMinsLeft', {
                mins: pkg.usage.remaining_voice
            });
        }
        return t('profile.pages.accountInfo.packageCard.usage.callNotAvailable');
    };

    return (
        <>
            <div className='my-4 w-full rounded-xl border bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm'>
                {/* Header */}
                <div className='flex items-start justify-between'>
                    <h3 className='text-sm font-medium text-gray-700'>
                        {t('profile.pages.accountInfo.packageCard.title')}
                    </h3>
                    <button
                        onClick={() => setOpen(true)}
                        className='rounded-lg border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50'
                        aria-label={t('profile.pages.accountInfo.packageCard.topUp.button')}>
                        {t('profile.pages.accountInfo.packageCard.topUp.button')}
                    </button>
                </div>

                {/* Country + Flag */}
                <div className='mt-3 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-800'>{pkg.location.name}</span>
                    <div className='flex items-center gap-2'>
                        <Image
                            src={pkg.location.image}
                            alt={t('profile.pages.accountInfo.packageCard.location.flagAlt', {
                                country: pkg.location.name
                            })}
                            width={20}
                            height={14}
                            className='rounded-sm'
                            unoptimized
                        />
                    </div>
                </div>

                {/* Internet Usage */}
                <div className='mt-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-gray-700'>
                        <Globe size={18} />
                        <span className='text-sm'>{t('profile.pages.accountInfo.packageCard.usage.internet')}</span>
                    </div>
                    <span className='text-sm font-semibold'>{getDataUsageText()}</span>
                </div>

                {/* Progress bar */}
                {!pkg.usage.is_unlimited && (
                    <div className='mt-2 h-1.5 w-full rounded-full bg-gray-200'>
                        <div
                            className='h-1.5 rounded-full bg-blue-500 transition-all duration-300'
                            style={{ width: `${progressPercent}%` }}
                            aria-label={t('profile.pages.accountInfo.packageCard.usage.progressLabel', {
                                percent: Math.round(progressPercent)
                            })}></div>
                    </div>
                )}

                {/* Expiry */}
                <p className='mt-2 text-xs text-gray-500'>
                    {t('profile.pages.accountInfo.packageCard.expiry.text', { date: expiryDate })}
                </p>

                {/* Footer - SMS and Call Status */}
                <div className='mt-4 flex justify-between border-t pt-3 text-gray-500'>
                    <div className='flex flex-col items-center text-xs'>
                        <MessageCircle size={18} className='mb-1' />
                        <span className='text-center'>{getSmsText()}</span>
                    </div>
                    <div className='flex flex-col items-center text-xs'>
                        <Phone size={18} className='mb-1' />
                        <span className='text-center'>{getCallText()}</span>
                    </div>
                </div>
            </div>

            {/* Topup Modal */}
            <TopupModal open={open} onOpenChange={setOpen} iccid={pkg.iccid} onBuyClick={onBuyClick} />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    open={showPaymentModal}
                    onOpenChange={handlePaymentModalClose}
                    esimPackageId={pkg.id}
                    iccid={pkg.iccid}
                />
            )}
        </>
    );
}
