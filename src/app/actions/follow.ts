'use server';

import { followUser, unfollowUser } from '@/lib/connections';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const followSchema = z.object({
  currentUserId: z.string(),
  targetUserId: z.string(),
  isFollowing: z.boolean(),
  path: z.string(),
});

export async function toggleFollowAction(formData: FormData) {
  const validatedFields = followSchema.safeParse({
    currentUserId: formData.get('currentUserId'),
    targetUserId: formData.get('targetUserId'),
    isFollowing: formData.get('isFollowing') === 'true',
    path: formData.get('path'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { currentUserId, targetUserId, isFollowing, path } = validatedFields.data;

  try {
    if (isFollowing) {
      await unfollowUser(currentUserId, targetUserId);
    } else {
      await followUser(currentUserId, targetUserId);
    }
    
    // Revalidate all relevant paths
    revalidatePath(path);
    revalidatePath('/connections');
    if (path.startsWith('/u/')) {
        const username = path.split('/')[2];
        revalidatePath(`/u/${username}`);
    }


    return { success: true };
  } catch (error) {
    console.error('Toggle follow error:', error);
    return { error: 'Something went wrong.' };
  }
}
