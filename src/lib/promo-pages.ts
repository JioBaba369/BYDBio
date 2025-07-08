
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

export type PromoPage = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  name: string;
  description: string;
  category?: string;
  subCategory?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  status: 'active' | 'archived';
  views?: number;
  clicks?: number;
  followerCount: number;
  createdAt: Date;
  searchableKeywords: string[];
};

export type PromoPageWithAuthor = PromoPage & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

const serializePromoPage = (doc: any): PromoPage | null => {
    const data = doc.data();
    if (!data) return null;

    const page: any = { id: doc.id };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            page[key] = data[key].toDate();
        } else {
            page[key] = data[key];
        }
    }
    return page as PromoPage;
};


// Function to fetch a single promo page by its ID
export const getPromoPage = async (id: string): Promise<PromoPage | null> => {
  const promoPageDocRef = doc(db, 'promoPages', id);
  const promoPageDoc = await getDoc(promoPageDocRef);
  if (!promoPageDoc.exists()) return null;
  return serializePromoPage(promoPageDoc);
};

// Function to fetch all promo pages for a specific user
export const getPromoPagesByUser = async (userId: string): Promise<PromoPage[]> => {
  const promoPagesRef = collection(db, 'promoPages');
  const q = query(promoPagesRef, where('authorId', '==', userId), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(serializePromoPage)
    .filter((page): page is PromoPage => page !== null);
};

// Function to create a new promo page
export const createPromoPage = async (userId: string, data: Partial<Omit<PromoPage, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords' | 'followerCount'>>) => {
  const promoPagesRef = collection(db, 'promoPages');
  const keywords = [
    ...(data.name?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.description?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.category?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.subCategory?.toLowerCase().split(' ').filter(Boolean) || []),
    ...(data.email?.toLowerCase() ? [data.email.toLowerCase()] : []),
    ...(data.address ? data.address.toLowerCase().split(' ') : [])
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

  const docRef = await addDoc(promoPagesRef, docData);
  return docRef.id;
};

// Function to update an existing promo page
export const updatePromoPage = async (id: string, data: Partial<Omit<PromoPage, 'id' | 'authorId' | 'createdAt'>>) => {
  const promoPageDocRef = doc(db, 'promoPages', id);
  const dataToUpdate: {[key: string]: any} = { ...data };

  if (
    data.name !== undefined ||
    data.description !== undefined ||
    data.email !== undefined ||
    data.category !== undefined ||
    data.subCategory !== undefined ||
    data.address !== undefined
  ) {
    const promoPageDoc = await getDoc(promoPageDocRef);
    const existingData = promoPageDoc.data() as PromoPage;
    const newName = data.name ?? existingData.name;
    const newDescription = data.description ?? existingData.description;
    const newEmail = data.email ?? existingData.email;
    const newCategory = data.category ?? existingData.category;
    const newSubCategory = data.subCategory ?? existingData.subCategory;
    const newAddress = data.address ?? existingData.address;

    const keywords = [
      ...newName.toLowerCase().split(' ').filter(Boolean),
      ...newDescription.toLowerCase().split(' ').filter(Boolean),
      newEmail.toLowerCase(),
      ...(newCategory ? newCategory.toLowerCase().split(' ').filter(Boolean) : []),
      ...(newSubCategory ? newSubCategory.toLowerCase().split(' ').filter(Boolean) : []),
      ...(newAddress ? newAddress.toLowerCase().split(' ') : []),
    ];
    dataToUpdate.searchableKeywords = [...new Set(keywords)];
  }

  await updateDoc(promoPageDocRef, dataToUpdate);
};

// Function to delete a promo page
export const deletePromoPage = async (id: string) => {
  const promoPageDocRef = doc(db, 'promoPages', id);
  await deleteDoc(promoPageDocRef);
};

// Helper function for public page to get promo page and its author
export const getPromoPageAndAuthor = async (promoPageId: string): Promise<{ promoPage: PromoPage; author: User } | null> => {
    const promoPage = await getPromoPage(promoPageId);
    if (!promoPage) return null;

    const userDocRef = doc(db, "users", promoPage.authorId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null;
    }

    const author = { uid: userDoc.id, ...userDoc.data() } as User;
    return { promoPage, author };
}

// Function to get all active promo pages from all users
export const getAllPromoPages = async (): Promise<PromoPageWithAuthor[]> => {
    const promoPagesRef = collection(db, 'promoPages');
    const q = query(promoPagesRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const promoPageDocs = querySnapshot.docs
        .map(serializePromoPage)
        .filter((page): page is PromoPage => !!page);

    if (promoPageDocs.length === 0) return [];
    
    const authorIds = [...new Set(promoPageDocs.map(doc => doc.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return promoPageDocs.map(data => {
        const author = authorMap.get(data.authorId);
        if (!author) return null;

        return {
            ...data,
            author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
        } as PromoPageWithAuthor;
    }).filter((page): page is PromoPageWithAuthor => !!page);
};
