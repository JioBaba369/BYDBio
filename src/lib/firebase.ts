
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

// Connect to Emulators in development
// The connectXXXEmulator functions are idempotent, meaning they can be called multiple
// times without creating multiple connections. They will only connect once.
// This is safe to run on every hot-reload in development.
if (process.env.NODE_ENV === 'development') {
    try {
        console.log("Connecting to Firebase Emulators...");
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        connectStorageEmulator(storage, "127.0.0.1", 9199);
        console.log("Successfully connected to Firebase Emulators.");
    } catch (error: any) {
        // This can happen if the emulators are already connected or not running.
        // It's safe to ignore these errors during development.
        if (error.code !== 'firebase/emulator-already-connected') {
            console.warn("Warning: Could not connect to Firebase emulators. Ensure they are running via 'firebase emulators:start'.", error.message);
        }
    }
}

export { app, auth, db, storage };
