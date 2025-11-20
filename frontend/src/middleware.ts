// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ===== ROUTE CONFIGURATION =====

const PUBLIC_ROUTES = [
    '/',
    '/about',
    '/contact',
    '/services',
    '/pricing',
    '/blog',
    '/blog/[slug]',
    '/help',
    '/documentation',
    '/protectedPage',
    '/api/public/*'
] as const;

const AUTH_ROUTES = ['/loginWithOtp', '/verifyEmailOtp'] as const;

const PROTECTED_ROUTES = ['/profile', '/profile/*'] as const;

// ===== UTILITY FUNCTIONS =====

function matchesRoutePattern(path: string, patterns: readonly string[]): boolean {
    return patterns.some((pattern) => {
        const regexPattern = pattern
            .replace(/\[([^\]]+)\]/g, '[^/]+')
            .replace(/\*/g, '.*')
            .replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
    });
}

// ✅ CLEAN: Simplified token extraction using your working method
function getUserTokenFromCookies(cookieHeader: string): string {
    try {
        // Your working token extraction method
        const userToken = decodeURIComponent(
            (cookieHeader || '')
                .split('; ')
                .find((c) => c.startsWith('userToken='))
                ?.split('=')[1] || ''
        );

        return userToken;
    } catch (error) {
        console.error('❌ Error extracting userToken:', error);
        return '';
    }
}

function getRouteType(path: string): 'public' | 'auth' | 'protected' | 'unknown' {
    if (matchesRoutePattern(path, PUBLIC_ROUTES)) return 'public';
    if (matchesRoutePattern(path, AUTH_ROUTES)) return 'auth';
    if (matchesRoutePattern(path, PROTECTED_ROUTES)) return 'protected';
    return 'unknown';
}

function storeOriginalRoute(request: NextRequest, path: string): NextResponse {
    const response = NextResponse.redirect(new URL('/protectedPage', request.url));

    response.cookies.set('originalRoute', path, {
        httpOnly: false,
        maxAge: 60 * 10, // 10 minutes
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return response;
}

// ===== MAIN MIDDLEWARE FUNCTION =====
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const cookieHeader = request.headers.get('cookie') || '';

    // Extract user token
    const userToken = getUserTokenFromCookies(cookieHeader);
    const isAuthenticated = Boolean(userToken && userToken.length >= 10);
    const routeType = getRouteType(path);

    // ===== ROUTE PROTECTION LOGIC =====
    switch (routeType) {
        case 'public':
            return NextResponse.next();

        case 'auth':
            if (isAuthenticated) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            return NextResponse.next();

        case 'protected':
            if (!isAuthenticated) {
                return storeOriginalRoute(request, path);
            }
            return NextResponse.next();

        case 'unknown':
            return NextResponse.next();

        default:
            return NextResponse.next();
    }
}

// ===== CONFIGURATION =====
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', '/api/(.*)']
};

// ===== EXPORT ROUTE CONFIGURATION =====
export const ROUTE_CONFIG = {
    PUBLIC_ROUTES,
    AUTH_ROUTES,
    PROTECTED_ROUTES
} as const;
