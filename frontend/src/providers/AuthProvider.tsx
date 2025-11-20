// providers/AuthProvider.tsx
'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { getFirebaseAuth } from '@/lib/firebase/config';

import { User, onAuthStateChanged } from 'firebase/auth';

// providers/AuthProvider.tsx

interface AuthContextType {
    user: User | null;
    userSession: string | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userSession: null,
    loading: true
});

interface AuthProviderProps {
    children: ReactNode;
    initialSession: string | null;
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userSession, setUserSession] = useState<string | null>(initialSession);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const init = async () => {
            try {
                // ✅ get Firebase Auth dynamically (after config decryption)
                const firebaseAuth = await getFirebaseAuth();

                unsubscribe = onAuthStateChanged(firebaseAuth, (authUser) => {
                    if (authUser) {
                        setUser(authUser);
                        setUserSession(authUser.uid);
                    } else {
                        setUser(null);
                        setUserSession(null);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error initializing Firebase Auth:', error);
                setLoading(false);
            }
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return <AuthContext.Provider value={{ user, userSession, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
