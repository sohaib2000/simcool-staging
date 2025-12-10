'use client';

import React, { useEffect } from 'react';

const Loader = () => {
    useEffect(() => {
        // Body scroll disable karo with better handling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        const originalPosition = document.body.style.position;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';

        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.position = originalPosition;
        };
    }, []);

    return (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black/30 to-black/50 backdrop-blur-sm dark:from-black/50 dark:to-black/70'>
            {/* Loader Container with glassmorphism effect */}
            <div className='flex flex-col items-center gap-6 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md dark:border-white/10 dark:bg-white/5'>
                {/* Dual Ring Spinner */}
                <div className='relative h-16 w-16'>
                    {/* Outer Ring */}
                    <div className='absolute inset-0 rounded-full border-4 border-blue-200/30 dark:border-blue-800/30'></div>

                    {/* Inner Spinning Ring */}
                    <div className='absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400'></div>

                    {/* Center Dot */}
                    <div className='absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-blue-600 dark:bg-blue-400'></div>
                </div>

                {/* Loading Text with animated dots */}
                <div className='flex items-center gap-1'>
                    <span className='text-sm font-medium text-white dark:text-gray-200'>Loading</span>
                    <div className='flex space-x-1'>
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={` ${_}-${i} `}
                                className='h-1 w-1 animate-bounce rounded-full bg-white dark:bg-gray-300'
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
