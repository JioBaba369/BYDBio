
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
  searchableKeywords: string[];
};

export type BusinessWithAuthor = Business & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

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
export const createBusiness = async (userId: string, data: Omit<Business, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords'>) => {
  const businessesRef = collection(db, 'businesses');
  const keywords = [
    ...data.name.toLowerCase().split(' ').filter(Boolean),
    ...data.description.toLowerCase().split(' ').filter(Boolean),
    data.email.toLowerCase(),
    ...(data.address ? data.address.toLowerCase().split(' ') : [])
  ];

  await addDoc(businessesRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    clicks: 0,
    searchableKeywords: [...new Set(keywords)],
  });
};

// Function to update an existing business
export const updateBusiness = async (id: string, data: Partial<Omit<Business, 'id' | 'authorId' | 'createdAt'>>) => {
  const businessDocRef = doc(db, 'businesses', id);
  const dataToUpdate = { ...data };

  if (data.name || data.description || data.email || data.address) {
    const businessDoc = await getDoc(businessDocRef);
    const existingData = businessDoc.data() as Business;
    const newName = data.name ?? existingData.name;
    const newDescription = data.description ?? existingData.description;
    const newEmail = data.email ?? existingData.email;
    const newAddress = data.address ?? existingData.address;

    const keywords = [
      ...newName.toLowerCase().split(' ').filter(Boolean),
      ...newDescription.toLowerCase().split(' ').filter(Boolean),
      newEmail.toLowerCase(),
      ...(newAddress ? newAddress.toLowerCase().split(' ') : []),
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(businessDocRef, dataToUpdate);
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

// Function to get all active businesses from all users
export const getAllBusinesses = async (): Promise<BusinessWithAuthor[]> => {
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);

    const businesses: BusinessWithAuthor[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const businessDoc of querySnapshot.docs) {
        const data = businessDoc.data();
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
            businesses.push({
                id: businessDoc.id,
                ...data,
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as BusinessWithAuthor);
        }
    }

    return businesses.sort((a,b) => (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis());
};
