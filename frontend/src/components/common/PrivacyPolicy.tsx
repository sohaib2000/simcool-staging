'use client';

import React, { useMemo } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';

import DOMPurify from 'dompurify';
import { ArrowLeft, Eye, FileText, Lock, Shield } from 'lucide-react';

interface PageContent {
    id: number;
    title: string;
    slug: string;
    banner: string | null;
    short_desc: string;
    long_desc: string;
}

interface ApiResponse {
    success: boolean;
    data: PageContent[];
}

const PrivacyPolicy = () => {
    const router = useRouter();
    const { data: pagesData } = usePublicApiHandler<ApiResponse>({
        url: '/pages'
    });

    const newpath = usePathname();

    const path = newpath.startsWith('/profile') ? '/profile/terms-and-conditions' : '/terms-and-conditions';

    // Find Privacy Policy page from API data
    const privacyPolicyPage = useMemo(() => {
        if (!pagesData?.success) return null;
        return pagesData.data.find((page) => page.slug === 'privacy-policy');
    }, [pagesData]);

    // Sanitize HTML content for security
    const sanitizedShortDesc = useMemo(() => {
        if (!privacyPolicyPage?.short_desc) return '';
        return DOMPurify.sanitize(privacyPolicyPage.short_desc, {
            ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'p'],
            ALLOWED_ATTR: ['class']
        });
    }, [privacyPolicyPage?.short_desc]);

    const sanitizedLongDesc = useMemo(() => {
        if (!privacyPolicyPage?.long_desc) return '';
        return DOMPurify.sanitize(privacyPolicyPage.long_desc, {
            ALLOWED_TAGS: [
                'div',
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'b',
                'strong',
                'i',
                'em',
                'u',
                'br',
                'hr',
                'table',
                'thead',
                'tbody',
                'tr',
                'td',
                'th',
                'ul',
                'ol',
                'li',
                'a'
            ],
            ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'target', 'rel', 'title', 'alt'],
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
    }, [privacyPolicyPage?.long_desc]);

    // Loading state
    if (!pagesData) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
                <div className='container mx-auto px-4 py-16'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading Privacy Policy...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Page not found state
    if (!privacyPolicyPage) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50'>
                <div className='container mx-auto px-4 py-16'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
                            <FileText className='mx-auto mb-4 h-16 w-16 text-red-500' />
                            <h1 className='mb-2 text-2xl font-bold text-gray-900'>Privacy Policy Not Found</h1>
                            <p className='mb-6 text-gray-600'>
                                The privacy policy content could not be loaded at this time.
                            </p>
                            <button
                                onClick={() => router.back()}
                                className='inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700'>
                                <ArrowLeft className='mr-2 h-4 w-4' />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
            <div className='container mx-auto max-w-6xl px-4 py-12'>
                {/* Hero Section */}
                <div className='mb-12 text-center'>
                    <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                        <Lock className='h-8 w-8 text-blue-600' />
                    </div>
                    <h1 className='mb-4 text-4xl font-bold text-gray-900 md:text-5xl'>{privacyPolicyPage.title}</h1>
                    <div className='mb-8 flex items-center justify-center space-x-6 text-sm text-gray-500'>
                        <div className='flex items-center'>
                            <Eye className='mr-2 h-4 w-4' />
                            <span>Transparency First</span>
                        </div>
                        <div className='flex items-center'>
                            <Shield className='mr-2 h-4 w-4' />
                            <span>GDPR Compliant</span>
                        </div>
                    </div>
                </div>

                {/* Short Description Card */}
                <div className='mb-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white shadow-xl'>
                    <div className='flex items-start space-x-4'>
                        <div className='flex-1'>
                            <h2 className='mb-3 text-xl font-semibold'>Overview</h2>
                            <div
                                className='privacy-overview leading-relaxed text-blue-50'
                                dangerouslySetInnerHTML={{ __html: sanitizedShortDesc }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='overflow-hidden rounded-2xl bg-white shadow-xl'>
                    <div className='p-8 md:p-12'>
                        <div
                            className='prose prose-lg prose-blue privacy-content max-w-none'
                            dangerouslySetInnerHTML={{ __html: sanitizedLongDesc }}
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className='mt-12 rounded-2xl bg-gray-50 p-8'>
                    <div className='text-center'>
                        <h3 className='mb-4 text-2xl font-bold text-gray-900'>Questions About Your Privacy?</h3>
                        <p className='mx-auto mb-6 max-w-2xl text-gray-600'>
                            If you have any questions about this Privacy Policy or how we handle your data, please don't
                            hesitate to contact our privacy team.
                        </p>
                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            <button
                                onClick={() => router.push(`${path}`)}
                                className='inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50'>
                                <FileText className='mr-2 h-4 w-4' />
                                View Terms & Conditions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .privacy-content h3 {
                    @apply mt-8 mb-4 border-b-2 border-blue-100 pb-2 text-2xl font-bold text-gray-900;
                }

                .privacy-content p {
                    @apply mb-4 leading-relaxed text-gray-700;
                }

                .privacy-content table {
                    @apply my-8 w-full border-collapse overflow-hidden rounded-lg bg-gray-50;
                }

                .privacy-content th {
                    @apply bg-blue-600 p-4 text-left font-semibold text-white;
                }

                .privacy-content td {
                    @apply border-b border-gray-200 p-4 text-gray-700;
                }

                .privacy-content b,
                .privacy-content strong {
                    @apply font-semibold text-gray-900;
                }

                .privacy-content hr {
                    @apply my-8 border-gray-200;
                }

                .privacy-overview b,
                .privacy-overview strong {
                    @apply font-semibold text-white;
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
