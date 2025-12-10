// lib/seo.ts
import type { Metadata } from 'next';

import { FRONT_BASE_URL } from '@/config/constant';

// SEO defaults configuration
const SEO_DEFAULTS = {
    siteName: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultImage: '',
    defaultKeywords: ['eSIM', 'travel SIM', 'international roaming', 'mobile data', 'global connectivity'],
    twitterHandle: '',
    baseUrl: FRONT_BASE_URL
} as const;

interface DynamicSEOProps {
    title?: string; // Optional - will use default if not provided
    description?: string; // Optional - will use default if not provided
    image?: string; // Optional - will use default if not provided
    canonical?: string; // Optional - will use current page path
    keywords?: string[]; // Optional - will merge with defaults
    noIndex?: boolean; // Optional - default false
    ogType?: 'website' | 'article'; // Optional - default 'website'
    publishedTime?: string; // Optional - for articles
    modifiedTime?: string; // Optional - for articles
}

/**
 * Validates and formats title to avoid duplication
 */
function formatTitle(title?: string): string {
    if (!title) {
        return SEO_DEFAULTS.defaultTitle;
    }

    // Check if title already contains site name variations (case-insensitive)
    const titleLower = title.toLowerCase();
    const siteNameVariations = ['esim '];

    const hasSiteName = siteNameVariations.some((variation) => titleLower.includes(variation));

    return hasSiteName ? title : `${title}`;
}

/**
 * Validates and formats image URL
 */
function formatImageUrl(image?: string): string {
    if (!image) {
        return `${SEO_DEFAULTS.baseUrl}${SEO_DEFAULTS.defaultImage}`;
    }

    // Check if it's already a full URL
    const isFullUrl = /^https?:\/\//.test(image);
    if (isFullUrl) {
        return image;
    }

    // Ensure image path starts with /
    const imagePath = image.startsWith('/') ? image : `/${image}`;
    return `${SEO_DEFAULTS.baseUrl}${imagePath}`;
}

/**
 * Validates and formats canonical URL
 */
function formatCanonicalUrl(canonical?: string): string | undefined {
    if (!canonical) {
        return undefined;
    }

    // If already a full URL, return as-is
    const isFullUrl = /^https?:\/\//.test(canonical);
    if (isFullUrl) {
        return canonical;
    }

    // Ensure canonical starts with /
    const canonicalPath = canonical.startsWith('/') ? canonical : `/${canonical}`;
    return `${SEO_DEFAULTS.baseUrl}${canonicalPath}`;
}

/**
 * Merges keywords and removes duplicates (case-insensitive)
 */
function mergeKeywords(customKeywords: string[]): string[] {
    const allKeywords = [...SEO_DEFAULTS.defaultKeywords, ...customKeywords];

    // Remove duplicates using case-insensitive comparison
    const uniqueKeywords = allKeywords.filter(
        (keyword, index, array) => array.findIndex((k) => k.toLowerCase() === keyword.toLowerCase()) === index
    );

    return uniqueKeywords;
}

/**
 * Generates alt text for images
 */
function generateImageAlt(title?: string): string {
    return title ? `${title} - eSIM ` : 'eSIM  - Global Connectivity Solutions';
}

export function createPageSEO({
    title,
    description,
    image,
    canonical,
    keywords = [],
    noIndex = false,
    ogType = 'website',
    publishedTime,
    modifiedTime
}: DynamicSEOProps = {}): Metadata {
    const finalTitle = formatTitle(title);
    const finalDescription = description || SEO_DEFAULTS.defaultDescription;
    const finalImage = formatImageUrl(image);
    const finalCanonical = formatCanonicalUrl(canonical);
    const finalKeywords = mergeKeywords(keywords);
    const imageAlt = generateImageAlt(title);

    const metadata: Metadata = {
        title: `${finalTitle}`,
        description: finalDescription,
        keywords: finalKeywords,
        authors: [{ name: 'eSIM  Team' }],
        creator: SEO_DEFAULTS.siteName,
        publisher: SEO_DEFAULTS.siteName,

        ...(finalCanonical && {
            alternates: {
                canonical: finalCanonical
            }
        }),

        openGraph: {
            type: ogType,
            title: finalTitle,
            description: finalDescription,
            siteName: SEO_DEFAULTS.siteName,
            images: [
                {
                    url: finalImage,
                    width: 1200,
                    height: 630,
                    alt: imageAlt
                }
            ],
            ...(finalCanonical && { url: finalCanonical }),
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime })
        },

        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: finalDescription,
            images: [finalImage],
            creator: SEO_DEFAULTS.twitterHandle,
            site: SEO_DEFAULTS.twitterHandle
        },

        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        }
    };

    return metadata;
}

// Quick templates for common patterns
export const QuickSEO = {
    /**
     * Default page SEO with optional canonical URL
     */
    default: (canonical?: string) => createPageSEO({ canonical }),

    /**
     * Page SEO with custom title only
     */
    withTitle: (title: string, canonical?: string) => createPageSEO({ title, canonical }),

    /**
     * Page SEO with custom title and description
     */
    withTitleDesc: (title: string, description: string, canonical?: string) =>
        createPageSEO({ title, description, canonical }),

    /**
     * Full custom SEO configuration
     */
    custom: (props: DynamicSEOProps) => createPageSEO(props),

    /**
     * Article/Blog post SEO with article-specific optimizations
     */
    article: (title: string, description?: string, canonical?: string, publishedTime?: string) =>
        createPageSEO({
            title,
            description,
            canonical,
            ogType: 'article',
            publishedTime,
            keywords: ['eSIM guide', 'travel tips', 'connectivity tutorial']
        }),

    /**
     * No-index page SEO (for admin, private, or duplicate pages)
     */
    noIndex: (title?: string, canonical?: string) => createPageSEO({ title, canonical, noIndex: true }),

    destination: (countryName: string, description: string, canonical: string) =>
        createPageSEO({
            title: `eSIM for ${countryName} - Best Data Plans & Coverage`,
            description: `Get instant eSIM for ${countryName}. ${description}`,
            canonical,
            keywords: [
                `${countryName} eSIM`,
                `${countryName} travel SIM`,
                `${countryName} mobile data`,
                `international roaming ${countryName}`
            ]
        })
} as const;

// Export SEO defaults for external use
export { SEO_DEFAULTS };

// Type export for external usage
export type { DynamicSEOProps };
