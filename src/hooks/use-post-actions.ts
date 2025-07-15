
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import type { PostWithAuthor } from '@/lib/posts';
import type { DeleteConfirmationDialogProps } from '@/components/delete-confirmation-dialog';
import { handleDeletePost } from '@/app/actions/posts';

interface UsePostActionsProps {
    posts: PostWithAuthor[];
    setPosts: React.Dispatch<React.SetStateAction<PostWithAuthor[]>>;
    currentUser: ReturnType<typeof useAuth>['user'];
    onQuoteAction?: (post: PostWithAuthor) => void;
}

export function usePostActions({
    posts,
    setPosts,
    currentUser,
    onQuoteAction,
}: UsePostActionsProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

        const result = await handleDeletePost(postToDelete.id, `/u/${postToDelete.author.username}`);

        if (result.success) {
            toast({ title: "Post Deleted" });
            setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        } else {
            toast({ title: "Failed to delete post", description: result.error, variant: "destructive" });
        }

        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
        setIsDeleting(false);
    }, [postToDelete, currentUser, setPosts, toast]);
    
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
        handleQuote,
        handleDelete,
        dialogProps
    };
}
