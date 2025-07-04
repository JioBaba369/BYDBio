
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

// Get suggested users to follow (simplified version)
// NOTE: This is not scalable for production. A real implementation would use a more sophisticated algorithm
// and backend service to generate suggestions.
export const getSuggestedUsers = async (userId: string, followingIds: string[]): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    
    const allUserIds = querySnapshot.docs.map(doc => doc.id);
    const nonFollowingIds = allUserIds.filter(id => !followingIds.includes(id) && id !== userId);
    
    if (nonFollowingIds.length === 0) {
        return [];
    }

    // Fetch the full user objects for the suggestions
    const suggestionsQuery = query(usersRef, where('uid', 'in', nonFollowingIds.slice(0, 10))); // Limit to 10 suggestions
    const suggestionsSnapshot = await getDocs(suggestionsQuery);
    return suggestionsSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
};
