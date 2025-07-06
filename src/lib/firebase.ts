import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signOut } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Define the Firebase configuration using environment variables.
// Ensure these variables are correctly set in your .env.local file for development,
// and in your deployment environment for production.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- Firebase Initialization with Singleton Pattern for Next.js ---
// This pattern prevents the Firebase app from being initialized multiple times during
// Next.js's hot-reloading in development, which can cause connection errors.
// A global variable is used to store the Firebase instance and track emulator connection status.

// A custom global type to store the Firebase instance.
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
 * This function is the core of the pattern to prevent re-initialization.
 */
function getFirebaseSingleton(): FirebaseGlobal {
  if (!globalWithFirebase[FIREBASE_GLOBAL_KEY]) {
    // --- DEBUGGING: Check for missing Firebase config variables ---
    const missingConfig = Object.entries(firebaseConfig).filter(([key, value]) => !value);
    if (missingConfig.length > 0) {
      console.error(
        "Firebase Configuration Error: The following environment variables are missing or undefined:",
        missingConfig.map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`).join(', ')
      );
      console.error("Please ensure your .env.local file (or deployment environment) is correctly configured.");
      // You might want to throw an error here to prevent the app from starting with bad config
      // throw new Error("Firebase configuration incomplete.");
    } else {
      console.log("Firebase Config loaded successfully:", firebaseConfig.projectId);
    }
    // --- END DEBUGGING ---

    // If the instance doesn't exist on the global object, create it.
    globalWithFirebase[FIREBASE_GLOBAL_KEY] = {
      app: getApps().length > 0 ? getApp() : initializeApp(firebaseConfig),
      emulatorsConnected: false,
    };
    console.log("Firebase Singleton Initialized.");
  }
  return globalWithFirebase[FIREBASE_GLOBAL_KEY]!;
}

// Get the singleton instance of the Firebase app and its state.
const { app, emulatorsConnected } = getFirebaseSingleton();

// Initialize Firebase services.
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In development, connect to emulators only once.
if (process.env.NODE_ENV === 'development' && !emulatorsConnected) {
    console.log("Attempting to connect to Firebase Emulators...");
    try {
        // Ensure the emulator addresses match what you're running
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        connectStorageEmulator(storage, "127.0.0.1", 9199);
        
        // Mark emulators as connected on the global object to prevent re-connection.
        if (globalWithFirebase[FIREBASE_GLOBAL_KEY]) {
          globalWithFirebase[FIREBASE_GLOBAL_KEY]!.emulatorsConnected = true;
        }

        console.log("Successfully connected to Firebase Emulators.");
    } catch (error) {
        console.error("Error connecting to Firebase emulators. Please ensure they are running via 'firebase emulators:start'.", error);
        // You might want to add a user-facing message or fallback behavior here
    }
}

export { app, auth, db, storage, signOut };