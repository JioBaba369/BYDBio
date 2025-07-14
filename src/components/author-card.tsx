
'use client';

import type { User } from '@/lib/users';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { toggleFollowAction } from '@/app/actions/follow';


interface AuthorCardProps {
  author: User;
  isOwner: boolean;
  authorTypeLabel?: string;
}

export function AuthorCard({ author, isOwner, authorTypeLabel = "Creator" }: AuthorCardProps) {
  const { user: currentUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const isFollowing = currentUser?.following.includes(author.uid) || false;
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to follow users.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (isOwner) return;

    startTransition(() => {
        const formData = new FormData();
        formData.append('currentUserId', currentUser.uid);
        formData.append('targetUserId', author.uid);
        formData.append('isFollowing', String(isFollowing));
        formData.append('path', pathname);
        toggleFollowAction(formData);
    });
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
        <p className="text-sm text-muted-foreground mt-2">{(author.followerCount || 0).toLocaleString()} followers</p>
         {!isOwner && currentUser && (
            <Button onClick={handleFollowToggle} disabled={isPending} className="w-full mt-4">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
            </Button>
         )}
      </CardContent>
    </Card>
  );
}
