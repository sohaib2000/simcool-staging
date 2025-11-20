import React from 'react';

import { Metadata } from 'next';

import DeviceCompatibility from '@/components/DeviceCompatibility';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'eSIM Compatible Devices - iPhone, Android & More',
    description:
        'Check if your device supports eSIM technology. Complete list of eSIM compatible iPhones, Android phones, tablets, and smartwatches. Setup guides included.',
    image: '/images/splash.png',
    canonical: '/supported-devices',
    keywords: [
        'eSIM compatible devices',
        'eSIM iPhone',
        'eSIM Android',
        'devices with eSIM',
        'eSIM support',
        'compatible phones'
    ]
});

const page = async () => {
    return (
        <div>
            <DeviceCompatibility />
        </div>
    );
};

export default page;
