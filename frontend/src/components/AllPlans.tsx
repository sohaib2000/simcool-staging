'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import Alert from './Alert';
import BuyPlanModal from './modals/BuyPlanModal';
import PaymentModal from './modals/PaymentModal';
import PlanExploreModal from './modals/PlanExploreModal';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Database,
    Eye,
    Globe,
    MessageSquare,
    Phone,
    PhoneCallIcon,
    Star,
    TrendingUp,
    View,
    Wifi
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
export interface PlanDetails {
    data?: string;
    sms?: string;
    mins?: string;
    days?: string;
}

type PlanType = 'all' | 'data-call-sms';

const AllPlans = () => {
    const [isPlanExploreModalOpen, setisPlanExploreModalOpen] = useState(false);
    const [isBuyPlanExploreModalOpen, setisBuyPlanExploreModalOpen] = useState(false);
    const [provideId, setprovideId] = useState<number>(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const userRedux = useSelector((state: RootState) => state.user.user);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    // Get query parameters from URL or set defaults
    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page) : 1;
    });

    const [perPage, setPerPage] = useState(() => {
        const per_page = searchParams.get('per_page');
        return per_page ? parseInt(per_page) : 12;
    });

    const [planType, setPlanType] = useState<PlanType>(() => {
        const data_pack = searchParams.get('data_pack');
        const text_voice = searchParams.get('text_voice');

        if (text_voice === 'true') return 'data-call-sms';
        return 'all';
    });

    // Build dynamic API URL with query parameters based on tab selection
    const apiUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('per_page', perPage.toString());
        params.set('sort_price', 'low'); // Always add sort_price=low as mentioned

        // Add specific parameters based on plan type
        if (planType === 'all') {
            params.set('data_pack', 'true');
        } else if (planType === 'data-call-sms') {
            params.set('text_voice', 'true');
        }

        return `/packages?${params.toString()}`;
    }, [currentPage, perPage, planType]);

    // API call with dynamic URL
    // const { data: packagesData } = usePublicApiHandler({
    //     url: apiUrl
    // }) as { data: ApiResponse | null };

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const { data: packagesData } =
        userToken === null
            ? (usePublicApiHandler({
                  url: apiUrl
              }) as { data: ApiResponse | null })
            : (useProtectedApiHandler({
                  url: apiUrl
              }) as { data: ApiResponse | null });

    // useEffect(() => {
    //     refetch();
    //     console.log('this console inside plan');
    // });

    // Update URL when any parameter changes
    const updateUrl = useCallback(
        (page: number, per_page: number, type: PlanType) => {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('per_page', per_page.toString());
            params.set('sort_price', 'low');

            // Set specific parameters based on plan type
            if (type === 'all') {
                params.set('data_pack', 'true');
            } else if (type === 'data-call-sms') {
                params.set('text_voice', 'true');
            }

            router.push(`?${params.toString()}`, { scroll: false });
        },
        [router]
    );

    // Sync URL params with state
    useEffect(() => {
        const page = searchParams.get('page');
        const per_page = searchParams.get('per_page');
        const data_pack = searchParams.get('data_pack');
        const text_voice = searchParams.get('text_voice');

        const newPage = page ? parseInt(page) : 1;
        const newPerPage = per_page ? parseInt(per_page) : 12;
        const newPlanType: PlanType = text_voice === 'true' ? 'data-call-sms' : 'all';

        if (newPage !== currentPage) {
            setCurrentPage(newPage);
        }
        if (newPerPage !== perPage) {
            setPerPage(newPerPage);
        }
        if (newPlanType !== planType) {
            setPlanType(newPlanType);
        }
    }, [searchParams, currentPage, perPage, planType]);

    // Helper function to get country flag from country code
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && packagesData?.meta && newPage <= packagesData.meta.last_page) {
            setCurrentPage(newPage);
            updateUrl(newPage, perPage, planType);
        }
    };

    // Handle per page change
    const handlePerPageChange = (newPerPage: string) => {
        const per_page = parseInt(newPerPage);
        setPerPage(per_page);
        setCurrentPage(1); // Reset to first page
        updateUrl(1, per_page, planType);
    };

    // Handle tab change
    const handleTabChange = (newType: PlanType) => {
        setPlanType(newType);
        setCurrentPage(1); // Reset to first page when changing tabs
        updateUrl(1, perPage, newType);
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        if (!packagesData?.meta) return [];

        const { current_page, last_page } = packagesData.meta;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
            range.push(i);
        }

        if (current_page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (current_page + delta < last_page - 1) {
            rangeWithDots.push('...', last_page);
        } else {
            rangeWithDots.push(last_page);
        }

        return rangeWithDots;
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

    const formatData = (data: string) => {
        const value = Number.parseFloat(data);

        if (isNaN(value)) return data;

        if (value < 1) {
            return `${(value * 1024).toFixed(0)} MB`;
        }

        return `${value} GB`;
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

    const isLoading = !packagesData;

    if (isLoading) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading {planType} plans...</p>
                        <p className='text-sm text-gray-500'>
                            Page {currentPage} • {perPage} per page
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!packagesData?.success || packagesData.data.length === 0) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='max-w-md rounded-2xl bg-white p-8 text-center shadow-lg'>
                            <TrendingUp className='mx-auto mb-4 h-16 w-16 text-blue-500' />
                            <h3 className='mb-2 text-xl font-bold text-gray-900'>
                                No {planType === 'all' ? 'Data' : 'Data + Call + SMS'} Plans Found
                            </h3>
                            <p className='mb-4 text-gray-600'>
                                No plans available for page {currentPage} with {perPage} items per page.
                            </p>
                            <Button onClick={() => handlePageChange(1)}>Go to First Page</Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const handleBuyNow = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
    };

    return (
        <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Globe className='h-4 w-4' />
                        All eSIM Plans
                    </div>

                    <h1 className='text-primary mb-4 text-3xl font-bold md:text-4xl'>
                        Browse All {packagesData.meta.total} Plans
                    </h1>

                    <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600'>
                        Showing {packagesData.meta.from}-{packagesData.meta.to} of {packagesData.meta.total} plans •
                        Page {packagesData.meta.current_page} of {packagesData.meta.last_page}
                    </p>
                </div>

                {/* Plan Type Tabs */}
                <div className='mb-8'>
                    <Tabs
                        value={planType}
                        onValueChange={(value) => handleTabChange(value as PlanType)}
                        className='w-full'>
                        {/* Tab Headers */}
                        <div className='mb-8 flex justify-center'>
                            <TabsList className='grid h-auto w-full max-w-lg grid-cols-1 gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg sm:grid-cols-2 sm:gap-0 sm:p-1 md:h-14'>
                                <TabsTrigger
                                    value='all'
                                    className='data-[state=active]:bg-primary flex flex-wrap items-center justify-center rounded-xl px-3 py-3 text-xs font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 data-[state=active]:text-white data-[state=active]:shadow-md sm:py-2 sm:text-sm md:flex-nowrap'>
                                    <Wifi className='mr-1.5 h-4 w-4 flex-shrink-0 sm:mr-2' />
                                    <span className='whitespace-nowrap'>All Data Plans</span>
                                    <span className='ml-1.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:ml-2'>
                                        {planType === 'all' ? packagesData.meta.total : ''}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value='data-call-sms'
                                    className='data-[state=active]:bg-primary flex flex-wrap items-center justify-center rounded-xl px-3 py-3 text-xs font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 data-[state=active]:text-white data-[state=active]:shadow-md sm:py-2 sm:text-sm md:flex-nowrap'>
                                    <div className='mr-1.5 flex flex-shrink-0 items-center gap-1 sm:mr-2'>
                                        <Wifi className='h-3 w-3' />
                                        <Phone className='h-3 w-3' />
                                        <MessageSquare className='h-3 w-3' />
                                    </div>
                                    <span className='text-center whitespace-nowrap sm:text-left'>
                                        Data + Call + SMS
                                    </span>
                                    <span className='ml-1.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 sm:ml-2'>
                                        {planType === 'data-call-sms' ? packagesData.meta.total : ''}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab Content */}
                        <TabsContent value={planType} className='mt-8'>
                            {/* Top Info Bar */}
                            <div className='mb-6 flex items-center justify-center gap-6 text-sm text-gray-500'>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-1'>
                                        {planType === 'all' ? (
                                            <Wifi className='h-4 w-4' />
                                        ) : (
                                            <>
                                                <Wifi className='h-3 w-3' />
                                                <Phone className='h-3 w-3' />
                                                <MessageSquare className='h-3 w-3' />
                                            </>
                                        )}
                                    </div>
                                    <span>{planType === 'all' ? 'Data Only Plans' : 'Data + Voice + SMS Plans'}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Eye className='h-4 w-4' />
                                    <span>{perPage} per page</span>
                                </div>
                            </div>

                            {/* Plans Grid */}
                            <div className='mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                {packagesData.data.map((plan) => {
                                    const planTypeData = parsePlan(plan.name);
                                    return (
                                        <div
                                            key={plan.id}
                                            className='group relative transform rounded-2xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl'>
                                            {plan.is_popular && (
                                                <div className='absolute -top-2 -right-2'>
                                                    <div className='flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                                                        <Star className='h-3 w-3' />
                                                        Popular
                                                    </div>
                                                </div>
                                            )}

                                            {/* Plan Type Indicator */}
                                            <div className='absolute top-3 left-3'>
                                                <div
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        planType === 'all'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {planType === 'all' ? 'Data' : 'Full Service'}
                                                </div>
                                            </div>

                                            {/* Country Info */}
                                            <div className='mt-8 mb-4 flex items-center gap-3'>
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
                                                        {plan.country?.name || `Plan ${plan.name}`}
                                                    </h3>
                                                    <p className='text-xs text-gray-500 capitalize'>{plan.type} Plan</p>
                                                </div>
                                            </div>

                                            {/* Plan Details */}
                                            <div className='mb-4 text-center'>
                                                <div className='grid grid-cols-3 gap-4'>
                                                    {/* Data */}
                                                    <div className='flex flex-col items-center gap-2'>
                                                        <Database className='h-4 w-4 text-blue-600' />
                                                        <span className='text-sm font-medium text-gray-900'>
                                                            {/* {plan.data} */}
                                                            {formatData(plan.data)}
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
                                                            {userRedux?.currency?.symbol || '$'}{' '}
                                                            {Number(plan.net_price || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <p className='text-xs text-gray-500'>
                                                        {userRedux?.currency?.symbol || '$'}{' '}
                                                        {/* {(plan.net_price / plan.day).toFixed(2)} per day */}
                                                        {(
                                                            (Number(plan.net_price) || 0) / (Number(plan.day) || 1)
                                                        ).toFixed(2)}{' '}
                                                        per day
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className='mb-4 space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                                    <span className='text-xs text-gray-700'>
                                                        {formatData(plan.data)} Data
                                                    </span>
                                                </div>

                                                {planType === 'data-call-sms' && (
                                                    <>
                                                        <div className='flex items-center gap-2'>
                                                            <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                                            <span className='text-xs text-gray-700'>
                                                                Voice Calls Included
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                                            <span className='text-xs text-gray-700'>SMS Messaging</span>
                                                        </div>
                                                    </>
                                                )}

                                                <div className='flex items-center gap-2'>
                                                    <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                                                    <span className='text-xs text-gray-700'>
                                                        {plan.day} Days Validity
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
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
                                                    className={`group w-full transform rounded-lg px-4 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}>
                                                    <span className='flex items-center justify-center gap-2'>
                                                        <span className='relative'>
                                                            Choose This Plan{' '}
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
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Bottom Controls - Left: Limits, Right: Pagination */}
                <div className='border-t border-gray-200 pt-8'>
                    <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                        {/* Left Side - Limits Control */}
                        <div className='flex flex-col items-center gap-4 lg:flex-row lg:items-center'>
                            <div className='flex items-center gap-3'>
                                <Eye className='h-5 w-5 text-gray-500' />
                                <span className='text-sm font-medium text-gray-700'>Items per page:</span>
                                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className='h-9 w-20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='6'>6</SelectItem>
                                        <SelectItem value='12'>12</SelectItem>
                                        <SelectItem value='24'>24</SelectItem>
                                        <SelectItem value='48'>48</SelectItem>
                                        <SelectItem value='96'>96</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Results Info */}
                        </div>

                        {/* Right Side - Pagination Controls */}
                        <div className='flex flex-col items-center gap-4'>
                            {/* Pagination Buttons */}
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handlePageChange(packagesData.meta.current_page - 1)}
                                    disabled={packagesData.meta.current_page === 1}
                                    className='flex items-center gap-2'>
                                    <ChevronLeft className='h-4 w-4' />
                                    Prev
                                </Button>

                                <div className='flex items-center gap-1'>
                                    {generatePageNumbers().map((pageNum, index) => (
                                        <React.Fragment key={index}>
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

                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handlePageChange(packagesData.meta.current_page + 1)}
                                    disabled={packagesData.meta.current_page === packagesData.meta.last_page}
                                    className='flex items-center gap-2'>
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
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={3000} />
            )}
        </section>
    );
};

export default AllPlans;
