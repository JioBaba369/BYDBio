
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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { createNotification } from './notifications';
import { getUsersByIds } from './users';

// This is the structure stored in Firestore for a quoted or reposted post.
export type EmbeddedPostInfo = {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
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
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the post
  comments: number;
  createdAt: Timestamp;
  repostCount?: number;
  privacy: 'public' | 'followers' | 'me';
  quotedPost?: EmbeddedPostInfo;
  repostedPost?: EmbeddedPostInfo;
  searchableKeywords?: string[];
};

export type PostWithAuthor = Omit<Post, 'createdAt'> & {
  author: User;
  createdAt: string;
  quotedPost?: EmbeddedPostInfoWithAuthor;
  repostedPost?: EmbeddedPostInfoWithAuthor;
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
  return querySnapshot.docs
    .map(doc => {
        const data = doc.data();
        if (!data.createdAt) return null;
        return { id: doc.id, ...data } as Post
    })
    .filter((post): post is Post => post !== null);
};

// Function to create a new post
export const createPost = async (userId: string, data: Pick<Post, 'content' | 'imageUrl' | 'privacy'> & { quotedPost?: EmbeddedPostInfo }): Promise<Post> => {
  const postsRef = collection(db, 'posts');
  const keywords = [...new Set(data.content.toLowerCase().split(' ').filter(Boolean))];

  const postData: any = {
    authorId: userId,
    content: data.content,
    imageUrl: data.imageUrl,
    privacy: data.privacy || 'followers',
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    comments: 0,
    repostCount: 0,
    searchableKeywords: keywords,
  };

  if (data.quotedPost) {
    postData.quotedPost = data.quotedPost;
  }

  const docRef = await addDoc(postsRef, postData);
  const newPostDoc = await getDoc(docRef);
  return { id: newPostDoc.id, ...newPostDoc.data() } as Post;
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

    const originalPostData = postDoc.data() as Post;
    // Prevent reposting a repost
    if (originalPostData.repostedPost) {
        throw new Error("Cannot repost a post that is already a repost.");
    }
    
    const repostedPostData: EmbeddedPostInfo = {
        id: originalPostId,
        content: originalPostData.content,
        imageUrl: originalPostData.imageUrl,
        authorId: originalPostData.authorId,
    };
    
    const keywords = [...new Set(originalPostData.content.toLowerCase().split(' ').filter(Boolean))];

    const batch = writeBatch(db);

    // 1. Increment repost count on the original post
    batch.update(postRef, {
        repostCount: increment(1)
    });

    // 2. Create the new post document for the reposter
    const newPostRef = doc(collection(db, 'posts')); // auto-generate ID
    const newPostData = {
        authorId: reposterId,
        content: '', // Reposts have no original content of their own
        imageUrl: null,
        repostedPost: repostedPostData, // Embed the original post data
        privacy: originalPostData.privacy, // Inherit privacy from original post
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        repostCount: 0,
        searchableKeywords: keywords,
    };
    batch.set(newPostRef, newPostData);
    
    await batch.commit();

    const newDoc = await getDoc(newPostRef);
    return { id: newDoc.id, ...newDoc.data() } as Post;
};

export const populatePostAuthors = async (posts: Post[]): Promise<PostWithAuthor[]> => {
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
            createdAt: (post.createdAt as Timestamp).toDate().toISOString(),
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
export const getFeedPosts = async (followingIds: string[]): Promise<PostWithAuthor[]> => {
    if (followingIds.length === 0) {
        return [];
    }

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('authorId', 'in', followingIds), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, 'id'>)
    }));

    return populatePostAuthors(postsData);
};

/**
 * Fetches recent posts from users that the current user does not follow.
 * @param userId The UID of the current user.
 * @param followingIds An array of UIDs that the current user follows.
 * @returns A promise that resolves to an array of posts for the discovery feed.
 */
export const getDiscoveryPosts = async (userId: string, followingIds: string[]): Promise<PostWithAuthor[]> => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('privacy', '==', 'public'), orderBy('createdAt', 'desc'), limit(100));
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

    return populatePostAuthors(postsData);
};
