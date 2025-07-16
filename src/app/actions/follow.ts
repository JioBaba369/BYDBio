
'use server';

import { followUser, unfollowUser, isFollowing } from '@/lib/connections';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const followSchema = z.object({
  currentUserId: z.string(),
  targetUserId: z.string(),
  path: z.string(),
});

export async function toggleFollowAction(currentUserId: string, targetUserId: string, path: string): Promise<{ success: boolean; error?: string; newFollowerCount?: number }> {
  const validatedFields = followSchema.safeParse({
    currentUserId,
    targetUserId,
    path,
  });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { currentUserId: validatedCurrentUserId, targetUserId: validatedTargetUserId, path: revalidationPath } = validatedFields.data;

  try {
    const currentlyFollowing = await isFollowing(validatedCurrentUserId, validatedTargetUserId);

    if (currentlyFollowing) {
      await unfollowUser(validatedCurrentUserId, validatedTargetUserId);
    } else {
      await followUser(validatedCurrentUserId, validatedTargetUserId);
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
