import { BASE_URL } from '@/config/constant';

// utils/csrf.ts
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
};

export const ensureCsrfCookie = async () => {
    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include'
    });

    const token = getCookie('XSRF-TOKEN');

    return token;
};
