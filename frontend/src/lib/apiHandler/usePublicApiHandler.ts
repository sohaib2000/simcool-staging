// lib/api/usePublicApiHandler.ts
import { API_URL } from '@/config/constant';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

type PublicFetchOptions<T> = {
    url: string;
    config?: RequestInit;
    headers?: Record<string, string>;
    queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
    enabled?: boolean;
};

// ✅ Proper Error Class - No `any` types
class ApiError extends Error {
    public readonly status: number;
    public readonly data: unknown; // ✅ `unknown` instead of `any`

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

// ✅ Type guard for error response - No `any`
function isErrorResponse(data: unknown): data is {
    message?: string;
    status?: number | false;
} {
    return typeof data === 'object' && data !== null;
}

// ✅ Helper function - JSON parsing with proper types
async function parseJsonResponse<T>(res: Response, url: string): Promise<T> {
    try {
        const data: unknown = await res.json(); // ✅ `unknown` instead of `any`
        return data as T;
    } catch {
        throw new ApiError(`Invalid JSON response from ${url}`, res.status);
    }
}

// ✅ Helper function - Response validation with type safety
function validateResponse<T>(res: Response, data: T, url: string): void {
    let hasErrorStatus = false;
    let errorMessage = `HTTP ${res.status}: Error fetching data from ${url}`;
    let errorStatus = res.status;

    // Type-safe error checking
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

// ✅ Main function - Zero `any` types, reduced complexity
export function usePublicApiHandler<T = unknown>({
    url,
    config,
    headers = {},
    queryOptions,
    enabled = true
}: PublicFetchOptions<T>) {
    const fetchData = async (): Promise<T> => {
        const res = await fetch(`${API_URL}${url}`, {
            ...config,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
                ...(config?.headers || {})
            }
        });

        const data = await parseJsonResponse<T>(res, url);
        validateResponse(res, data, url);

        return data;
    };

    return useQuery<T>({
        queryKey: ['public', url],
        queryFn: fetchData,
        enabled,
        ...queryOptions
    });
}
