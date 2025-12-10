'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/LanguageContext';

import { ArrowRight, CheckCircle, Download, Globe, Shield, Smartphone, Wifi, Zap } from 'lucide-react';

const WhatIsEsimPage = () => {
    const { t } = useTranslation();
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
            {/* Hero Section */}
            <section className='px-4 pt-[50px] pb-16'>
                <div className='mx-auto max-w-7xl'>
                    <div className='grid items-center gap-12 lg:grid-cols-2'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <div className='space-y-4'>
                                <Badge className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                    <Smartphone className='mr-2 h-4 w-4' />
                                    {t('whatIsEsim.hero.badge.text')}
                                </Badge>
                                <h1 className='text-primary text-4xl leading-tight font-bold lg:text-5xl'>
                                    {t('whatIsEsim.hero.title')}
                                </h1>
                                <p className='text-xl leading-relaxed text-gray-600'>
                                    {t('whatIsEsim.hero.description')}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className='grid grid-cols-3 gap-6 border-t border-gray-200 pt-8'>
                                <div className='text-center'>
                                    <div className='text-2xl font-bold text-blue-600'>
                                        {t('whatIsEsim.hero.stats.countries.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        {t('whatIsEsim.hero.stats.countries.label')}
                                    </div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-2xl font-bold text-blue-600'>
                                        {t('whatIsEsim.hero.stats.users.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        {t('whatIsEsim.hero.stats.users.label')}
                                    </div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-2xl font-bold text-blue-600'>
                                        {t('whatIsEsim.hero.stats.uptime.value')}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        {t('whatIsEsim.hero.stats.uptime.label')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image Placeholder */}
                        <div className='relative'>
                            <div className=''>
                                <Image
                                    src='/images/what-is-esim.png'
                                    alt='Global connectivity'
                                    width={500}
                                    height={400}
                                    className='h-auto w-full rounded-4xl object-cover'
                                    priority
                                />
                            </div>
                            {/* Floating Elements */}
                            <div className='absolute -top-4 -right-4 rounded-xl bg-white p-4 shadow-lg'>
                                <Wifi className='h-8 w-8 text-green-500' />
                            </div>
                            <div className='absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg'>
                                <Globe className='h-8 w-8 text-blue-500' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is an eSIM Section */}
            <section className='bg-white px-4 py-16'>
                <div className='mx-auto max-w-7xl'>
                    <div className='grid items-center gap-12 lg:grid-cols-2'>
                        {/* Left Image Placeholder */}
                        <div className='relative order-2 lg:order-1'>
                            <div className='flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br'>
                                <Image
                                    src='/images/esim1.jpg'
                                    alt='Global connectivity'
                                    width={500}
                                    height={500}
                                    className='h-auto w-full rounded-4xl object-cover'
                                    priority
                                />
                            </div>
                            {/* Floating Card */}
                            <Card className='absolute -right-6 -bottom-6 w-48 shadow-xl'>
                                <CardContent className='p-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                                            <CheckCircle className='h-6 w-6 text-green-600' />
                                        </div>
                                        <div>
                                            <p className='font-semibold text-gray-900'>
                                                {t('whatIsEsim.whatIsSection.floatingCard.title')}
                                            </p>
                                            <p className='text-sm text-gray-600'>
                                                {t('whatIsEsim.whatIsSection.floatingCard.description')}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Content */}
                        <div className='order-1 space-y-8 lg:order-2'>
                            <div className='space-y-4'>
                                <Badge className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                    <Shield className='mr-2 h-4 w-4' />
                                    {t('whatIsEsim.whatIsSection.badge.text')}
                                </Badge>
                                <h2 className='text-primary text-3xl font-bold lg:text-4xl'>
                                    {t('whatIsEsim.whatIsSection.title')}
                                </h2>
                                <p className='text-lg leading-relaxed text-gray-600'>
                                    {t('whatIsEsim.whatIsSection.description')}
                                </p>
                            </div>

                            {/* Key Features */}
                            <div className='space-y-4'>
                                <h3 className='text-primary text-xl font-semibold'>
                                    {t('whatIsEsim.whatIsSection.keyFeatures.title')}
                                </h3>
                                <div className='space-y-3'>
                                    <div className='flex items-center gap-3'>
                                        <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-500' />
                                        <span className='text-gray-700'>
                                            {t('whatIsEsim.whatIsSection.keyFeatures.feature1')}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-500' />
                                        <span className='text-gray-700'>
                                            {t('whatIsEsim.whatIsSection.keyFeatures.feature2')}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-500' />
                                        <span className='text-gray-700'>
                                            {t('whatIsEsim.whatIsSection.keyFeatures.feature3')}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-500' />
                                        <span className='text-gray-700'>
                                            {t('whatIsEsim.whatIsSection.keyFeatures.feature4')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href='/esim-supported-devices'
                                className='bg-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors'>
                                <Smartphone className='h-5 w-5' />
                                {t('whatIsEsim.whatIsSection.cta.text')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How does eSIM work Section */}
            <section className='bg-gray-50 px-4 py-16'>
                <div className='mx-auto max-w-7xl'>
                    <div className='grid items-center gap-12 lg:grid-cols-2'>
                        {/* Left Content */}
                        <div className='space-y-8'>
                            <div className='space-y-4'>
                                <Badge className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                                    <Zap className='mr-2 h-4 w-4' />
                                    {t('whatIsEsim.howItWorks.badge.text')}
                                </Badge>
                                <h2 className='text-primary text-3xl font-bold lg:text-4xl'>
                                    {t('whatIsEsim.howItWorks.title')}
                                </h2>
                                <p className='text-lg leading-relaxed text-gray-600'>
                                    {t('whatIsEsim.howItWorks.description')}
                                </p>
                            </div>

                            {/* Process Steps */}
                            <div className='space-y-6'>
                                <h3 className='text-primary text-xl font-semibold'>
                                    {t('whatIsEsim.howItWorks.processTitle')}
                                </h3>
                                <div className='space-y-4'>
                                    {['step1', 'step2', 'step3', 'step4'].map((stepKey) => (
                                        <div key={stepKey} className='flex gap-4'>
                                            <div className='bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white'>
                                                {t(`whatIsEsim.howItWorks.steps.${stepKey}.number`)}
                                            </div>
                                            <div>
                                                <h4 className='font-semibold text-gray-900'>
                                                    {t(`whatIsEsim.howItWorks.steps.${stepKey}.title`)}
                                                </h4>
                                                <p className='text-gray-600'>
                                                    {t(`whatIsEsim.howItWorks.steps.${stepKey}.description`)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href={t('whatIsEsim.howItWorks.cta.link')}
                                className='bg-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-white'>
                                <Download className='mr-2 h-5 w-5' />
                                {t('whatIsEsim.howItWorks.cta.text')}
                            </Link>
                        </div>

                        {/* Right Image Placeholder */}
                        <div className='relative'>
                            <div className='flex aspect-[4/3] items-center justify-center'>
                                <Image
                                    src='/images/esimAcivate.png'
                                    alt='Global connectivity'
                                    width={500}
                                    height={400}
                                    className='h-auto w-full rounded-4xl object-cover'
                                    priority
                                />
                            </div>
                            {/* Process Indicator */}
                            <div className='absolute top-4 right-4 rounded-lg bg-white p-3 shadow-lg'>
                                <div className='flex items-center gap-2'>
                                    <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
                                    <span className='text-sm font-medium text-gray-700'>
                                        {t('whatIsEsim.howItWorks.statusIndicator.text')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className='bg-primary py-16'>
                <div className='mx-auto max-w-4xl text-center'>
                    <h2 className='mb-4 text-3xl font-bold text-white'>{t('whatIsEsim.callToAction.title')}</h2>
                    <p className='mb-8 text-xl text-blue-100'>{t('whatIsEsim.callToAction.description')}</p>
                    <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                        <Button asChild size='lg' className='bg-white text-blue-600 hover:bg-gray-100'>
                            <Link href='https://play.google.com/store/apps/details?id=com.esimtel.app'>
                                <Download className='mr-2 h-5 w-5' />
                                {t('whatIsEsim.callToAction.buttons.downloadApp.text')}
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant='outline'
                            size='lg'
                            className='bg-secondary hover:bg-seccondry border-white text-white hover:text-white'>
                            <Link href='/all-packages'>
                                {t('whatIsEsim.callToAction.buttons.viewPlans.text')}
                                <ArrowRight className='ml-2 h-5 w-5' />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WhatIsEsimPage;
