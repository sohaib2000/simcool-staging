'use client';

import React, { useMemo } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from '@/contexts/LanguageContext';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { FaqsResponse } from '@/types/type';

import { AlertCircle, HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
    const {
        data: faqData,
        isLoading,
        error
    } = usePublicApiHandler<FaqsResponse>({
        url: '/faqs'
    });

    const { t } = useTranslation();

    // Memoize filtered active FAQs
    const activeFaqs = useMemo(() => {
        if (!faqData?.success || !faqData.data) return [];

        return faqData.data.filter((faq) => faq.is_active === 1).sort((a, b) => a.id - b.id); // Sort by ID for consistent order
    }, [faqData]);

    // Loading state
    if (isLoading) {
        return (
            <section className='bg-gray-50 py-16'>
                <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-12 text-center'>
                        <h2 className='mb-4 text-3xl font-normal text-gray-900 md:text-4xl lg:text-5xl'>
                            {t('home.faq.faqHeading')}
                        </h2>
                        <p className='mx-auto max-w-2xl text-lg text-gray-600'>{t('home.faq.faqDescription')}</p>
                    </div>

                    {/* Loading Skeletons */}
                    <div className='space-y-4'>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={`${_}-${index}`}
                                className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
                                <div className='animate-pulse'>
                                    <div className='mb-2 h-5 w-3/4 rounded bg-gray-200'></div>
                                    <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error || !faqData?.success) {
        return (
            <section className='bg-gray-50 py-16'>
                <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                    <div className='text-center'>
                        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                            <AlertCircle className='h-8 w-8 text-red-600' aria-hidden='true' />
                        </div>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900'>Unable to Load FAQs</h2>
                        <p className='text-gray-600'>
                            {faqData?.message || 'Failed to fetch frequently asked questions. Please try again later.'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // No FAQs available
    if (activeFaqs.length === 0) {
        return (
            <section className='bg-gray-50 py-16'>
                <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                    <div className='text-center'>
                        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                            <HelpCircle className='h-8 w-8 text-blue-600' aria-hidden='true' />
                        </div>
                        <h2 className='mb-4 text-2xl font-bold text-gray-900'>No FAQs Available</h2>
                        <p className='text-gray-600'>
                            We're working on adding frequently asked questions. Check back soon!
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='bg-gray-50 py-16'>
            <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section */}
                <div className='mb-12 text-center'>
                    <h2 className='text-primary mb-4 text-3xl font-normal md:text-4xl lg:text-5xl'>
                        {t('home.faq.faqHeading')}
                    </h2>
                    <p className='mx-auto max-w-2xl text-lg text-gray-600'>{t('home.faq.faqDescription')}</p>
                </div>

                {/* Single Accordion Container - Only One Item Can Be Open */}
                <Accordion type='single' collapsible className='w-full space-y-4'>
                    {activeFaqs.map((faq) => (
                        <AccordionItem
                            key={faq.id}
                            value={faq.id.toString()}
                            className='rounded-2xl border border-none border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
                            <AccordionTrigger className='px-6 py-5 text-left transition-colors hover:no-underline [&[data-state=open]]:text-blue-600'>
                                <span className='pr-4 text-base leading-relaxed font-semibold text-gray-900 md:text-lg'>
                                    {faq.question}
                                </span>
                            </AccordionTrigger>

                            <AccordionContent className='px-6 pb-5'>
                                <div className='pt-2'>
                                    <p className='leading-relaxed whitespace-pre-line text-gray-700'>{faq.answer}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
