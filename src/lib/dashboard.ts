
'use server';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Listing, Offer, Job, Event, Business } from './users';
import type { Post } from './posts';

export type ActivityItem = (
    | (Listing & { type: 'Listing' })
    | (Offer & { type: 'Offer' })
    | (Job & { type: 'Job' })
    | (Event & { type: 'Event' })
    | (Business & { type: 'Business' })
    | (Post & { type: 'Post' })
) & {
    id: string;
    createdAt: string; // Serialized date
    title: string;
};

export const getRecentActivity = async (userId: string): Promise<ActivityItem[]> => {
    const collections = ['listings', 'jobs', 'events', 'offers', 'businesses', 'posts'];
    const typeMap: { [key: string]: string } = {
        'listings': 'Listing',
        'jobs': 'Job',
        'events': 'Event',
        'offers': 'Offer',
        'businesses': 'Business',
        'posts': 'Post',
    };

    const promises = collections.map(col => {
        const q = query(
            collection(db, col),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        return getDocs(q);
    });

    const snapshots = await Promise.all(promises);
    
    let allItems: any[] = [];

    snapshots.forEach((snapshot, index) => {
        const collectionName = collections[index];
        const type = typeMap[collectionName];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            let title = 'Untitled';
            if (data.title) {
                title = data.title;
            } else if (data.name) { // For businesses
                title = data.name;
            } else if (data.content) { // For posts
                title = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');
            }

            allItems.push({
                ...data,
                id: doc.id,
                type: type,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                title: title
            });
        });
    });

    // Sort all merged items by date and take the top 5
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allItems.slice(0, 5) as ActivityItem[];
};
