import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import '@/app/globals.css';
import ConditionalMargin from '@/components/ConditionalMargin';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { API_URL, BASE_URL, FRONT_BASE_URL } from '@/config/constant';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { TanStackQueryProvider } from '@/providers/TanStackQueryProvider';
import { MetaApiResponse } from '@/types/type';

import { inter, poppins } from './fonts/fonts';

// export const metadata: Metadata = {
//     title: {
//         default: 'eSIM Tell | Global eSIM Solutions for Travelers',
//         template: '%s | eSIM Tell'
//     },
//     description:
//         'Stay connected globally with smart eSIM solutions. Instant activation in 180+ countries without expensive roaming fees.',
//     keywords: ['eSIM', 'travel SIM', 'inter  national roaming', 'mobile data', 'global connectivity'],
//     authors: [{ name: 'eSIM Tell Team' }],
//     creator: 'eSIM Tell',
//     publisher: 'eSIM Tell',
//     metadataBase: new URL(FRONT_BASE_URL || 'https://admin.esimtel.com'),
//     alternates: {
//         canonical: '/'
//     },
//     openGraph: {
//         type: 'website',
//         locale: 'en_US',
//         url: '/',
//         title: 'eSIM Tell | Global eSIM Solutions',
//         description: 'Experience seamless international connectivity with eSIM technology',
//         siteName: 'eSIM Tell',
//         images: [
//             {
//                 url: `${FRONT_BASE_URL}/images/splash.png`,
//                 width: 1200,
//                 height: 630,
//                 alt: 'eSIM Tell - Global Connectivity Solutions'
//             }
//         ]
//     },
//     twitter: {
//         card: 'summary_large_image',
//         title: 'eSIM Tell | Global eSIM Solutions',
//         description: 'Stay connected worldwide with smart eSIM technology',
//         images: ['/images/splash.png'],
//         creator: '@esimtel',
//         site: '@esimtel'
//     },
//     robots: {
//         index: true,
//         follow: true,
//         googleBot: {
//             index: true,
//             follow: true,
//             'max-video-preview': -1,
//             'max-image-preview': 'large',
//             'max-snippet': -1
//         }
//     },
//     verification: {
//         google: 'your-google-verification-code',
//         yandex: 'your-yandex-verification-code',
//         yahoo: 'your-yahoo-verification-code'
//     }
// };

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
};

export async function generateMetadata(): Promise<Metadata> {
    try {
        const response = await fetch(`${API_URL}/generalSettings`);

        const metadata: MetaApiResponse = await response.json();

        return {
            title: {
                default: `${metadata.data.webconfig.siteName} | Global eSIM Solutions for Travelers`,
                template: `%s |  ${metadata.data.webconfig.siteName} `
            },
            description:
                'Stay connected globally with smart eSIM solutions. Instant activation in 180+ countries without expensive roaming fees.',
            icons: {
                icon: [
                    {
                        url: `${BASE_URL}/${metadata.data.favicon}`, // Your API URL
                        type: 'image/png',
                        sizes: '32x32'
                    }
                ],
                shortcut: `${BASE_URL}/${metadata.data.favicon}`,
                apple: `${BASE_URL}/${metadata.data.favicon}`
            },
            keywords: ['eSIM', 'travel SIM', 'international roaming', 'mobile data', 'global connectivity'],
            authors: [{ name: `${metadata.data.webconfig.siteName} Team` }],
            creator: `${metadata.data.webconfig.siteName} `,
            publisher: `${metadata.data.webconfig.siteName} `,
            metadataBase: new URL(FRONT_BASE_URL) || `${metadata.data.webconfig.webBaseUrl}`,
            alternates: {
                canonical: '/'
            },
            openGraph: {
                type: 'website',
                locale: 'en_US',
                url: '/',
                title: ` ${metadata.data.webconfig.siteName} | Global eSIM Solutions`,
                description: 'Experience seamless international connectivity with eSIM technology',
                siteName: ` ${metadata.data.webconfig.siteName}`,
                images: [
                    {
                        url: `${BASE_URL}/${metadata.data.favicon}`,
                        width: 1200,
                        height: 630,
                        alt: `${metadata.data.webconfig.siteName} - Global Connectivity Solutions`
                    }
                ]
            },
            twitter: {
                card: 'summary_large_image',
                title: `${metadata.data.webconfig.siteName} | Global eSIM Solutions`,
                description: 'Stay connected worldwide with smart eSIM technology',
                images: [`${BASE_URL}/${metadata.data.favicon}`],
                creator: `${metadata.data.webconfig.contactEmail}`,
                site: '@esimtel'
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1
                }
            },
            verification: {
                google: 'your-google-verification-code',
                yandex: 'your-yandex-verification-code',
                yahoo: 'your-yahoo-verification-code'
            }
        };
    } catch (error) {
        return {
            title: {
                template: '%s | eSIM Tell',
                default: 'eSIM Tell'
            },
            description: 'Global eSIM Solutions'
        };
    }
}

const Layout = async ({ children }: Readonly<{ children: ReactNode }>) => {
    // Get user session from cookies

    return (
        <html suppressHydrationWarning lang='en'>
            <head>
                <Script src='https://checkout.razorpay.com/v1/checkout.js' strategy='afterInteractive' />
                {/* <Script src='https://js.stripe.com/v3/' strategy='afterInteractive' /> */}
                <Script src='https://sdk.cashfree.com/js/v3/cashfree.js' strategy='afterInteractive' />
            </head>
            <body className={`${poppins.variable} ${inter.variable} bg-background text-foreground !overflow-scroll`}>
                <LanguageProvider>
                    <ReduxProvider>
                        {/* <FaviconSetter /> */}
                        <TanStackQueryProvider>
                            <Navbar />
                            <ConditionalMargin>{children}</ConditionalMargin>
                            <Footer />
                        </TanStackQueryProvider>
                    </ReduxProvider>
                </LanguageProvider>
            </body>
        </html>
    );
};

export default Layout;
