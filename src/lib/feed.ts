
'use server';

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './users';
import { getUsersByIds } from './users';
import { serializeDocument } from './firestore-utils';
import type { Post, EmbeddedPostInfoWithAuthor, PostWithAuthor } from './posts';
import type { PromoPage } from './promo-pages';
import type { Listing } from './listings';
import type { Job } from './jobs';
import type { Event } from './events';
import type { Offer } from './offers';
import { populatePostAuthors } from './posts';

// Define a union type for all possible feed items
export type FeedContent =
  | (Post & { type: 'post' })
  | (PromoPage & { type: 'promoPage'; title: string })
  | (Listing & { type: 'listing' })
  | (Job & { type: 'job' })
  | (Event & { type: 'event' })
  | (Offer & { type: 'offer' });

export type FeedItem = (FeedContent & { author: User }) & {
    id: string;
    createdAt: string; // Serialized date
    sortDate: Date;
    isLiked?: boolean; // Specific to posts
};

const collectionTypeMap: { [key: string]: string } = {
    promoPages: 'promoPage',
    listings: 'listing',
    jobs: 'job',
    events: 'event',
    offers: 'offer',
};

const fetchContent = async (collectionName: string, followingIds: string[]): Promise<any[]> => {
    const q = query(
        collection(db, collectionName),
        where('authorId', 'in', followingIds),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = serializeDocument<any>(doc);
        if (collectionName === 'promoPages' && data?.name) {
            data.title = data.name;
        }
        return {
            ...data,
            type: collectionTypeMap[collectionName],
        }
    });
};


export const getFollowingFeedContent = async (userId: string, followingIds: string[]): Promise<FeedItem[]> => {
    const allIdsToFetch = [...new Set([userId, ...followingIds])];
    if (allIdsToFetch.length === 0) return [];

    // 1. Fetch posts
    const postsQuery = query(
        collection(db, 'posts'), 
        where('authorId', 'in', allIdsToFetch),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    const postsSnapshot = await getDocs(postsQuery);
    const rawPosts = postsSnapshot.docs
        .map(doc => serializeDocument<Post>(doc))
        .filter((post): post is Post => {
            if (!post) return false;
            if (post.authorId === userId) return true; // Always show user's own posts
            return post.privacy === 'public' || post.privacy === 'followers';
        });
        
    const postsWithAuthors = await populatePostAuthors(rawPosts);
    const postItems: FeedItem[] = postsWithAuthors.map(p => ({
        ...p,
        type: 'post',
        sortDate: new Date(p.createdAt),
        isLiked: p.likedBy.includes(userId),
    }));

    // 2. Fetch other content types
    const otherCollections = ['promoPages', 'listings', 'jobs', 'events', 'offers'];
    const contentPromises = otherCollections.map(col => fetchContent(col, allIdsToFetch));
    const contentResults = await Promise.all(contentPromises);
    const allOtherRawItems = contentResults.flat().filter(item => item !== null);
    
    // 3. Populate authors for other content
    const authorIds = [...new Set(allOtherRawItems.map(item => item.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));
    
    const otherContentItems: FeedItem[] = allOtherRawItems.map(item => {
        const author = authorMap.get(item.authorId);
        if (!author) return null;
        
        let primaryDate = item.createdAt;
        if (item.type === 'event' || item.type === 'offer') primaryDate = item.startDate;
        if (item.type === 'job') primaryDate = item.postingDate;

        return { ...item, author, sortDate: new Date(primaryDate) };
    }).filter((item): item is FeedItem => item !== null);


    // 4. Combine and sort
    const combinedFeed = [...postItems, ...otherContentItems];
    combinedFeed.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    
    return combinedFeed.slice(0, 50);
};

    