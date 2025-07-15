
'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { toggleFollowAction } from '@/app/actions/follow';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    initialFollowerCount: number;
    className?: string;
}

export function FollowButton({ targetUserId, initialIsFollowing, initialFollowerCount, className }: FollowButtonProps) {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    
    const handleFollow = () => {
        if (!currentUser) {
            toast({ title: 'Please sign in to follow users.', variant: 'destructive' });
            router.push('/auth/sign-in');
            return;
        }

        if (isPending) return;

        startTransition(async () => {
            const wasFollowing = isFollowing;
            // Optimistic update
            setIsFollowing(!wasFollowing);
            setFollowerCount(c => c + (wasFollowing ? -1 : 1));
            
            const result = await toggleFollowAction(currentUser.uid, targetUserId, wasFollowing);

            if (!result.success) {
                // Revert on error
                setIsFollowing(wasFollowing);
                setFollowerCount(c => c + (wasFollowing ? 1 : -1));
                toast({ title: result.error || 'Something went wrong', variant: 'destructive' });
            } else if (result.newFollowerCount !== undefined) {
                // Sync with server state
                setFollowerCount(result.newFollowerCount);
            }
        });
    };

    const Icon = isFollowing ? UserCheck : UserPlus;

    return (
        <Button onClick={handleFollow} disabled={isPending} variant={isFollowing ? 'secondary' : 'default'} className={className}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}
