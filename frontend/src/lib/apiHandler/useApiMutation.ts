// lib/api/useUserMutation.ts
import { API_URL } from '@/config/constant';
import { getUserTokenClient } from '@/lib/userAuth';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type UserMutationOptions<T, V> = {
    readonly url: string;
    readonly method?: HttpMethod;
    readonly headers?: Record<string, string>;
    readonly mutationOptions?: UseMutationOptions<T, Error, V>;
    readonly config?: RequestInit;
};

// ✅ Proper Error Class
class ApiError extends Error {
    public readonly status: number;
    public readonly data: unknown;
    public readonly method: string;
    public readonly url: string;

    constructor(message: string, status: number, method: string, url: string, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.method = method;
        this.url = url;
        this.data = data;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    isServerError(): boolean {
        return this.status >= 500;
    }
}

// ✅ Type guard for error response
function isErrorResponse(data: unknown): data is {
    readonly message?: string;
    readonly error?: string;
} {
    return typeof data === 'object' && data !== null;
}

// ✅ Helper function - Build headers safely (Fixed to accept undefined)
function buildRequestHeaders(
    headers: Record<string, string>,
    config: RequestInit | undefined,
    token: string | null | undefined // ✅ Now accepts undefined
): HeadersInit {
    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    const mergedHeaders = {
        ...baseHeaders,
        ...headers,
        ...((config?.headers as Record<string, string>) || {})
    };

    // Add user token if available (handles null, undefined, and empty string)
    if (token) {
        mergedHeaders.Authorization = `Bearer ${token}`;
    }

    return mergedHeaders;
}

// ✅ Helper function - Handle error response
async function handleErrorResponse(res: Response, method: string, url: string): Promise<never> {
    let errorMessage = `Error ${method} data to ${url}`;
    let errorData: unknown = null;

    try {
        errorData = await res.json();
        if (isErrorResponse(errorData)) {
            errorMessage = errorData.message || errorData.error || errorMessage;
        }
    } catch {
        console.warn('⚠️ Response is not a valid JSON body.');
    }

    throw new ApiError(errorMessage, res.status, method, url, errorData);
}

// ✅ Helper function - Parse JSON response safely
async function parseJsonResponse<T>(res: Response): Promise<T | null> {
    const contentType = res.headers.get('Content-Type') ?? '';
    const contentLength = res.headers.get('Content-Length');

    // Handle empty responses (204 No Content, etc.)
    if (res.status === 204 || contentLength === '0' || contentType.indexOf('application/json') === -1) {
        return null;
    }

    try {
        const data: unknown = await res.json();
        return data as T;
    } catch {
        console.warn('⚠️ Response has no JSON body, returning null.');
        return null;
    }
}

// ✅ Main function - User-only mutation handler (FIXED)
export function useUserMutation<T = unknown, V = unknown>({
    url,
    method = 'POST',
    headers = {},
    config,
    mutationOptions
}: UserMutationOptions<T, V>) {
    return useMutation<T, Error, V>({
        mutationFn: async (data: V): Promise<T> => {
            const userToken = getUserTokenClient();
            const requestHeaders = buildRequestHeaders(headers, config, userToken);

            // ✅ If sending FormData, remove Content-Type (browser sets it automatically)
            // const isFormData = data instanceof FormData;
            // if (isFormData && requestHeaders['Content-Type']) {
            //     delete requestHeaders['Content-Type'];
            // }

            const isFormData = data instanceof FormData;
            if (isFormData && (requestHeaders as Record<string, string>)['Content-Type']) {
                delete (requestHeaders as Record<string, string>)['Content-Type'];
            }

            const requestOptions: RequestInit = {
                method,
                ...config,
                headers: requestHeaders
            };

            // ✅ Handle FormData vs JSON
            if (method !== 'GET' && data !== undefined) {
                requestOptions.body = isFormData ? (data as unknown as BodyInit) : JSON.stringify(data);
            }

            const res = await fetch(`${API_URL}${url}`, requestOptions);

            if (!res.ok) {
                await handleErrorResponse(res, method, url);
            }

            const responseData = await parseJsonResponse<T>(res);
            return responseData as T;
        },
        retry: (failureCount, error) => {
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                return false;
            }
            if (error instanceof ApiError && error.isClientError()) {
                return false;
            }
            return failureCount < 2;
        },
        ...mutationOptions
    });
}

// ✅ Additional hook for checking user mutation availability
export function useUserMutationAvailability() {
    const userToken = getUserTokenClient();

    return {
        canMutate: Boolean(userToken),
        token: userToken
    };
}

// ✅ Type exports for better TypeScript support
export type { UserMutationOptions, ApiError };
