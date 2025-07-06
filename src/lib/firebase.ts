
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signOut } from "firebase/auth";
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

// --- Use a global variable to ensure a single Firebase instance in development ---
// This prevents issues with Next.js Hot Module Replacement (HMR).

// Define a type for our custom global variable to avoid TypeScript errors.
type FirebaseGlobal = {
  app: FirebaseApp;
  emulatorsConnected: boolean;
};

// Use a unique symbol to prevent potential global name collisions.
const FIREBASE_GLOBAL_KEY = Symbol.for("firebase.global");

// Type-safe way to access the global object.
const globalWithFirebase = globalThis as typeof globalThis & {
  [FIREBASE_GLOBAL_KEY]?: FirebaseGlobal;
};

/**
 * Initializes and retrieves the Firebase app instance, ensuring it's a singleton.
 * In development, it also tracks if emulators have been connected.
 */
function getFirebaseSingleton(): FirebaseGlobal {
  if (!globalWithFirebase[FIREBASE_GLOBAL_KEY]) {
    // If the instance doesn't exist on the global object, create it.
    globalWithFirebase[FIREBASE_GLOBAL_KEY] = {
      app: getApps().length > 0 ? getApp() : initializeApp(firebaseConfig),
      emulatorsConnected: false,
    };
  }
  return globalWithFirebase[FIREBASE_GLOBAL_KEY]!;
}

const { app, emulatorsConnected } = getFirebaseSingleton();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In development mode, connect to the emulators, but only if they haven't been connected before.
if (process.env.NODE_ENV === 'development' && !emulatorsConnected) {
    console.log("Connecting to Firebase Emulators for the first time...");
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        connectStorageEmulator(storage, "127.0.0.1", 9199);
        
        // Mark emulators as connected on the global object to prevent re-connection.
        if (globalWithFirebase[FIREBASE_GLOBAL_KEY]) {
          globalWithFirebase[FIREBASE_GLOBAL_KEY]!.emulatorsConnected = true;
        }

        console.log("Successfully connected to Firebase Emulators.");
    } catch (error) {
        console.error("Error connecting to Firebase emulators: ", error);
    }
}

export { app, auth, db, storage, signOut };
