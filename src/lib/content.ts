
'use server';

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Listing, Offer, Job, Event, Business } from './users';
import { getUsersByIds } from './users';

export type PublicContentItem = (
  | (Listing & { type: 'listing' })
  | (Offer & { type: 'offer' })
  | (Job & { type: 'job' })
  | (Event & { type: 'event' })
  | (Business & { type: 'business' })
) & { author: Pick<User, 'uid' | 'name' | 'username' | 'avatarUrl' | 'avatarFallback'>; date: string };


export const getAllPublicContent = async (): Promise<PublicContentItem[]> => {
    const listingsQuery = query(collection(db, 'listings'), where('status', '==', 'active'));
    const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'active'));
    const eventsQuery = query(collection(db, 'events'), where('status', '==', 'active'));
    const offersQuery = query(collection(db, 'offers'), where('status', '==', 'active'));
    const businessesQuery = query(collection(db, 'businesses'), where('status', '==', 'active'));

    const [
        listingsSnap,
        jobsSnap,
        eventsSnap,
        offersSnap,
        businessesSnap,
    ] = await Promise.all([
        getDocs(listingsQuery),
        getDocs(jobsQuery),
        getDocs(eventsQuery),
        getDocs(offersQuery),
        getDocs(businessesQuery),
    ]);

    const allContent: any[] = [
        ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
        ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
        ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
        ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
        ...businessesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'business' })),
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

        const serializedItem = { ...item };
        // Manually serialize all potential date fields in the item
        for (const key in serializedItem) {
            if (serializedItem[key] instanceof Timestamp) {
                serializedItem[key] = serializedItem[key].toDate().toISOString();
            }
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
    }).filter((item): item is PublicContentItem => item !== null);

    // Sort by date descending
    contentWithAuthors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return contentWithAuthors;
};
