
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/users';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/connections';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthorCardProps {
  author: User;
  isOwner: boolean;
  authorTypeLabel: string; // e.g., "Host", "Seller", "Poster", "Provider", "Owner"
}

export function AuthorCard({ author, isOwner, authorTypeLabel }: AuthorCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(author.uid) || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(author.uid));
    }
  }, [currentUser, author.uid]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({ title: "Please sign in to follow users.", variant: "destructive" });
      router.push('/auth/sign-in');
      return;
    }
    if (isOwner) return;

    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;

    // Optimistic UI update
    setIsFollowing(!currentlyFollowing);

    try {
      if (currentlyFollowing) {
        await unfollowUser(currentUser.uid, author.uid);
        toast({ title: `Unfollowed ${author.name}` });
      } else {
        await followUser(currentUser.uid, author.uid);
        toast({ title: `You are now following ${author.name}` });
      }
    } catch (error) {
      // Rollback on error
      setIsFollowing(currentlyFollowing);
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
         <div className="mt-4 w-full space-y-2">
            {currentUser && !isOwner && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                >
                    {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {isFollowing ? 'Following' : 'Follow'}
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
