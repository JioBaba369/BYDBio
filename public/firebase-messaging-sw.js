
// This file must be in the public directory to work correctly.
// It handles background push notifications for Firebase Cloud Messaging.

// Import the Firebase app and messaging scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This configuration is automatically provided by the hosting environment,
// but we need to define it here for the service worker context.
// In a production setup, you would replace these with your actual project config values.
const firebaseConfig = {
    apiKey: "AIzaSyCPFwbrRFZTByiJT6ZcG--jdNxiR1GtwoA",
    authDomain: "bydbio-dyowj.firebaseapp.com",
    projectId: "bydbio-dyowj",
    storageBucket: "bydbio-dyowj.firebasestorage.app",
    messagingSenderId: "454797679253",
    appId: "1:454797679253:web:1491ce5ddd3144cf3c999c",
};

// Initialize the Firebase app if it hasn't been already.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Optional: Handle background messages here
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192x192.png' // A default icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
