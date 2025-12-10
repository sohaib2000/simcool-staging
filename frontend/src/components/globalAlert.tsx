'use client';

import { useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAlertStore } from '@/lib/store/alertStore';

import { Terminal } from 'lucide-react';

export function GlobalAlert() {
    const { title, description, variant, visible, hideAlert } = useAlertStore();

    // Optional: auto-dismiss after 3s
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => hideAlert(), 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, hideAlert]);

    if (!visible) return null;

    return (
        <div className='fixed top-4 right-4 z-50 max-w-sm'>
            <Alert variant={variant}>
                <Terminal className='h-4 w-4' />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{description}</AlertDescription>
            </Alert>
        </div>
    );
}
