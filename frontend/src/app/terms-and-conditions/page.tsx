import React from 'react';

import { Metadata } from 'next';

import TermsAndConditionsPage from '@/components/common/TermsAndConditionsPage';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'Terms and Conditions - eSIM Tell Legal Terms',
    description:
        'Read eSIM Tell terms and conditions for using our eSIM services, data plans, and platform. Legal terms, user agreement, and service conditions.',
    canonical: '/terms-and-conditions',
    noIndex: true,
    keywords: [
        'eSIM Tell terms',
        'terms and conditions',
        'user agreement',
        'legal terms',
        'service terms',
        'eSIM service terms'
    ]
});

const page = () => {
    return (
        <div>
            <TermsAndConditionsPage />
        </div>
    );
};

export default page;
