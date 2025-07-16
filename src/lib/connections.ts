
'use server';
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
import { serializeDocument } from './firestore-utils';

// Check if a user is following another
export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        return false;
    }
    const followingIds = userSnap.data().following || [];
    return followingIds.includes(targetUserId);
};


// Follow a user
export const followUser = async (currentUserId: string, targetUserId: string) => {
  if (currentUserId === targetUserId) {
    throw new Error("You cannot follow yourself.");
  }

  const batch = writeBatch(db);
  
  const currentUserRef = doc(db, 'users', currentUserId);
  batch.update(currentUserRef, {
    following: arrayUnion(targetUserId)
  });

  const targetUserRef = doc(db, 'users', targetUserId);
  const targetUserDoc = await getDoc(targetUserRef);
  
  if (targetUserDoc.exists()) {
      batch.update(targetUserRef, { followerCount: increment(1) });
  } else {
      // This case should ideally not happen if users are created correctly
      batch.set(targetUserRef, { followerCount: 1 }, { merge: true });
  }

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
  const targetUserDoc = await getDoc(targetUserRef);
  
  if (targetUserDoc.exists() && (targetUserDoc.data().followerCount || 0) > 0) {
      batch.update(targetUserRef, { followerCount: increment(-1) });
  } else {
      batch.set(targetUserRef, { followerCount: 0 }, { merge: true });
  }
  
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
    return querySnapshot.docs.map(doc => serializeDocument<User>(doc)).filter((user): user is User => user !== null);
};

// Get list of users who are following the current user
export const getFollowers = async (userId: string): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('following', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => serializeDocument<User>(doc)).filter((user): user is User => user !== null);
};

// Get suggested users to follow
export const getSuggestedUsers = async (userId: string, count: number = 10): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    // Fetch a larger batch of users to increase the chance of finding suggestions.
    const q = query(usersRef, limit(100));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => serializeDocument<User>(doc)).filter((user): user is User => user !== null);

    const userDoc = await getDoc(doc(db, 'users', userId));
    const followingIds = userDoc.exists() ? userDoc.data().following || [] : [];
    
    // Filter out the current user and anyone they already follow from the fetched batch
    const suggestions = users.filter(u => u.uid !== userId && !followingIds.includes(u.uid));

    // Return a smaller, more manageable list
    return suggestions.slice(0, count);
};
