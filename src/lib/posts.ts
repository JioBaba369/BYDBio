// src/lib/posts.ts

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
  startAfter,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { createNotification } from './notifications';
import { getUsersByIds } from './users';
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
  const postRef = doc(collection(db, "posts")); // Generate a new ref with a unique ID

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
    quotedPost: data.quotedPost || null,
  };
  
  batch.set(postRef, postData);
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

  batch.delete(postRef);
  
  if (!isRepost) {
    const authorRef = doc(db, 'users', postData.authorId);
    batch.update(authorRef, { postCount: increment(-1) });
  }

  if (postData.originalPostId) {
    const originalPostRef = doc(db, 'posts', postData.originalPostId);
    batch.update(originalPostRef, { repostCount: increment(-1) });
  }
  
  await batch.commit();
};

export const toggleLikePost = async (postId: string, userId: string) => {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
        throw new Error("Post not found");
    }

    const postData = postDoc.data() as Post;
    const isLiked = postData.likedBy.includes(userId);

    if (isLiked) {
        await updateDoc(postRef, {
            likedBy: arrayRemove(userId),
            likes: increment(-1)
        });
    } else {
        await updateDoc(postRef, {
            likedBy: arrayUnion(userId),
            likes: increment(1)
        });
        
        const contentForNotification = postData.repostedPost?.content || postData.content;
        const contentSnippet = contentForNotification.substring(0, 40) + (contentForNotification.length > 40 ? '...' : '');

        await createNotification(postData.authorId, 'new_like', userId, { entityId: postId, entityTitle: contentSnippet });
    }

    return !isLiked;
}

export const repostPost = async (originalPostId: string, reposterId: string): Promise<Post> => {
    const postRef = doc(db, 'posts', originalPostId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
        throw new Error("Cannot repost a post that does not exist.");
    }
    
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
    const ultimateOriginalPostId = originalPostData.originalPostId || originalPostId;
    const ultimateOriginalPostContent = originalPostData.repostedPost || {
        id: originalPostId,
        content: originalPostData.content,
        imageUrl: originalPostData.imageUrl,
        authorId: originalPostData.authorId,
        createdAt: originalPostData.createdAt,
    };
    
    if (ultimateOriginalPostContent.authorId === reposterId) {
        throw new Error("You cannot repost your own post.");
    }

    const keywords = [...new Set(ultimateOriginalPostContent.content.toLowerCase().split(' ').filter(Boolean))];

    const batch = writeBatch(db);

    batch.update(doc(db, 'posts', ultimateOriginalPostId), {
        repostCount: increment(1)
    });

    const newPostRef = doc(collection(db, 'posts'));
    const newPostData = {
        authorId: reposterId,
        content: '',
        imageUrl: null,
        repostedPost: ultimateOriginalPostContent,
        originalPostId: ultimateOriginalPostId,
        privacy: originalPostData.privacy,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        repostCount: 0,
        postNumber: 0,
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
        if (!author) return null;

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

export const getFeedPosts = async (userId: string, followingIds: string[], lastVisible: DocumentData | null, pageSize: number) => {
    const authorsToFetch = [...new Set([userId, ...followingIds])];
    
    if (authorsToFetch.length === 0) {
        return { posts: [], lastVisible: null };
    }
    
    const queryConstraints: any[] = [
        where('authorId', 'in', authorsToFetch),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    ];

    if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
    }
    
    const postsQuery = query(collection(db, 'posts'), ...queryConstraints);
    const postSnapshots = await getDocs(postsQuery);

    const posts = postSnapshots.docs
        .map(doc => serializeDocument<Post>(doc))
        .filter((post): post is Post => post !== null);
    
    const populatedPosts = await populatePostAuthors(posts, userId);
    
    return {
        posts: populatedPosts,
        lastVisible: postSnapshots.docs[postSnapshots.docs.length - 1] || null
    };
};

export const getDiscoveryPosts = async (userId: string, followingIds: string[], lastVisible: DocumentData | null, pageSize: number) => {
    const usersToExclude = [...new Set([userId, ...followingIds])];
    
    const queryConstraints: any[] = [
        where('privacy', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    ];
    
    if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
    }
    
    const postsQuery = query(collection(db, 'posts'), ...queryConstraints);
    const postSnapshots = await getDocs(postsQuery);

    let posts = postSnapshots.docs
        .map(doc => serializeDocument<Post>(doc))
        .filter((post): post is Post => post !== null);
        
    // Manual filtering for "not-in" behavior, as Firestore has limitations
    posts = posts.filter(post => !usersToExclude.includes(post.authorId));

    const populatedPosts = await populatePostAuthors(posts, userId);

    return {
        posts: populatedPosts,
        lastVisible: postSnapshots.docs[postSnapshots.docs.length - 1] || null
    };
};
