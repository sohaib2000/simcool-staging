import React from 'react';

import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { FaqsResponse } from '@/types/type';

import ESimTelBanner from './ESimTelBanner';
import EsimToRule from './EsimToRule';
import PopularPlans from './PopulerPlan';
import FAQ from './sections/FAQ';
import Hero from './sections/Hero';
import TravelDestinationTabs from './sections/TravelDestinationTabs';
import WhyChoose from './sections/WhyChoose';

const Main = () => {
    const { data: faqData } = usePublicApiHandler<FaqsResponse>({
        url: '/faqs'
    });
    return (
        <div>
            <Hero />
            <EsimToRule />
            <ESimTelBanner />
            <TravelDestinationTabs />
            <PopularPlans />
            <WhyChoose />
            {faqData?.data && faqData.data.length > 0 && <FAQ />}
        </div>
    );
};

export default Main;
