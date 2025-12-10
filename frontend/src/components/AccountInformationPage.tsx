'use client';

import React from 'react';

import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { ProfileGetInfoRes } from '@/types/type';

import DeleteAccount from './DeleteAccount';
import KYCVerification from './KYCVerification';
import PackageCard from './PackageCard';
import ProfileInformation from './ProfileInformation';
import Loader from './common/Loader';
import { User } from 'lucide-react';

const AccountInformationPage = () => {
    const { data: profileData, isLoading } = useProtectedApiHandler<ProfileGetInfoRes>({
        url: '/profile'
    });
    const { t } = useTranslation();
    const userData = profileData?.data;

    const kycStatus = userData?.kyc_status || 'Not applied';

    if (isLoading) return <Loader />;

    return (
        <div className=''>
            {/* Page Header */}
            <div className='mb-6 flex items-center gap-2'>
                <User className='h-6 w-6 text-gray-700' />
                <h2 className='text-2xl font-bold text-gray-900'>{t('profile.pages.accountInfo.profileInfo.title')}</h2>
            </div>

            {/* Profile Information Component */}
            <ProfileInformation userData={userData} kycStatus={kycStatus} />

            <PackageCard />

            {/* KYC Verification Component */}
            <KYCVerification kycStatus={kycStatus} />

            {/* Delete Account Component */}
            <DeleteAccount />
        </div>
    );
};

export default AccountInformationPage;
