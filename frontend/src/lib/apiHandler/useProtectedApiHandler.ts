// lib/api/useUserApiHandler.ts
import { API_URL } from '@/config/constant';
import { getUserTokenClient } from '@/lib/userAuth';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

type UserFetchOptions<T> = {
    readonly url: string;
    readonly config?: RequestInit;
    readonly headers?: Record<string, string>;
    readonly queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
    readonly enabled?: boolean;
};

// ✅ Proper Error Class
class ApiError extends Error {
    public readonly status: number;
    public readonly data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

const path = API_URL;

// ✅ Type guard for error response
function isErrorResponse(data: unknown): data is {
    readonly message?: string;
    readonly status?: number | false;
} {
    return typeof data === 'object' && data !== null;
}

// ✅ Helper function - JSON parsing
async function parseJsonResponse<T>(res: Response, url: string): Promise<T> {
    try {
        const data: unknown = await res.json();
        return data as T;
    } catch {
        throw new ApiError(`Invalid JSON response from ${url}`, res.status);
    }
}

// ✅ Helper function - Response validation
function validateResponse<T>(res: Response, data: T, url: string): void {
    let hasErrorStatus = false;
    let errorMessage = `HTTP ${res.status}: Error fetching data from ${url}`;
    let errorStatus = res.status;

    if (isErrorResponse(data)) {
        hasErrorStatus = data.status === false;
        if (typeof data.message === 'string') {
            errorMessage = data.message;
        }
        if (typeof data.status === 'number') {
            errorStatus = data.status;
        }
    }

    if (!res.ok || hasErrorStatus) {
        throw new ApiError(errorMessage, errorStatus, data);
    }
}

// ✅ Helper function - Handle server errors
function handleServerError(res: Response): void {
    if (res.status === 500) {
        console.error('Server error (500) for user request');
    }
}

// ✅ Type-safe headers builder
function buildRequestHeaders(
    headers: Record<string, string>,
    config: RequestInit | undefined,
    token: string | null
): HeadersInit {
    // Create base headers
    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    // Merge headers safely
    const mergedHeaders = {
        ...baseHeaders,
        ...headers, // User provided headers
        ...((config?.headers as Record<string, string>) || {}) // Config headers
    };

    // Add user token if available
    if (token) {
        mergedHeaders.Authorization = `Bearer ${token}`;
    }

    return mergedHeaders;
}

// ✅ Main function - User-only API handler
export function useProtectedApiHandler<T = unknown>({
    url,
    config,
    headers = {},
    queryOptions,
    enabled = true
}: UserFetchOptions<T>) {
    // Get user token from cookies
    const userToken = getUserTokenClient() || null;

    const fetchData = async (): Promise<T> => {
        // Build headers with user token
        const requestHeaders = buildRequestHeaders(headers, config, userToken);

        const res = await fetch(`${API_URL}${url}`, {
            ...config,
            headers: requestHeaders
        });

        handleServerError(res);
        const data = await parseJsonResponse<T>(res, url);
        validateResponse(res, data, url);

        return data;
    };

    return useQuery<T>({
        queryKey: ['user', url, userToken], // Include user token in query key
        queryFn: fetchData,
        enabled: enabled && Boolean(userToken), // Only fetch if user token exists
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: (failureCount, error) => {
            // Don't retry on 401 (unauthorized) or 403 (forbidden)
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                return false;
            }
            return failureCount < 2;
        },
        ...queryOptions
    });
}

// ✅ Additional hook for checking if user is authenticated
export function useUserAuth() {
    const userToken = getUserTokenClient();

    return {
        isAuthenticated: Boolean(userToken),
        token: userToken
    };
}

// ✅ Type exports for better TypeScript support
export type { UserFetchOptions, ApiError };
