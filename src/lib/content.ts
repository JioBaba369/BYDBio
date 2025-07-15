
'use client';

import { query, where, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { type Listing } from "./listings";
import { type Offer } from "./offers";
import { type Job } from "./jobs";
import { type Event } from "./events";
import { type PromoPage } from "./promo-pages";

export type PublicContentItem = (
    | (Listing & { type: 'listing' })
    | (Offer & { type: 'offer' })
    | (Job & { type: 'job' })
    | (Event & { type: 'event' })
    | (PromoPage & { type: 'promoPage' })
) & { title: string; date: string; };

export const searchPublicContent = async (searchText: string) => {
    const searchKeywords = searchText.toLowerCase().split(' ').filter(Boolean).slice(0, 10);
    if (searchKeywords.length === 0) {
        return [];
    }

    const collectionsToSearch = ['listings', 'jobs', 'events', 'offers', 'promoPages'];

    const searchPromises = collectionsToSearch.map(colName => {
        const q = query(
            collection(db, colName),
            where('searchableKeywords', 'array-contains-any', searchKeywords),
            where('status', '==', 'active')
        );
        return getDocs(q);
    });

    const snapshots = await Promise.all(searchPromises);

    const allContent: PublicContentItem[] = [];

    snapshots.forEach((snapshot, index) => {
        const type = collectionsToSearch[index].slice(0, -1) as PublicContentItem['type']; // 'listings' -> 'listing'
        snapshot.forEach(doc => {
            const data = doc.data() as any;
            
            let primaryDate = data.createdAt;
            if (type === 'event' || type === 'offer') primaryDate = data.startDate;
            else if (type === 'job') primaryDate = data.postingDate;

            allContent.push({
                ...data,
                id: doc.id,
                type: type,
                title: data.title || data.name,
                date: primaryDate.toDate().toISOString(),
            });
        });
    });

    allContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allContent;
};
