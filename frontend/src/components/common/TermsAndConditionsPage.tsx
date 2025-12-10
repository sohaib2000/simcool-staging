'use client';

import React, { useMemo } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';

import DOMPurify from 'dompurify';
import { AlertTriangle, ArrowLeft, CheckCircle, FileText, Gavel, Scale } from 'lucide-react';

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

const TermsAndConditionsPage = () => {
    const newpath = usePathname();

    const path = newpath.startsWith('/profile') ? '/profile/privacy-policy' : '/privacy-policy';

    const router = useRouter();
    const { data: pagesData } = usePublicApiHandler({
        url: '/pages'
    }) as { data: ApiResponse | null };

    // Find Terms & Conditions page from API data
    const termsPage = useMemo(() => {
        if (!pagesData?.success) return null;
        return pagesData.data.find((page) => page.slug === 'terms-and-conditions');
    }, [pagesData]);

    // Sanitize HTML content for security
    const sanitizedShortDesc = useMemo(() => {
        if (!termsPage?.short_desc) return '';
        return DOMPurify.sanitize(termsPage.short_desc, {
            ALLOWED_TAGS: ['p', 'span', 'b', 'strong', 'i', 'em', 'u', 'br'],
            ALLOWED_ATTR: ['style', 'class'],
            ALLOW_DATA_ATTR: false
        });
    }, [termsPage?.short_desc]);

    const sanitizedLongDesc = useMemo(() => {
        if (!termsPage?.long_desc) return '';
        return DOMPurify.sanitize(termsPage.long_desc, {
            ALLOWED_TAGS: [
                'p',
                'span',
                'div',
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
                'ul',
                'ol',
                'li',
                'table',
                'thead',
                'tbody',
                'tr',
                'td',
                'th',
                'a'
            ],
            ALLOWED_ATTR: [
                'class',
                'style',
                'href',
                'target',
                'rel',
                'margin-right',
                'margin-bottom',
                'margin-left',
                'font-family',
                'font-size',
                'line-height',
                'font-weight',
                'font-variant-numeric'
            ],
            ALLOWED_URI_REGEXP: /^(?:(?:mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        });
    }, [termsPage?.long_desc]);

    // Loading state
    if (!pagesData) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50'>
                <div className='container mx-auto px-4 py-16'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-green-600'></div>
                        <p className='text-lg text-gray-600'>Loading Terms & Conditions...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Page not found state
    if (!termsPage) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50'>
                <div className='container mx-auto px-4 py-16'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
                            <AlertTriangle className='mx-auto mb-4 h-16 w-16 text-red-500' />
                            <h1 className='mb-2 text-2xl font-bold text-gray-900'>Terms & Conditions Not Found</h1>
                            <p className='mb-6 text-gray-600'>
                                The terms and conditions content could not be loaded at this time.
                            </p>
                            <button
                                onClick={() => router.back()}
                                className='inline-flex items-center rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700'>
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
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50'>
            {/* Header Section */}

            <div className='container mx-auto max-w-6xl px-4 py-12'>
                {/* Hero Section */}
                <div className='mb-12 text-center'>
                    <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                        <Gavel className='h-8 w-8 text-green-600' />
                    </div>
                    <h1 className='mb-4 text-4xl font-bold text-gray-900 md:text-5xl'>{termsPage.title}</h1>
                    <div className='mb-8 flex items-center justify-center space-x-6 text-sm text-gray-500'>
                        <div className='flex items-center'>
                            <CheckCircle className='mr-2 h-4 w-4' />
                            <span>Legally Binding</span>
                        </div>
                        <div className='flex items-center'>
                            <Scale className='mr-2 h-4 w-4' />
                            <span>Fair & Transparent</span>
                        </div>
                        <div className='flex items-center'>
                            <FileText className='mr-2 h-4 w-4' />
                            <span>Easy to Understand</span>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className='mb-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white shadow-xl'>
                    <div className='flex items-start space-x-4'>
                        <div className='flex-1'>
                            <h2 className='mb-3 text-xl font-semibold'>Important Notice</h2>
                            <div
                                className='terms-overview leading-relaxed text-amber-50'
                                dangerouslySetInnerHTML={{ __html: sanitizedShortDesc }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='overflow-hidden rounded-2xl bg-white shadow-xl'>
                    <div className='border-b border-gray-200 bg-gray-50 p-6'>
                        <h2 className='flex items-center text-2xl font-bold text-gray-900'>
                            <Gavel className='mr-3 h-6 w-6' />
                            Full Terms & Conditions
                        </h2>
                        <p className='mt-2 text-gray-600'>
                            Please read these terms carefully before using our services. By using our app, you agree to
                            be bound by these terms.
                        </p>
                    </div>

                    <div className='p-8 md:p-12'>
                        <div
                            className='prose prose-lg prose-green terms-content max-w-none'
                            dangerouslySetInnerHTML={{ __html: sanitizedLongDesc }}
                        />
                    </div>
                </div>

                {/* Contact & Support Section */}
                <div className='mt-12 rounded-2xl bg-gray-50 p-8'>
                    <div className='text-center'>
                        <h3 className='mb-4 text-2xl font-bold text-gray-900'>Questions About These Terms?</h3>
                        <p className='mx-auto mb-6 max-w-2xl text-gray-600'>
                            If you have any questions about these Terms & Conditions or need clarification on any
                            clause, please contact our legal team.
                        </p>
                        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                            <button
                                onClick={() => router.push(`${path}`)}
                                className='inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50'>
                                <FileText className='mr-2 h-4 w-4' />
                                View Privacy Policy
                            </button>
                        </div>

                        {/* Contact Email Display */}
                        <div className='mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-white p-4'>
                            <p className='mb-2 text-sm text-gray-600'>For immediate assistance:</p>
                            <a
                                href='mailto:cs@esim.app'
                                className='font-semibold text-green-600 transition-colors hover:text-green-700'>
                                cs@esim.app
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .terms-content h3,
                .terms-content h2 {
                    @apply mt-8 mb-4 border-b-2 border-green-100 pb-2 text-xl font-bold text-gray-900;
                }

                .terms-content p {
                    @apply mb-4 leading-relaxed text-gray-700;
                }

                .terms-content ul {
                    @apply mb-6 list-disc space-y-2 pl-6;
                }

                .terms-content li {
                    @apply leading-relaxed text-gray-700;
                }

                .terms-content span[style*='font-weight: 600'],
                .terms-content b,
                .terms-content strong {
                    @apply font-semibold text-gray-900;
                }

                .terms-content hr {
                    @apply my-8 border-gray-200;
                }

                .terms-overview span[style*='font-weight: 600'],
                .terms-overview b,
                .terms-overview strong {
                    @apply font-semibold text-white;
                }

                /* Clean up inline styles from API */
                .terms-content p[class*='p'],
                .terms-content li[class*='li'],
                .terms-content ul[class*='ul'] {
                    @apply !m-0 mb-4 !p-0;
                }

                .terms-content li[class*='li'] {
                    @apply mb-2 !important;
                }

                .terms-content ul[class*='ul'] {
                    @apply mb-6 !important;
                }
            `}</style>
        </div>
    );
};

export default TermsAndConditionsPage;
