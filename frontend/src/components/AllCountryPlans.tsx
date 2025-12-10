'use client';

import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import { ChevronRight, MapPin, Search, Sparkles } from 'lucide-react';
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

interface ApiResponse {
    success: boolean;
    data: Country[];
}

const AllCountryPlans = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const userRedux = useSelector((state: RootState) => state.user.user);
    const userToken = useSelector((state: RootState) => state.user.userToken);
    const router = useRouter();

    const apiHandler = userToken ? useProtectedApiHandler : usePublicApiHandler;

    const { data: countryApiData, isLoading } = apiHandler<ApiResponse | null>({
        url: '/country'
    });

    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    const determineIfFeatured = (price: number): boolean => {
        return price < 5;
    };

    const countries = useMemo(() => {
        return countryApiData?.success ? countryApiData.data : [];
    }, [countryApiData]);

    const filteredCountries = useMemo(() => {
        let filtered = countries;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((country) => country.name.toLowerCase().includes(query));
        }

        return filtered.sort((a, b) => {
            const aFeatured = determineIfFeatured(a.start_price);
            const bFeatured = determineIfFeatured(b.start_price);
            if (aFeatured && !bFeatured) return -1;
            if (!aFeatured && bFeatured) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [countries, searchQuery]);

    const getCountryIcon = (country: Country) => {
        if (country.image) {
            return (
                <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                    <Image
                        src={country.image}
                        alt={`${country.name} flag`}
                        width={32}
                        height={32}
                        className='h-full w-full object-cover'
                        unoptimized
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && country.country_code) {
                                parent.innerHTML = `<span class="text-2xl">${getCountryFlag(country.country_code)}</span>`;
                            } else if (parent) {
                                parent.innerHTML =
                                    '<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                            }
                        }}
                    />
                </div>
            );
        }

        if (country.country_code) {
            return <span className='text-2xl'>{getCountryFlag(country.country_code)}</span>;
        }

        return <MapPin className='h-6 w-6 text-gray-400' />;
    };

    const handleNavigate = (country: Country) => {
        router.push(`/country-plan/${country.slug}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    if (isLoading) {
        return (
            <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading countries...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Sparkles className='h-4 w-4' />
                        Global Coverage
                    </div>

                    <h1 className='text-primary my-6 text-4xl font-medium md:text-5xl'>All Country Plans</h1>

                    <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600'>
                        Find the best data plans in over {countries.length}+ countries — and enjoy easy and safe
                        internet access wherever you go. Connect instantly with our premium eSIM solutions.
                    </p>
                </div>

                {/* Search Section */}
                <div className='mb-8'>
                    <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm'>
                                <span className='text-sm font-semibold text-gray-900'>
                                    Total Countries: {countries.length}
                                </span>
                            </div>
                        </div>

                        <div className='relative w-full sm:w-auto sm:min-w-[300px]'>
                            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                            <Input
                                type='text'
                                name='countrySearch'
                                placeholder='Search for country'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='h-12 rounded-xl border-gray-200 bg-white pr-4 pl-10 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                            />
                            {searchQuery && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleClearSearch}
                                    className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-lg p-0 hover:bg-gray-100'>
                                    ×
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className='mb-6'>
                        <p className='text-sm text-gray-600'>
                            Showing {filteredCountries.length} countries
                            {searchQuery && <span> for "{searchQuery}"</span>}
                        </p>
                    </div>

                    {filteredCountries.length > 0 ? (
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {filteredCountries
                                .filter((pk) => pk.start_price !== null)
                                .map((country) => {
                                    const isFeatured = determineIfFeatured(country.start_price);
                                    return (
                                        <button
                                            key={country.id}
                                            type='button'
                                            onClick={() => handleNavigate(country)}
                                            className={`group relative transform rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                                                isFeatured ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                                            }`}>
                                            {/* {isFeatured && (
                                            <div className='absolute top-3 right-3 rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-black'>
                                                Featured
                                            </div>
                                        )} */}

                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-50'>
                                                        {getCountryIcon(country)}
                                                    </div>

                                                    <div>
                                                        <h3 className='text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
                                                            {country.name}
                                                        </h3>
                                                        <p className='text-sm font-medium text-gray-600'>
                                                            From {userRedux?.currency?.symbol || '$'}
                                                            {(Number(country.start_price) || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-blue-50'>
                                                    <ChevronRight className='h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600' />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                                <Search className='h-8 w-8 text-gray-400' />
                            </div>
                            <h3 className='mb-2 text-lg font-medium text-gray-900'>No countries found</h3>
                            <p className='mb-4 text-gray-600'>Try adjusting your search criteria</p>
                            <Button variant='outline' onClick={handleClearSearch}>
                                Clear search
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AllCountryPlans;
