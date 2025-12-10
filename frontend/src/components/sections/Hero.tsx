'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useTranslation } from '@/contexts/LanguageContext';

import DestinationModal from '../modals/DestinationModal';
import { Search } from 'lucide-react';
import { FaPlaneDeparture } from 'react-icons/fa';

const Hero = () => {
    const [showDestinationModal, setShowDestinationModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const { t } = useTranslation();
    const handleDestinationSelect = (destination: string) => {
        setSelectedDestination(destination);
    };

    return (
        <>
            <section className='flex min-h-screen items-center pl-4 sm:pl-6 lg:pl-8'>
                <div className='pt-32 md:pt-28 lg:pt-10 lg:pl-[70px] xl:pl-[80px]'>
                    <div className='flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
                        {/* Left Side - Text Content */}
                        <div className='flex-1 text-center lg:pt-24 lg:text-left'>
                            {/* Main Heading */}
                            <div className='mb-8 space-y-2'>
                                <h1 className='bg-primary bg-clip-text text-4xl leading-[0.9] font-black tracking-tight text-transparent drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl'>
                                    {t('home.hero.mainHeading')}
                                </h1>

                                <h2 className='bg-primary bg-clip-text text-2xl leading-tight font-semibold tracking-tight text-transparent opacity-90 drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl'>
                                    {t('home.hero.mainSubHeading')}
                                </h2>
                            </div>

                            {/* Description */}
                            <p className='mb-8 text-lg text-black opacity-95 sm:text-xl'>
                                {t('home.hero.description')}
                            </p>

                            {/* Search Section */}
                            <div className='space-y-4'>
                                <p className='text-lg font-medium text-black opacity-80'>
                                    {t('home.hero.chooseDestination')}
                                </p>

                                <div className='flex items-center justify-center lg:justify-start'>
                                    <button
                                        onClick={() => setShowDestinationModal(true)}
                                        className='flex w-full max-w-lg items-center justify-between rounded-full border border-gray-200 bg-white px-6 py-4 shadow-lg transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-none'>
                                        {/* Left side with plane icon and text */}
                                        <div className='flex items-center gap-4'>
                                            <FaPlaneDeparture className='h-5 w-5 text-blue-500' />
                                            <span
                                                className={`text-base ${
                                                    selectedDestination ? 'font-medium text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {selectedDestination || 'Find your next travel destination'}
                                            </span>
                                        </div>

                                        {/* Right side search icon */}
                                        <div className='flex-shrink-0'>
                                            <Search className='h-5 w-5 text-blue-500' />
                                        </div>
                                    </button>
                                </div>
                                {/* Features List */}
                                <div className='flex flex-wrap justify-center gap-4 pt-2 lg:justify-start'>
                                    <div className='flex items-center gap-2 rounded-lg border bg-white/80 p-3 py-4 text-center text-sm text-black opacity-80 shadow-lg backdrop-blur-sm'>
                                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                                        <span className='font-medium'>{t('home.hero.featureCountries')}</span>
                                    </div>
                                    <div className='flex items-center gap-2 rounded-lg border bg-white/80 p-3 text-center text-sm text-black opacity-80 shadow-lg backdrop-blur-sm'>
                                        <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                                        <span className='font-medium'>{t('home.hero.featureActivation')}</span>
                                    </div>
                                    <div className='flex items-center gap-2 rounded-lg border bg-white/80 p-3 text-center text-sm text-black opacity-80 shadow-lg backdrop-blur-sm'>
                                        <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                                        <span className='font-medium'>{t('home.hero.featureNoRoaming')}</span>
                                    </div>
                                </div>

                                {/* Enhanced Features List */}
                            </div>
                        </div>

                        {/* Right Side - Bigger Image */}

                        {/* Right Side - Multiple Images Layout */}
                        <div className='flex flex-1 justify-center lg:justify-end'>
                            <div className='relative my-6 w-full max-w-sm px-4 sm:mt-8 sm:max-w-md sm:px-6 md:max-w-lg lg:mt-12 lg:max-w-2xl lg:px-0 xl:max-w-3xl'>
                                {/* Main Container Grid - Responsive Heights */}
                                <div
                                    className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 md:gap-2 lg:gap-4'
                                    style={{
                                        height: 'auto',
                                        gridTemplateRows:
                                            window.innerWidth >= 640 ? '180px 180px 220px' : 'auto auto auto'
                                    }}>
                                    {/* First Image - Mobile: Full width, Desktop: Spans 2 rows */}
                                    <div className='h-64 overflow-hidden rounded-lg shadow-lg sm:row-span-2 sm:h-auto sm:rounded-xl'>
                                        <Image
                                            src='/images/landingImage1-min.jpg'
                                            alt='esim Voice - Global calling service'
                                            width={400}
                                            height={400}
                                            className='h-full w-full object-cover'
                                        />
                                        {/* White Card Overlay - Responsive */}
                                        <div className='absolute top-2 right-2 h-28 w-48 rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:right-[25%] sm:h-36 sm:w-64 sm:rounded-xl sm:p-4 sm:shadow-2xl'>
                                            <h3 className='mb-1 text-base font-bold text-gray-900 sm:mb-2 sm:text-lg'>
                                                esim Voice
                                            </h3>
                                            <p className='text-xs leading-relaxed text-gray-600 sm:text-sm'>
                                                Allows you to call across the globe even the land lines. Purchase it
                                                from our app!
                                            </p>
                                        </div>
                                    </div>

                                    {/* Empty space - Hidden on mobile, shown on desktop */}
                                    <div className='hidden sm:block'></div>

                                    {/* Second Image - Mobile: Full width, Desktop: Second row position */}
                                    <div className='relative h-48 overflow-hidden rounded-lg shadow-lg sm:h-auto sm:rounded-2xl sm:shadow-xl'>
                                        <Image
                                            src='/images/landingImage2-min.jpg'
                                            alt='Summer offer - Up to 50% off'
                                            width={400}
                                            height={240}
                                            className='h-full w-full object-cover'
                                        />

                                        {/* Yellow Banner - Responsive */}
                                        <div className='absolute top-2 right-2 sm:top-4 sm:right-4'>
                                            <div className='rounded-md bg-yellow-400 px-2 py-1 text-xs font-bold text-black shadow-lg sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm'>
                                                GET UP TO 50% OFF
                                            </div>
                                            <div className='rounded-b-md bg-yellow-400 px-2 py-0.5 text-[10px] font-medium text-black sm:rounded-b-lg sm:px-4 sm:py-1 sm:text-xs'>
                                                WITH esimt THIS SUMMER
                                            </div>
                                        </div>

                                        {/* Desert gradient - Responsive */}
                                        <div className='absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-orange-200/60 via-orange-100/40 to-transparent sm:h-16'></div>

                                        {/* Camel icons - Responsive */}
                                        <div className='absolute right-3 bottom-2 text-xs text-orange-800/70 sm:right-6 sm:bottom-4 sm:text-sm'>
                                            🐪 🐪
                                        </div>
                                    </div>

                                    {/* Third Image - Full width on all devices */}
                                    <div className='relative h-[200px] overflow-hidden rounded-lg shadow-lg sm:col-span-2 sm:h-auto sm:rounded-xl'>
                                        <Image
                                            src='/images/landingImage3-min.jpg'
                                            alt='No more bill shocks - Travel anywhere'
                                            width={800}
                                            height={240}
                                            className='h-full w-full object-cover'
                                        />
                                        {/* Overlay Content - Responsive */}
                                        <div className='absolute max-w-xs rounded-lg bg-white/90 p-3 shadow-xl backdrop-blur-sm sm:bottom-[0%] sm:left-[0%] sm:p-4 sm:shadow-2xl'>
                                            <h3 className='mb-1 text-sm font-semibold text-gray-900 sm:text-base'>
                                                No more bill shocks
                                            </h3>
                                            <p className='text-xs text-gray-700 sm:text-sm'>
                                                Say goodbye to hidden fees, top-up anytime
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Elements - Responsive */}
                                <div className='absolute -top-2 -left-2 h-4 w-4 rounded-full bg-yellow-400 opacity-20 sm:-top-4 sm:-left-4 sm:h-8 sm:w-8'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* External Destination Modal */}
            <DestinationModal
                isOpen={showDestinationModal}
                onClose={() => setShowDestinationModal(false)}
                onSelect={handleDestinationSelect}
            />
        </>
    );
};

export default Hero;
