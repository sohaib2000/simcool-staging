'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';

import { Calendar, MessageCircle, Phone, Wifi } from 'lucide-react';

type Props = {
    iccid: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBuyClick?: () => void | undefined;
};

// types/type.ts

export type PackageItem = {
    id: string;
    type: string; // likely always "topup"
    day: number;
    is_unlimited: boolean;
    title: string;
    data: string;
    short_info: string | null;
    voice: number;
    text: number;
    net_price: number;
};

export type PackageApiResponse = {
    data: PackageItem[];
    success: boolean;
    message: string;
};

export default function TopupModal({ iccid, open, onOpenChange, onBuyClick }: Readonly<Props>) {
    const { data, isLoading } = useProtectedApiHandler<PackageApiResponse>({
        url: `/getTopupList?iccid=${iccid}`
    });

    const handleBuyClick = () => {
        if (onBuyClick) {
            onBuyClick();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Available Topups</DialogTitle>
                    <DialogDescription>Choose a top-up package from the list below</DialogDescription>
                </DialogHeader>

                <div className='max-h-[60vh] space-y-4 overflow-y-auto'>
                    {isLoading && <p className='text-center text-gray-500'>Loading...</p>}

                    {data?.data?.map((item) => (
                        <div key={item.id} className='rounded-xl border p-4 shadow-sm transition hover:shadow-md'>
                            {/* Title */}
                            <div className='flex items-center justify-between'>
                                <h3 className='text-base font-semibold'>{item.data}</h3>
                                <Wifi size={18} className='text-gray-500' />
                            </div>

                            {/* Short Info */}
                            {item.short_info && <p className='mt-1 text-xs text-gray-500'>{item.short_info}</p>}

                            {/* Details */}
                            <div className='mt-2 flex items-center gap-4 text-xs text-gray-600'>
                                <div className='flex items-center gap-1'>
                                    <Phone size={14} /> {item.voice} Min
                                </div>
                                <div className='flex items-center gap-1'>
                                    <MessageCircle size={14} /> {item.text} SMS
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Calendar size={14} /> {item.day} Days
                                </div>
                            </div>

                            {/* Price + Buy */}
                            <div className='mt-3 flex items-center justify-between'>
                                <span className='text-sm font-semibold'>₹ {item.net_price}</span>
                                <Button className='bg-blue-600 hover:bg-blue-700' onClick={handleBuyClick}>
                                    Buy Now
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
