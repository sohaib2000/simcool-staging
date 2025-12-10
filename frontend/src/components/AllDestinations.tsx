'use client';

import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import { ChevronRight, Globe, MapPin, Search, Sparkles } from 'lucide-react';
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

interface UnifiedDestination {
    id: string;
    name: string;
    price: string;
    image: string;
    country_code?: string;
    countries?: number;
    type: 'country' | 'region';
    featured?: boolean;
    slug: string;
}

const AllDestinations = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const userRedux = useSelector((state: RootState) => state.user.user);

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const tokeBaseHandler = userToken ? useProtectedApiHandler : usePublicApiHandler;

    const { data: countryApiData } = tokeBaseHandler<ApiResponse<Country>>({
        url: '/country'
    });

    const { data: regionApiData } = tokeBaseHandler<ApiResponse<Region>>({
        url: '/regions',
        enabled: userToken === null
    });

    // Helper functions defined before useMemo to avoid "Cannot access before initialization" error
    const getCountryFlag = (countryCode: string): string => {
        // Using country_code to get Unicode flag emoji
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    const determineIfFeatured = (price: number, name: string, type: 'country' | 'region'): boolean => {
        if (type === 'region') {
            // Featured regions based on popularity
            const popularRegions = ['europe', 'asia', 'americas', 'africa'];
            return popularRegions.includes(name.toLowerCase());
        }
        // Featured countries based on low price (under $5)
        return price < 5;
    };

    // Memoize countries data
    const countries = useMemo(() => {
        return countryApiData?.success ? countryApiData.data : [];
    }, [countryApiData]);

    // Memoize regions data
    const regions = useMemo(() => {
        return regionApiData?.success ? regionApiData.data : [];
    }, [regionApiData]);

    // Transform API data into unified format - now using helper functions defined above
    const unifiedDestinations = useMemo((): UnifiedDestination[] => {
        const countryDestinations: UnifiedDestination[] = countries
            .filter((pkg) => pkg.start_price !== null)
            .map((country) => ({
                id: `country-${country.id}`,
                name: country.name,
                price: `From ${userRedux?.currency?.symbol || '$'}${(Number(country.start_price) || 0).toFixed(2)}`,
                image: country.image,
                country_code: country.country_code,
                type: 'country',
                featured: determineIfFeatured(country.start_price, country.name, 'country'),
                slug: country.slug
            }));

        const regionDestinations: UnifiedDestination[] = regions
            .filter((pkg) => pkg.start_price !== null)
            .map((region) => ({
                id: `region-${region.id}`,
                name: region.name,
                price: `From ${userRedux?.currency?.symbol || '$'}${(Number(region.start_price) || 0).toFixed(2)}`,
                image: region.image,

                type: 'region',
                featured: determineIfFeatured(region.start_price, region.name, 'region'),
                slug: region.slug
            }));

        return [...countryDestinations, ...regionDestinations];
    }, [countries, regions]);

    // Optimized search and filter with useMemo
    const filteredDestinations = useMemo(() => {
        let filtered = unifiedDestinations;

        // Filter by tab - early return for performance
        if (activeTab !== 'all') {
            filtered = filtered.filter((dest) => dest.type === activeTab);
        }

        // Filter by search query - case insensitive
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((dest) => dest.name.toLowerCase().includes(query));
        }

        // Sort: featured first, then alphabetically
        return filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [unifiedDestinations, activeTab, searchQuery]);

    const getDestinationIcon = (dest: UnifiedDestination) => {
        if (dest.type === 'region') {
            if (dest.image) {
                return (
                    <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                        <Image
                            src={dest.image}
                            alt={`${dest.name} region`}
                            width={32}
                            height={32}
                            className='h-full w-full object-cover'
                            unoptimized
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML =
                                        '<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg></div>';
                                }
                            }}
                        />
                    </div>
                );
            }
            return <Globe className='h-8 w-8 text-blue-600' />;
        }

        // For countries, try API image first, then country flag from country_code
        if (dest.image) {
            return (
                <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                    <Image
                        src={dest.image}
                        alt={`${dest.name} flag`}
                        width={32}
                        height={32}
                        className='h-full w-full object-cover'
                        unoptimized
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && dest.country_code) {
                                parent.innerHTML = `<span class="text-2xl">${getCountryFlag(dest.country_code)}</span>`;
                            } else if (parent) {
                                parent.innerHTML =
                                    '<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                            }
                        }}
                    />
                </div>
            );
        }

        // Fallback to flag from country_code or default icon
        if (dest.country_code) {
            return <span className='text-2xl'>{getCountryFlag(dest.country_code)}</span>;
        }

        return <MapPin className='h-6 w-6 text-gray-400' />;
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
    };

    const router = useRouter();

    const handleNaviage = (info: UnifiedDestination) => {
        if (info.type == 'country') {
            const countryId = info.slug;
            router.push(`/country-plan/${countryId}`);
        }
        if (info.type == 'region') {
            const regionId = info.slug;
            router.push(`/region-plan/${regionId}`);
        }
    };

    const isLoading = !countryApiData || !regionApiData;

    if (isLoading) {
        return (
            <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading destinations...</p>
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

                    <h1 className='text-primary mb-6 text-4xl font-medium md:text-5xl'>All destinations</h1>

                    <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600'>
                        Find the best data plans in over {unifiedDestinations.length}+ destinations — and enjoy easy and
                        safe internet access wherever you go. Connect instantly with our premium eSIM solutions.
                    </p>
                </div>

                {/* Tabs and Search Section */}
                <div className='mb-8'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                        {/* Enhanced Tabs */}
                        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                            <TabsList className='grid h-12 w-full grid-cols-3 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:w-auto'>
                                <TabsTrigger
                                    value='all'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    All ({unifiedDestinations.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value='country'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    Countries ({countries.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value='region'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    Regions ({regions.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Enhanced Search */}
                            <div className='relative w-full sm:w-auto sm:min-w-[300px]'>
                                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                                <Input
                                    type='text'
                                    name='allDestinations'
                                    placeholder='Search for destination'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='h-12 rounded-xl border-gray-200 bg-white pr-4 pl-10 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                />
                                {searchQuery && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setSearchQuery('')}
                                        className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-lg p-0 hover:bg-gray-100'>
                                        ×
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Results Section */}
                        <TabsContent value={activeTab} className='mt-6'>
                            <div className='mb-6'>
                                <p className='text-sm text-gray-600'>
                                    Showing {filteredDestinations.length} destinations
                                    {searchQuery && <span> for "{searchQuery}"</span>}
                                </p>
                            </div>

                            {filteredDestinations.length > 0 ? (
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                    {filteredDestinations.map((dest) => {
                                        return (
                                            <button
                                                key={dest.id}
                                                type='button'
                                                onClick={() => handleNaviage(dest)}
                                                className={`group relative transform rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                                                    dest.featured ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                                                }`}>
                                                <div className='flex items-center justify-between'>
                                                    <div className='flex items-center gap-4'>
                                                        <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-50'>
                                                            {getDestinationIcon(dest)}
                                                        </div>

                                                        <div>
                                                            <h3 className='text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
                                                                {dest.name}
                                                            </h3>
                                                            <p className='text-sm font-medium text-gray-600'>
                                                                {dest.price}
                                                                {dest.countries && (
                                                                    <span className='text-gray-400'>
                                                                        {' '}
                                                                        • {dest.countries} countries
                                                                    </span>
                                                                )}
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
                                    <h3 className='mb-2 text-lg font-medium text-gray-900'>No destinations found</h3>
                                    <p className='mb-4 text-gray-600'>Try adjusting your search or filter criteria</p>
                                    <Button variant='outline' onClick={handleClearFilters}>
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
};

export default AllDestinations;
