// components/skeleton/PlanCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

interface PlanCardSkeletonProps {
    count?: number;
}

const PlanCardSkeleton = ({ count = 8 }: PlanCardSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className='group relative transform animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-lg'>
                    {/* Top Pick Badge Skeleton (for first card) */}
                    {index === 0 && (
                        <div className='absolute -top-2 -right-2'>
                            <Skeleton className='h-6 w-16 rounded-full' />
                        </div>
                    )}

                    {/* Country Info Skeleton */}
                    <div className='mb-4 flex items-center gap-3'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <div>
                            <Skeleton className='mb-1 h-4 w-20' />
                            <Skeleton className='h-3 w-16' />
                        </div>
                    </div>

                    {/* Plan Details Skeleton */}
                    <div className='mb-4 text-center'>
                        {/* Data/Voice/SMS Grid */}
                        <div className='mb-4 grid grid-cols-3 gap-4'>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className='flex flex-col items-center gap-2'>
                                    <Skeleton className='h-4 w-4 rounded' />
                                    <Skeleton className='h-4 w-8' />
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className='mb-3 flex items-center justify-center gap-1'>
                            <Skeleton className='h-3 w-3 rounded' />
                            <Skeleton className='h-3 w-12' />
                        </div>

                        {/* Price */}
                        <div className='mb-3'>
                            <Skeleton className='mx-auto mb-1 h-8 w-20' />
                            <Skeleton className='mx-auto h-3 w-16' />
                        </div>
                    </div>

                    {/* Features List Skeleton */}
                    <div className='mb-4 space-y-2'>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className='flex items-center gap-2'>
                                <Skeleton className='h-3 w-3 flex-shrink-0 rounded-full' />
                                <Skeleton className='h-3 w-24' />
                            </div>
                        ))}
                    </div>

                    {/* Buttons Skeleton */}
                    <div className='mt-auto space-y-3'>
                        {/* View Details Button */}
                        <Skeleton className='h-12 w-full rounded-lg' />

                        {/* Buy Plan Button */}
                        <Skeleton className='h-12 w-full rounded-lg' />
                    </div>
                </div>
            ))}
        </>
    );
};

export default PlanCardSkeleton;
