'use client';

import React from 'react';

import dynamic from 'next/dynamic';

const AccountInformationPage = dynamic(() => import('@/components/AccountInformationPage'), {
    ssr: false
});

const page = () => {
    return (
        <div suppressHydrationWarning>
            <AccountInformationPage />
        </div>
    );
};

export default page;
