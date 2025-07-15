
'use server';

import { revalidatePath } from 'next/cache';
import { deletePost as deletePostDb, repostPost as repostPostDb, toggleLikePost as toggleLikePostDb } from '@/lib/posts';

export async function handleDeletePost(postId: string, postPath: string) {
    try {
        await deletePostDb(postId);
        revalidatePath(postPath);
    } catch (error: any) {
        throw new Error(error.message || "Failed to delete post.");
    }
}

export async function handleToggleLike(postId: string, userId: string, postPath: string) {
    try {
        await toggleLikePostDb(postId, userId);
        revalidatePath(postPath);
    } catch (error: any) {
        throw new Error(error.message || "Failed to toggle like.");
    }
}

export async function handleRepost(originalPostId: string, reposterId: string, postPath: string) {
     try {
        await repostPostDb(originalPostId, reposterId);
        revalidatePath(postPath);
    } catch (error: any) {
        throw new Error(error.message || "Failed to repost.");
    }
}
