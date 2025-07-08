'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { toggleSubscription, type ContentType } from '@/lib/subscriptions';

interface FollowButtonProps {
    contentId: string;
    contentType: ContentType;
    authorId: string;
    entityTitle: string;
    initialIsFollowing: boolean;
    initialFollowerCount: number;
}

export function FollowButton({ contentId, contentType, authorId, entityTitle, initialIsFollowing, initialFollowerCount }: FollowButtonProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);

    const handleFollow = () => {
        if (!user) {
            toast({ title: 'Please sign in to follow.', variant: 'destructive' });
            router.push('/auth/sign-in');
            return;
        }

        startTransition(async () => {
            // Optimistic update
            const wasFollowing = isFollowing;
            setIsFollowing(!wasFollowing);
            setFollowerCount(c => c + (wasFollowing ? -1 : 1));

            try {
                await toggleSubscription(user.uid, contentId, contentType, authorId, entityTitle);
            } catch (error) {
                // Revert on error
                setIsFollowing(wasFollowing);
                setFollowerCount(c => c + (wasFollowing ? 1 : -1));
                toast({ title: 'Something went wrong', variant: 'destructive' });
            }
        });
    };

    const Icon = isFollowing ? BellOff : Bell;

    return (
        <Button onClick={handleFollow} disabled={isPending} variant={isFollowing ? 'secondary' : 'default'} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
            {isFollowing ? 'Unfollow' : 'Follow'} ({followerCount.toLocaleString()})
        </Button>
    );
}
