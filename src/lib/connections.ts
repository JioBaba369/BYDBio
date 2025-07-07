
import {
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from './users';
import { createNotification } from './notifications';

// Follow a user
export const followUser = async (currentUserId: string, targetUserId: string) => {
  const batch = writeBatch(db);
  
  const currentUserRef = doc(db, 'users', currentUserId);
  batch.update(currentUserRef, {
    following: arrayUnion(targetUserId)
  });

  const targetUserRef = doc(db, 'users', targetUserId);
  batch.update(targetUserRef, {
      followerCount: increment(1)
  });

  await batch.commit();
  await createNotification(targetUserId, 'new_follower', currentUserId);
};

// Unfollow a user
export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  const batch = writeBatch(db);

  const currentUserRef = doc(db, 'users', currentUserId);
  batch.update(currentUserRef, {
    following: arrayRemove(targetUserId)
  });

  const targetUserRef = doc(db, 'users', targetUserId);
  batch.update(targetUserRef, {
      followerCount: increment(-1)
  });
  
  await batch.commit();
};

// Get list of users the current user is following
export const getFollowing = async (userId: string): Promise<User[]> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        return [];
    }
    const followingIds = userSnap.data().following || [];
    if (followingIds.length === 0) {
        return [];
    }
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'in', followingIds));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
};

// Get list of users who are following the current user
export const getFollowers = async (userId: string): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('following', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
};

// Get suggested users to follow
export const getSuggestedUsers = async (userId: string, followingIds: string[]): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    // Fetch a batch of users, ideally not the current user or those they follow.
    // Firestore's 'not-in' is limited to 10, so we can't reliably exclude all followed users.
    // A pragmatic approach is to fetch a limited number of users and filter them.
    const q = query(usersRef, limit(50));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    
    // Filter out the current user and anyone they already follow from the fetched batch
    const suggestions = users.filter(u => u.uid !== userId && !followingIds.includes(u.uid));

    return suggestions;
};
