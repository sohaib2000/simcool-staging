'use client';

import React from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';

import { ArrowDownUp, ArrowRight, Calendar, CheckCircle, MessageSquare, PhoneCallIcon, Star, View } from 'lucide-react';

export interface PlanDetails {
    data?: string;
    sms?: string;
    mins?: string;
    days?: string;
}

interface Country {
    id: number;
    name: string;
    country_code: string;
    image: string;
}
interface Region {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    countries: Country[];
}

export interface PlanCardProps {
    id: number;
    country: Country | Region | null;
    type: string;
    data: string;
    day: number;
    netPrice: number;
    name: string;
    isTopPick?: boolean;
    planTypeData: PlanDetails;
    currencySymbol?: string;
    onViewDetails: () => void;
    onBuyPlan: () => void;
    viewDetailsText?: string;
    buyPlanText?: string;
    formatData: (data: string) => string;
    getCountryFlag: (countryCode: string) => string;
}

const PlanCard: React.FC<PlanCardProps> = ({
    id,
    country,
    type,
    data,
    day,
    netPrice,
    name,
    isTopPick = false,
    planTypeData,
    currencySymbol = '$',
    onViewDetails,
    onBuyPlan,
    viewDetailsText = 'View Plan Details',
    buyPlanText = 'Choose This Plan',
    formatData,
    getCountryFlag
}) => {
    const pricePerDay = ((Number(netPrice) || 0) / (Number(day) || 1)).toFixed(2);

    return (
        <div
            className={`group relative transform rounded-2xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isTopPick
                    ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white'
                    : 'border-gray-200 hover:border-blue-300'
            }`}>
            {/* Top Pick Badge */}
            {isTopPick && (
                <div className='absolute -top-2 -right-2'>
                    <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                        Most Popular
                    </div>
                </div>
            )}

            {/* Country Info */}
            <div className='mb-4 flex items-center gap-3'>
                {country?.image ? (
                    <div className='relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-gray-200'>
                        <Image
                            src={country.image}
                            alt={`${country.name} flag`}
                            width={32}
                            height={32}
                            className='h-full w-full object-cover'
                            unoptimized
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<span class="text-lg">${getCountryFlag(country?.image || '')}</span>`;
                                }
                            }}
                        />
                    </div>
                ) : (
                    <span className='text-lg'>{getCountryFlag(country?.image || '')}</span>
                )}
                <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-sm font-bold text-gray-900'>{country?.name || name}</h3>
                    <p className='text-xs text-gray-500 capitalize'>{type} Plan</p>
                </div>
            </div>

            {/* Plan Details Grid */}
            <div className='mb-4 text-center'>
                <div className='grid grid-cols-3 gap-2 sm:gap-4'>
                    {/* Data */}
                    <div className='flex flex-col items-center gap-1 sm:gap-2'>
                        <ArrowDownUp className='h-4 w-4 flex-shrink-0 text-blue-600' />
                        <span className='text-xs font-medium text-gray-900 sm:text-sm'>{formatData(data)}</span>
                    </div>

                    {/* Voice */}
                    <div className='flex flex-col items-center gap-1 sm:gap-2'>
                        <PhoneCallIcon
                            className={`h-4 w-4 flex-shrink-0 ${planTypeData.mins ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        <span
                            className={`text-xs font-medium sm:text-sm ${planTypeData.mins ? 'text-gray-900' : 'text-gray-400'}`}>
                            {planTypeData.mins || 'N/A'}
                        </span>
                    </div>

                    {/* SMS */}
                    <div className='flex flex-col items-center gap-1 sm:gap-2'>
                        <MessageSquare
                            className={`h-4 w-4 flex-shrink-0 ${planTypeData.sms ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        <span
                            className={`text-xs font-medium sm:text-sm ${planTypeData.sms ? 'text-gray-900' : 'text-gray-400'}`}>
                            {planTypeData.sms || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Duration */}
                <div className='mt-3 mb-3 flex items-center justify-center gap-1 text-gray-600'>
                    <Calendar className='h-3 w-3 flex-shrink-0' />
                    <span className='text-xs'>{day} Days</span>
                </div>

                {/* Pricing */}
                <div className='mb-3'>
                    <div className='flex items-baseline justify-center gap-1'>
                        <span className='text-secondary text-2xl font-bold'>
                            {currencySymbol}
                            {(Number(netPrice) || 0).toFixed(2)}
                        </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                        {currencySymbol}
                        {pricePerDay} per day
                    </p>
                </div>
            </div>

            {/* Features List */}
            <div className='mb-4 space-y-2'>
                <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                    <span className='text-xs text-gray-700'>{formatData(data)} Data</span>
                </div>

                <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />
                    <span className='text-xs text-gray-700'>Valid for {day} days</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-auto space-y-3'>
                {/* View Details Button */}
                <Button
                    onClick={onViewDetails}
                    variant='outline'
                    className='group w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 sm:py-3'>
                    <span className='flex items-center justify-center gap-2'>
                        <View className='h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110' />
                        <span className='truncate'>{viewDetailsText}</span>
                        <ArrowRight className='h-3 w-3 flex-shrink-0 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
                    </span>
                </Button>

                {/* Buy Plan Button */}
                <Button
                    onClick={onBuyPlan}
                    className='group w-full transform rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:py-3'>
                    <span className='flex items-center justify-center gap-2'>
                        <span className='relative truncate'>
                            {buyPlanText}
                            <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full' />
                        </span>
                        <ArrowRight className='h-4 w-4 flex-shrink-0 transition-all group-hover:translate-x-1 group-hover:scale-110' />
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default PlanCard;
