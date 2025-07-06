
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (Singleton Pattern for Next.js)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In development, connect to the emulators.
// We use a global variable to ensure this only runs once, even with Next.js's hot-reloading.
// This is the definitive fix for the intermittent "auth/network-request-failed" error.
if (process.env.NODE_ENV === 'development') {
    // Check if the emulators are already connected to avoid re-connecting on every hot-reload.
    if (!(global as any)._firebaseEmulatorsConnected) {
        console.log("Connecting to Firebase Emulators for the first time...");
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
            connectStorageEmulator(storage, "127.0.0.1", 9199);
            // Set the global flag to true after successful connection.
            (global as any)._firebaseEmulatorsConnected = true;
            console.log("Successfully connected to Firebase Emulators.");
        } catch (error) {
            // This catch block is for the initial connection attempt.
            console.error("Critical error connecting to Firebase Emulators:", error);
        }
    }
}

export { app, auth, db, storage };
