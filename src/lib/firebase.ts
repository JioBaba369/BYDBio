
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyCPFwbrRFZTByiJT6ZcG--jdNxiR1GtwoA",
  authDomain: "bydbio-dyowj.firebaseapp.com",
  projectId: "bydbio-dyowj",
  storageBucket: "bydbio-dyowj.appspot.com",
  messagingSenderId: "454797679253",
  appId: "1:454797679253:web:22fda57bfbd62dc93c999c",
  measurementId: "G-P49NLQ126L"
};


// Initialize Firebase App (Singleton Pattern for Next.js)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const remoteConfig = typeof window !== 'undefined' ? getRemoteConfig(app) : null;


export { app, auth, db, storage, analytics, remoteConfig };
