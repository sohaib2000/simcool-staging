'use client';

import React, { useMemo } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import { ChevronRightIcon, MapPin, Shield, Users, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';

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

const RegionPlanPage = () => {
    const router = useRouter();

    const userRedux = useSelector((state: RootState) => state.user.user);

    const { data: regionApiData } = usePublicApiHandler<ApiResponse<Region>>({
        url: '/regions'
    });

    const regions = useMemo(() => {
        return regionApiData?.success ? regionApiData.data : [];
    }, [regionApiData]);

    const handleRegionClick = (regionId: string) => {
        router.push(`/region-plan/${regionId}`);
    };

    return (
        <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <MapPin className='h-4 w-4' />
                        Regional Coverage
                    </div>

                    <h1 className='mb-6 text-4xl font-medium text-gray-900 md:text-5xl'>
                        <span className='bg-primary bg-clip-text text-transparent'>Regional Plans</span>
                    </h1>

                    <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600'>
                        Travel across multiple countries with one eSIM solution. Our regional plans offer comprehensive
                        coverage across continents, perfect for extended travels and business trips spanning multiple
                        destinations.
                    </p>

                    {/* Features highlights */}
                    <div className='mx-auto mb-8 flex max-w-2xl items-center justify-center gap-8 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                            <Users className='h-4 w-4 text-blue-500' />
                            <span>Multi-Country Coverage</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Zap className='h-4 w-4 text-purple-500' />
                            <span>Instant Activation</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Shield className='h-4 w-4 text-green-500' />
                            <span>Secure Connection</span>
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {regions
                        .filter((pkg) => pkg.start_price !== null)
                        .map((region) => (
                            <button
                                key={region.id}
                                type='button'
                                onClick={() => handleRegionClick(region.slug)}
                                aria-label={`Select ${region.name} region - From ${userRedux?.currency?.symbol || '$'}${(Number(region.start_price) || 0).toFixed(2)}`}
                                className='group transform cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-4'>
                                        {/* Fixed Image Container */}
                                        <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-100 to-blue-100'>
                                            {region.image ? (
                                                <div className='relative h-12 w-12'>
                                                    <Image
                                                        src={region.image}
                                                        alt={`${region.name} region`}
                                                        fill
                                                        className='object-cover'
                                                        sizes='48px'
                                                        unoptimized
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            const container = target.closest(
                                                                '.bg-gradient-to-br'
                                                            ) as HTMLElement;
                                                            if (container) {
                                                                container.innerHTML = `
                      <div class="flex h-12 w-12 items-center justify-center">
                        <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="m4.93 4.93 4.24 4.24"></path>
                          <path d="m14.83 9.17 4.24-4.24"></path>
                          <path d="m14.83 14.83 4.24 4.24"></path>
                          <path d="m9.17 14.83-4.24 4.24"></path>
                        </svg>
                      </div>
                    `;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <svg
                                                    className='h-6 w-6 text-purple-600'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <circle cx='12' cy='12' r='10'></circle>
                                                    <path d='m4.93 4.93 4.24 4.24'></path>
                                                    <path d='m14.83 9.17 4.24-4.24'></path>
                                                    <path d='m14.83 14.83 4.24 4.24'></path>
                                                    <path d='m9.17 14.83-4.24 4.24'></path>
                                                </svg>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className='flex-1'>
                                            <h3 className='group-hover:text-primary text-lg font-bold text-gray-900 transition-colors'>
                                                {region.name}
                                            </h3>
                                            <p className='text-sm font-medium text-gray-500'>
                                                From {userRedux?.currency?.symbol || '$'}
                                                {(Number(region.start_price) || 0).toFixed(2)}
                                            </p>
                                            <p className='text-xs text-gray-400'>Multi-country coverage</p>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className='rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-purple-50'>
                                        <ChevronRightIcon
                                            className='group-hover:text-primary h-5 w-5 text-gray-400 transition-colors'
                                            aria-hidden='true'
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </div>
        </section>
    );
};

export default RegionPlanPage;
