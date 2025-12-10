import React from 'react';

import { Metadata } from 'next';

import RegionPlanPage from '@/components/pages/RegionPlanPage';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'Regional eSIM Plans - Multi-Country Data Plans for Travelers',
    description:
        'Explore regional eSIM plans covering multiple countries. Europe, Asia, Americas, Africa, and Oceania eSIM packages. Save money on multi-country travel.',
    image: '/images/splash.png',
    canonical: '/region-plan',
    keywords: [
        'regional eSIM',
        'multi-country eSIM',
        'regional data plans',
        'Europe eSIM',
        'Asia eSIM',
        'travel regions'
    ]
});

const page = () => {
    return <RegionPlanPage />;
};

export default page;
