
'use client';

import { useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { toggleFollowAction } from '@/app/actions/follow';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    initialFollowerCount: number;
    className?: string;
}

export function FollowButton({ 
    targetUserId, 
    initialIsFollowing, 
    initialFollowerCount, 
    className 
}: FollowButtonProps) {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    
    const handleFollow = useCallback(() => {
        if (!currentUser) {
            toast({ 
                title: 'Authentication required',
                description: 'Please sign in to follow users.',
                variant: 'destructive' 
            });
            router.push('/auth/sign-in');
            return;
        }

        if (currentUser.uid === targetUserId) {
            toast({ 
                title: 'Invalid action',
                description: 'You cannot follow yourself.',
                variant: 'destructive' 
            });
            return;
        }

        if (isPending) return;

        startTransition(async () => {
            const wasFollowing = isFollowing;
            const previousFollowerCount = followerCount;
            
            // Optimistic update
            setIsFollowing(!wasFollowing);
            setFollowerCount(prev => prev + (wasFollowing ? -1 : 1));
            
            try {
                const result = await toggleFollowAction(
                    currentUser.uid, 
                    targetUserId, 
                    pathname
                );

                if (!result.success) {
                    // Revert on error
                    setIsFollowing(wasFollowing);
                    setFollowerCount(previousFollowerCount);
                    toast({ 
                        title: 'Error',
                        description: result.error || 'Something went wrong',
                        variant: 'destructive' 
                    });
                } else if (result.newFollowerCount !== undefined) {
                    // Sync with server state
                    setFollowerCount(result.newFollowerCount);
                    toast({
                        title: wasFollowing ? 'Unfollowed' : 'Following',
                        description: wasFollowing ? 'You are no longer following this user.' : 'You are now following this user.',
                    });
                }
            } catch (error) {
                // Revert on error
                setIsFollowing(wasFollowing);
                setFollowerCount(previousFollowerCount);
                toast({ 
                    title: 'Error',
                    description: 'A network error occurred. Please try again.',
                    variant: 'destructive' 
                });
            }
        });
    }, [currentUser, targetUserId, isFollowing, followerCount, pathname, isPending, toast, router]);

    const Icon = isFollowing ? UserCheck : UserPlus;

    return (
        <Button 
            onClick={handleFollow} 
            disabled={isPending || !currentUser || currentUser.uid === targetUserId} 
            variant={isFollowing ? 'secondary' : 'default'} 
            className={className}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icon className="mr-2 h-4 w-4" />
            )}
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}
