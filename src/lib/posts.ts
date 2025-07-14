
'use server';

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
  limit,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { createNotification } from './notifications';
import { getUsersByIds, getSuggestedUsers } from './users';
import { serializeDocument } from './firestore-utils';

// This is the structure stored in Firestore for a quoted or reposted post.
// It also serves as the structure for the original post when a post is a repost.
export type EmbeddedPostInfo = {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: string; // Store as ISO string
};

// This is the structure used on the client, with author details populated.
export type EmbeddedPostInfoWithAuthor = EmbeddedPostInfo & {
  author: {
    uid: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
};

export type Post = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  content: string;
  imageUrl: string | null;
  category?: string;
  postNumber: number;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the post
  comments: number;
  createdAt: string; // ISO 8601 string
  repostCount?: number;
  privacy: 'public' | 'followers' | 'me';
  quotedPost?: EmbeddedPostInfo;
  // If this post is a repost, this field will contain the *original* post's data.
  // The top-level authorId will be the user who did the reposting.
  repostedPost?: EmbeddedPostInfo;
  // If this post is a repost, this is the ID of the original post document.
  originalPostId?: string;
  searchableKeywords?: string[];
};

export type PostWithAuthor = Post & {
  author: User;
  isLiked?: boolean;
  quotedPost?: EmbeddedPostInfoWithAuthor;
  repostedPost?: EmbeddedPostInfoWithAuthor;
};

const FEED_POST_LIMIT = 50;

// Function to fetch a single post by its ID
export const getPost = async (id: string): Promise<Post | null> => {
  const postDocRef = doc(db, 'posts', id);
  const postDoc = await getDoc(postDocRef);
  if (!postDoc.exists()) return null;
  return serializeDocument<Post>(postDoc);
};

// Function to fetch all posts for a specific user.
export const getPostsByUser = async (userId: string, viewerId?: string | null): Promise<PostWithAuthor[]> => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const posts = querySnapshot.docs
    .map(doc => serializeDocument<Post>(doc))
    .filter((post): post is Post => post !== null);
  
  return populatePostAuthors(posts, viewerId);
};

// Function to create a new post
export const createPost = async (userId: string, data: Pick<Post, 'content' | 'imageUrl' | 'privacy' | 'category'> & { quotedPost?: EmbeddedPostInfo }): Promise<Post> => {
  const userRef = doc(db, "users", userId);
  const postRef = doc(collection(db, "posts")); // New post ref with auto-generated ID

  if (data.quotedPost && data.quotedPost.authorId === userId) {
    throw new Error("You cannot quote your own post.");
  }

  const batch = writeBatch(db);

  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
      throw new Error("User performing the action not found.");
  }
  const postCount = userDoc.data().postCount || 0;
  const newPostNumber = postCount + 1;

  const keywords = [
    ...new Set(data.content.toLowerCase().split(' ').filter(Boolean)),
    ...(data.category ? data.category.toLowerCase().split(' ').filter(Boolean) : []),
  ];

  const postData: any = {
    authorId: userId,
    content: data.content,
    imageUrl: data.imageUrl,
    privacy: data.privacy || 'public',
    category: data.category || '',
    postNumber: newPostNumber,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    comments: 0,
    repostCount: 0,
    searchableKeywords: keywords,
    quotedPost: data.quotedPost || null, // Ensure quotedPost is included
  };
  
  // Set the new post document in the batch
  batch.set(postRef, postData);
  // Update the user's post count in the batch
  batch.update(userRef, { postCount: increment(1) });
  
  await batch.commit();

  const newPostDoc = await getDoc(postRef);
  return serializeDocument<Post>(newPostDoc) as Post;
};

// Function to delete a post
export const deletePost = async (id: string) => {
  const postRef = doc(db, 'posts', id);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) {
    throw new Error("Post not found.");
  }
  
  const postData = postDoc.data() as Post;
  const isRepost = !!postData.repostedPost;
  
  const batch = writeBatch(db);

  // Delete the post itself
  batch.delete(postRef);
  
  // If it was an original post (not a repost), decrement the author's post count
  if (!isRepost) {
    const authorRef = doc(db, 'users', postData.authorId);
    batch.update(authorRef, { postCount: increment(-1) });
  }

  // If this was a repost, decrement the original post's repost count
  if (postData.repostedPost) {
    const originalPostRef = doc(db, 'posts', postData.repostedPost.id);
    batch.update(originalPostRef, { repostCount: increment(-1) });
  }
  
  await batch.commit();
};


// Function to toggle a like on a post
export const toggleLikePost = async (postId: string, userId: string) => {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
        throw new Error("Post not found");
    }

    const postData = postDoc.data() as Post;
    const isLiked = postData.likedBy.includes(userId);

    if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
            likedBy: arrayRemove(userId),
            likes: increment(-1)
        });
    } else {
        // Like the post
        await updateDoc(postRef, {
            likedBy: arrayUnion(userId),
            likes: increment(1)
        });
        
        // Use reposted content for notification if it's a repost, otherwise use main content
        const contentForNotification = postData.repostedPost?.content || postData.content;
        const contentSnippet = contentForNotification.substring(0, 40) + (contentForNotification.length > 40 ? '...' : '');

        await createNotification(postData.authorId, 'new_like', userId, { entityId: postId, entityTitle: contentSnippet });
    }

    return !isLiked; // Return the new like status
}

// A repost is a new post that links to an original post.
export const repostPost = async (originalPostId: string, reposterId: string): Promise<Post> => {
    const postRef = doc(db, 'posts', originalPostId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
        throw new Error("Cannot repost a post that does not exist.");
    }
    
    // Check if this user has already reposted this specific post.
    const repostQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', reposterId),
        where('originalPostId', '==', originalPostId)
    );
    const existingRepost = await getDocs(repostQuery);
    if (!existingRepost.empty) {
        throw new Error("You have already reposted this.");
    }

    const originalPostData = serializeDocument<Post>(postDoc)!;
    // If original post is a repost, we want to repost the *original* content, not the repost itself
    const contentToRepost = originalPostData.repostedPost || { 
        id: originalPostId, 
        content: originalPostData.content, 
        imageUrl: originalPostData.imageUrl, 
        authorId: originalPostData.authorId,
        createdAt: originalPostData.createdAt,
    };
    
    const keywords = [...new Set(contentToRepost.content.toLowerCase().split(' ').filter(Boolean))];

    const batch = writeBatch(db);

    // 1. Increment repost count on the original post
    batch.update(doc(db, 'posts', contentToRepost.id), {
        repostCount: increment(1)
    });

    // 2. Create the new post document for the reposter
    const newPostRef = doc(collection(db, 'posts')); // auto-generate ID
    const newPostData = {
        authorId: reposterId,
        content: '', // Reposts have no original content of their own
        imageUrl: null,
        repostedPost: contentToRepost, // Embed the original post data
        originalPostId: contentToRepost.id, // Store a direct reference to the original post ID
        privacy: originalPostData.privacy, // Inherit privacy from original post
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        repostCount: 0,
        postNumber: 0, // Reposts don't get a number
        category: originalPostData.category,
        searchableKeywords: keywords,
    };
    batch.set(newPostRef, newPostData);
    
    await batch.commit();

    const newDoc = await getDoc(newPostRef);
    return serializeDocument<Post>(newDoc) as Post;
};

export const populatePostAuthors = async (posts: Post[], viewerId?: string | null): Promise<PostWithAuthor[]> => {
    if (posts.length === 0) return [];

    const authorIds = new Set<string>();
    posts.forEach(post => {
        authorIds.add(post.authorId);
        if (post.quotedPost?.authorId) {
            authorIds.add(post.quotedPost.authorId);
        }
        if (post.repostedPost?.authorId) {
            authorIds.add(post.repostedPost.authorId);
        }
    });

    const authors = await getUsersByIds(Array.from(authorIds));
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return posts.map(post => {
        const author = authorMap.get(post.authorId);
        if (!author) return null; // Skip post if main author not found

        const populatedPost: PostWithAuthor = {
            ...post,
            author,
            isLiked: viewerId ? post.likedBy.includes(viewerId) : false,
        };

        if (post.quotedPost) {
            const quotedAuthor = authorMap.get(post.quotedPost.authorId);
            if (quotedAuthor) {
                populatedPost.quotedPost = {
                    ...post.quotedPost,
                    author: {
                        uid: quotedAuthor.uid,
                        name: quotedAuthor.name,
                        username: quotedAuthor.username,
                        avatarUrl: quotedAuthor.avatarUrl,
                    }
                };
            }
        }
        
        if (post.repostedPost) {
            const repostedAuthor = authorMap.get(post.repostedPost.authorId);
            if (repostedAuthor) {
                populatedPost.repostedPost = {
                    ...post.repostedPost,
                    author: {
                        uid: repostedAuthor.uid,
                        name: repostedAuthor.name,
                        username: repostedAuthor.username,
                        avatarUrl: repostedAuthor.avatarUrl,
                    }
                };
            }
        }

        return populatedPost;
    }).filter((post): post is PostWithAuthor => post !== null);
}

// Function to fetch posts for the user's feed
export const getFeedPosts = async (userId: string, followingIds: string[]): Promise<PostWithAuthor[]> => {
    const authorsToFetch = [...new Set([userId, ...followingIds])];
    
    if (authorsToFetch.length === 0) {
        return [];
    }
    
    // Chunk the authorsToFetch array to handle Firestore's 'in' query limit (30)
    const chunks: string[][] = [];
    for (let i = 0; i < authorsToFetch.length; i += 30) {
        chunks.push(authorsToFetch.slice(i, i + 30));
    }

    const allPosts: Post[] = [];

    for (const chunk of chunks) {
        const postsQuery = query(
            collection(db, 'posts'), 
            where('authorId', 'in', chunk),
            orderBy('createdAt', 'desc'),
            limit(FEED_POST_LIMIT) // Apply limit per chunk
        );
        const postSnapshots = await getDocs(postsQuery);
        postSnapshots.forEach(doc => {
            const post = serializeDocument<Post>(doc);
            if (post) allPosts.push(post);
        });
    }

    // Sort all combined results by date and take the top N
    allPosts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const finalPosts = allPosts.slice(0, FEED_POST_LIMIT);
    
    return populatePostAuthors(finalPosts, userId);
};

/**
 * Fetches recent public posts from users that the current user does not follow.
 * @param userId The UID of the current user.
 * @param followingIds An array of UIDs that the current user follows.
 * @returns A promise that resolves to an array of posts for the discovery feed.
 */
export const getDiscoveryPosts = async (userId: string, followingIds: string[]): Promise<PostWithAuthor[]> => {
    const suggestedUsers = await getSuggestedUsers(userId, 20); // Get up to 20 suggested users
    if (suggestedUsers.length === 0) {
        return [];
    }

    const suggestedUserIds = suggestedUsers.map(u => u.uid);
    
    // Chunk the user IDs to handle Firestore's 'in' query limit (30)
    const chunks: string[][] = [];
    for (let i = 0; i < suggestedUserIds.length; i += 30) {
        chunks.push(suggestedUserIds.slice(i, i + 30));
    }
    
    const allPosts: Post[] = [];

    for (const chunk of chunks) {
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', 'in', chunk),
            where('privacy', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(FEED_POST_LIMIT)
        );
        const postSnapshots = await getDocs(postsQuery);
        postSnapshots.forEach(doc => {
            const post = serializeDocument<Post>(doc);
            if (post) allPosts.push(post);
        });
    }

    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const finalPosts = allPosts.slice(0, FEED_POST_LIMIT);
    
    return populatePostAuthors(finalPosts, userId);
};

