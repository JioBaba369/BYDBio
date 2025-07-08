
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check for missing Firebase configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_API_KEY')) {
    throw new Error(
        'Firebase API Key is missing or invalid. Please check your .env file and ensure that all NEXT_PUBLIC_FIREBASE_* variables are set correctly. You can find these values in your Firebase project settings.'
    );
}


// Initialize Firebase App (Singleton Pattern for Next.js)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;


// A more robust way to guard against re-initialization in Next.js hot-reload environments.
// We attach a flag to the global object, which persists across reloads.
declare global {
  var __EMULATORS_CONNECTED: boolean | undefined;
}

/*
// This block is for connecting to LOCAL emulators for development.
// It should be commented out for production deployment.
if (process.env.NODE_ENV === 'development' && !global.__EMULATORS_CONNECTED) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    connectStorageEmulator(storage, "127.0.0.1", 9198);
    global.__EMULATORS_CONNECTED = true;
    console.log("🔥 Connected to Firebase Emulators");
  } catch (error) {
    console.error("ERROR: Failed to connect to Firebase Emulators. Please ensure they are running via 'firebase emulators:start' and that the ports in firebase.json match this code.", error);
  }
}
*/

export { app, auth, db, storage, analytics };
