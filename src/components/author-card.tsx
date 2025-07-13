
'use client';

import type { User } from '@/lib/users';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/connections';
import { useRouter } from 'next/navigation';

interface AuthorCardProps {
  author: User;
  isOwner: boolean;
  authorTypeLabel?: string; // e.g., "Host", "Seller", "Poster", "Provider", "Owner"
}

export function AuthorCard({ author, isOwner, authorTypeLabel = "Creator" }: AuthorCardProps) {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(currentUser?.following.includes(author.uid) || false);
  const [followerCount, setFollowerCount] = useState(author.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to follow users.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (isOwner) return;

    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;

    setIsFollowing(!currentlyFollowing);
    setFollowerCount(prev => prev + (!currentlyFollowing ? 1 : -1));

    try {
        if (currentlyFollowing) {
            await unfollowUser(currentUser.uid, author.uid);
            toast({ title: `Unfollowed ${author.name}` });
        } else {
            await followUser(currentUser.uid, author.uid);
            toast({ title: `You are now following ${author.name}` });
        }
    } catch (error) {
        setIsFollowing(currentlyFollowing);
        setFollowerCount(prev => prev + (currentlyFollowing ? 1 : -1));
        toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
        setIsFollowLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">About the {authorTypeLabel}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Link href={`/u/${author.username}`} className="block">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={author.avatarUrl} data-ai-hint="person portrait" />
            <AvatarFallback>{author.avatarFallback}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/u/${author.username}`} className="font-semibold hover:underline">{author.name}</Link>
        <p className="text-sm text-muted-foreground">@{author.username}</p>
        <p className="text-sm text-muted-foreground mt-2">{followerCount.toLocaleString()} followers</p>
         {!isOwner && currentUser && (
            <Button onClick={handleFollowToggle} disabled={isFollowLoading} className="w-full mt-4">
                {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
            </Button>
         )}
      </CardContent>
    </Card>
  );
}
