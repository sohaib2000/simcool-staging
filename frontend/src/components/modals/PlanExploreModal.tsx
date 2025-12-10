'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';
import { formatDataType } from '@/utils/formatData ';

import { CountryFlagListModal } from './CountryFlagListModal';
import {
    Infinity,
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Database,
    DollarSign,
    Info,
    MapPin,
    Shield,
    Smartphone,
    Wifi
} from 'lucide-react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { FaMoneyCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';

interface Region {
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
    country: Country[];
    region: Region[];
    operator: Operator;
}

interface ApiResponse {
    data: PackageData;
    success: boolean;
    message: string;
}

interface PlanExploreModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageId: number;
    onPurchase?: () => void | undefined;
}

const PlanExploreModal: React.FC<PlanExploreModalProps> = ({ isOpen, onClose, packageId, onPurchase }) => {
    const userToken = useSelector((state: RootState) => state.user.userToken);

    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const segments = useMemo(
        () => pathname.split('/').filter(Boolean), // ["region-plan", "middle-east-north-africa"]
        [pathname]
    );

    const params = useParams();

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

    const userRedux = useSelector((state: RootState) => state.user.user);
    // Memoize package details for performance optimization
    const packageDetails = useMemo(() => {
        return packageData?.success ? packageData.data : null;
    }, [packageData]);

    // const currntCountryData = packageDetails?.region.find((item) => item.slug == params.countryId);
    const currntCountryData = useMemo(() => {
        const planType = pathname.split('/')[1]; // "country-plan" | "region-plan"

        return planType === 'country-plan'
            ? packageDetails?.country?.find((c) => c.slug === params.countryId)
            : packageDetails?.region?.find((r) => r.slug === params.id);
    }, [pathname, packageDetails, params.countryId]);

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

    const handlePurchase = (): void => {
        if (onPurchase) {
            onPurchase();
        }
        onClose();
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        const currentCountry = packageDetails?.country.find((item) => item.name == 'india');
        if (parent && currentCountry) {
            parent.innerHTML = `<span class="text-lg">${getCountryFlag(currentCountry.country_code)}</span>`;
        }
    };

    // Loading state component
    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='max-h-[90vh] max-w-4xl gap-0 p-0'>
                    <DialogTitle className='sr-only'>Loading Plan Details</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <div className='flex min-h-[400px] flex-col items-center justify-center p-8'>
                        <div
                            className='mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-blue-600'
                            aria-label='Loading'></div>
                        <p className='text-gray-600'>Loading plan details...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Error or no data state component
    if (!packageData?.success || !packageDetails) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='max-h-[90vh] max-w-4xl gap-0 p-0'>
                    <DialogTitle className='sr-only'>Plan Not Found</DialogTitle>
                    <DialogDescription className='text-sm text-gray-600'>
                        {packageDetails
                            ? `${packageDetails.name} • ${packageDetails.operator?.name} - View complete plan details and pricing`
                            : 'Loading plan information...'}
                    </DialogDescription>
                    <div className='flex min-h-[400px] flex-col items-center justify-center p-8'>
                        <div className='max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg'>
                            <AlertTriangle className='mx-auto mb-3 h-12 w-12 text-red-500' aria-hidden='true' />
                            <h3 className='mb-2 text-lg font-bold text-gray-900'>Plan Not Found</h3>
                            <p className='text-sm text-gray-600'>
                                {packageData?.message || 'Unable to load plan details.'}
                            </p>
                            <Button onClick={onClose} className='mt-4'>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const dailyPrice = (packageDetails.net_price / packageDetails.day).toFixed(2);
    const hasOperatorInfo = Boolean(packageDetails.operator?.info);
    const hasFairUsagePolicy = packageDetails.is_fair_usage_policy && Boolean(packageDetails.fair_usage_policy);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='max-h-[90vh] max-w-4xl gap-0 overflow-hidden p-0'>
                    {/* Header */}
                    <DialogHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 pb-4'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='mb-2 flex items-center gap-3'>
                                    {currntCountryData && currntCountryData.image ? (
                                        <div className='relative h-8 w-8 overflow-hidden rounded-full border border-gray-200'>
                                            <Image
                                                src={currntCountryData.image}
                                                alt={`${currntCountryData.name} flag`}
                                                width={32}
                                                height={32}
                                                className='h-full w-full object-cover'
                                                unoptimized
                                                onError={handleImageError}
                                            />
                                        </div>
                                    ) : (
                                        <span className='text-lg' aria-label={`${currntCountryData} flag`}>
                                            {getCountryFlag(currntCountryData?.image || '')}
                                        </span>
                                    )}
                                    <div>
                                        <DialogTitle className='text-xl font-bold text-gray-900'>
                                            {packageDetails.name}
                                        </DialogTitle>
                                        <DialogDescription className='text-sm text-gray-600'>
                                            {/* <button onClick={() => setOpen(true)}> click</button> */}
                                        </DialogDescription>
                                    </div>
                                </div>

                                <div className='mt-3 flex flex-wrap items-center gap-2'>
                                    <Badge variant={packageDetails.is_unlimited ? 'default' : 'secondary'}>
                                        {packageDetails.is_unlimited ? 'Unlimited' : 'Limited Data'}
                                    </Badge>
                                    <Badge variant='outline' className='capitalize'>
                                        {packageDetails.type} Plan
                                    </Badge>
                                    {hasFairUsagePolicy && <Badge variant='destructive'>Fair Usage Policy</Badge>}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Modal Body */}
                    <div className='max-h-[60vh] overflow-y-auto px-6 py-4'>
                        {/* Price and Data Section */}
                        <div className='from-primary to-secondary mb-6 rounded-lg bg-gradient-to-r p-6 text-white'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                <div className='text-center'>
                                    <div className='mb-2 flex items-center justify-center gap-2'>
                                        {packageDetails.is_unlimited ? (
                                            <Infinity className='h-6 w-6' aria-hidden='true' />
                                        ) : (
                                            <Database className='h-6 w-6' aria-hidden='true' />
                                        )}
                                        <span className='text-2xl font-bold'>
                                            {formatDataType(packageDetails.data)}
                                        </span>
                                    </div>
                                    <p className='text-sm text-blue-100'>Data Allowance</p>
                                </div>

                                <div className='text-center'>
                                    <div className='mb-2 flex items-center justify-center gap-2'>
                                        <Calendar className='h-6 w-6' aria-hidden='true' />
                                        <span className='text-2xl font-bold'>{packageDetails.day}</span>
                                    </div>
                                    <p className='text-sm text-blue-100'>Days Valid</p>
                                </div>
                                <div className='text-center'>
                                    <div className='mb-2 flex items-center justify-center gap-2'>
                                        <FaMoneyCheck className='h-6 w-6' aria-hidden='true' />
                                        <span className='text-2xl font-bold'>
                                            {packageDetails.net_price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className='text-sm text-blue-100'>
                                        {userRedux?.currency?.symbol || '$'}
                                        {dailyPrice} per day
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Package Details */}
                        <div className='mb-6 space-y-4'>
                            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                                <Info className='h-5 w-5 text-blue-600' aria-hidden='true' />
                                Plan Details
                            </h3>

                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                <div className='space-y-3'>
                                    <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3'>
                                        <MapPin className='h-4 w-4 text-gray-600' aria-hidden='true' />
                                        <div>
                                            <p className='text-sm font-medium text-gray-900'>Coverage</p>
                                            {/* <p className='text-sm text-gray-600'>{currntCountryData?.name}</p> */}
                                            <div className='flex gap-2 pt-2'>
                                                {packageDetails.country &&
                                                    packageDetails.country
                                                        .slice(0, 4)
                                                        .map((imgData) => (
                                                            <Image
                                                                key={imgData.id}
                                                                src={imgData.image}
                                                                alt={imgData.name}
                                                                width={24}
                                                                height={24}
                                                                className='rounded-full'
                                                                unoptimized
                                                            />
                                                        ))}
                                                <button
                                                    className='text-[8px] text-blue-500'
                                                    onClick={() => setOpen(true)}>
                                                    see more
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3'>
                                        <Smartphone className='h-4 w-4 text-gray-600' aria-hidden='true' />
                                        <div>
                                            <p className='text-sm font-medium text-gray-900'>Fair Policy</p>
                                            <p className='text-sm text-gray-600 capitalize'>
                                                {packageDetails.is_fair_usage_policy ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3'>
                                        <Clock className='h-4 w-4 text-gray-600' aria-hidden='true' />
                                        <div>
                                            <p className='text-sm font-medium text-gray-900'>Activation</p>
                                            <p className='text-sm text-gray-600 capitalize'>
                                                {/* {packageDetails.operator?.activation_policy?.replace('-', ' ')} */}
                                                First Usage
                                            </p>
                                        </div>
                                    </div>

                                    {/* <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3'>
                                        <Wifi className='h-4 w-4 text-gray-600' aria-hidden='true' />
                                        <div>
                                            <p className='text-sm font-medium text-gray-900'>APN</p>
                                            <p className='text-sm text-gray-600'>
                                                {packageDetails.operator?.apn_value}
                                            </p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Operator Information */}
                        {hasOperatorInfo && (
                            <div className='mb-6'>
                                <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                                    <Shield className='h-5 w-5 text-blue-600' aria-hidden='true' />
                                    Network Information
                                </h3>
                                <div className='rounded-lg bg-blue-50 p-4'>
                                    <div className='flex items-start gap-3'>
                                        {packageDetails.operator.image && (
                                            <div className='relative h-12 w-12 overflow-hidden rounded-lg border border-blue-200'>
                                                <Image
                                                    src={packageDetails.operator.image}
                                                    alt={`${packageDetails.operator.name} logo`}
                                                    width={48}
                                                    height={48}
                                                    className='h-full w-full object-cover'
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        <div className='flex-1'>
                                            <h4 className='mb-1 font-medium text-gray-900'>
                                                {packageDetails.operator.name}
                                            </h4>
                                            <div className='text-sm whitespace-pre-line text-gray-700'>
                                                {packageDetails.operator.info}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fair Usage Policy Warning */}
                        {hasFairUsagePolicy && (
                            <div className='mb-6'>
                                <div className='rounded-lg border border-green-200 bg-blue-50 p-4'>
                                    <div className='flex items-start gap-3'>
                                        <AiOutlineThunderbolt
                                            className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600'
                                            aria-hidden='true'
                                        />
                                        <div>
                                            <h4 className='mb-1 font-medium text-blue-900'>Fair Usage Policy</h4>
                                            <p className='text-sm text-blue-800'>{packageDetails.fair_usage_policy}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Features List */}
                        <div className='mb-6'>
                            <h3 className='mb-3 text-lg font-semibold text-gray-900'>Features</h3>
                            <div className='space-y-2'>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle className='h-4 w-4 text-green-500' aria-hidden='true' />
                                    <span className='text-sm text-gray-700'>
                                        {formatDataType(packageDetails.data)} Data Allowance
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle className='h-4 w-4 text-green-500' aria-hidden='true' />
                                    <span className='text-sm text-gray-700'>Valid for {packageDetails.day} days</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle className='h-4 w-4 text-green-500' aria-hidden='true' />
                                    <span className='text-sm text-gray-700'>
                                        {packageDetails.operator?.plan_type} plan coverage
                                    </span>
                                </div>
                                {packageDetails.short_info && (
                                    <div className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' aria-hidden='true' />
                                        <span className='text-sm text-gray-700'>{packageDetails.short_info}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className='border-t border-gray-200 bg-gray-50 p-6'>
                        <div className='flex flex-col items-center gap-3 sm:flex-row'>
                            <div className='flex-1'>
                                {/* <p className='font-mono text-xs text-gray-500'>{packageDetails.airalo_package_id}</p> */}
                                <Button variant='outline' onClick={onClose}>
                                    Close
                                </Button>
                            </div>
                            <div className='flex gap-3 sm:flex-shrink-0'>
                                <Button
                                    onClick={handlePurchase}
                                    className='from-primary to-secondary hover:from-secondary hover:to-primary bg-gradient-to-r'>
                                    Purchase Plan - {userRedux?.currency?.symbol || '$'}
                                    {packageDetails.net_price.toFixed(2)}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {open && <CountryFlagListModal open={open} onOpenChange={setOpen} countries={packageDetails.country} />}
        </>
    );
};

export default PlanExploreModal;
