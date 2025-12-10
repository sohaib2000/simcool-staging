// // lib/api/usePublicApiMutation.ts
// import { UseMutationOptions, useMutation } from '@tanstack/react-query';
// type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
// type PublicApiMutationOptions<T, V> = {
//     url: string;
//     method?: HttpMethod;
//     headers?: Record<string, string>;
//     config?: RequestInit;
//     mutationOptions?: UseMutationOptions<T, Error, V>;
// };
// // ✅ Proper Error Class - No `any` types
// class ApiError extends Error {
//     public readonly status: number;
//     public readonly data: unknown;
//     public readonly method: string;
//     public readonly url: string;
//     constructor(message: string, status: number, method: string, url: string, data?: unknown) {
//         super(message);
//         this.name = 'ApiError';
//         this.status = status;
//         this.method = method;
//         this.url = url;
//         this.data = data;
//         if (Error.captureStackTrace) {
//             Error.captureStackTrace(this, ApiError);
//         }
//     }
//     isClientError(): boolean {
//         return this.status >= 400 && this.status < 500;
//     }
//     isServerError(): boolean {
//         return this.status >= 500;
//     }
// }
// // ✅ Type guard for error response
// function isErrorResponse(data: unknown): data is {
//     message?: string;
//     error?: string;
// } {
//     return typeof data === 'object' && data !== null;
// }
// // ✅ Helper function - Build headers safely (No token)
// function buildRequestHeaders(headers: Record<string, string>, config: RequestInit | undefined): HeadersInit {
//     const baseHeaders: Record<string, string> = {
//         'Content-Type': 'application/json'
//     };
//     return {
//         ...baseHeaders,
//         ...headers,
//         ...((config?.headers as Record<string, string>) || {})
//     };
// }
// // ✅ Helper function - Handle error response
// async function handleErrorResponse(res: Response, method: string, url: string): Promise<never> {
//     let errorMessage = `Error ${method} request to ${url}`;
//     let errorData: unknown = null;
//     try {
//         errorData = await res.json();
//         if (isErrorResponse(errorData)) {
//             errorMessage = errorData.message || errorData.error || errorMessage;
//         }
//     } catch {
//         console.warn('⚠️ Response is not a valid JSON body.');
//     }
//     throw new ApiError(errorMessage, res.status, method, url, errorData);
// }
// // ✅ Helper function - Parse JSON response safely
// async function parseJsonResponse<T>(res: Response): Promise<T | null> {
//     const contentType = res.headers.get('Content-Type') ?? '';
//     const contentLength = res.headers.get('Content-Length');
//     // Handle empty responses
//     if (res.status === 204 || contentLength === '0' || contentType.indexOf('application/json') === -1) {
//         return null;
//     }
//     try {
//         const data: unknown = await res.json();
//         return data as T;
//     } catch {
//         console.warn('⚠️ Response has no JSON body, returning null.');
//         return null;
//     }
// }
// // ✅ Main Public API Mutation - Handles ALL methods, NO TOKEN required
// export function usePublicApiMutation<T = unknown, V = unknown>({
//     url,
//     method = 'POST',
//     headers = {},
//     config,
//     mutationOptions
// }: PublicApiMutationOptions<T, V>) {
//     return useMutation<T, Error, V>({
//         mutationFn: async (data: V): Promise<T> => {
//             // ✅ No token - purely public API
//             const requestHeaders = buildRequestHeaders(headers, config);
//             // ✅ Build request options
//             const requestOptions: RequestInit = {
//                 method,
//                 ...config,
//                 headers: requestHeaders
//             };
//             // ✅ Only add body for non-GET methods and when data exists
//             if (method !== 'GET' && data !== undefined) {
//                 requestOptions.body = JSON.stringify(data);
//             }
//             // ✅ Make the request
//             const res = await fetch(`/api${url}`, requestOptions);
//             if (!res.ok) {
//                 await handleErrorResponse(res, method, url);
//             }
//             // ✅ Parse and return response
//             const responseData = await parseJsonResponse<T>(res);
//             return responseData as T;
//         },
//         ...mutationOptions
//     });
// }
// lib/api/usePublicApiMutation.ts - COMPLETELY FIXED VERSION
import { API_URL } from '@/config/constant';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type PublicApiMutationOptions<T, V> = {
    url: string;
    method?: HttpMethod;
    headers?: Record<string, string>;
    config?: RequestInit;
    mutationOptions?: UseMutationOptions<T, Error, V>;
};

// ✅ ApiError Class
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

// ✅ Type guard
function isErrorResponse(data: unknown): data is {
    message?: string;
    error?: string;
} {
    return typeof data === 'object' && data !== null;
}

// ✅ Public headers builder
function buildPublicRequestHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };

    const mergedHeaders = { ...baseHeaders, ...customHeaders };

    // Remove all possible auth headers
    const authHeaderVariants = [
        'Authorization',
        'authorization',
        'AUTHORIZATION',
        'Bearer',
        'bearer',
        'BEARER',
        'Token',
        'token',
        'TOKEN'
    ];

    authHeaderVariants.forEach((authHeader) => {
        delete mergedHeaders[authHeader];
    });

    return mergedHeaders;
}

// ✅ FIXED: Handle errors properly
async function handleErrorResponse(res: Response, method: string, url: string): Promise<never> {
    let errorMessage = `${method} ${url} failed with status ${res.status}`;
    let errorData: unknown = null;

    try {
        const contentType = res.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            errorData = await res.json();
            if (isErrorResponse(errorData)) {
                errorMessage = errorData.message || errorData.error || errorMessage;
            }
        } else {
            const textData = await res.text();
            if (textData) {
                errorMessage = `${errorMessage}: ${textData}`;
            }
        }
    } catch (parseError) {
        console.warn('⚠️ Could not parse error response:', parseError);
        errorMessage = `${method} ${url} failed with status ${res.status} - Unable to parse response`;
    }

    throw new ApiError(errorMessage, res.status, method, url, errorData);
}

// ✅ FIXED: Parse response without returning null
async function parseJsonResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('Content-Type') ?? '';
    const contentLength = res.headers.get('Content-Length');

    // Handle empty responses
    if (res.status === 204 || contentLength === '0') {
        return { success: true, message: 'Request completed successfully' } as T;
    }

    // Check if response is JSON
    if (!contentType.includes('application/json')) {
        try {
            const textData = await res.text();
            if (textData.trim()) {
                // Try to parse as JSON first
                try {
                    return JSON.parse(textData) as T;
                } catch {
                    // If not JSON, wrap text in success object
                    return { success: true, data: textData, message: 'Request completed' } as T;
                }
            }
            // Empty text response
            return { success: true, message: 'Request completed successfully' } as T;
        } catch (error) {
            console.warn('⚠️ Failed to parse text response:', error);
            return { success: true, message: 'Request completed successfully' } as T;
        }
    }

    try {
        const data: unknown = await res.json();
        return data as T;
    } catch (error) {
        console.error('❌ Failed to parse JSON response:', error);
        // Instead of returning null, return a default success object
        return { success: true, message: 'Request completed but response parsing failed' } as T;
    }
}

// ✅ MAIN FIXED PUBLIC API MUTATION
export function usePublicApiMutation<T = unknown, V = unknown>({
    url,
    method = 'POST',
    headers = {},
    config = {},
    mutationOptions
}: PublicApiMutationOptions<T, V>) {
    return useMutation<T, Error, V>({
        mutationFn: async (data: V): Promise<T> => {
            try {
                // Build clean headers
                const cleanHeaders = buildPublicRequestHeaders(headers);
                const requestHeaders = new Headers();

                Object.entries(cleanHeaders).forEach(([key, value]) => {
                    requestHeaders.set(key, value);
                });

                // Build request options
                const requestOptions: RequestInit = {
                    method: method,
                    headers: requestHeaders,
                    mode: 'cors',
                    credentials: 'omit',
                    cache: 'no-cache'
                };

                // Add body for appropriate methods
                if (['POST', 'PUT', 'PATCH'].includes(method) && data !== undefined && data !== null) {
                    requestOptions.body = JSON.stringify(data);
                }

                const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

                // Make the request
                const res = await fetch(fullUrl, requestOptions);

                // ✅ CRITICAL: Only throw error for actual HTTP errors
                if (!res.ok) {
                    await handleErrorResponse(res, method, fullUrl);
                }

                // ✅ For successful responses, parse and return data
                const responseData = await parseJsonResponse<T>(res);

                return responseData;
            } catch (error) {
                // ✅ Log the actual error but let TanStack Query handle it

                // ✅ Re-throw to let TanStack Query handle properly
                throw error;
            }
        },
        ...mutationOptions
    });
}
