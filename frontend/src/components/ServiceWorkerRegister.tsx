'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    // console.log('Service Worker registered:', registration);
                })
                .catch((err) => {
                    console.error('Service Worker registration failed:', err);
                });
        }
    }, []);

    return null;
}
