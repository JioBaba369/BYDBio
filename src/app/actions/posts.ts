
'use server';

import { revalidatePath } from 'next/cache';
import { deletePost as deletePostDb, repostPost as repostPostDb, toggleLikePost as toggleLikePostDb } from '@/lib/posts';

export async function handleDeletePost(postId: string, postPath: string) {
    try {
        await deletePostDb(postId);
        revalidatePath(postPath);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function handleToggleLike(postId: string, userId: string, postPath: string) {
    try {
        await toggleLikePostDb(postId, userId);
        revalidatePath(postPath);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function handleRepost(originalPostId: string, reposterId: string, postPath: string) {
     try {
        await repostPostDb(originalPostId, reposterId);
        revalidatePath(postPath);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
