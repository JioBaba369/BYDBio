
import * as admin from 'firebase-admin';

// This file is NOT for client-side use. It's for server-side operations.

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    'Firebase Admin SDK environment variables are not set. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are present in your environment.'
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Replace \\n with \n to ensure the private key is parsed correctly
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error);
    // Throw a more specific error to make it clear that initialization failed.
    throw new Error(`Firebase admin initialization failed: ${error.message}`);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
