// app/what-is-esim/page.tsx
import React from 'react';

import { Metadata } from 'next';

import WhatIsEsimPage from '@/components/pages/WhatIsEsimPage';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'What is eSIM? Complete Guide to eSIM Technology 2025',
    description:
        "Learn everything about eSIM technology. Discover how eSIM works, benefits, setup process, compatible devices, and why it's the future of mobile connectivity.",
    image: '/images/splash.png',
    canonical: '/what-is-esim',
    keywords: [
        'what is eSIM',
        'eSIM technology',
        'embedded SIM',
        'digital SIM card',
        'eSIM guide',
        'eSIM benefits',
        'how eSIM works'
    ]
});

const page = () => {
    return <WhatIsEsimPage />;
};

export default page;
