
'use server';

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './users';
import { getUsersByIds } from './users';
import { serializeDocument } from './firestore-utils';
import type { Post } from './posts';
import { populatePostAuthors } from './posts';


export type FeedItem = (Post & { author: User }) & {
    id: string;
    createdAt: string; // Serialized date
    sortDate: Date;
    isLiked?: boolean; // Specific to posts
};

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    if (!array) return chunks;
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};


export const getFollowingFeedContent = async (userId: string, followingIds: string[]): Promise<FeedItem[]> => {
    const allIdsToFetch = [...new Set([userId, ...followingIds])];
    if (allIdsToFetch.length === 0) return [];
    
    const idChunks = chunkArray(allIdsToFetch, 30);

    const postPromises = idChunks.map(chunk => {
        const postsQuery = query(
            collection(db, 'posts'), 
            where('authorId', 'in', chunk),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        return getDocs(postsQuery);
    });

    const postSnapshots = await Promise.all(postPromises);
    const allPostDocs = postSnapshots.flatMap(snap => snap.docs);
    const uniquePostDocs = Array.from(new Map(allPostDocs.map(doc => [doc.id, doc])).values());

    const rawPosts = uniquePostDocs
        .map(doc => serializeDocument<Post>(doc))
        .filter((post): post is Post => {
            if (!post) return false;
            if (post.authorId === userId) return true;
            return post.privacy === 'public' || post.privacy === 'followers';
        });
        
    const postsWithAuthors = await populatePostAuthors(rawPosts);
    
    const postItems: FeedItem[] = postsWithAuthors.map(p => ({
        ...p,
        sortDate: new Date(p.createdAt),
        isLiked: p.likedBy.includes(userId),
    }));
    
    postItems.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    
    return postItems.slice(0, 50);
};

