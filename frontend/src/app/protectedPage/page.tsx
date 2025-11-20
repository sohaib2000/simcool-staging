'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getUserTokenClient } from '@/lib/userAuth';

const ProtectedPage = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [originalRoute, setOriginalRoute] = useState('/dashboard');

    useEffect(() => {
        // Get original route from cookie
        const getOriginalRoute = () => {
            const cookies = document.cookie.split(';');
            const originalRouteCookie = cookies.find((c) => c.trim().startsWith('originalRoute='));

            if (originalRouteCookie) {
                const route = decodeURIComponent(originalRouteCookie.split('=')[4]);
                setOriginalRoute(route);

                // Clear the cookie after reading
                document.cookie = 'originalRoute=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        };

        // Check authentication
        const checkAuth = () => {
            const token = getUserTokenClient();
            if (token) {
                setIsAuthenticated(true);
                // Auto redirect after 1 second
                setTimeout(() => {
                    router.push(originalRoute);
                }, 1000);
            }
        };

        getOriginalRoute();
        checkAuth();
    }, [router, originalRoute]);

    const handleLogin = () => {
        // Store original route in localStorage as fallback
        router.push('/');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    // Success State
    if (isAuthenticated) {
        return (
            <div className='flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
                <div className='text-center sm:mx-auto sm:w-full sm:max-w-md'>
                    <div className='mb-8 text-6xl'>✅</div>
                    <h1 className='mb-4 text-4xl font-bold text-gray-900'>Access Granted</h1>
                    <p className='mb-4 text-xl text-gray-600'>Redirecting to {originalRoute}</p>
                    <div className='mx-auto h-2 w-32 rounded-full bg-gray-200'>
                        <div className='h-2 animate-pulse rounded-full bg-green-600' style={{ width: '75%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    // Protected Route Message (404 Style)
    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
            <div className='mx-auto max-w-md px-4 text-center'>
                {/* Large Icon */}
                <div className='mb-8 text-9xl'>🔒</div>

                {/* Large Status Code */}
                <h1 className='mb-6 text-7xl font-bold text-gray-900'>401</h1>

                {/* Main Message */}
                <h2 className='mb-8 text-4xl font-bold text-gray-800'>Protected Route</h2>

                {/* Simple Description */}
                <p className='mb-4 text-xl text-gray-600'>You need to be logged in to access this page.</p>

                {/* Show which page they tried to access */}
                <div className='mb-8 rounded-lg bg-gray-100 p-4'>
                    <p className='mb-1 text-sm text-gray-500'>Requested page:</p>
                    <p className='font-mono text-gray-800'>{originalRoute}</p>
                </div>

                {/* Action Buttons */}
                <div className='space-y-4'>
                    <button
                        onClick={handleLogin}
                        className='block w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700'>
                        🔑 Login to Continue
                    </button>

                    <button
                        onClick={handleGoHome}
                        className='block w-full rounded-lg bg-gray-200 px-6 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-300'>
                        🏠 Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProtectedPage;
