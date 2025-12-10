'use client';

import React, { useEffect, useMemo } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import CountryRegionSkeleton from '../skeleton/CountryRegionSkeleton';
import { ChevronRightIcon, GlobeIcon, MapPinIcon } from 'lucide-react';
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
    start_price: number;
}

interface Region {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_price: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T[];
}

const TravelDestinationTabs = () => {
    const userRedux = useSelector((state: RootState) => state.user.user);

    const currency = userRedux?.currency?.symbol;

    const router = useRouter();
    const { t } = useTranslation();

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const {
        data: countryApiData,
        isLoading: countryLoading,
        refetch: refetchCountry
    } = userToken === null
        ? usePublicApiHandler<ApiResponse<Country>>({
              url: '/country'
          })
        : useProtectedApiHandler<ApiResponse<Country>>({
              url: '/country'
          });

    const { data: regionApiData, refetch: refetchRegion } =
        userToken === null
            ? usePublicApiHandler<ApiResponse<Region>>({
                  url: '/regions',
                  config: {
                      cache: 'no-cache'
                  }
              })
            : useProtectedApiHandler<ApiResponse<Region>>({
                  url: '/regions',
                  config: {
                      cache: 'no-cache'
                  }
              });

    useEffect(() => {
        refetchCountry();
        refetchRegion();
    }, []);

    // Memoize countries data to prevent unnecessary re-renders
    const countries = useMemo(() => {
        return countryApiData?.success ? countryApiData.data : [];
    }, [countryApiData]);

    // Memoize regions data to prevent unnecessary re-renders
    const regions = useMemo(() => {
        return regionApiData?.success ? regionApiData.data : [];
    }, [regionApiData]);

    // Helper function to get country flag emoji as fallback
    const getCountryFlag = (countryCode: string): string => {
        const flagMap: Record<string, string> = {
            IN: '🇮🇳',
            US: '🇺🇸',
            GB: '🇬🇧',
            JP: '🇯🇵',
            FR: '🇫🇷',
            AE: '🇦🇪',
            SG: '🇸🇬',
            AU: '🇦🇺',
            TH: '🇹🇭',
            DE: '🇩🇪',
            ES: '🇪🇸',
            IT: '🇮🇹',
            GR: '🇬🇷',
            TR: '🇹🇷',
            PT: '🇵🇹',
            CA: '🇨🇦',
            CN: '🇨🇳'
        };
        return flagMap[countryCode] || '🌍';
    };

    const handleCountryClick = (countryId: string) => {
        router.push(`/country-plan/${countryId}`);
    };

    const handleRegionClick = (regionId: string | undefined) => {
        router.push(`/region-plan/${regionId}`);
        // router.push(`/region-plan?countryId=${regionId}`);
    };

    return (
        <section className='bg-gradient-to-b from-blue-50 to-white py-16 lg:py-20'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Enhanced Header Section */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <GlobeIcon className='h-4 w-4' />
                        {t('home.travelDestination.globalEsim')}
                    </div>

                    <h2 className='text-primary mb-4 text-3xl font-bold md:text-4xl lg:text-5xl'>
                        {t('home.travelDestination.choosePlan')}
                    </h2>

                    <p className='mx-auto mb-8 max-w-2xl text-lg text-gray-600'>
                        {t('home.travelDestination.planDescription')}
                    </p>

                    <Button
                        onClick={() => router.push('/all-destinations')}
                        size='lg'
                        className='from-primary to-secondary hover:from-secondary hover:to-primary rounded-full bg-gradient-to-r px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl'>
                        {t('home.travelDestination.viewDestinations')}
                        <ChevronRightIcon className='ml-2 h-4 w-4' />
                    </Button>
                </div>

                {/* Beautiful Modern Tabs */}
                <Tabs defaultValue='country' className='w-full'>
                    {/* Enhanced Tabs List */}
                    <div className='mb-8 flex justify-center'>
                        <TabsList className='grid h-14 w-full max-w-md grid-cols-2 rounded-2xl border border-gray-200 bg-white p-1 shadow-lg'>
                            <TabsTrigger
                                value='country'
                                className='data-[state=active]:bg-primary rounded-xl text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 data-[state=active]:text-white data-[state=active]:shadow-md'>
                                <MapPinIcon className='mr-2 h-4 w-4' />
                                {t('home.travelDestination.byCountry')}
                            </TabsTrigger>
                            <TabsTrigger
                                value='region'
                                className='data-[state=active]:bg-primary rounded-xl text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 data-[state=active]:text-white data-[state=active]:shadow-md'>
                                <GlobeIcon className='mr-2 h-4 w-4' />
                                {t('home.travelDestination.byRegion')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Country Tab Content */}
                    <TabsContent value='country' className='mt-8'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {countryLoading ? (
                                <CountryRegionSkeleton count={6} />
                            ) : (
                                countries.slice(0, 9).map((country) => (
                                    <button
                                        key={country.id}
                                        type='button'
                                        onClick={() => handleCountryClick(country.slug)}
                                        aria-label={`Select ${country.name} - From US$${country?.start_price?.toFixed(2)}`}
                                        className='group transform cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-50'>
                                                    <div className='relative h-full w-full'>
                                                        <Image
                                                            src={country.image}
                                                            alt={`${country.name} flag`}
                                                            width={48}
                                                            height={48}
                                                            className='h-full w-full object-cover'
                                                            unoptimized
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement?.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<span class="text-2xl">${getCountryFlag(country.country_code)}</span>`;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='text-start'>
                                                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                                                        {country.name}
                                                    </h3>
                                                    <p className='text-sm font-medium text-gray-500'>
                                                        From {currency || '$'}
                                                        {country?.start_price?.toFixed(2)}
                                                    </p>
                                                    {/* <p className='text-xs text-gray-400'>1GB - 30 Days</p> */}
                                                </div>
                                            </div>

                                            <div className='rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-blue-50'>
                                                <ChevronRightIcon className='h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600' />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Region Tab Content */}
                    <TabsContent value='region' className='mt-8'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {regions.length > 0 ? (
                                regions.slice(0, 9).map((region) => (
                                    <button
                                        key={region?.id}
                                        type='button'
                                        onClick={() => handleRegionClick(region?.slug)}
                                        aria-label={`Select ${region?.name} region - From US$${region?.start_price?.toFixed(2)}`}
                                        className='group transform cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-100 to-blue-100'>
                                                    <div className='relative h-full w-full'>
                                                        <Image
                                                            src={region?.image ?? ''}
                                                            alt={`${region?.name} region`}
                                                            width={48}
                                                            height={48}
                                                            className='h-full w-full object-cover'
                                                            unoptimized
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement?.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML =
                                                                        '<svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg>';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='text-start'>
                                                    <h3 className='group-hover:text-primary text-lg font-bold text-gray-900 transition-colors'>
                                                        {region?.name}
                                                    </h3>
                                                    <p className='text-sm font-medium text-gray-500'>
                                                        From {userRedux?.currency?.symbol || '$'}
                                                        {region?.start_price?.toFixed(2)}
                                                    </p>
                                                    <p className='text-xs text-gray-400'>Multi-country coverage</p>
                                                </div>
                                            </div>

                                            <div className='rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-purple-50'>
                                                <ChevronRightIcon className='group-hover:text-primary h-5 w-5 text-gray-400 transition-colors' />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <span> Data not found </span>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
};

export default TravelDestinationTabs;
