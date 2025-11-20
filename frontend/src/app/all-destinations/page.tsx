import React from 'react';

import { Metadata } from 'next';

import AllDestinations from '@/components/AllDestinations';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'eSIM Coverage in 180+ Countries - Global Travel Destinations',
    description:
        'Explore eSIM coverage across 180+ countries and regions. Find the perfect travel data plan for your destination with instant activation and local rates.',
    image: '/images/splash.png',
    canonical: '/all-destinations',
    keywords: [
        'eSIM destinations',
        'countries with eSIM',
        'travel destinations',
        'international eSIM coverage',
        'global eSIM'
    ]
});

const page = () => {
    return <AllDestinations />;
};

export default page;
