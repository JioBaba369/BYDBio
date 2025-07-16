
'use server';

import { followUser, unfollowUser } from '@/lib/connections';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const followSchema = z.object({
  currentUserId: z.string(),
  targetUserId: z.string(),
  newIsFollowingState: z.boolean(),
  path: z.string(),
});

export async function toggleFollowAction(currentUserId: string, targetUserId: string, newIsFollowingState: boolean, path: string): Promise<{ success: boolean; error?: string; newFollowerCount?: number }> {
  const validatedFields = followSchema.safeParse({
    currentUserId,
    targetUserId,
    newIsFollowingState,
    path,
  });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { currentUserId: validatedCurrentUserId, targetUserId: validatedTargetUserId, newIsFollowingState: validatedIsFollowing, path: revalidationPath } = validatedFields.data;

  try {
    if (validatedIsFollowing) {
      await followUser(validatedCurrentUserId, validatedTargetUserId);
    } else {
      await unfollowUser(validatedCurrentUserId, validatedTargetUserId);
    }
    
    // Revalidate paths to update follower lists on other pages
    revalidatePath(revalidationPath);
    revalidatePath(`/u/${validatedTargetUserId}`);
    revalidatePath('/connections');

    // Fetch the new follower count to return to the client
    const targetUserRef = doc(db, 'users', validatedTargetUserId);
    const userDoc = await getDoc(targetUserRef);
    const newFollowerCount = userDoc.exists() ? userDoc.data().followerCount || 0 : 0;

    return { success: true, newFollowerCount };
  } catch (error) {
    console.error('Toggle follow error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}
