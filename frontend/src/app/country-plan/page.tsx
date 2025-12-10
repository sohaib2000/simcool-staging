import { Metadata } from 'next';

import AllCountryPlans from '@/components/AllCountryPlans';
import CountryPlanPage from '@/components/pages/CountryPlanPage';
import { QuickSEO } from '@/lib/seo';

export const metadata: Metadata = QuickSEO.custom({
    title: 'Country eSIM Plans - Best Data Plans by Country for Travel',
    description:
        'Browse eSIM plans by country for international travel. Find the best data plans for 180+ countries with instant activation, no roaming fees, and local rates.',
    image: '/images/splash.png',
    canonical: '/country-plan',
    keywords: [
        'country eSIM plans',
        'eSIM by country',
        'international data plans',
        'travel eSIM countries',
        'country-specific eSIM',
        'best eSIM for travel',
        'mobile data by country',
        'global eSIM coverage',
        'country data plans',
        'travel SIM by destination'
    ]
});
const page = () => {
    return (
        <>
            {/* <CountryPlanPage /> */}
            <AllCountryPlans />
        </>
    );
};

export default page;
