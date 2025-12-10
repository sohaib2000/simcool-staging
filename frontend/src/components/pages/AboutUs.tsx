'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { MetaApiResponse } from '@/types/type';

import { ArrowRight, CheckCircle, Globe, Globe2, Heart, Shield, Star, Users, Zap } from 'lucide-react';

const AboutUs = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const { data: siteData } = usePublicApiHandler<MetaApiResponse>({
        url: `/generalSettings`
    });


    const colors = ['text-green-500', 'text-blue-500', 'text-purple-500'];
    return (
        <div className='bg-white'>
            {/* Hero Section - Clean & Premium */}
            <section className='bg-gradient-to-br from-gray-50 to-white py-12 lg:py-16'>
                <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8 text-center'>
                        <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                            <Heart className='h-4 w-4' />
                            {t('aboutUs.hero.badge.text')}
                        </div>
                        <h1 className='text-primary lg:text-5x text-4xl leading-tight font-bold'>
                            {t('aboutUs.hero.title')}
                        </h1>
                        <p className='mx-auto max-w-2xl text-lg text-gray-600'>{t('aboutUs.hero.description')}</p>
                    </div>
                </div>
            </section>

            {/* Section 1: Mission */}
            <section className='py-12 lg:py-16'>
                <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
                        {/* Left Content */}
                        <div className='space-y-6'>
                            <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                <Globe className='h-4 w-4' />
                                {t('aboutUs.mission.badge.text')}
                            </div>

                            <h2 className='text-primary lg:text-5x text-4xl leading-tight font-bold'>
                                {t('aboutUs.mission.badge.text')}
                            </h2>

                            <p className='leading-relaxed text-gray-600'>{t('aboutUs.mission.description')}</p>

                            {/* Key Points */}
                            <div className='space-y-3'>
                                {['point1', 'point2', 'point3'].map((pointKey, index) => (
                                    <div key={pointKey} className='flex items-center gap-3'>
                                        <CheckCircle className={`h-5 w-5 ${colors[index]}`} />
                                        <span className='text-gray-700'>
                                            {t(`aboutUs.mission.keyPoints.${pointKey}`)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => router.push(t('aboutUs.mission.cta.link'))}
                                className='bg-primary rounded-lg px-6 py-2 text-white'>
                                {t('aboutUs.mission.cta.text')}
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Button>
                        </div>

                        {/* Right Image */}
                        <div className='relative'>
                            <div className='overflow-hidden rounded-xl shadow-lg'>
                                <Image
                                    src='/images/about_us_img1.png'
                                    alt='Global connectivity'
                                    width={500}
                                    height={400}
                                    className='h-auto w-full rounded-bl-4xl object-cover'
                                    priority
                                />

                                {/* Floating Badge */}
                                <div className='absolute top-0 right-4 animate-bounce rounded-lg bg-white p-3 shadow-md'>
                                    <div className='text-center'>
                                        <div className='text-xl font-medium text-blue-600'>
                                            {t('aboutUs.mission.floatingBadge.value')}
                                        </div>
                                        <div className='text-xs text-gray-600'>
                                            {t('aboutUs.mission.floatingBadge.label')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Team - Swapped Layout */}
            <section className='bg-gray-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
                        {/* Left Image */}
                        <div className='relative order-2 lg:order-1'>
                            <div className='overflow-hidden rounded-xl shadow-lg'>
                                <Image
                                    src='/images/about_us_img2.png'
                                    alt='Our team'
                                    width={500}
                                    height={400}
                                    className='h-auto w-full object-cover'
                                />

                                {/* Floating Badge */}
                                <div className='absolute bottom-4 left-4 animate-bounce rounded-lg bg-white p-3 shadow-md'>
                                    <div className='flex items-center gap-2'>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={`${_}-${i}`}
                                                className='h-3 w-3 fill-yellow-400 text-yellow-400'
                                            />
                                        ))}
                                        <span className='ml-1 text-sm font-medium'>4.9</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className='order-1 space-y-6 lg:order-2'>
                            <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                <Users className='h-4 w-4' />
                                {t('aboutUs.team.badge.text')}
                            </div>

                            <h2 className='text-primary lg:text-5x text-4xl leading-tight font-bold'>
                                {t('aboutUs.team.title')}
                            </h2>

                            <p className='leading-relaxed text-gray-600'>{t('aboutUs.team.description')}</p>

                            {/* Stats */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='text-center lg:text-left'>
                                    <div className='text-2xl font-medium text-gray-900'>
                                        {t('aboutUs.team.stats.users.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>{t('aboutUs.team.stats.users.label')}</div>
                                </div>
                                <div className='text-center lg:text-left'>
                                    <div className='text-2xl font-medium text-gray-900'>
                                        {t('aboutUs.team.stats.support.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>{t('aboutUs.team.stats.support.label')}</div>
                                </div>
                            </div>

                            {/* Values */}
                            <div className='space-y-3'>
                                <div className='flex items-center gap-3'>
                                    <Shield className='h-5 w-5 text-blue-500' />
                                    <span className='text-gray-700'>{t('aboutUs.team.values.value1')}</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Heart className='h-5 w-5 text-red-500' />
                                    <span className='text-gray-700'>{t('aboutUs.team.values.value2')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Technology */}
            <section className='py-12 lg:py-16'>
                <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
                        {/* Left Content */}
                        <div className='space-y-6'>
                            <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                <Zap className='h-4 w-4' />
                                {t('aboutUs.technology.badge.text')}
                            </div>

                            <h2 className='text-primary lg:text-5x text-4xl leading-tight font-bold'>
                                {t('aboutUs.technology.title')}
                            </h2>

                            <p className='leading-relaxed text-gray-600'>{t('aboutUs.technology.description')}</p>

                            {/* Tech Features */}
                            <div className='space-y-3'>
                                <div className='flex items-center gap-3'>
                                    <Zap className='h-5 w-5 text-yellow-500' />
                                    <span className='text-gray-700'>
                                        {t('aboutUs.technology.techFeatures.feature1')}
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Globe className='h-5 w-5 text-blue-500' />
                                    <span className='text-gray-700'>
                                        {t('aboutUs.technology.techFeatures.feature2')}
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Shield className='h-5 w-5 text-green-500' />
                                    <span className='text-gray-700'>
                                        {t('aboutUs.technology.techFeatures.feature3')}
                                    </span>
                                </div>
                            </div>

                            {/* Performance Stats */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='text-center lg:text-left'>
                                    <div className='text-2xl font-medium text-gray-900'>
                                        {t('aboutUs.technology.performanceStats.uptime.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        {t('aboutUs.technology.performanceStats.uptime.label')}
                                    </div>
                                </div>
                                <div className='text-center lg:text-left'>
                                    <div className='text-2xl font-medium text-gray-900'>
                                        {t('aboutUs.technology.performanceStats.activation.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        {t('aboutUs.technology.performanceStats.activation.label')}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={t('aboutUs.technology.cta.link')}
                                className='bg-primary inline-flex items-center gap-2 rounded-lg px-6 py-2 text-white'>
                                <ArrowRight className='ml-2 h-4 w-4' />
                                {t('aboutUs.technology.cta.text')}
                            </Link>
                        </div>

                        {/* Right Image */}
                        <div className='relative'>
                            <div className='overflow-hidden rounded-xl shadow-lg'>
                                <Image
                                    src='/images/plane-sky-phone-app.png'
                                    alt='Advanced technology'
                                    width={500}
                                    height={400}
                                    className='h-auto w-full object-cover'
                                />

                                {/* Floating Badge */}
                                <div className='absolute top-4 right-4 animate-bounce rounded-lg bg-white p-3 shadow-md'>
                                    <div className='text-center'>
                                        <div className='text-lg font-medium text-green-600'>
                                            {t('aboutUs.technology.floatingBadge.value')}
                                        </div>
                                        <div className='text-xs text-gray-600'>
                                            {t('aboutUs.technology.floatingBadge.label')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='bg-primary py-16'>
                <div className='container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8'>
                    <h2 className='mb-4 text-2xl font-medium text-white md:text-3xl'>{t('aboutUs.cta.title')}</h2>
                    <p className='mx-auto mb-6 max-w-2xl text-blue-100'>{t('aboutUs.cta.description')}</p>
                    <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                        <Link
                            href='/all-packages'
                            className='bg-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-2 text-white'>
                            <Globe2 className='ml-2 h-4 w-4' />
                            {t('aboutUs.cta.button.text')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
