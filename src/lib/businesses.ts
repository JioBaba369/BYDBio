
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

export type Business = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  name: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
  createdAt: Timestamp | string;
};

// Function to fetch a single business by its ID
export const getBusiness = async (id: string): Promise<Business | null> => {
  const businessDocRef = doc(db, 'businesses', id);
  const businessDoc = await getDoc(businessDocRef);
  if (businessDoc.exists()) {
    return { id: businessDoc.id, ...businessDoc.data() } as Business;
  }
  return null;
};

// Function to fetch all businesses for a specific user
export const getBusinessesByUser = async (userId: string): Promise<Business[]> => {
  const businessesRef = collection(db, 'businesses');
  const q = query(businessesRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
};

// Function to create a new business
export const createBusiness = async (userId: string, data: Omit<Business, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks'>) => {
  const businessesRef = collection(db, 'businesses');
  await addDoc(businessesRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    clicks: 0,
  });
};

// Function to update an existing business
export const updateBusiness = async (id: string, data: Partial<Omit<Business, 'id' | 'authorId' | 'createdAt'>>) => {
  const businessDocRef = doc(db, 'businesses', id);
  await updateDoc(businessDocRef, data);
};

// Function to delete a business
export const deleteBusiness = async (id: string) => {
  const businessDocRef = doc(db, 'businesses', id);
  await deleteDoc(businessDocRef);
};

// Helper function for public page to get business and its author
export const getBusinessAndAuthor = async (businessId: string): Promise<{ business: Business; author: User } | null> => {
    const business = await getBusiness(businessId);
    if (!business) return null;

    const userDocRef = doc(db, "users", business.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { business, author };
}
