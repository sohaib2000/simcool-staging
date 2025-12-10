export const APP_KEY = 'base64:Q+Mpe%%%%%%';

let FRONT_BASE_URL: string;
let BASE_URL: string;
let API_URL: string;

if (typeof window !== 'undefined') {
    // ✅ Client-side: use actual browser hostname
    const { hostname } = window.location;
    FRONT_BASE_URL = `https://${hostname}`;
    BASE_URL = `https://admin.${hostname}`;
} else {
    // ✅ SSR/Build: use env or generic placeholder
    const hostname = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
    FRONT_BASE_URL = `https://${hostname}`;
    BASE_URL = `https://admin.${hostname}`;
}

API_URL = `${BASE_URL}/api`;

export { FRONT_BASE_URL, BASE_URL, API_URL };
