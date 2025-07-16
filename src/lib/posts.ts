
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

export type EmbeddedPostInfo = {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: string; // ISO string from client
};

export type EmbeddedPostInfoWithAuthor = Omit<EmbeddedPostInfo, 'authorId' | 'createdAt'> & {
  author: User;
  createdAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  category?: string;
  postNumber: number;
  likes: number;
  likedBy: string[];
  comments: number;
  createdAt: string; // ISO string
  repostCount?: number;
  privacy: 'public' | 'followers' | 'me';
  quotedPost?: EmbeddedPostInfo;
  originalPostId?: string; // If this is a repost, this is the ID of the original post
};

export type PostWithAuthor = Post & {
  author: User;
  isLiked?: boolean;
  quotedPost?: EmbeddedPostInfoWithAuthor;
  repost?: PostWithAuthor; // If it's a repost, the original post is nested here
};


export const createPost = async (
  data: Pick<Post, 'authorId' | 'content' | 'imageUrl' | 'privacy' | 'category'> & { quotedPost?: EmbeddedPostInfo }
): Promise<string> => {
    const userRef = doc(db, "users", data.authorId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found.");

    const postCount = userDoc.data().postCount || 0;
    const newPostNumber = postCount + 1;

    const keywords = [...new Set([
        ...(data.content ? data.content.toLowerCase().split(' ').filter(Boolean) : []),
        ...(data.category ? data.category.toLowerCase().split(' ').filter(Boolean) : []),
    ])];
    
    const postData = {
        authorId: data.authorId,
        content: data.content,
        imageUrl: data.imageUrl,
        privacy: data.privacy,
        category: data.category,
        quotedPost: data.quotedPost ? {
            ...data.quotedPost,
            createdAt: Timestamp.fromDate(new Date(data.quotedPost.createdAt))
        } : null,
        postNumber: newPostNumber,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        repostCount: 0,
        searchableKeywords: keywords,
    };

    const postRef = await addDoc(collection(db, 'posts'), postData);
    await updateDoc(userRef, { postCount: newPostNumber });
    return postRef.id;
};

export const deletePost = async (id: string) => {
    const postRef = doc(db, 'posts', id);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) throw new Error("Post not found.");
    
    const postData = postDoc.data() as Post;
    const batch = writeBatch(db);

    batch.delete(postRef);
    
    if (postData.originalPostId) {
        // It's a repost, decrement the original's repost count
        const originalPostRef = doc(db, 'posts', postData.originalPostId);
        batch.update(originalPostRef, { repostCount: increment(-1) });
    } else {
        // It's an original post, decrement the user's post count
        const authorRef = doc(db, 'users', postData.authorId);
        batch.update(authorRef, { postCount: increment(-1) });
    }

    await batch.commit();
};

export const toggleLikePost = async (postId: string, userId: string) => {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) throw new Error("Post not found");

    const postData = postDoc.data() as Post;
    const isLiked = postData.likedBy.includes(userId);

    if (isLiked) {
        await updateDoc(postRef, { likedBy: arrayRemove(userId), likes: increment(-1) });
    } else {
        await updateDoc(postRef, { likedBy: arrayUnion(userId), likes: increment(1) });
        await createNotification(postData.authorId, 'new_like', userId, { entityId: postId, entityTitle: postData.content });
    }
    return !isLiked;
};

export const repostPost = async (originalPostId: string, reposterId: string): Promise<string> => {
    const originalPostRef = doc(db, 'posts', originalPostId);
    const originalPostDoc = await getDoc(originalPostRef);
    if (!originalPostDoc.exists()) throw new Error("Post does not exist.");

    const originalPostData = originalPostDoc.data() as Post;
    if (originalPostData.authorId === reposterId) throw new Error("You cannot repost your own post.");

    const repostData = {
        authorId: reposterId,
        content: '',
        imageUrl: null,
        privacy: originalPostData.privacy,
        originalPostId: originalPostId,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        repostCount: 0,
        postNumber: 0,
    };
    
    const batch = writeBatch(db);
    batch.update(originalPostRef, { repostCount: increment(1) });
    const newPostRef = doc(collection(db, 'posts'));
    batch.set(newPostRef, repostData);
    await batch.commit();

    return newPostRef.id;
};

export const populatePostAuthors = async (posts: Post[], viewerId?: string | null): Promise<PostWithAuthor[]> => {
    if (posts.length === 0) return [];
    
    const authorIds = new Set<string>();
    const originalPostIds = new Set<string>();

    posts.forEach(post => {
        authorIds.add(post.authorId);
        if (post.quotedPost) authorIds.add(post.quotedPost.authorId);
        if (post.originalPostId) originalPostIds.add(post.originalPostId);
    });
    
    let originalPosts: Post[] = [];
    if(originalPostIds.size > 0) {
        const originalPostsQuery = query(collection(db, 'posts'), where('__name__', 'in', Array.from(originalPostIds)));
        const originalPostsSnapshot = await getDocs(originalPostsQuery);
        originalPosts = originalPostsSnapshot.docs.map(doc => serializeDocument<Post>(doc)).filter((p): p is Post => p !== null);
        originalPosts.forEach(p => authorIds.add(p.authorId));
    }
    const originalPostsMap = new Map(originalPosts.map(p => [p.id, p]));
    
    const authors = await getUsersByIds(Array.from(authorIds));
    const authorMap = new Map(authors.map(a => [a.uid, a]));

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
                    author: quotedAuthor
                };
            }
        }
        
        if (post.originalPostId) {
            const originalPost = originalPostsMap.get(post.originalPostId);
            if (originalPost) {
                const originalAuthor = authorMap.get(originalPost.authorId);
                if (originalAuthor) {
                    populatedPost.repost = {
                        ...originalPost,
                        author: originalAuthor,
                        isLiked: viewerId ? originalPost.likedBy.includes(viewerId) : false
                    };
                }
            }
        }
        
        return populatedPost;
    }).filter((p): p is PostWithAuthor => p !== null);
};


interface GetPostsParams {
    userId: string;
    feedType: 'following' | 'discovery';
    followingIds: string[];
    pageSize: number;
    lastPostDate: string | null;
}

export const getPosts = async ({ userId, feedType, followingIds, pageSize, lastPostDate }: GetPostsParams): Promise<PostWithAuthor[]> => {
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(pageSize));

    if (lastPostDate) {
        q = query(q, startAfter(Timestamp.fromDate(new Date(lastPostDate))));
    }

    if (feedType === 'following') {
        const authorsToFetch = [...new Set([userId, ...followingIds])];
        if (authorsToFetch.length > 0) {
            q = query(q, where('authorId', 'in', authorsToFetch));
        } else {
            return []; // User follows no one, feed is empty
        }
    } else { // 'discovery'
        q = query(q, where('privacy', '==', 'public'));
        if (followingIds.length > 0) {
            // Firestore 'not-in' is limited, but we can exclude the user themselves
            q = query(q, where('authorId', '!=', userId));
        }
    }
    
    const postSnapshots = await getDocs(q);
    const posts = postSnapshots.docs.map(doc => serializeDocument<Post>(doc)).filter((p): p is Post => p !== null);

    // For discovery feed, we need to manually filter out posts from users the current user follows
    const finalPosts = feedType === 'discovery' 
        ? posts.filter(p => !followingIds.includes(p.authorId)) 
        : posts;
    
    return populatePostAuthors(finalPosts, userId);
};

export const getPostsByUser = async (userId: string, viewerId?: string | null): Promise<PostWithAuthor[]> => {
  const isOwner = viewerId === userId;
  
  const q = query(
    collection(db, 'posts'), 
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const allPosts = querySnapshot.docs
    .map(doc => serializeDocument<Post>(doc))
    .filter((post): post is Post => post !== null);
    
  // Filter by privacy based on viewer
  const visiblePosts = allPosts.filter(post => {
      if (post.privacy === 'public') return true;
      if (isOwner) return true; // Owner can see all their own posts
      // A non-owner follower can't see 'me' posts, so no special check needed here yet.
      // Logic for followers seeing 'followers' posts would be applied in getProfile, not here.
      // For a direct user page view, we assume public only for non-owners.
      return false;
  })
  
  return populatePostAuthors(visiblePosts, viewerId);
};
