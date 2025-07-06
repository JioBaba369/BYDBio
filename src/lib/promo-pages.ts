
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

export type PromoPage = {
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

export type PromoPageWithAuthor = PromoPage & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl'> };

// Function to fetch a single promo page by its ID
export const getPromoPage = async (id: string): Promise<PromoPage | null> => {
  const promoPageDocRef = doc(db, 'promoPages', id);
  const promoPageDoc = await getDoc(promoPageDocRef);
  if (promoPageDoc.exists()) {
    return { id: promoPageDoc.id, ...promoPageDoc.data() } as PromoPage;
  }
  return null;
};

// Function to fetch all promo pages for a specific user
export const getPromoPagesByUser = async (userId: string): Promise<PromoPage[]> => {
  const promoPagesRef = collection(db, 'promoPages');
  const q = query(promoPagesRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => {
        const data = doc.data();
        if (!data.createdAt) return null;
        return { id: doc.id, ...doc.data() } as PromoPage
    })
    .filter((page): page is PromoPage => page !== null);
};

// Function to create a new promo page
export const createPromoPage = async (userId: string, data: Omit<PromoPage, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords'>) => {
  const promoPagesRef = collection(db, 'promoPages');
  const keywords = [
    ...data.name.toLowerCase().split(' ').filter(Boolean),
    ...data.description.toLowerCase().split(' ').filter(Boolean),
    data.email.toLowerCase(),
    ...(data.address ? data.address.toLowerCase().split(' ') : [])
  ];

  await addDoc(promoPagesRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    status: 'active',
    views: 0,
    clicks: 0,
    searchableKeywords: [...new Set(keywords)],
  });
};

// Function to update an existing promo page
export const updatePromoPage = async (id: string, data: Partial<Omit<PromoPage, 'id' | 'authorId' | 'createdAt'>>) => {
  const promoPageDocRef = doc(db, 'promoPages', id);
  const dataToUpdate = { ...data };

  if (data.name || data.description || data.email || data.address) {
    const promoPageDoc = await getDoc(promoPageDocRef);
    const existingData = promoPageDoc.data() as PromoPage;
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

    const promoPages: PromoPageWithAuthor[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const promoPageDoc of querySnapshot.docs) {
        const data = promoPageDoc.data();
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
            promoPages.push({
                id: promoPageDoc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                author: { uid: author.uid, name: author.name, username: author.username, avatarUrl: author.avatarUrl }
            } as PromoPageWithAuthor);
        }
    }

    return promoPages;
};
