
'use client';

import type { User } from '@/lib/users';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuthorCardProps {
  author: User;
  isOwner: boolean;
  authorTypeLabel?: string; // e.g., "Host", "Seller", "Poster", "Provider", "Owner"
}

export function AuthorCard({ author, isOwner, authorTypeLabel = "Creator" }: AuthorCardProps) {

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
        <p className="text-sm text-muted-foreground mt-2">{author.followerCount} followers</p>
      </CardContent>
    </Card>
  );
}
