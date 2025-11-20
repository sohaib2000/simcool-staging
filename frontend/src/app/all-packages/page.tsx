import React from 'react';

import { Metadata } from 'next';

import AllPlans from '@/components/AllPlans';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'Best eSIM Data Plans - International Travel Packages 2025',
    description:
        'Browse 500+ eSIM data plans for international travel. Affordable rates starting from $5, instant activation, no roaming fees. Coverage in 180+ countries.',
    image: '/images/splash.png',
    canonical: '/all-packages',
    keywords: [
        'eSIM plans',
        'travel data packages',
        'international data plans',
        'eSIM deals',
        'cheap eSIM',
        'travel internet plans'
    ]
});

const page = () => {
    return (
        <div>
            <AllPlans />
        </div>
    );
};

export default page;
