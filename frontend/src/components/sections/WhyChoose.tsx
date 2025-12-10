'use client';

import React from 'react';

import { useTranslation } from '@/contexts/LanguageContext';

import { FaBell, FaCheckCircle, FaDatabase, FaGlobe, FaMobileAlt, FaShieldAlt } from 'react-icons/fa';

interface FeatureItem {
    icon: React.ElementType;
    title: string;
    description: string;
}

const WhyChoose: React.FC = () => {
    const { t } = useTranslation();

    const features: FeatureItem[] = [
        {
            icon: FaDatabase,
            title: t('home.whyChoose.feature1Title'),
            description: t('home.whyChoose.feature1Desc')
        },
        {
            icon: FaCheckCircle,
            title: t('home.whyChoose.feature2Title'),
            description: t('home.whyChoose.feature2Desc')
        },
        {
            icon: FaShieldAlt,
            title: t('home.whyChoose.feature3Title'),
            description: t('home.whyChoose.feature3Desc')
        },
        {
            icon: FaMobileAlt,
            title: t('home.whyChoose.feature4Title'),
            description: t('home.whyChoose.feature4Desc')
        },
        {
            icon: FaBell,
            title: t('home.whyChoose.feature5Title'),
            description: t('home.whyChoose.feature5Desc')
        },
        {
            icon: FaGlobe,
            title: t('home.whyChoose.feature6Title'),
            description: t('home.whyChoose.feature6Desc')
        }
    ];

    return (
        <section className='bg-gray-50 py-16'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-12 text-center'>
                    {/* <p className='mb-2 text-sm text-gray-500'>{t('home.whyChoose.whyChooseUs')}</p> */}
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        {t('home.whyChoose.whyChooseUs')}
                    </div>
                    <h2 className='text-primary mb-4 text-3xl font-bold md:text-4xl'>
                        {t('home.whyChoose.stayConnected')}
                    </h2>
                </div>

                {/* Features Grid */}
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='group relative cursor-pointer overflow-hidden rounded-xl bg-gray-50 p-6 transition-all duration-300 ease-in-out'>
                            {/* Animated Border */}
                            <div className='from-primary to-secondary absolute inset-0 rounded-xl bg-gradient-to-r via-purple-500 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100'>
                                <div className='absolute inset-[2px] rounded-xl bg-gray-50'></div>
                            </div>

                            {/* Content */}
                            <div className='relative z-10'>
                                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-transparent transition-all duration-300 group-hover:scale-110'>
                                    <feature.icon className='group-hover:text-primary h-6 w-6 text-gray-800 transition-colors duration-300' />
                                </div>

                                <h3 className='group-hover:text-primary mb-3 text-xl font-semibold text-gray-900 transition-colors duration-300'>
                                    {feature.title}
                                </h3>

                                <p className='text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700'>
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>  
        </section>
    );
};

export default WhyChoose;
