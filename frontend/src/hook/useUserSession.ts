// hooks/useUserSession.ts
import { useEffect, useState } from 'react';

import { onAuthStateChanged } from '@/lib/firebase/auth';

export function useUserSession(initialSession: string | null) {
    const [userUid, setUserUid] = useState<string | null>(initialSession);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const init = async () => {
            try {
                unsubscribe = await onAuthStateChanged(async (authUser) => {
                    if (authUser) {
                        setUserUid(authUser.uid);
                    } else {
                        setUserUid(null);
                    }
                });
            } catch (error) {
                console.error('Error setting up auth listener:', error);
            }
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return userUid;
}
