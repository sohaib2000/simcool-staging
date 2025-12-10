// libs/firebase/auth.ts
import { getFirebaseAuth } from './config';
import {
    GoogleAuthProvider,
    type User,
    onAuthStateChanged as _onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';

export async function onAuthStateChanged(callback: (user: any) => void) {
    const firebaseAuth = await getFirebaseAuth();
    return _onAuthStateChanged(firebaseAuth, callback);
}

export async function signInWithGoogle() {
    const firebaseAuth = await getFirebaseAuth(); // fetch and init dynamically
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(firebaseAuth, provider);

        if (!result || !result.user) throw new Error('Google sign in failed');
        return result.user.email;
    } catch (error) {
        console.error('Error signing in with Google', error);
        throw error;
    }
}

export async function signOutWithGoogle() {
    const firebaseAuth = await getFirebaseAuth();
    try {
        await firebaseAuth.signOut();
    } catch (error) {
        console.error('Error signing out with Google', error);
        throw error;
    }
}
