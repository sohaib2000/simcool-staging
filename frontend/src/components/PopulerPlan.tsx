'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';
import { formatDataType } from '@/utils/formatData ';

import Alert from './Alert';
import BuyPlanModal from './modals/BuyPlanModal';
import PaymentModal from './modals/PaymentModal';
import PlanExploreModal from './modals/PlanExploreModal';
import PlanCardSkeleton from './skeleton/PlanCardSkeleton';
import {
    ArrowDownUp,
    ArrowRight,
    Calendar,
    CheckCircle,
    MessageSquare,
    PhoneCallIcon,
    Star,
    TrendingUp,
    View
} from 'lucide-react';
import { FaSms } from 'react-icons/fa';
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
}

interface Package {
    id: number;
    operator_id: number;
    airalo_package_id: string;
    name: string;
    type: string;
    day: number;
    is_unlimited: boolean;
    short_info: string | null;
    data: string;
    net_price: number;
    country: Country | null;
    region: string | null;
    sms: string | null;
    mins: string | null;
    is_active: boolean;
    is_popular: boolean;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    data: Package[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
    success: boolean;
    message: string;
}

export interface PlanDetails {
    data?: string;
    sms?: string;
    mins?: string;
    days?: string;
}

const PopularPlans = () => {
    const [isPlanExploreModalOpen, setisPlanExploreModalOpen] = useState(false);
    const [isBuyPlanExploreModalOpen, setisBuyPlanExploreModalOpen] = useState(false);
    const [provideId, setprovideId] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const userRedux = useSelector((state: RootState) => state.user.user);
    const { t } = useTranslation();

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const {
        data: packagesData,
        isLoading,
        refetch
    } = userToken === null
        ? usePublicApiHandler<ApiResponse | null>({
              url: '/packages?per_page=4'
          })
        : useProtectedApiHandler<ApiResponse | null>({
              url: '/packages?per_page=4'
          });

    useEffect(() => {
        refetch();
    });

    const router = useRouter();

    // Helper function to get country flag from country code
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    // Memoize popular packages
    const popularPackages = useMemo(() => {
        if (!packagesData?.success || !packagesData.data) return [];

        return packagesData.data
            .filter((pkg) => pkg.is_popular && pkg.is_active)
            .sort((a, b) => a.net_price - b.net_price);
    }, [packagesData]);

    if (!packagesData?.success || popularPackages.length === 0) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[300px] flex-col items-center justify-center'>
                        <div className='max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg'>
                            <TrendingUp className='mx-auto mb-3 h-12 w-12 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold text-gray-900'>
                                {packagesData?.message || 'No Popular Plans Available'}
                            </h3>
                            <p className='text-sm text-gray-600'>Popular plans are currently unavailable.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    function parsePlan(planString: string): PlanDetails {
        const parts = planString.split(' - ');
        const result: PlanDetails = {};

        parts.forEach((part) => {
            const lower = part.toLowerCase();

            if (lower.includes('gb')) {
                result.data = part.trim();
            } else if (lower.includes('sms')) {
                result.sms = part.trim();
            } else if (lower.includes('mins')) {
                result.mins = part.trim();
            } else if (lower.includes('days')) {
                result.days = part.trim();
            }
        });

        return result;
    }

    const handleExploreModal = (planData: Package) => {
        if (!userRedux) {
            showAlertMessage('Please log in to purchase a plan.', 'warning');
            return;
        }
        const SMS = parsePlan(planData.name).sms;
        const MINS = parsePlan(planData.name).mins;
        if (SMS && MINS && userRedux?.kyc_status !== 'approved') {
            showAlertMessage('To view plan details, please complete KYC verification.', 'warning');
            setTimeout(() => {
                router.push('/profile');
            }, 3000);
            return;
        }
        setisPlanExploreModalOpen(true);
        setprovideId(planData.id);
    };
    const handleBuyPlanModal = (planData: Package) => {
        if (!userRedux) {
            showAlertMessage('Please log in to purchase a plan.', 'warning');
            return;
        }

        const SMS = parsePlan(planData.name).sms;
        const MINS = parsePlan(planData.name).mins;

        if (SMS && MINS && userRedux?.kyc_status !== 'approved') {
            showAlertMessage('To view plan details, please complete KYC verification.', 'warning');
            setTimeout(() => {
                router.push('/profile');
            }, 3000);
            return;
        }
        setisBuyPlanExploreModalOpen(true);
        setprovideId(planData.id);
    };

    const handleBuyNow = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
    };

    return (
        <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section - Fully Dynamic */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Star className='h-4 w-4 text-yellow-500' />
                        {t('home.popularPlan.mostPopularEsims', { count: popularPackages.length })}
                    </div>

                    <h1 className='text-primary mb-4 text-3xl font-bold md:text-4xl'>
                        {t('home.popularPlan.popularEsims')}
                    </h1>

                    <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600'>
                        {t('home.popularPlan.choosePackages', {
                            total: packagesData.meta.total,
                            pages: packagesData.meta.last_page
                        })}
                    </p>

                    <Button onClick={() => router.push('all-packages')}>{t('home.popularPlan.viewAllPackages')}</Button>
                </div>

                {/* Compact Popular Plans Grid */}
                {isLoading ? (
                    <PlanCardSkeleton count={4} />
                ) : (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {popularPackages.map((plan, index) => {
                            const isTopPick = index === 0;
                            const planTypeData = parsePlan(plan.name);

                            return (
                                <div
                                    key={plan.id}
                                    className={`group relative transform rounded-2xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isTopPick
                                            ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}>
                                    <div className='absolute -top-2 -right-2'>
                                        <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                                            Most Populer
                                        </div>
                                    </div>
                                    {/* {isTopPick && (
                                    )} */}

                                    {/* Country Info */}
                                    <div className='mb-4 flex items-center gap-3'>
                                        {plan.country?.image ? (
                                            <div className='relative h-8 w-8 overflow-hidden rounded-full border border-gray-200'>
                                                <Image
                                                    src={plan.country.image}
                                                    alt={`${plan.country.name} flag`}
                                                    width={32}
                                                    height={32}
                                                    className='h-full w-full object-cover'
                                                    unoptimized
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = `<span class="text-lg">${getCountryFlag(plan.country?.country_code || '')}</span>`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className='text-lg'>
                                                {getCountryFlag(plan.country?.country_code || '')}
                                            </span>
                                        )}
                                        <div>
                                            <h3 className='text-sm font-bold text-gray-900'>
                                                {plan.name || `Plan ${plan.id}`}
                                            </h3>
                                            {/* <p className='text-xs text-gray-500 capitalize'>{plan.type} Plan</p> */}
                                        </div>
                                    </div>

                                    {/* Plan Details */}
                                    <div className='mb-4 text-center'>
                                        <div className='grid grid-cols-3 gap-4'>
                                            {/* Data */}
                                            <div className='flex flex-col items-center gap-2'>
                                                <ArrowDownUp className='h-4 w-4 text-blue-600' />
                                                <span className='text-sm font-medium text-gray-900'>
                                                    {formatDataType(plan.data)}
                                                </span>
                                            </div>

                                            {/* Voice */}
                                            <div className='flex flex-col items-center gap-2'>
                                                <PhoneCallIcon
                                                    className={`h-4 w-4 ${planTypeData.mins ? 'text-blue-600' : 'text-gray-400'}`}
                                                />
                                                <span
                                                    className={`text-sm font-medium ${planTypeData.mins ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {planTypeData.mins || 'N/A'}
                                                </span>
                                            </div>

                                            {/* SMS */}
                                            <div className='flex flex-col items-center gap-2'>
                                                <MessageSquare
                                                    className={`h-4 w-4 ${planTypeData.sms ? 'text-blue-600' : 'text-gray-400'}`}
                                                />
                                                <span
                                                    className={`text-sm font-medium ${planTypeData.sms ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {planTypeData.sms || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='mb-3 flex items-center justify-center gap-1 text-gray-600'>
                                            <Calendar className='h-3 w-3' />
                                            <span className='pt-2 text-xs'>{plan.day} Days</span>
                                        </div>

                                        <div className='mb-3'>
                                            <div className='flex items-baseline justify-center gap-1'>
                                                <span className='text-secondary text-2xl font-bold'>
                                                    {userRedux?.currency?.symbol || '$'}
                                                    {plan.net_price.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className='text-xs text-gray-500'>
                                                {userRedux?.currency?.symbol || '$'}
                                                {(plan.net_price / plan.day).toFixed(2)} per day
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dynamic Features */}
                                    <div className='mb-4 space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                            <span className='text-xs text-gray-700'>{plan.data} Data</span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                            <span className='text-xs text-gray-700'>Valid for {plan.day} days</span>
                                        </div>
                                    </div>

                                    <div className='mt-auto space-y-3'>
                                        {/* Get Details Button */}
                                        <Button
                                            onClick={() => handleExploreModal(plan)}
                                            variant='outline'
                                            className={`group w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50`}>
                                            <span className='flex items-center justify-center gap-2'>
                                                <View className='h-4 w-4 transition-transform group-hover:scale-110' />
                                                {t('home.popularPlan.viewPlanDetails')}
                                                <ArrowRight className='h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
                                            </span>
                                        </Button>

                                        {/* Buy Plan Button */}
                                        <Button
                                            onClick={() => handleBuyPlanModal(plan)}
                                            className={`group w-full transform rounded-lg px-4 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}>
                                            <span className='flex items-center justify-center gap-2'>
                                                <span className='relative'>
                                                    {t('home.popularPlan.chooseThisPlan')}
                                                    <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full' />
                                                </span>
                                                <ArrowRight className='h-4 w-4 transition-all group-hover:translate-x-1 group-hover:scale-110' />
                                            </span>
                                        </Button>
                                    </div>

                                    {/* Package ID */}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* <PaymentModal open={open} onOpenChange={setOpen} esimPackageId={esimPackageId ?? 0} /> */}
            {isPlanExploreModalOpen && (
                <PlanExploreModal
                    isOpen={isPlanExploreModalOpen}
                    onClose={() => setisPlanExploreModalOpen(false)}
                    packageId={provideId}
                    onPurchase={handleBuyNow}
                />
            )}
            {isBuyPlanExploreModalOpen && (
                <BuyPlanModal
                    isOpen={isBuyPlanExploreModalOpen}
                    onClose={() => setisBuyPlanExploreModalOpen(false)}
                    packageId={provideId}
                    onPurchase={handleBuyNow}
                />
            )}

            {showPaymentModal && (
                <PaymentModal
                    open={showPaymentModal}
                    onOpenChange={handlePaymentModalClose}
                    esimPackageId={provideId}
                />
            )}

            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={3000} />
            )}
        </section>
    );
};

export default PopularPlans;
