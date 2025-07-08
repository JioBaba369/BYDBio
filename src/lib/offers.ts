
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
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { getUsersByIds } from './users';

export type Offer = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  startDate: Timestamp | Date | string;
  endDate?: Timestamp | Date | string | null;
  imageUrl: string | null;
  couponCode?: string;
  ctaLink?: string;
  status: 'active' | 'archived';
  views: number;
  claims: number;
  followerCount: number;
  createdAt: Timestamp | string;
  searchableKeywords: string[];
};

export type OfferWithAuthor = Offer & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

// Function to fetch a single offer by its ID
export const getOffer = async (id: string): Promise<Offer | null> => {
  const offerDocRef = doc(db, 'offers', id);
  const offerDoc = await getDoc(offerDocRef);
  if (offerDoc.exists()) {
    const data = offerDoc.data();
    if (!data.startDate) {
        console.warn(`Offer ${id} is missing a startDate and will be skipped.`);
        return null;
    }
    return { 
        id: offerDoc.id, 
        ...data,
        startDate: (data.startDate as Timestamp).toDate(),
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
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
      if (!data.startDate || !data.createdAt) {
          console.warn(`Offer ${doc.id} for user ${userId} is missing a required date field and will be skipped.`);
          return null;
      }
      return { 
          id: doc.id, 
          ...data,
          startDate: (data.startDate as Timestamp).toDate(),
          endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
      } as Offer
  }).filter((offer): offer is Offer => offer !== null);
};

// Function to create a new offer
export const createOffer = async (userId: string, data: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'claims' | 'searchableKeywords' | 'followerCount'>>) => {
  const offersRef = collection(db, 'offers');
  const keywords = [
    ...(data.title?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.category?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subCategory?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.couponCode ? data.couponCode.toLowerCase().split(' ') : [])
  ];

  const docData = {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active' as const,
    views: 0,
    claims: 0,
    followerCount: 0,
    searchableKeywords: [...new Set(keywords)],
  };

  await addDoc(offersRef, docData);
};

// Function to update an existing offer
export const updateOffer = async (id: string, data: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt'>>) => {
  const offerDocRef = doc(db, 'offers', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  if (
    data.title !== undefined ||
    data.description !== undefined ||
    data.category !== undefined ||
    data.subCategory !== undefined ||
    data.couponCode !== undefined
  ) {
    const offerDoc = await getDoc(offerDocRef);
    const existingData = offerDoc.data() as Offer;
    const newTitle = data.title ?? existingData.title;
    const newDescription = data.description ?? existingData.description;
    const newCategory = data.category ?? existingData.category;
    const newSubCategory = data.subCategory ?? existingData.subCategory;
    const newCouponCode = data.couponCode ?? existingData.couponCode;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newDescription.toLowerCase().split(' ').filter(Boolean),
        ...newCategory.toLowerCase().split(' ').filter(Boolean),
        ...(newSubCategory ? newSubCategory.toLowerCase().split(' ').filter(Boolean) : []),
        ...(newCouponCode ? newCouponCode.toLowerCase().split(' ') : [])
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(offerDocRef, dataToUpdate);
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

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { offer, author };
}

// Function to get all active offers from all users
export const getAllOffers = async (): Promise<OfferWithAuthor[]> => {
    const offersRef = collection(db, 'offers');
    const q = query(offersRef, where('status', '==', 'active'), orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const offerDocs = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(data => data.startDate); // Ensure offer has a start date

    if (offerDocs.length === 0) return [];
    
    const authorIds = [...new Set(offerDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return offerDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;
        
        return {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            startDate: (data.startDate as Timestamp).toDate().toISOString(),
            endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as OfferWithAuthor;
    }).filter((offer): offer is OfferWithAuthor => !!offer);
};
