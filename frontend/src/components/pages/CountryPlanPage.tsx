'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import Alert from '@/components/Alert';
import { PlanDetails } from '@/components/PopulerPlan';
import ApiErrorPage from '@/components/errors/ApiErrorPage';
import BuyPlanModal from '@/components/modals/BuyPlanModal';
import PaymentModal from '@/components/modals/PaymentModal';
import PlanExploreModal from '@/components/modals/PlanExploreModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import {
    ArrowDownUp,
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
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
    country: number | null;
    perPage: number;
    page: number;
}

const CountryPlanPage: React.FC = () => {
    const [provideId, setprovideId] = useState<number>(0);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPlanExploreModalOpen, setisPlanExploreModalOpen] = useState(false);
    const [isBuyPlanExploreModalOpen, setisBuyPlanExploreModalOpen] = useState(false);
    const userRedux = useSelector((state: RootState) => state.user.user);
    const searchParams = useSearchParams();
    const countryIdNum = searchParams.get('countryId');
    const router = useRouter();

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
    const countryId = countryIdNum ? Number(countryIdNum) : null;

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
            params.append('country', currentFilters.country.toString());
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
    // const {
    //     data: packagesData,
    //     isLoading,
    //     error,
    //     refetch
    // } = usePublicApiHandler<ApiResponse | null>({
    //     url: `/packages?${queryString}`,
    //     enabled: !!queryString,
    //     queryOptions: {
    //         staleTime: 0
    //     }
    // });

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const {
        data: packagesData,
        isLoading,
        error,
        refetch
    } = userToken === null
        ? usePublicApiHandler<ApiResponse | null>({
              url: `/packages?${queryString}`,
              enabled: !!queryString,
              queryOptions: {
                  staleTime: 0
              }
          })
        : useProtectedApiHandler<ApiResponse | null>({
              url: `/packages?${queryString}`,
              enabled: !!queryString,
              queryOptions: {
                  staleTime: 0
              }
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

    // Enhanced pagination handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && packagesData?.meta && newPage <= packagesData.meta.last_page) {
            handleFilterChange('page', newPage);
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePerPageChange = (newPerPage: string) => {
        const perPageValue = parseInt(newPerPage);
        setFilters((prev) => ({
            ...prev,
            perPage: perPageValue,
            page: 1 // Reset to first page when changing items per page
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate smart pagination numbers
    const generatePageNumbers = () => {
        if (!packagesData?.meta) return [];

        const { current_page, last_page } = packagesData.meta;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        // Calculate range around current page
        for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
            range.push(i);
        }

        // Add first page and dots if needed
        if (current_page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        // Add calculated range
        rangeWithDots.push(...range);

        // Add last page and dots if needed
        if (current_page + delta < last_page - 1) {
            rangeWithDots.push('...', last_page);
        } else if (last_page > 1) {
            rangeWithDots.push(last_page);
        }

        return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    // ... all your existing handler functions remain the same (handleExploreModal, handleBuyPlanModal, etc.)
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
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-700'>
                        <Globe className='h-4 w-4 text-blue-500' />
                        Country Plans ({packagesData?.meta?.total || 0} total)
                    </div>

                    <h1 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>Country Data Plans</h1>

                    <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600'>
                        {packagesData?.meta && (
                            <>
                                Showing {packagesData.meta.from}-{packagesData.meta.to} of {packagesData.meta.total}{' '}
                                plans
                                {packagesData.meta.last_page > 1 && (
                                    <>
                                        {' '}
                                        • Page {packagesData.meta.current_page} of {packagesData.meta.last_page}
                                    </>
                                )}
                            </>
                        )}
                    </p>
                </div>

                {/* Filter Section */}
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
                            <div className='flex items-center gap-2'>
                                <Eye className='h-4 w-4 text-gray-500' />
                                <span className='text-sm text-gray-600'>Per page:</span>
                                <Select value={filters.perPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className='h-9 w-20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='6'>6</SelectItem>
                                        <SelectItem value='12'>12</SelectItem>
                                        <SelectItem value='24'>24</SelectItem>
                                        <SelectItem value='48'>48</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className='mt-4 rounded-lg border bg-white p-4 shadow-sm'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                {/* Data Type Filter */}
                                <div>
                                    <span className='mb-2 block text-sm font-medium text-gray-700'>Data Type</span>
                                    <div className='space-y-2'>
                                        <label className='flex items-center'>
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

                {/* Plans Grid - Your existing grid code remains exactly the same */}
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
                                {/* Your existing card content remains exactly the same */}
                                {isPopular && (
                                    <div className='absolute -top-2 -right-2'>
                                        <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                                            Most Popular
                                        </div>
                                    </div>
                                )}

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
                                            {plan.country?.name || `Plan ${plan.id}`}
                                        </h3>
                                        <p className='text-xs text-gray-500 capitalize'>{plan.type} Plan</p>
                                    </div>
                                </div>

                                {/* Plan Details */}
                                <div className='mb-4 text-center'>
                                    <div className='grid grid-cols-3 gap-4'>
                                        {/* Data */}
                                        <div className='flex flex-col items-center gap-2'>
                                            <ArrowDownUp className='h-4 w-4 text-blue-600' />
                                            <span className='text-sm font-medium text-gray-900'>{plan.data}</span>
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
                                            <span className='text-2xl font-bold text-gray-900'>
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
                                <div className='mb-4 flex-grow space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                        <span className='text-xs text-gray-700'>{plan.data} Data</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                        <span className='text-xs text-gray-700'>Valid for {plan.day} days</span>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className='mt-auto space-y-3'>
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

                                    <Button
                                        onClick={() => handleBuyPlanModal(plan)}
                                        className={`group w-full transform rounded-lg px-4 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                                            isPopular
                                                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-xl'
                                                : 'bg-gray-900 text-white shadow-md hover:bg-black hover:shadow-lg'
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

                {/* Enhanced Pagination Section */}
                {packagesData && packagesData.meta.last_page > 1 && (
                    <div className='mt-12 border-t border-gray-200 pt-8'>
                        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                            {/* Left Side - Results Info */}
                            <div className='flex flex-col items-center gap-2 lg:items-start'>
                                <div className='text-sm text-gray-500'>
                                    Showing <span className='font-medium text-gray-900'>{packagesData.meta.from}</span>{' '}
                                    to <span className='font-medium text-gray-900'>{packagesData.meta.to}</span> of{' '}
                                    <span className='font-medium text-gray-900'>{packagesData.meta.total}</span> results
                                </div>
                            </div>

                            {/* Right Side - Pagination Controls */}
                            <div className='flex flex-col items-center gap-4'>
                                {/* Pagination Buttons */}
                                <div className='flex items-center gap-2'>
                                    {/* Previous Button */}
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handlePageChange(packagesData.meta.current_page - 1)}
                                        disabled={packagesData.meta.current_page === 1}
                                        className='flex items-center gap-2 px-3 py-2'>
                                        <ChevronLeft className='h-4 w-4' />
                                        Prev
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className='flex items-center gap-1'>
                                        {generatePageNumbers().map((pageNum, index) => (
                                            <React.Fragment key={`${pageNum}-${index}`}>
                                                {pageNum === '...' ? (
                                                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                                                ) : (
                                                    <Button
                                                        variant={
                                                            pageNum === packagesData.meta.current_page
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size='sm'
                                                        onClick={() => handlePageChange(pageNum as number)}
                                                        className={`h-9 min-w-[36px] text-sm ${
                                                            pageNum === packagesData.meta.current_page
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'hover:bg-blue-50'
                                                        }`}>
                                                        {pageNum}
                                                    </Button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handlePageChange(packagesData.meta.current_page + 1)}
                                        disabled={packagesData.meta.current_page === packagesData.meta.last_page}
                                        className='flex items-center gap-2 px-3 py-2'>
                                        Next
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>

                                {/* Page Info */}
                                <div className='text-center text-sm text-gray-500'>
                                    Page {packagesData.meta.current_page} of {packagesData.meta.last_page}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* All your existing modals remain the same */}
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

export default CountryPlanPage;
