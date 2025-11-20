'use client';

import React, { useMemo } from 'react';

import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/contexts/LanguageContext';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import { useSelector } from 'react-redux';

interface Country {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_price: number;
}

interface CountryApiResponse {
    success: boolean;
    data: Country[];
}

const Footer = () => {
    const { t } = useTranslation();
    const { logo } = useSelector((state: RootState) => state.appSettings);
    const { data: countryApiData, isLoading } = usePublicApiHandler<CountryApiResponse>({
        url: '/country'
    });

    const countries = useMemo(() => (countryApiData?.success ? countryApiData.data : []), [countryApiData]);

    return (
        <footer className='border-t border-gray-200 bg-white'>
            <div className='container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
                {/* Top Section */}
                <div className='mb-12 flex flex-col items-start justify-between lg:flex-row lg:items-center'>
                    <div className='mb-8 lg:mb-0'>
                        <div className='flex-shrink-0'>
                            <Link href='/'>
                                {/* <Image
                                    src={`${BASE_URL}/${logo}` || '/images/simtel-main.png'}
                                    alt='Company Logo'
                                    height={60}
                                    width={140}
                                    className='h-6 w-auto transition-all duration-300 sm:h-8'
                                /> */}
                            </Link>
                        </div>
                    </div>

                    {/* App Download */}
                    <div className='flex gap-4'>
                        <Link href='https://www.apple.com/in/app-store'>
                            <div className='bg-primary flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors'>
                                <svg className='h-6 w-6' viewBox='0 0 24 24' fill='currentColor'>
                                    <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                                </svg>
                                <div className='text-left'>
                                    <div className='text-xs'>{t('home.footer.downloadOnThe')}</div>
                                    <div className='text-sm font-semibold'>{t('home.footer.appStore')}</div>
                                </div>
                            </div>
                        </Link>

                        <Link href='https://play.google.com/store/apps/details?id=com.esimtel.app'>
                            <div className='bg-primary flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors'>
                                <svg className='h-6 w-6' viewBox='0 0 24 24' fill='currentColor'>
                                    <path d='M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z' />
                                </svg>
                                <div className='text-left'>
                                    <div className='text-xs'>{t('home.footer.getItOn')}</div>
                                    <div className='text-sm font-semibold'>{t('home.footer.googlePlay')}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Popular Destinations */}
                    <div>
                        <h3 className='text-primary mb-4 text-lg font-semibold'>
                            {t('home.footer.popularDestinations')}
                        </h3>
                        <ul className='space-y-3'>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, idx) => (
                                      <li key={`${_}-${idx}`}>
                                          <Skeleton className='h-5 w-40 rounded-md' />
                                      </li>
                                  ))
                                : countries?.slice(0, 8).map((c) => (
                                      <li key={c.id}>
                                          <Link
                                              href={`/country-plan/${c.slug}`}
                                              className='hover:text-primary text-gray-600 hover:underline'>
                                              {c.name}
                                          </Link>
                                      </li>
                                  ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-primary mb-4 text-lg font-semibold'>
                            {t('home.footer.popularCountryPlan')}
                        </h3>
                        <ul className='space-y-3'>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, idx) => (
                                      <li key={`${_}-${idx}`}>
                                          <Skeleton className='h-5 w-40 rounded-md' />
                                      </li>
                                  ))
                                : countries?.slice(8, 16).map((c) => (
                                      <li key={c.id}>
                                          <Link
                                              href={`/country-plan/${c.slug}`}
                                              className='hover:text-primary text-gray-600 hover:underline'>
                                              {c.name}
                                          </Link>
                                      </li>
                                  ))}
                        </ul>
                    </div>
                    {/* eSIM */}
                    <div>
                        <h3 className='text-primary mb-4 text-lg font-semibold'>{t('home.footer.esim')}</h3>
                        <ul className='space-y-3'>
                            <li>
                                <Link href='/what-is-esim' className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.whatIsEsim')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/esim-supported-devices'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.supportedDevices')}
                                </Link>
                            </li>
                            <li>
                                <Link href='/about-us' className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.aboutUs')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/all-destinations'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.allDestinations')}
                                </Link>
                            </li>
                            <li>
                                <Link href='/all-packages' className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.allPackages')}
                                </Link>
                            </li>
                            <li>
                                <Link href='/country-plan' className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.allCountryPlan')}
                                </Link>
                            </li>
                            <li>
                                <Link href='/region-plan' className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.allRegionPlan')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* Follow Us */}
                    <div>
                        <h3 className='text-primary mb-4 text-lg font-semibold'>{t('home.footer.followUs')}</h3>
                        <ul className='space-y-3'>
                            <li>
                                <Link
                                    href='https://twitter.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.twitter')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='https://facebook.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.facebook')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='https://linkedin.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.linkedin')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='https://youtube.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.youtube')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='https://instagram.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.instagram')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='https://reddit.com/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.reddit')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className='border-t border-gray-200 pt-8'>
                    <div className='flex flex-col items-center justify-between lg:flex-row'>
                        <div className='mb-4 flex flex-col items-center gap-4 sm:flex-row lg:mb-0'>
                            <p className='text-sm text-gray-600'>{t('home.footer.copyright')}</p>
                            <div className='flex items-center gap-4 text-sm'>
                                <Link
                                    href='/privacy-policy'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.privacyPolicy')}
                                </Link>
                                <Link
                                    href='/terms-and-conditions'
                                    className='hover:text-primary text-gray-600 hover:underline'>
                                    {t('home.footer.termsOfService')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
