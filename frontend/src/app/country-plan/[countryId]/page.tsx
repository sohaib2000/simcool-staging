'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import Alert from '@/components/Alert';
import { PlanDetails } from '@/components/PopulerPlan';
import ApiErrorPage from '@/components/errors/ApiErrorPage';
import BuyPlanModal from '@/components/modals/BuyPlanModal';
import PaymentModal from '@/components/modals/PaymentModal';
import PlanExploreModal from '@/components/modals/PlanExploreModal';
import { Button } from '@/components/ui/button';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';
import { formatDataType } from '@/utils/formatData ';

import {
    ArrowDownUp,
    ArrowRight,
    Calendar,
    CheckCircle,
    Globe,
    MessageSquare,
    PhoneCallIcon,
    SlidersHorizontal,
    View,
    X
} from 'lucide-react';
import { useSelector } from 'react-redux';

interface Country {
    id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
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
    country: Country[];
    region: string | null;
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

interface FilterOptions {
    isUnlimited: boolean | null;
    sortPrice: 'high' | 'low' | null;
    country: string | null;
    perPage: number;
    page: number;
}

const CountryPlan: React.FC = () => {
    const [provideId, setprovideId] = useState<number>(0);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPlanExploreModalOpen, setisPlanExploreModalOpen] = useState(false);
    const [isBuyPlanExploreModalOpen, setisBuyPlanExploreModalOpen] = useState(false);
    const userRedux = useSelector((state: RootState) => state.user.user);

    const router = useRouter();
    const params = useParams();
    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    // convert string → number
    const countryIdParam = params.countryId as string;
    const countryId = countryIdParam || null;

    // Filter state management (removed dataPack)
    const [filters, setFilters] = useState<FilterOptions>({
        isUnlimited: null,
        sortPrice: null,
        country: countryId,
        perPage: 12,
        page: 1
    });

    const [showFilters, setShowFilters] = useState(false);

    // Build query parameters (removed dataPack logic)
    const buildQueryParams = useCallback((currentFilters: FilterOptions): string => {
        const params = new URLSearchParams();

        if (currentFilters.country) {
            params.append('slug', currentFilters.country.toString());
        }

        params.append('per_page', currentFilters.perPage.toString());
        params.append('page', currentFilters.page.toString());

        if (currentFilters.isUnlimited !== null) {
            params.append('is_unlimited', currentFilters.isUnlimited ? '1' : '0');
        }

        if (currentFilters.sortPrice) {
            params.append('sort_price', currentFilters.sortPrice);
        }

        return params.toString();
    }, []);

    // API call with dynamic query parameters
    const queryString = buildQueryParams(filters);

    const userToken = useSelector((state: RootState) => state.user.userToken);
    const tokeBaseHandler = userToken ? useProtectedApiHandler : usePublicApiHandler;

    const {
        data: packagesData,
        isLoading,
        error,
        refetch
    } = tokeBaseHandler<ApiResponse | null>({
        url: `/packages?${queryString}`
    });

    useEffect(() => {
        refetch();
    });

    // Helper function to get country flag from country code
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    // Memoize packages data
    const packages = useMemo(() => {
        if (!packagesData?.success || !packagesData.data) return [];
        return packagesData.data.filter((pkg) => pkg.is_active);
    }, [packagesData]);

    // const currntCountryData = packageDetails?.country.find((item) => item.slug == params.countryId);

    // Filter handlers
    const handleFilterChange = (key: keyof FilterOptions, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            isUnlimited: null,
            sortPrice: null,
            country: countryId,
            perPage: 12,
            page: 1
        });
    };

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

    const handlePageChange = (newPage: number) => {
        handleFilterChange('page', newPage);
    };

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

    if (isLoading) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[300px] flex-col items-center justify-center'>
                        <div className='mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-gray-600'>Loading country plans...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!packagesData?.success || packages.length === 0) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[300px] flex-col items-center justify-center'>
                        <div className='max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg'>
                            <Globe className='mx-auto mb-3 h-12 w-12 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold text-gray-900'>
                                {packagesData?.message || 'No Plans Available'}
                            </h3>
                            <p className='text-sm text-gray-600'>No plans found for the selected country.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const activeFiltersCount = [filters.isUnlimited !== null, filters.sortPrice !== null].filter(Boolean).length;

    if (error) return <ApiErrorPage onRetry={() => refetch()} isRetrying={isLoading} />;

    return (
        <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Globe className='h-4 w-4' />
                        Country Plans ({packages.length} available)
                    </div>

                    <h1 className='text-primary mb-4 text-3xl font-bold md:text-4xl'>Country Data Plans</h1>

                    <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600'>
                        Showing {packagesData.meta.from}-{packagesData.meta.to} of {packagesData.meta.total} plans
                    </p>
                </div>

                {/* Filter Section - Simplified (removed Plan Type) */}
                <div className='mb-8'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            <Button
                                variant='outline'
                                onClick={() => setShowFilters(!showFilters)}
                                className='flex items-center gap-2'>
                                <SlidersHorizontal className='h-4 w-4' />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className='rounded-full bg-blue-600 px-2 py-1 text-xs text-white'>
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>

                            {activeFiltersCount > 0 && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={clearAllFilters}
                                    className='text-gray-500 hover:text-gray-700'>
                                    <X className='mr-1 h-4 w-4' />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className='flex items-center gap-3'>
                            <select
                                name='perPageFileter'
                                value={filters.perPage}
                                onChange={(e) => handleFilterChange('perPage', parseInt(e.target.value))}
                                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'>
                                <option value={12}>12 per page</option>
                                <option value={24}>24 per page</option>
                                <option value={48}>48 per page</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Panel - Removed Plan Type filter */}
                    {showFilters && (
                        <div className='mt-4 rounded-lg border bg-white p-4 shadow-sm'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                {/* Data Type Filter */}
                                <div>
                                    <span className='mb-2 block text-sm font-medium text-gray-700'>Data Type</span>
                                    <div className='space-y-2'>
                                        <label id='unlimited' className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='unlimited'
                                                checked={filters.isUnlimited === null}
                                                onChange={() => handleFilterChange('isUnlimited', null)}
                                                className='mr-2'
                                            />{' '}
                                            All Plans
                                        </label>
                                        <label className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='unlimited'
                                                checked={filters.isUnlimited === true}
                                                onChange={() => handleFilterChange('isUnlimited', true)}
                                                className='mr-2'
                                            />{' '}
                                            Unlimited Only
                                        </label>
                                        <label className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='unlimited'
                                                checked={filters.isUnlimited === false}
                                                onChange={() => handleFilterChange('isUnlimited', false)}
                                                className='mr-2'
                                            />{' '}
                                            Limited Data Only
                                        </label>
                                    </div>
                                </div>

                                {/* Price Sort Filter */}
                                <div>
                                    <span className='mb-2 block text-sm font-medium text-gray-700'>Sort by Price</span>
                                    <div className='space-y-2'>
                                        <label className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='sortPrice'
                                                checked={filters.sortPrice === null}
                                                onChange={() => handleFilterChange('sortPrice', null)}
                                                className='mr-2'
                                            />{' '}
                                            Default
                                        </label>
                                        <label className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='sortPrice'
                                                checked={filters.sortPrice === 'low'}
                                                onChange={() => handleFilterChange('sortPrice', 'low')}
                                                className='mr-2'
                                            />{' '}
                                            Low to High
                                        </label>
                                        <label className='flex items-center'>
                                            <input
                                                type='radio'
                                                name='sortPrice'
                                                checked={filters.sortPrice === 'high'}
                                                onChange={() => handleFilterChange('sortPrice', 'high')}
                                                className='mr-2'
                                            />{' '}
                                            High to Low
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Plans Grid - Modified for consistent button positioning */}
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {packages.map((plan, index) => {
                        const isPopular = plan.is_popular;

                        const planTypeData = parsePlan(plan.name);

                        return (
                            <div
                                key={plan.id}
                                className={`group relative flex transform flex-col rounded-2xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                    isPopular
                                        ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}>
                                {isPopular && (
                                    <div className='absolute -top-2 -right-2'>
                                        <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                {/* Country Info */}
                                <div className='mb-4 flex items-center gap-3'>
                                    {plan.country.slice(0, 1)[0].image ? (
                                        <div className='relative h-8 w-8 overflow-hidden rounded-full border border-gray-200'>
                                            <Image
                                                src={plan.country.slice(0, 1)[0].image}
                                                alt={`${plan.country.slice(0, 1)[0].name} flag`}
                                                width={32}
                                                height={32}
                                                className='h-full w-full object-cover'
                                                unoptimized
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `<span class="text-lg">${getCountryFlag(plan.country?.slice(0, 1)[0].country_code || '')}</span>`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span className='text-lg'>
                                            {/* {getCountryFlag(plan.country.slice || '')} */}
                                            test
                                        </span>
                                    )}
                                    <div>
                                        <h3 className='text-sm font-bold text-gray-900'>
                                            {/* {plan.country?.name || `Plan ${plan.id}`} */}
                                            {plan.name}
                                        </h3>
                                        <p className='text-xs text-gray-500 capitalize'>
                                            {' '}
                                            {plan.country.slice(0, 1)[0].name} Plan
                                        </p>
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

                                    <div className='my-3 flex items-center justify-center gap-1 text-gray-600'>
                                        <Calendar className='h-3 w-3' />
                                        <span className='text-xs'>{plan.day} Days</span>
                                    </div>

                                    <div className='mb-3'>
                                        <div className='flex items-baseline justify-center gap-1'>
                                            <span className='text-secondary text-2xl font-bold'>
                                                {userRedux?.currency?.symbol || '$'} {plan?.net_price?.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-500'>
                                            {userRedux?.currency?.symbol || '$'}
                                            {(plan.net_price / plan.day)?.toFixed(2)} per day
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Features - This section will grow/shrink */}
                                <div className='mb-4 flex-grow space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                        <span className='text-xs text-gray-700'>{formatDataType(plan.data)} Data</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                        <span className='text-xs text-gray-700'>Valid for {plan.day} days</span>
                                    </div>
                                </div>

                                {/* CTA Button - Always at bottom with consistent positioning */}
                                <div className='mt-auto space-y-3'>
                                    {/* Get Details Button */}
                                    <Button
                                        onClick={() => handleExploreModal(plan)}
                                        variant='outline'
                                        className={`group w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50`}>
                                        <span className='flex items-center justify-center gap-2'>
                                            <View className='h-4 w-4 transition-transform group-hover:scale-110' />
                                            View Plan Details
                                            <ArrowRight className='h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
                                        </span>
                                    </Button>

                                    {/* Buy Plan Button */}
                                    <Button
                                        onClick={() => handleBuyPlanModal(plan)}
                                        className={`group w-full transform rounded-lg px-4 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                                            isPopular
                                                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-xl'
                                                : ''
                                        }`}>
                                        <span className='flex items-center justify-center gap-2'>
                                            <span className='relative'>
                                                Get Plan{' '}
                                                <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full' />
                                            </span>
                                            <ArrowRight className='h-4 w-4 transition-all group-hover:translate-x-1 group-hover:scale-110' />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {packagesData.meta.last_page > 1 && (
                    <div className='mt-12 flex items-center justify-center gap-2'>
                        {packagesData.links.prev && (
                            <Button
                                variant='outline'
                                onClick={() => handlePageChange(packagesData.meta.current_page - 1)}
                                className='px-4 py-2'>
                                Previous
                            </Button>
                        )}

                        <div className='flex items-center gap-1'>
                            {Array.from({ length: Math.min(5, packagesData.meta.last_page) }, (_, i) => {
                                const page = i + 1;
                                const isCurrentPage = page === packagesData.meta.current_page;

                                return (
                                    <Button
                                        key={page}
                                        variant={isCurrentPage ? 'default' : 'outline'}
                                        size='sm'
                                        onClick={() => handlePageChange(page)}
                                        className='h-8 w-8 p-0'>
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>

                        {packagesData.links.next && (
                            <Button
                                variant='outline'
                                onClick={() => handlePageChange(packagesData.meta.current_page + 1)}
                                className='px-4 py-2'>
                                Next
                            </Button>
                        )}
                    </div>
                )}
            </div>
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
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={4000} />
            )}
        </section>
    );
};

export default CountryPlan;
