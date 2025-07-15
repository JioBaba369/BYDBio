

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import type { PostWithAuthor } from '@/lib/posts';
import { toggleLikePost, repostPost, deletePost } from '@/lib/posts';
import type { DeleteConfirmationDialogProps } from '@/components/delete-confirmation-dialog';

interface UsePostActionsProps {
    posts: PostWithAuthor[];
    setPosts: React.Dispatch<React.SetStateAction<PostWithAuthor[]>>;
    currentUser: ReturnType<typeof useAuth>['user'];
    onAfterAction?: () => void | Promise<void>;
    onQuoteAction?: (post: PostWithAuthor) => void;
}

export function usePostActions({
    posts,
    setPosts,
    currentUser,
    onAfterAction,
    onQuoteAction,
}: UsePostActionsProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' | 'delete' } | null>(null);

    const handleLike = useCallback(async (postId: string) => {
        if (!currentUser || loadingAction) return;
        setLoadingAction({ postId, action: 'like' });

        const originalPosts = [...posts];
        setPosts(prevPosts =>
            prevPosts.map(p => {
                if (p.id === postId) {
                    const isLiked = !p.isLiked;
                    return { ...p, isLiked, likes: (p.likes || 0) + (isLiked ? 1 : -1) };
                }
                return p;
            })
        );

        try {
            await toggleLikePost(postId, currentUser.uid);
        } catch (error) {
            toast({ title: "Something went wrong", variant: "destructive" });
            setPosts(originalPosts);
        } finally {
            setLoadingAction(null);
        }
    }, [currentUser, loadingAction, posts, setPosts, toast]);

    const handleRepost = useCallback(async (postId: string) => {
        if (!currentUser || loadingAction) return;
        setLoadingAction({ postId, action: 'repost' });

        try {
            await repostPost(postId, currentUser.uid);
            toast({ title: "Reposted!" });
            if (onAfterAction) await onAfterAction();
        } catch (error: any) {
            toast({ title: error.message || "Failed to repost", variant: "destructive" });
        } finally {
            setLoadingAction(null);
        }
    }, [currentUser, loadingAction, toast, onAfterAction]);

    const handleQuote = useCallback((post: PostWithAuthor) => {
        if (onQuoteAction) {
            onQuoteAction(post);
        } else {
            sessionStorage.setItem('postToQuote', JSON.stringify(post));
            router.push('/feed');
        }
    }, [router, onQuoteAction]);

    const handleDelete = (post: PostWithAuthor) => {
        setPostToDelete(post);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = useCallback(async () => {
        if (!postToDelete || !currentUser) return;
        setIsDeleting(true);
        setLoadingAction({ postId: postToDelete.id, action: 'delete' });

        const originalPosts = [...posts];
        setPosts(prev => prev.filter(item => item.id !== postToDelete.id));

        try {
            await deletePost(postToDelete.id);
            toast({ title: "Post Deleted" });
        } catch (error) {
            toast({ title: "Failed to delete post", variant: "destructive" });
            setPosts(originalPosts);
        } finally {
            setIsDeleteDialogOpen(false);
            setPostToDelete(null);
            setIsDeleting(false);
            setLoadingAction(null);
        }
    }, [postToDelete, currentUser, posts, setPosts, toast]);
    
    // Props to be spread onto the DeleteConfirmationDialog component
    const dialogProps: Omit<DeleteConfirmationDialogProps, 'children'> = {
        open: isDeleteDialogOpen,
        onOpenChange: setIsDeleteDialogOpen,
        onConfirm: handleConfirmDelete,
        isLoading: isDeleting,
        itemName: "post",
        confirmationText: "DELETE"
    };

    return {
        handleLike,
        handleRepost,
        handleQuote,
        handleDelete,
        loadingAction,
        dialogProps
    };
}
