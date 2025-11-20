// hooks/use-user-session.ts
import { useEffect, useState } from 'react';

import { onAuthStateChanged } from '@/lib/firebase/auth';

export function useUserSession(initSession: string | null) {
    const [userUid, setUserUid] = useState<string | null>(initSession);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const init = async () => {
            try {
                // Await the Promise<Unsubscribe>
                unsubscribe = await onAuthStateChanged((authUser) => {
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

        // Cleanup
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return userUid;
}
