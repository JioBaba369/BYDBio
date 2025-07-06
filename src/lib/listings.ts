
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

export type Listing = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string;
  status: 'active' | 'archived';
  listingType?: 'sale' | 'rental';
  views?: number;
  clicks?: number;
  startDate?: Timestamp | Date | string | null;
  endDate?: Timestamp | Date | string | null;
  createdAt: Timestamp | string;
  searchableKeywords: string[];
};

export type ListingWithAuthor = Listing & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

// Function to fetch a single listing by its ID
export const getListing = async (id: string): Promise<Listing | null> => {
  const listingDocRef = doc(db, 'listings', id);
  const listingDoc = await getDoc(listingDocRef);
  if (listingDoc.exists()) {
    const data = listingDoc.data();
    return { 
        id: listingDoc.id, 
        ...data,
        startDate: data.startDate ? (data.startDate as Timestamp).toDate() : null,
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
    } as Listing;
  }
  return null;
};

// Function to fetch all listings for a specific user
export const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where('authorId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.createdAt) return null;
      return { 
          id: doc.id, 
          ...data,
          startDate: data.startDate ? (data.startDate as Timestamp).toDate() : null,
          endDate: data.endDate ? (data.endDate as Timestamp).toDate() : null,
      } as Listing
  }).filter((listing): listing is Listing => listing !== null);
};

// Function to create a new listing
export const createListing = async (userId: string, data: Omit<Listing, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords'>) => {
  const listingsRef = collection(db, 'listings');
  const keywords = [
    ...data.title.toLowerCase().split(' ').filter(Boolean),
    ...data.description.toLowerCase().split(' ').filter(Boolean),
    ...data.category.toLowerCase().split(' ').filter(Boolean),
  ];

  await addDoc(listingsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    listingType: data.listingType || 'sale',
    views: 0,
    clicks: 0,
    searchableKeywords: [...new Set(keywords)],
  });
};

// Function to update an existing listing
export const updateListing = async (id: string, data: Partial<Omit<Listing, 'id' | 'authorId' | 'createdAt'>>) => {
  const listingDocRef = doc(db, 'listings', id);
  const dataToUpdate = { ...data };

  if (data.title || data.description || data.category) {
    const listingDoc = await getDoc(listingDocRef);
    const existingData = listingDoc.data() as Listing;
    const newTitle = data.title ?? existingData.title;
    const newDescription = data.description ?? existingData.description;
    const newCategory = data.category ?? existingData.category;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newDescription.toLowerCase().split(' ').filter(Boolean),
        ...newCategory.toLowerCase().split(' ').filter(Boolean),
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(listingDocRef, dataToUpdate);
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

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { listing, author };
}

// Function to get all active listings from all users
export const getAllListings = async (): Promise<ListingWithAuthor[]> => {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const listings: ListingWithAuthor[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const listingDoc of querySnapshot.docs) {
        const data = listingDoc.data();
        const authorId = data.authorId;
        let author = authorCache[authorId];

        if (!author) {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
                author = { uid: userDoc.id, ...userDoc.data() } as User;
                authorCache[authorId] = author;
            }
        }
        
        if (author) {
            listings.push({
                id: listingDoc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                startDate: data.startDate ? (data.startDate as Timestamp).toDate().toISOString() : null,
                endDate: data.endDate ? (data.endDate as Timestamp).toDate().toISOString() : null,
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as ListingWithAuthor);
        }
    }

    return listings;
};
