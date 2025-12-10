// components/skeleton/CountryRegionSkeleton.tsx (Updated for inline use)
import { Skeleton } from '@/components/ui/skeleton';

interface CountryRegionSkeletonProps {
    count?: number;
    type?: 'country' | 'region';
}

const CountryRegionSkeleton = ({ count = 9, type = 'country' }: CountryRegionSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className='animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            {/* Image Skeleton */}
                            <Skeleton
                                className={`h-12 w-12 rounded-full ${type === 'region' ? 'bg-gradient-to-br from-purple-200 to-blue-200' : ''}`}
                            />

                            {/* Text Content */}
                            <div className='space-y-2 text-start'>
                                <Skeleton className={`h-5 ${type === 'country' ? 'w-24' : 'w-32'}`} />
                                <Skeleton className='h-4 w-20' />
                                <Skeleton className={`h-3 ${type === 'country' ? 'w-16' : 'w-28'}`} />
                            </div>
                        </div>

                        {/* Arrow Skeleton */}
                        <Skeleton className='h-9 w-9 rounded-full' />
                    </div>
                </div>
            ))}
        </>
    );
};

export default CountryRegionSkeleton;
