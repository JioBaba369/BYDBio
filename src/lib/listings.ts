
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
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { getUsersByIds } from './users';
import { serializeDocument } from './firestore-utils';

export type Listing = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string;
  subCategory?: string;
  status: 'active' | 'archived';
  listingType?: 'sale' | 'rental';
  views?: number;
  clicks?: number;
  followerCount: number;
  startDate?: string | null; // ISO 8601 string
  endDate?: string | null; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  searchableKeywords: string[];
};

export type ListingWithAuthor = Listing & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

// Function to fetch a single listing by its ID
export const getListing = async (id: string): Promise<Listing | null> => {
  const listingDocRef = doc(db, 'listings', id);
  const listingDoc = await getDoc(listingDocRef);
  if (!listingDoc.exists()) return null;
  return serializeDocument<Listing>(listingDoc);
};

// Function to fetch all listings for a specific user
export const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where('authorId', '==', userId), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => serializeDocument<Listing>(doc)).filter((listing): listing is Listing => listing !== null);
};

// Function to create a new listing
export const createListing = async (userId: string, data: Partial<Omit<Listing, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords' | 'followerCount'>>) => {
  const listingsRef = collection(db, 'listings');
  const keywords = [
    ...(data.title?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.category?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subCategory?.toLowerCase().split(' ').filter(Boolean) || []),
  ];

  const docData = {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active' as const,
    views: 0,
    clicks: 0,
    followerCount: 0,
    searchableKeywords: [...new Set(keywords)],
  };
  
  const docRef = await addDoc(listingsRef, docData);
  return docRef.id;
};

// Function to update an existing listing
export const updateListing = async (id: string, data: Partial<Omit<Listing, 'id' | 'authorId' | 'createdAt'>>) => {
  const listingDocRef = doc(db, 'listings', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  if (
    data.title !== undefined ||
    data.description !== undefined ||
    data.category !== undefined ||
    data.subCategory !== undefined
  ) {
    const listingDoc = await getDoc(listingDocRef);
    const existingData = listingDoc.data() as Listing;
    const newTitle = data.title ?? existingData.title;
    const newDescription = data.description ?? existingData.description;
    const newCategory = data.category ?? existingData.category;
    const newSubCategory = data.subCategory ?? existingData.subCategory;

    const keywords = [
        ...newTitle.toLowerCase().split(' ').filter(Boolean),
        ...newDescription.toLowerCase().split(' ').filter(Boolean),
        ...newCategory.toLowerCase().split(' ').filter(Boolean),
        ...(newSubCategory ? newSubCategory.toLowerCase().split(' ').filter(Boolean) : []),
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

    const listingDocs = querySnapshot.docs
      .map(doc => serializeDocument<Listing>(doc))
      .filter((listing): listing is Listing => !!listing);

    if (listingDocs.length === 0) return [];

    const authorIds = [...new Set(listingDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return listingDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;

        return {
            ...data,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as ListingWithAuthor;
    }).filter((listing): listing is ListingWithAuthor => !!listing);
};
