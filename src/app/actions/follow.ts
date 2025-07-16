
'use server';

import { followUser, unfollowUser, isFollowing } from '@/lib/connections';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const followSchema = z.object({
  currentUserId: z.string().min(1, 'Current user ID is required.'),
  targetUserId: z.string().min(1, 'Target user ID is required.'),
  path: z.string().min(1, 'Path is required.'),
});

export async function toggleFollowAction(currentUserId: string, targetUserId: string, path: string): Promise<{ success: boolean; error?: string; newFollowerCount?: number }> {
  const validatedFields = followSchema.safeParse({
    currentUserId,
    targetUserId,
    path,
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(i => i.message).join(', ');
    return { success: false, error: `Invalid input: ${errorMessages}` };
  }

  const { currentUserId: validatedCurrentUserId, targetUserId: validatedTargetUserId, path: revalidationPath } = validatedFields.data;

  if (validatedCurrentUserId === validatedTargetUserId) {
    return { success: false, error: 'You cannot follow yourself.' };
  }

  try {
    const currentlyFollowing = await isFollowing(validatedCurrentUserId, validatedTargetUserId);

    if (currentlyFollowing) {
      await unfollowUser(validatedCurrentUserId, validatedTargetUserId);
    } else {
      await followUser(validatedCurrentUserId, validatedTargetUserId);
    }
    
    revalidatePath(revalidationPath);
    revalidatePath(`/u/${validatedTargetUserId}`);
    revalidatePath('/connections');

    const targetUserRef = doc(db, 'users', validatedTargetUserId);
    const userDoc = await getDoc(targetUserRef);
    const newFollowerCount = userDoc.exists() ? userDoc.data().followerCount || 0 : 0;

    return { success: true, newFollowerCount };
  } catch (error) {
    console.error('Toggle follow error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Something went wrong.' };
  }
}
