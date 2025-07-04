
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';

export type Listing = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
  createdAt: Timestamp;
};

// Function to fetch a single listing by its ID
export const getListing = async (id: string): Promise<Listing | null> => {
  const listingDocRef = doc(db, 'listings', id);
  const listingDoc = await getDoc(listingDocRef);
  if (listingDoc.exists()) {
    return { id: listingDoc.id, ...listingDoc.data() } as Listing;
  }
  return null;
};

// Function to fetch all listings for a specific user
export const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
};

// Function to create a new listing
export const createListing = async (userId: string, data: Omit<Listing, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks'>) => {
  const listingsRef = collection(db, 'listings');
  await addDoc(listingsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    clicks: 0,
  });
};

// Function to update an existing listing
export const updateListing = async (id: string, data: Partial<Omit<Listing, 'id' | 'authorId' | 'createdAt'>>) => {
  const listingDocRef = doc(db, 'listings', id);
  await updateDoc(listingDocRef, data);
};

// Function to delete a listing
export const deleteListing = async (id: string) => {
  const listingDocRef = doc(db, 'listings', id);
  await deleteDoc(listingDocRef);
};

// Helper function for public page to get listing and its author
export const getListingAndAuthor = async (listingId: string): Promise<{ listing: Listing; author: User } | null> => {
    const listing = await getListing(listingId);
    if (!listing) return null;

    const userDocRef = doc(db, "users", listing.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = userDoc.data() as User;
    return { listing, author };
}
