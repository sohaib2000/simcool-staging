import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

const HOSTNAME = process.env.NEXT_PUBLIC_DOMAIN || '';

const nextConfig: NextConfig = {
    output: 'standalone',
    htmlLimitedBots: /.*/,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: `admin.${HOSTNAME}`,
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'cdn.airalo.com',
                pathname: '/**'
            }
        ]
    }
};

export default withBundleAnalyzer(nextConfig);
