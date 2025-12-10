'use client';

import { useEffect } from 'react';

import Head from 'next/head';

import { BASE_URL } from '@/config/constant';
import { RootState } from '@/redux/store/store';

import { useSelector } from 'react-redux';

export default function FaviconSetter() {
    const { favicon } = useSelector((state: RootState) => state.appSettings);

    useEffect(() => {
        if (typeof document === 'undefined' || !favicon) return;

        // Remove existing favicons
        const links = document.querySelectorAll("link[rel*='icon']");
        links.forEach((link) => link.parentNode?.removeChild(link));

        // Create new favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = `${BASE_URL}/${favicon}`;
        document.head.appendChild(link);

        return () => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        };
    }, [favicon]);

    return (
        <Head>
            {/* fallback favicon (from public/) */}
            <link rel='icon' href='/favicon.ico' />
        </Head>
    );
}
