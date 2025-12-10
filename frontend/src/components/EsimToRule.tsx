import React from 'react';

import Image from 'next/image';

import { IconType } from 'react-icons';
import { FcGlobe } from 'react-icons/fc';
import { GiNetworkBars } from 'react-icons/gi';
import { SlLike } from 'react-icons/sl';

interface FeatureCard {
    id: number;
    icon: string | IconType | 'image';
    iconImage?: string;
    title: string;
    subtitle: string;
    bgColor: string;
    iconColor: string;
}

interface FeatureCardProps {
    card: FeatureCard;
    className?: string;
}

interface EsimToRuleProps {
    appScreenshotUrl?: string;
    customCards?: FeatureCard[];
}

const EsimToRule: React.FC<EsimToRuleProps> = ({
    appScreenshotUrl = '/path-to-your-esimtel-screenshot.jpg',
    customCards
}) => {
    const defaultCards: FeatureCard[] = [
        {
            id: 1,
            icon: GiNetworkBars, // React Icon component
            title: '1 eSIM, 200+ destinations',
            subtitle: 'Set up once and top up for next trip',
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            id: 2,
            icon: SlLike, // React Icon component
            title: 'Always-on with multiple networks',
            subtitle: 'eSim exclusive, keeps you connected 24/7',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            id: 3,
            icon: 'image', // Custom image type
            iconImage: '/images/logos-colored.webp', // Your custom image path
            title: 'Free Uber, Whatsapp, Grab and Google maps',
            subtitle: 'When your data runs out',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            id: 4,
            icon: FcGlobe, // React Icon component
            title: 'Hotspot to others',
            subtitle: 'Even on unlimited packs, only with eSim',
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600'
        }
    ];

    const featureCards = customCards || defaultCards;

    return (
        <div className='min-h-screen bg-white p-4 md:p-8'>
            {/* Header Section */}
            <div className='mb-12 text-center'>
                <h1 className='text-primary mb-4 text-4xl font-bold md:text-6xl'>1 eSIM to rule</h1>
                <p className='mx-auto max-w-2xl text-lg text-gray-600 md:text-xl'>
                    Your universal key to internet anywhere in the world
                </p>
            </div>

            {/* Main Content Layout */}
            <div className='mx-auto max-w-7xl'>
                <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-3'>
                    {/* Left Cards */}
                    <div className='space-y-6'>
                        <FeatureCardComponent card={featureCards[0]} className='transform lg:-rotate-2' />
                        <FeatureCardComponent card={featureCards[2]} className='transform lg:rotate-1' />
                    </div>

                    {/* Center App Screenshot */}
                    <div className='flex justify-center'>
                        <AppScreenshotDisplay screenshotUrl={appScreenshotUrl} />
                    </div>

                    {/* Right Cards */}
                    <div className='space-y-6'>
                        <FeatureCardComponent card={featureCards[1]} className='transform lg:rotate-1' />
                        <FeatureCardComponent card={featureCards[3]} className='transform lg:-rotate-2' />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCardComponent: React.FC<FeatureCardProps> = ({ card, className = '' }) => {
    const renderIcon = () => {
        // If icon is a string and equals 'image', render custom image
        if (card.icon === 'image' && card.iconImage) {
            return (
                <div className='relative mx-auto mb-4 h-[40px] w-full'>
                    <Image src={card.iconImage} alt={card.title} fill className='object-contain' />
                </div>
            );
        }

        // If icon is a React Icon component
        if (typeof card.icon === 'function') {
            const IconComponent = card.icon;
            return (
                <div className={`mb-4 ${card.iconColor}`}>
                    <IconComponent size={64} />
                </div>
            );
        }

        // Fallback for emoji string icons
        return <div className={`mb-4 text-4xl ${card.iconColor}`}>{card.icon}</div>;
    };

    return (
        <div
            className={`${card.bgColor} cursor-pointer rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}>
            <div className='text-center'>
                {renderIcon()}
                <h3 className='mb-2 text-lg font-bold text-gray-800'>{card.title}</h3>
                <p className='text-sm leading-relaxed text-gray-600'>{card.subtitle}</p>
            </div>
        </div>
    );
};

const AppScreenshotDisplay: React.FC<{ screenshotUrl: string }> = ({ screenshotUrl }) => {
    return (
        <div className='relative'>
            {/* Phone Frame */}
            <div className='h-[600px] w-80 rounded-[60px]'>
                <div className='h-full w-full overflow-hidden rounded-2xl'>
                    {/* Real App Screenshot */}
                    <img
                        src='/images/esimtellappScreenShot.png'
                        alt='eSIM App Interface'
                        className='h-full w-full rounded-4xl object-cover object-top'
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'center top'
                        }}
                    />

                    {/* Optional overlay for branding */}
                    <div className='pointer-events-none absolute right-0 -bottom-0 left-0 h-20 rounded-[70px] bg-gradient-to-t from-black/20 to-transparent' />
                </div>

                {/* Phone Details */}
                <div className='absolute -right-2 -bottom-2 rounded-full bg-white p-2 shadow-lg'>
                    <div className='h-3 w-3 animate-pulse rounded-full bg-green-500' />
                </div>
            </div>

            {/* Floating Elements for Visual Appeal */}
            <div className='absolute -top-4 -left-4 h-8 w-8 animate-bounce rounded-full bg-blue-500 opacity-20' />
            <div className='absolute -right-4 -bottom-4 h-6 w-6 animate-pulse rounded-full bg-purple-500 opacity-20' />
        </div>
    );
};

export default EsimToRule;
