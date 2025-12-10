'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Flag, Globe2, MapPin } from 'lucide-react';

interface PackageCountry {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    laravel_through_key: number;
}

type CountryFlagListModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    countries: PackageCountry[]; // 👈 yahi package.data.country ayega
};

export function CountryFlagListModal({ open, onOpenChange, countries }: Readonly<CountryFlagListModalProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Globe2 size={20} />
                        Supported Countries
                    </DialogTitle>
                    <DialogDescription>This package is valid in the following countries.</DialogDescription>
                </DialogHeader>

                <div className='max-h-[60vh] space-y-3 overflow-y-auto'>
                    {!countries?.length && (
                        <p className='py-6 text-center text-sm text-gray-500'>
                            No countries available for this package.
                        </p>
                    )}

                    {countries?.map((country) => (
                        <div
                            key={country.id}
                            className='flex items-center justify-between gap-4 rounded-xl border p-3 shadow-sm transition hover:shadow-md'>
                            {/* Left: flag + name + code */}
                            <div className='flex flex-1 items-center gap-3'>
                                <div className='relative h-9 w-9 overflow-hidden rounded-full bg-gray-100'>
                                    {country.image ? (
                                        <Image
                                            src={country.image}
                                            alt={`${country.name} flag`}
                                            fill
                                            sizes='36px'
                                            className='object-cover'
                                        />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center text-gray-400'>
                                            <Flag size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className='flex flex-col'>
                                    <span className='text-sm font-semibold'>{country.name}</span>
                                    <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                                        <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5'>
                                            <MapPin size={12} />
                                            {country.slug}
                                        </span>
                                        <span className='rounded-full bg-gray-100 px-2 py-0.5'>
                                            {country.country_code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
