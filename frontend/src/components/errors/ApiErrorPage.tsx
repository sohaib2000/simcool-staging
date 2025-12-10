'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiErrorPageProps {
    onRetry?: () => void;
    isRetrying?: boolean;
}

const ApiErrorPage = ({ onRetry, isRetrying = false }: ApiErrorPageProps) => {
    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4'>
            <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
                {/* Error Icon */}
                <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
                    <AlertTriangle className='h-10 w-10 text-red-600' />
                </div>

                {/* Error Title */}
                <h1 className='mb-4 text-2xl font-bold text-gray-900'>API Connection Failed</h1>

                {/* Error Message */}
                <p className='mb-6 leading-relaxed text-gray-600'>
                    Unable to connect to our servers. This might be a temporary issue with our API service.
                </p>

                {/* Retry Button */}
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        disabled={isRetrying}
                        className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-70'>
                        {isRetrying ? (
                            <>
                                <RefreshCw className='h-4 w-4 animate-spin' />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className='h-4 w-4' />
                                Try Again
                            </>
                        )}
                    </Button>
                )}

                {/* Help Text */}
                <p className='mt-6 text-xs text-gray-500'>Our team has been notified about the API issue.</p>
            </div>
        </div>
    );
};

export default ApiErrorPage;
