import React from 'react';

import { Metadata } from 'next';

import AboutUs from '@/components/pages/AboutUs';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'About Us',
    description:
        'Learn about our mission to provide seamless global connectivity through innovative eSIM solutions. Discover our story, values, and commitment to travelers worldwide.',
    canonical: '/about',
    keywords: ['about us', 'company mission', 'eSIM provider', 'our story', 'team']
});

const page = () => {
    return <AboutUs />;
};

export default page;
