
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

// A flag to ensure we only connect to the emulators once.
let emulatorsConnected = false;

// Initialize Firebase App (Singleton Pattern for Next.js)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In development, connect to the emulators. This needs to be guarded
// to prevent re-initialization during hot-reloads.
if (process.env.NODE_ENV === 'development' && !emulatorsConnected) {
  try {
    console.log("Connecting to Firebase Emulators on Auth(9099), Firestore(8081), Storage(9198)...");
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableRegeneration: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    connectStorageEmulator(storage, "127.0.0.1", 9198);
    console.log("Successfully connected to Firebase Emulators.");
    // Set the flag to true after the first successful connection.
    emulatorsConnected = true;
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

export { app, auth, db, storage };
