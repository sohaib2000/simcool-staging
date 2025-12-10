import { API_URL, APP_KEY } from '@/config/constant';

import crypto from 'crypto';
import { FirebaseOptions, getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let firebaseConfig: FirebaseOptions | null = null;
let vapidKey: string | null = null;

// ---------------- Decrypt Laravel encrypted string ----------------
function decryptData(encrypted: string): string {
    try {
        let key = APP_KEY;
        if (APP_KEY.startsWith('base64:')) {
            key = Buffer.from(APP_KEY.replace('base64:', ''), 'base64').toString('binary');
        }

        // Decode base64 JSON
        const payload = JSON.parse(Buffer.from(encrypted, 'base64').toString());
        const iv = Buffer.from(payload.iv, 'base64');
        const ciphertext = Buffer.from(payload.value, 'base64');
        const mac = payload.mac;

        // Verify MAC
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(Buffer.concat([iv, ciphertext]));
        const calculatedMac = hmac.digest('hex');

        if (calculatedMac !== mac) {
            throw new Error('Invalid MAC');
        }

        // Decrypt AES-256-CBC
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'binary'), iv);
        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        console.error('Laravel decrypt error', err);
        return '';
    }
}

// ---------------- Fetch Firebase config from Laravel API ----------------
async function fetchFirebaseConfig(): Promise<{ config: FirebaseOptions; vapidKey: string }> {
    const res = await fetch(`${API_URL}/generalSettings`);
    const json = await res.json(); // This is already a parsed JavaScript object

    // console.log('Firebase config response:', JSON.stringify(json));

    if (!json.success || !json.data?.webconfig) {
        throw new Error('Invalid Firebase config');
    }
    // console.log('Fetched Firebase config:', json.data.webconfig);

    const fb = json.data.webconfig;
    // console.log('Encrypted Firebase config:', fb);

    // const config: FirebaseOptions = {
    //     apiKey: decryptData(fb.firebaseApiKey),
    //     authDomain: decryptData(fb.firebaseAuthDomain),
    //     projectId: decryptData(fb.firebaseProjectId),
    //     storageBucket: decryptData(fb.firebaseStorageBucket),
    //     messagingSenderId: decryptData(fb.firebaseSenderId),
    //     appId: decryptData(fb.firebaseAppId)
    // };

    const config: FirebaseOptions = {
        apiKey: fb.firebaseApiKey,
        authDomain: fb.firebaseAuthDomain,
        projectId: fb.firebaseProjectId,
        storageBucket: fb.firebaseStorageBucket,
        messagingSenderId: fb.firebaseSenderId,
        appId: fb.firebaseAppId
    };

    vapidKey = fb.firebaseVapidKey;

    // console.log('Decrypted Firebase config:', { ...config, firebaseVapidKey: vapidKey });

    return { config, vapidKey: vapidKey! };
}

// ---------------- Initialize Firebase ----------------
export async function getFirebaseApp() {
    if (firebaseApp) return firebaseApp;

    if (!firebaseConfig) {
        const { config } = await fetchFirebaseConfig();
        firebaseConfig = config;
    }

    try {
        firebaseApp = getApp();
    } catch {
        firebaseApp = initializeApp(firebaseConfig!);
    }

    return firebaseApp;
}

// ---------------- Firebase Auth ----------------
export async function getFirebaseAuth() {
    const app = await getFirebaseApp();
    return getAuth(app);
}

// ---------------- Firebase Messaging ----------------
export async function getFirebaseMessaging() {
    const app = await getFirebaseApp();
    return typeof window !== 'undefined' ? getMessaging(app) : null;
}

// ---------------- Request FCM Token ----------------
export const requestNotificationToken = async (): Promise<string | null> => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    try {
        const swReg = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            vapidKey: vapidKey ?? undefined,
            serviceWorkerRegistration: swReg
        });
        return token;
    } catch (error) {
        console.error('Error getting FCM token', error);
        return null;
    }
};

// ---------------- Foreground message listener ----------------
export const onMessageListener = async () => {
    const messaging = await getFirebaseMessaging();
    return new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => resolve(payload));
    });
};

// ---------------- Get FCM Token directly ----------------
export async function getFcmToken(): Promise<string | null> {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    try {
        const token = await getToken(messaging, {
            vapidKey: vapidKey ?? undefined
        });
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}
