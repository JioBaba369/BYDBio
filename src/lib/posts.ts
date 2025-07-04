
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

export type Post = {
  id: string; // Document ID from Firestore
  authorId: string; // UID of the user who created it
  content: string;
  imageUrl: string | null;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the post
  comments: number;
  createdAt: Timestamp;
};

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
        await createNotification(postData.authorId, 'new_like', userId, postId);
    }

    return !isLiked; // Return the new like status
}

// Function to fetch posts for the user's feed
export const getFeedPosts = async (followingIds: string[]): Promise<(Omit<Post, 'createdAt'> & { author: User; createdAt: string })[]> => {
    if (followingIds.length === 0) {
        return [];
    }

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('authorId', 'in', followingIds), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    const posts: (Omit<Post, 'createdAt'> & { author: User; createdAt: string; })[] = [];
    const authorCache: { [key: string]: User } = {};

    for (const postDoc of querySnapshot.docs) {
        const postData = postDoc.data() as Omit<Post, 'id' | 'createdAt'>;
        const postCreatedAt = (postDoc.data().createdAt as Timestamp);
        
        let author = authorCache[postData.authorId];
        if (!author) {
            const userDoc = await getDoc(doc(db, 'users', postData.authorId));
            if (userDoc.exists()) {
                author = userDoc.data() as User;
                authorCache[postData.authorId] = author;
            }
        }

        if (author) {
            posts.push({ 
                id: postDoc.id,
                 ...postData, 
                 author: author,
                 createdAt: postCreatedAt.toDate().toISOString(),
            });
        }
    }

    return posts;
};
