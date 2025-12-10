import React from 'react';

import { Metadata } from 'next';

import PrivacyPolicy from '@/components/common/PrivacyPolicy';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'Privacy Policy - eSIM Tell Data Protection & Privacy',
    description:
        'eSIM Tell privacy policy explains how we collect, use, and protect your personal data. GDPR compliant data protection and user privacy information.',
    canonical: '/privacy-policy',
    noIndex: true, // Privacy pages should not be indexed
    keywords: [
        'eSIM Tell privacy',
        'privacy policy',
        'data protection',
        'GDPR compliance',
        'user privacy',
        'data security'
    ]
});

const page = async () => {
    return (
        <div>
            <PrivacyPolicy />
        </div>
    );
};

export default page;
