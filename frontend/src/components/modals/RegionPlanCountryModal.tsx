'use client';

import Image from 'next/image';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    regionInfo: Region[] | null;
};

export default function RegionPlanCountryModal({ open, onOpenChange, regionInfo }: Readonly<Props>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    {/* <DialogTitle>{regionInfo?.name}</DialogTitle> */}
                    <DialogDescription>Supported Country</DialogDescription>
                </DialogHeader>

                <div className='max-h-[60vh] space-y-4 overflow-y-auto'>
                    <div className='flex flex-wrap gap-3'>
                        {regionInfo?.map((country) => (
                            <div
                                key={country.id}
                                className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm'>
                                {/* <span className='text-base'>{getCountryFlag(country.country_code)}</span> */}
                                <Image
                                    src={country.image}
                                    alt={country.name}
                                    height={100}
                                    width={100}
                                    className='w-10 rounded-sm'
                                />
                                <span className='text-gray-700'>{country.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
