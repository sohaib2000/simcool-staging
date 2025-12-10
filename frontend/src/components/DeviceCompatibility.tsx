'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';

import { ArrowRight, CheckCircle, Info, Laptop, Search, Smartphone, Sparkles, Tablet, Watch } from 'lucide-react';

interface Device {
    model: string;
    os: string;
    brand: string;
    name: string;
}

interface ApiResponse {
    success: boolean;
    data: Device[];
}

interface DeviceModel {
    name: string;
    model: string;
    supported: boolean;
}

interface DeviceBrand {
    id: string;
    brand: string;
    models: DeviceModel[];
    icon?: React.ReactNode;
}

interface DeviceCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    brands: DeviceBrand[];
}

const DeviceCompatibility = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // API call for device compatibility data
    const { data: deviceApiData } = usePublicApiHandler<ApiResponse>({
        url: '/deviceCompatible'
    });

    // Helper functions to categorize devices based on OS and brand
    const getDeviceCategory = (os: string, brand: string): string => {
        const osLower = os.toLowerCase();
        const brandLower = brand.toLowerCase();

        // Categorize based on common patterns
        if (brandLower.includes('apple') || brandLower.includes('iphone') || brandLower.includes('ipad')) {
            if (brandLower.includes('watch')) return 'smartwatches';
            if (brandLower.includes('ipad') || brandLower.includes('tablet')) return 'tablets';
            return 'smartphones';
        }

        if (brandLower.includes('watch') || brandLower.includes('wear')) return 'smartwatches';
        if (brandLower.includes('tablet') || brandLower.includes('pad')) return 'tablets';
        if (brandLower.includes('surface') || brandLower.includes('laptop') || brandLower.includes('thinkpad'))
            return 'laptops';

        // Default to smartphones for android/mobile OS
        if (osLower.includes('android') || osLower.includes('ios')) return 'smartphones';

        return 'smartphones'; // Default category
    };

    const getCategoryIcon = (category: string): React.ReactNode => {
        switch (category) {
            case 'smartphones':
                return <Smartphone className='h-5 w-5' />;
            case 'smartwatches':
                return <Watch className='h-5 w-5' />;
            case 'tablets':
                return <Tablet className='h-5 w-5' />;
            case 'laptops':
                return <Laptop className='h-5 w-5' />;
            default:
                return <Smartphone className='h-5 w-5' />;
        }
    };

    const normalizeBrandName = (brand: string): string => {
        const brandLower = brand.toLowerCase();

        // Normalize common brand variations
        if (brandLower.includes('apple') || brandLower.includes('iphone')) return 'Apple';
        if (brandLower.includes('samsung')) return 'Samsung';
        if (brandLower.includes('google') || brandLower.includes('pixel')) return 'Google Pixel';
        if (brandLower.includes('asus')) return 'ASUS';
        if (brandLower.includes('xiaomi') || brandLower.includes('mi')) return 'Xiaomi';
        if (brandLower.includes('huawei')) return 'Huawei';
        if (brandLower.includes('oneplus')) return 'OnePlus';
        if (brandLower.includes('oppo')) return 'OPPO';
        if (brandLower.includes('vivo')) return 'Vivo';
        if (brandLower.includes('realme')) return 'Realme';
        if (brandLower.includes('nokia')) return 'Nokia';
        if (brandLower.includes('motorola') || brandLower.includes('moto')) return 'Motorola';
        if (brandLower.includes('sony')) return 'Sony';
        if (brandLower.includes('lg')) return 'LG';
        if (brandLower.includes('htc')) return 'HTC';
        if (brandLower.includes('lenovo') || brandLower.includes('thinkpad')) return 'Lenovo';
        if (brandLower.includes('surface') || brandLower.includes('microsoft')) return 'Microsoft Surface';

        // Capitalize first letter for other brands
        return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    };

    // Transform API data into component structure
    const deviceCategories = useMemo((): DeviceCategory[] => {
        if (!deviceApiData?.success) return [];

        // Group devices by category and brand
        const categoryGroups: Record<string, Record<string, Device[]>> = {};

        deviceApiData.data.forEach((device) => {
            const category = getDeviceCategory(device.os, device.brand);
            const normalizedBrand = normalizeBrandName(device.brand);

            if (!categoryGroups[category]) {
                categoryGroups[category] = {};
            }
            if (!categoryGroups[category][normalizedBrand]) {
                categoryGroups[category][normalizedBrand] = [];
            }
            categoryGroups[category][normalizedBrand].push(device);
        });

        // Transform to component structure
        return Object.entries(categoryGroups)
            .map(([categoryId, brands]) => {
                const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

                const brandData: DeviceBrand[] = Object.entries(brands).map(([brandName, devices]) => ({
                    id: `${categoryId}-${brandName.toLowerCase().replace(/\s+/g, '-')}`,
                    brand: brandName,
                    models: devices.map((device) => ({
                        name: device.name,
                        model: device.model,
                        supported: true // All API devices are supported
                    })),
                    icon: getCategoryIcon(categoryId)
                }));

                return {
                    id: categoryId,
                    name: categoryName,
                    icon: getCategoryIcon(categoryId),
                    brands: brandData.toSorted((a, b) => a.brand.localeCompare(b.brand))
                };
            })
            .sort((a, b) => {
                // Sort categories: smartphones, tablets, smartwatches, laptops
                const order = ['smartphones', 'tablets', 'smartwatches', 'laptops'];
                return order.indexOf(a.id) - order.indexOf(b.id);
            });
    }, [deviceApiData]);

    // Add "All" category that combines all devices
    const allDevicesCategory = useMemo((): DeviceCategory => {
        const allBrands: DeviceBrand[] = [];

        deviceCategories.forEach((category) => {
            category.brands.forEach((brand) => {
                const existingBrand = allBrands.find((b) => b.brand === brand.brand);
                if (existingBrand) {
                    existingBrand.models = [...existingBrand.models, ...brand.models];
                } else {
                    allBrands.push({ ...brand, id: `all-${brand.id}` });
                }
            });
        });

        return {
            id: 'all',
            name: 'All Devices',
            icon: <Sparkles className='h-5 w-5' />,
            brands: allBrands.toSorted((a, b) => a.brand.localeCompare(b.brand))
        };
    }, [deviceCategories]);

    // Combined categories with "All" option
    const allCategories = useMemo(() => {
        return [allDevicesCategory, ...deviceCategories];
    }, [allDevicesCategory, deviceCategories]);

    // Filter devices based on search and tab
    const filteredData = useMemo(() => {
        const currentCategory = allCategories.find((cat) => cat.id === activeTab);
        if (!currentCategory) return null;

        if (!searchQuery.trim()) return currentCategory;

        return {
            ...currentCategory,
            brands: currentCategory.brands
                .map((brand) => ({
                    ...brand,
                    models: brand.models.filter(
                        (model) =>
                            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            model.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            brand.brand.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                }))
                .filter((brand) => brand.models.length > 0)
        };
    }, [activeTab, searchQuery, allCategories]);

    const getTotalDevices = (category: DeviceCategory) => {
        return category.brands.reduce((total, brand) => total + brand.models.length, 0);
    };

    const getFilteredCount = () => {
        if (!filteredData) return 0;
        return getTotalDevices(filteredData);
    };

    const isLoading = !deviceApiData;

    if (isLoading) {
        return (
            <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading device compatibility...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!deviceApiData?.success || deviceApiData.data.length === 0) {
        return (
            <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
                            <Info className='mx-auto mb-4 h-16 w-16 text-blue-500' />
                            <h1 className='text-primary mb-2 text-2xl font-bold'>Device Data Unavailable</h1>
                            <p className='mb-6 text-gray-600'>
                                Device compatibility information could not be loaded at this time.
                            </p>
                            <Button onClick={() => window.location.reload()}>Try Again</Button>
                        </div>
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
                        Device Compatibility
                    </div>

                    <h1 className='text-primary mb-6 text-4xl font-medium md:text-5xl lg:text-6xl'>
                        Devices that support eSIMs
                    </h1>

                    <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600'>
                        Only devices that are carrier-unlocked and support eSIM technology can use our service. We
                        support over{' '}
                        {allDevicesCategory.brands.reduce((total, brand) => total + brand.models.length, 0)}
                        compatible devices. Check if your device is compatible below.
                    </p>

                    {/* Search Bar */}
                    <div className='relative mx-auto max-w-lg'>
                        <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                        <Input
                            type='text'
                            name='searchDevice'
                            placeholder='Search for device or brand'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='h-14 rounded-2xl border-gray-200 bg-white pr-4 pl-12 text-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                        />
                        {searchQuery && (
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setSearchQuery('')}
                                className='absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2 transform rounded-full p-0 hover:bg-gray-100'>
                                ×
                            </Button>
                        )}
                    </div>
                </div>

                {/* Device Category Tabs */}
                <div className='mb-12'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                        {/* Enhanced Category Tabs */}
                        <div className='mb-8 flex justify-center'>
                            <TabsList className='grid h-16 w-full max-w-4xl grid-cols-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg lg:grid-cols-3'>
                                {allCategories.map((category) => (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id}
                                        className='data-[state=active]:bg-primary flex items-center gap-2 rounded-xl px-3 py-2 font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-md'>
                                        {category.icon}
                                        <span className='hidden text-xs sm:inline lg:text-sm'>
                                            {category.name}
                                            <span className='block text-xs opacity-70'>
                                                ({getTotalDevices(category)})
                                            </span>
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Device Content */}
                        <TabsContent value={activeTab} className='mt-8'>
                            {filteredData && (
                                <div>
                                    {/* Category Header */}
                                    <div className='mb-8 text-center'>
                                        <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100'>
                                            <div className='text-primary text-2xl'>{filteredData.icon}</div>
                                        </div>
                                        <h2 className='text-primary mb-2 text-2xl font-bold'>{filteredData.name}</h2>
                                        <p className='text-gray-600'>
                                            Our service is available on {filteredData.name.toLowerCase()} from various
                                            manufacturers.
                                            {searchQuery && (
                                                <span className='mt-2 block text-sm'>
                                                    Showing {getFilteredCount()} results for "{searchQuery}"
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Device Lists */}
                                    {filteredData.brands.length > 0 ? (
                                        <div className='space-y-4'>
                                            {filteredData.brands.map((brand) => (
                                                <div
                                                    key={brand.id}
                                                    className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
                                                    <Accordion type='single' collapsible className='w-full'>
                                                        <AccordionItem value={brand.id} className='border-none'>
                                                            <AccordionTrigger className='group rounded-2xl px-6 py-5 text-left transition-colors hover:no-underline [&[data-state=open]]:bg-blue-50'>
                                                                <div className='flex w-full items-center justify-between pr-4'>
                                                                    <div className='flex items-center gap-4'>
                                                                        <div className='bg-primary flex h-12 w-12 items-center justify-center rounded-xl text-white'>
                                                                            {filteredData.icon}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className='group-hover:text-primary text-lg font-semibold text-gray-900'>
                                                                                {brand.brand}
                                                                            </h3>
                                                                            <p className='text-sm text-gray-500'>
                                                                                {brand.models.length} compatible models
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>

                                                            <AccordionContent className='px-6 pb-6'>
                                                                <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                                                                    {brand.models.map((model, index) => (
                                                                        <div
                                                                            key={`${model.model}-${index}`}
                                                                            className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100'>
                                                                            <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-500' />
                                                                            <div className='flex-1'>
                                                                                <span className='block text-sm font-medium text-gray-900'>
                                                                                    {model.name}
                                                                                </span>
                                                                                <span className='text-xs text-gray-500'>
                                                                                    Model: {model.model}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='py-16 text-center'>
                                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                                                <Search className='h-8 w-8 text-gray-400' />
                                            </div>
                                            <h3 className='mb-2 text-lg font-medium text-gray-900'>No devices found</h3>
                                            <p className='mb-4 text-gray-600'>
                                                Try a different search term or check another category
                                            </p>
                                            <Button variant='outline' onClick={() => setSearchQuery('')}>
                                                Clear search
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Important Note */}
                <div className='mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6'>
                    <div className='flex items-start gap-3'>
                        <Info className='mt-1 h-6 w-6 flex-shrink-0 text-blue-600' />
                        <div>
                            <h3 className='mb-2 font-semibold text-blue-900'>Important Note</h3>
                            <p className='text-sm leading-relaxed text-blue-800'>
                                Your device must be carrier-unlocked to use eSIM. Some devices sold by carriers may have
                                eSIM functionality disabled. If you're unsure about your device's compatibility, contact
                                your carrier or check your device settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className='text-center'>
                    <div className='bg-primary rounded-2xl p-8 text-white'>
                        <h3 className='mb-2 text-2xl font-semibold'>Can't find your device?</h3>
                        <p className='mb-6 text-blue-100'>
                            Device compatibility is constantly expanding. Check back regularly or contact support for
                            assistance.
                        </p>
                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            <Link
                                href='/all-destinations'
                                className='bg-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white'>
                                <ArrowRight className='ml-2 h-4 w-4' />
                                Explore All Destinations
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DeviceCompatibility;
