/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

let messaging = null;

// Wait for config from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'INIT_FIREBASE') {
        const config = event.data.config;
        firebase.initializeApp(config);
        messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Background message ', payload);

            const notificationTitle = payload.notification?.title || 'Notification';
            const notificationOptions = {
                body: payload.notification?.body || '',
                icon: '/firebase-logo.png'
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
});
