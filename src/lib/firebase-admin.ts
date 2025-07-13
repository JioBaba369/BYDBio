
import * as admin from 'firebase-admin';

// This file is NOT for client-side use. It's for server-side operations.

// Ensure you have the following environment variables set in your deployment environment:
// FIREBASE_PRIVATE_KEY: The private key from your Firebase service account JSON file.
// FIREBASE_CLIENT_EMAIL: The client email from your Firebase service account JSON file.

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with \n to ensure the private key is parsed correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
