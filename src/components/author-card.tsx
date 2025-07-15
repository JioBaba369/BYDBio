
'use client';

import type { User } from '@/lib/users';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from './auth-provider';
import { FollowButton } from './follow-button';

interface AuthorCardProps {
  author: User;
  isOwner: boolean;
  authorTypeLabel?: string;
}

export function AuthorCard({ author, isOwner, authorTypeLabel = "Creator" }: AuthorCardProps) {
  const { user: currentUser } = useAuth();
  const isFollowing = currentUser?.following.includes(author.uid) || false;

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
         {!isOwner && currentUser && (
            <div className="w-full mt-4">
              <FollowButton
                targetUserId={author.uid}
                initialIsFollowing={isFollowing}
                initialFollowerCount={author.followerCount}
              />
            </div>
         )}
      </CardContent>
    </Card>
  );
}
