
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

export type Offer = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  description: string;
  category: string;
  releaseDate: Timestamp | Date | string;
  imageUrl: string | null;
  status: 'active' | 'archived';
  views: number;
  claims: number;
  createdAt: Timestamp | string;
};

// Function to fetch a single offer by its ID
export const getOffer = async (id: string): Promise<Offer | null> => {
  const offerDocRef = doc(db, 'offers', id);
  const offerDoc = await getDoc(offerDocRef);
  if (offerDoc.exists()) {
    const data = offerDoc.data();
    return { 
        id: offerDoc.id, 
        ...data,
        releaseDate: (data.releaseDate as Timestamp).toDate()
    } as Offer;
  }
  return null;
};

// Function to fetch all offers for a specific user
export const getOffersByUser = async (userId: string): Promise<Offer[]> => {
  const offersRef = collection(db, 'offers');
  const q = query(offersRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          releaseDate: (data.releaseDate as Timestamp).toDate()
      } as Offer
  });
};

// Function to create a new offer
export const createOffer = async (userId: string, data: Omit<Offer, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'claims'>) => {
  const offersRef = collection(db, 'offers');
  await addDoc(offersRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    claims: 0,
  });
};

// Function to update an existing offer
export const updateOffer = async (id: string, data: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt'>>) => {
  const offerDocRef = doc(db, 'offers', id);
  await updateDoc(offerDocRef, data);
};

// Function to delete an offer
export const deleteOffer = async (id: string) => {
  const offerDocRef = doc(db, 'offers', id);
  await deleteDoc(offerDocRef);
};

// Helper function for public page to get offer and its author
export const getOfferAndAuthor = async (offerId: string): Promise<{ offer: Offer; author: User } | null> => {
    const offer = await getOffer(offerId);
    if (!offer) return null;

    const userDocRef = doc(db, "users", offer.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = { ...userDoc.data(), id: userDoc.id } as User;
    return { offer, author };
}
