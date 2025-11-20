// export const APP_KEY = 'base64:Q+Mpe%%%%%%';

// let FRONT_BASE_URL: string;
// let BASE_URL: string;
// let API_URL: string;

// if (typeof window !== 'undefined') {
//     // ✅ Client-side: use actual browser hostname
//     const { hostname } = window.location;
//     FRONT_BASE_URL = `https://${hostname}`;
//     BASE_URL = `https://admin.${hostname}`;
// } else {
//     // ✅ SSR/Build: use env or generic placeholder n
//     const hostname = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
//     FRONT_BASE_URL = `https://${hostname}`;
//     BASE_URL = `https://admin.${hostname}`;
// }

// API_URL = `${BASE_URL}/api`;

// export { FRONT_BASE_URL, BASE_URL, API_URL };

// Fixed version with proper const usage and type safety
export const APP_KEY = 'base64:Q+Mpe%%%%%%';

// Use const for variables that won't be reassigned
const getHostname = (): string => {
    // Use environment variable or fallback to production domain
    return process.env.NEXT_PUBLIC_DOMAIN || 'esimtel.app';
};

const buildUrls = (hostname: string) => {
    const frontBaseUrl = `https://${hostname}`;
    const baseUrl = `https://admin.${hostname}`;
    const apiUrl = `${baseUrl}/api`;

    return {
        frontBaseUrl,
        baseUrl,
        apiUrl
    };
};

const hostname = getHostname();

// Build URLs using the hostname
const { frontBaseUrl, baseUrl, apiUrl } = buildUrls(hostname);

// Export as const to prevent reassignment
export const FRONT_BASE_URL = frontBaseUrl;
export const BASE_URL = baseUrl;
export const API_URL = apiUrl;
