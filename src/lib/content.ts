
'use server';

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUsersByIds, type User } from './users';
import type { Listing } from './listings';
import type { Offer } from './offers';
import type { Job } from './jobs';
import type { Event } from './events';
import type { PromoPage } from './promo-pages';

export type PublicContentItem = (
  | (Listing & { type: 'listing' })
  | (Offer & { type: 'offer' })
  | (Job & { type: 'job' })
  | (Event & { type: 'event' })
  | (PromoPage & { type: 'promoPage' })
) & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl' | 'avatarFallback'>; date: string; title: string; };


export const getAllPublicContent = async (): Promise<PublicContentItem[]> => {
    const listingsQuery = query(collection(db, 'listings'), where('status', '==', 'active'));
    const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'active'));
    const eventsQuery = query(collection(db, 'events'), where('status', '==', 'active'));
    const offersQuery = query(collection(db, 'offers'), where('status', '==', 'active'));
    const promoPagesQuery = query(collection(db, 'promoPages'), where('status', '==', 'active'));

    const [
        listingsSnap,
        jobsSnap,
        eventsSnap,
        offersSnap,
        promoPagesSnap,
    ] = await Promise.all([
        getDocs(listingsQuery),
        getDocs(jobsQuery),
        getDocs(eventsQuery),
        getDocs(offersQuery),
        getDocs(promoPagesQuery),
    ]);

    const allContent: any[] = [
        ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
        ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
        ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
        ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
        ...promoPagesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'promoPage' })),
    ];
    
    // De-duplicate authors and fetch them
    const authorIds = [...new Set(allContent.map(item => item.authorId))];
    if (authorIds.length === 0) {
        return [];
    }
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    const contentWithAuthors = allContent.map(item => {
        const author = authorMap.get(item.authorId);
        if (!author) {
            return null; // Skip content if author not found
        }
        
        let primaryDate = item.createdAt; 
        if (item.type === 'event' || item.type === 'offer') {
            primaryDate = item.startDate;
        } else if (item.type === 'job') {
            primaryDate = item.postingDate;
        }

        if (!primaryDate) {
            return null;
        }

        const serializedItem: any = { ...item };
        // Manually serialize all potential date fields in the item
        for (const key in serializedItem) {
            if (serializedItem[key] instanceof Timestamp) {
                serializedItem[key] = serializedItem[key].toDate().toISOString();
            }
        }
        
        // Normalize the title property
        if (serializedItem.type === 'promoPage' && serializedItem.name) {
            serializedItem.title = serializedItem.name;
        }

        return {
            ...serializedItem,
            author: {
                uid: author.uid,
                name: author.name,
                username: author.username,
                avatarUrl: author.avatarUrl,
                avatarFallback: author.avatarFallback,
            },
            date: (primaryDate as Timestamp).toDate().toISOString()
        };
    }).filter((item): item is PublicContentItem => item !== null && !!item.title);

    // Sort by date descending
    contentWithAuthors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return contentWithAuthors;
};
