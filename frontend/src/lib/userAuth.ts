// src/lib/userAuth.ts
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

import { deleteCookie, getCookie, setCookie } from 'cookies-next';

/**
 * Configuration for user token cookie settings
 */
const USER_TOKEN_CONFIG = {
    maxAge: 60 * 60 * 24 * 7, // 1 week (in seconds)
    path: '/', // Available across the entire site
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' as const, // Better compatibility for cross-site navigation
    httpOnly: false // Allow client-side access for SPA functionality
} as const;

/**
 * Configuration for user data cookie settings (shorter expiry for security)
 */
const USER_DATA_CONFIG = {
    maxAge: 60 * 60 * 24 * 3, // 3 days (shorter than token for security)
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    httpOnly: false
} as const;

const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';

// --- Type Definitions ---

/**
 * User data interface
 */
export interface UserData {
    readonly id: string | number;
    readonly name?: string;
    readonly email: string;
    readonly image?: string;
    readonly role?: string;
    readonly phone?: string;
    readonly preferences?: UserPreferences;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
    readonly theme?: 'light' | 'dark' | 'system';
    readonly language?: string;
    readonly notifications?: boolean;
    readonly timezone?: string;
}

/**
 * Complete user authentication status interface
 */
export interface UserAuthStatus {
    readonly isAuthenticated: boolean;
    readonly token?: string;
    readonly user?: UserData;
}

// --- Token Functions ---

/**
 * Saves the user authentication token to a cookie.
 * @param token The user JWT token to store
 * @throws {Error} If token is empty or invalid
 */
export const saveUserToken = (token: string): void => {
    if (!token || token.trim().length === 0) {
        throw new Error('Token cannot be empty');
    }

    try {
        setCookie(USER_TOKEN_KEY, token, USER_TOKEN_CONFIG);
    } catch (error) {
        console.error('Failed to save user token:', error);
        throw new Error('Failed to save authentication token');
    }
};

/**
 * Retrieves the user token from cookies on the client-side.
 * @returns The user token string or undefined if not found
 */
export const getUserTokenClient = (): string | undefined => {
    if (typeof window === 'undefined') {
        console.warn('getUserTokenClient called on server-side, use getUserTokenServer instead');
        return undefined;
    }

    try {
        const token = getCookie(USER_TOKEN_KEY) as string | undefined;
        return token?.trim() || undefined;
    } catch (error) {
        console.error('Failed to retrieve user token on client:', error);
        return undefined;
    }
};

/**
 * Retrieves the user token from cookies on the server-side.
 * @param cookiesInstance The cookies instance from next/headers or NextRequest.cookies
 * @returns The user token string or undefined if not found
 */
export const getUserTokenServer = (cookiesInstance: ReadonlyRequestCookies): string | undefined => {
    if (!cookiesInstance) {
        console.error('Cookies instance is required for server-side token retrieval');
        return undefined;
    }

    try {
        const token = cookiesInstance.get(USER_TOKEN_KEY)?.value;
        return token?.trim() || undefined;
    } catch (error) {
        console.error('Failed to retrieve user token on server:', error);
        return undefined;
    }
};

/**
 * Removes the user token cookie.
 */
export const removeUserToken = (): void => {
    try {
        deleteCookie(USER_TOKEN_KEY, {
            path: USER_TOKEN_CONFIG.path
        });
    } catch (error) {
        console.error('Failed to remove user token:', error);
    }
};

// --- User Data Functions ---

/**
 * Saves user data to cookies (encrypted as JSON).
 * @param userData The user data object to store
 * @throws {Error} If user data is invalid
 */
export const saveUserData = (userData: UserData): void => {
    if (!userData || !userData.id || !userData.email) {
        throw new Error('User data must include id, name, and email');
    }

    try {
        const dataString = JSON.stringify(userData);
        setCookie(USER_DATA_KEY, dataString, USER_DATA_CONFIG);
    } catch (error) {
        console.error('Failed to save user data:', error);
        throw new Error('Failed to save user data');
    }
};

/**
 * Retrieves user data from cookies on the client-side.
 * @returns The user data object or undefined if not found
 */
export const getUserDataClient = (): UserData | undefined => {
    if (typeof window === 'undefined') {
        console.warn('getUserDataClient called on server-side, use getUserDataServer instead');
        return undefined;
    }

    try {
        const dataString = getCookie(USER_DATA_KEY) as string | undefined;
        if (!dataString) return undefined;

        const userData = JSON.parse(dataString) as UserData;
        return userData;
    } catch (error) {
        console.error('Failed to retrieve user data on client:', error);
        return undefined;
    }
};

/**
 * Retrieves user data from cookies on the server-side.
 * @param cookiesInstance The cookies instance from next/headers or NextRequest.cookies
 * @returns The user data object or undefined if not found
 */
export const getUserDataServer = (cookiesInstance: ReadonlyRequestCookies): UserData | undefined => {
    if (!cookiesInstance) {
        console.error('Cookies instance is required for server-side user data retrieval');
        return undefined;
    }

    try {
        const dataString = cookiesInstance.get(USER_DATA_KEY)?.value;
        if (!dataString) return undefined;

        const userData = JSON.parse(dataString) as UserData;
        return userData;
    } catch (error) {
        console.error('Failed to retrieve user data on server:', error);
        return undefined;
    }
};

/**
 * Updates specific fields in user data.
 * @param updates Partial user data to update
 * @throws {Error} If update fails
 */
export const updateUserData = (updates: Partial<UserData>): void => {
    try {
        const currentData = getUserDataClient();
        if (!currentData) {
            throw new Error('No existing user data found');
        }

        const updatedData: UserData = {
            ...currentData,
            ...updates,
            // Ensure required fields are not removed
            id: updates.id || currentData.id,
            name: updates.name || currentData.name,
            email: updates.email || currentData.email
        };

        saveUserData(updatedData);
    } catch (error) {
        console.error('Failed to update user data:', error);
        throw new Error('Failed to update user data');
    }
};

/**
 * Removes user data cookie.
 */
export const removeUserData = (): void => {
    try {
        deleteCookie(USER_DATA_KEY, {
            path: USER_DATA_CONFIG.path
        });
    } catch (error) {
        console.error('Failed to remove user data:', error);
    }
};

// --- Combined Functions ---

/**
 * Saves both user token and user data in one operation.
 * @param token The JWT token
 * @param userData The user data object
 */
export const saveCompleteUserAuth = (token: string, userData: UserData): void => {
    try {
        saveUserToken(token);
        saveUserData(userData);
    } catch (error) {
        // If saving user data fails, clean up token as well
        removeUserToken();
        throw error;
    }
};

/**
 * Checks if user is authenticated by verifying both token and user data existence.
 * @param cookiesInstance Optional cookies instance for server-side checking
 * @returns True if both token and user data exist, false otherwise
 */
export const isUserAuthenticated = (cookiesInstance?: ReadonlyRequestCookies): boolean => {
    try {
        if (typeof window !== 'undefined') {
            // Client-side check
            const token = getUserTokenClient();
            const userData = getUserDataClient();
            return Boolean(token && userData);
        } else if (cookiesInstance) {
            // Server-side check
            const token = getUserTokenServer(cookiesInstance);
            const userData = getUserDataServer(cookiesInstance);
            return Boolean(token && userData);
        }
        return false;
    } catch (error) {
        console.error('Failed to check authentication status:', error);
        return false;
    }
};

/**
 * Safely retrieves user token with automatic client/server detection.
 * @param cookiesInstance Optional cookies instance for server-side operations
 * @returns User token string or undefined if not found
 */
export const getUserToken = (cookiesInstance?: ReadonlyRequestCookies): string | undefined => {
    if (typeof window !== 'undefined') {
        return getUserTokenClient();
    } else if (cookiesInstance) {
        return getUserTokenServer(cookiesInstance);
    }

    console.warn('No cookies instance provided for server-side token retrieval');
    return undefined;
};

/**
 * Safely retrieves user data with automatic client/server detection.
 * @param cookiesInstance Optional cookies instance for server-side operations
 * @returns User data object or undefined if not found
 */
export const getUserData = (cookiesInstance?: ReadonlyRequestCookies): UserData | undefined => {
    if (typeof window !== 'undefined') {
        return getUserDataClient();
    } else if (cookiesInstance) {
        return getUserDataServer(cookiesInstance);
    }

    console.warn('No cookies instance provided for server-side user data retrieval');
    return undefined;
};

/**
 * Gets complete user authentication status including user data.
 * @param cookiesInstance Optional cookies instance for server-side operations
 * @returns Complete authentication status object
 */
export const getUserAuthStatus = (cookiesInstance?: ReadonlyRequestCookies): UserAuthStatus => {
    try {
        const token = getUserToken(cookiesInstance);
        const user = getUserData(cookiesInstance);

        return {
            isAuthenticated: Boolean(token && user),
            token: token,
            user: user
        };
    } catch (error) {
        console.error('Failed to get user auth status:', error);
        return {
            isAuthenticated: false,
            token: undefined,
            user: undefined
        };
    }
};

/**
 * Clears all user authentication data (token + user data).
 */
export const clearUserAuth = (): void => {
    try {
        removeUserToken();
        removeUserData();
    } catch (error) {
        console.error('Failed to clear user auth:', error);
    }
};

/**
 * Updates an existing user token.
 * @param newToken The new JWT token to store
 * @throws {Error} If new token is invalid
 */
export const updateUserToken = (newToken: string): void => {
    if (!newToken || newToken.trim().length === 0) {
        throw new Error('New token cannot be empty');
    }

    try {
        removeUserToken();
        saveUserToken(newToken);
    } catch (error) {
        console.error('Failed to update user token:', error);
        throw new Error('Failed to update authentication token');
    }
};

// --- User Preference Functions ---

/**
 * Updates user preferences only.
 * @param preferences New user preferences
 */
export const updateUserPreferences = (preferences: UserPreferences): void => {
    try {
        const currentData = getUserDataClient();
        if (!currentData) {
            throw new Error('No user data found to update preferences');
        }

        const updatedData: UserData = {
            ...currentData,
            preferences: {
                ...currentData.preferences,
                ...preferences
            }
        };

        saveUserData(updatedData);
    } catch (error) {
        console.error('Failed to update user preferences:', error);
        throw new Error('Failed to update user preferences');
    }
};

/**
 * Gets user preferences.
 * @param cookiesInstance Optional cookies instance for server-side operations
 * @returns User preferences or undefined
 */
export const getUserPreferences = (cookiesInstance?: ReadonlyRequestCookies): UserPreferences | undefined => {
    try {
        const userData = getUserData(cookiesInstance);
        return userData?.preferences;
    } catch (error) {
        console.error('Failed to get user preferences:', error);
        return undefined;
    }
};

// --- Constants Export ---
export const USER_AUTH_CONSTANTS = {
    TOKEN_KEY: USER_TOKEN_KEY,
    DATA_KEY: USER_DATA_KEY,
    TOKEN_MAX_AGE: USER_TOKEN_CONFIG.maxAge,
    DATA_MAX_AGE: USER_DATA_CONFIG.maxAge,
    PATH: USER_TOKEN_CONFIG.path
} as const;
