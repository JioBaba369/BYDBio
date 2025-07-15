
'use server';

import { followUser, unfollowUser } from '@/lib/connections';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const followSchema = z.object({
  currentUserId: z.string(),
  targetUserId: z.string(),
  isFollowing: z.boolean(),
  path: z.string(),
});

export async function toggleFollowAction(formData: FormData): Promise<{ success: boolean; error?: string; newFollowerCount?: number }> {
  const validatedFields = followSchema.safeParse({
    currentUserId: formData.get('currentUserId'),
    targetUserId: formData.get('targetUserId'),
    isFollowing: formData.get('isFollowing') === 'true',
    path: formData.get('path'),
  });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { currentUserId, targetUserId, isFollowing, path } = validatedFields.data;

  try {
    if (isFollowing) {
      await unfollowUser(currentUserId, targetUserId);
    } else {
      await followUser(currentUserId, targetUserId);
    }
    
    // Revalidate paths to update follower lists on other pages
    revalidatePath(path);
    revalidatePath('/connections');

    // Fetch the new follower count to return to the client
    const targetUserRef = doc(db, 'users', targetUserId);
    const userDoc = await getDoc(targetUserRef);
    const newFollowerCount = userDoc.exists() ? userDoc.data().followerCount : 0;

    return { success: true, newFollowerCount };
  } catch (error) {
    console.error('Toggle follow error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}
