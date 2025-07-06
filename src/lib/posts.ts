
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
  limit,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { createNotification } from './notifications';
import { getUsersByIds } from './users';

export type Post = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  content: string;
  imageUrl: string | null;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the post
  comments: number;
  createdAt: Timestamp;
  repostCount?: number;
};

export type PostWithAuthor = Omit<Post, 'createdAt'> & { author: User; createdAt: string; };

// Function to fetch a single post by its ID
export const getPost = async (id: string): Promise<Post | null> => {
  const postDocRef = doc(db, 'posts', id);
  const postDoc = await getDoc(postDocRef);
  if (postDoc.exists()) {
    return { id: postDoc.id, ...postDoc.data() } as Post;
  }
  return null;
};

// Function to fetch all posts for a specific user
export const getPostsByUser = async (userId: string): Promise<Post[]> => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

// Function to create a new post
export const createPost = async (userId: string, data: Pick<Post, 'content' | 'imageUrl'>) => {
  const postsRef = collection(db, 'posts');
  await addDoc(postsRef, {
    ...data,
    authorId: userId,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    comments: 0,
    repostCount: 0,
  });
};

// Function to delete a post
export const deletePost = async (id: string) => {
  const postDocRef = doc(db, 'posts', id);
  await deleteDoc(postDocRef);
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
        const contentSnippet = postData.content.substring(0, 40) + (postData.content.length > 40 ? '...' : '');
        await createNotification(postData.authorId, 'new_like', userId, postId, contentSnippet);
    }

    return !isLiked; // Return the new like status
}

// Function to repost a post (currently just increments count)
export const repostPost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
        repostCount: increment(1)
    });
};

// Function to fetch posts for the user's feed
export const getFeedPosts = async (followingIds: string[]): Promise<PostWithAuthor[]> => {
    if (followingIds.length === 0) {
        return [];
    }

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('authorId', 'in', followingIds), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }

    const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, 'id'>)
    }));

    const authorIds = [...new Set(postsData.map(post => post.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return postsData.map(post => {
        const author = authorMap.get(post.authorId);
        if (!author) return null;
        
        return {
            ...post,
            author,
            createdAt: (post.createdAt as Timestamp).toDate().toISOString(),
        }
    }).filter((post): post is PostWithAuthor => post !== null);
};

/**
 * Fetches recent posts from users that the current user does not follow.
 * @param userId The UID of the current user.
 * @param followingIds An array of UIDs that the current user follows.
 * @returns A promise that resolves to an array of posts for the discovery feed.
 */
export const getDiscoveryPosts = async (userId: string, followingIds: string[]): Promise<PostWithAuthor[]> => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);

    const discoveryDocs = querySnapshot.docs.filter(doc => {
        const authorId = doc.data().authorId;
        return authorId !== userId && !followingIds.includes(authorId);
    }).slice(0, 25);

    if (discoveryDocs.length === 0) {
        return [];
    }

    const postsData = discoveryDocs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, 'id'>)
    }));

    const authorIds = [...new Set(postsData.map(post => post.authorId))];
    const authors = await getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(author => [author.uid, author]));

    return postsData.map(post => {
        const author = authorMap.get(post.authorId);
        if (!author) return null;

        return {
            ...post,
            author,
            createdAt: (post.createdAt as Timestamp).toDate().toISOString(),
        }
    }).filter((post): post is PostWithAuthor => post !== null);
};
