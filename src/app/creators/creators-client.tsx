
'use client';

import { useState, useMemo, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import type { User } from '@/lib/users';
import { Search, Compass, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toggleFollowAction } from '@/app/actions/follow';


const FollowButton = ({ targetUser, currentUser, isFollowing }: { targetUser: User; currentUser: User | null; isFollowing: boolean }) => {
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleFollow = () => {
        if (!currentUser) return;
        startTransition(() => {
            const formData = new FormData();
            formData.append('currentUserId', currentUser.uid);
            formData.append('targetUserId', targetUser.uid);
            formData.append('isFollowing', String(isFollowing));
            formData.append('path', pathname);
            toggleFollowAction(formData);
        });
    }

    if (!currentUser || currentUser.uid === targetUser.uid) {
        return null;
    }

    return (
        <Button size="sm" variant={isFollowing ? 'secondary' : 'default'} onClick={handleFollow} disabled={isPending} className="w-full mt-4">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    )
}


export default function CreatorsClient({ initialUsers }: { initialUsers: User[] }) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return initialUsers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return initialUsers.filter(user => 
      user.name.toLowerCase().includes(lowercasedTerm) ||
      user.username.toLowerCase().includes(lowercasedTerm) ||
      (user.bio && user.bio.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, initialUsers]);
  
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Creators</h1>
            <p className="text-muted-foreground">Discover other profiles in the community.</p>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search for creators by name, username, or bio..."
                className="pl-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredUsers.map(user => (
                    <Card key={user.uid} className="text-center transition-shadow hover:shadow-md">
                        <CardContent className="p-6">
                             <Link href={`/u/${user.username}`}>
                                <Avatar className="h-24 w-24 mx-auto">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-lg mt-4 hover:underline">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                <p className="text-sm text-muted-foreground mt-2 h-10 line-clamp-2">{user.bio}</p>
                            </Link>
                            {!authLoading && (
                                <FollowButton 
                                    targetUser={user} 
                                    currentUser={currentUser} 
                                    isFollowing={currentUser?.following.includes(user.uid) || false} 
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <Card>
                <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <Compass className="h-12 w-12 text-gray-400" />
                    <h3 className="font-semibold text-foreground">No Creators Found</h3>
                    <p>
                        We couldn't find any creators matching your search. Try a different term.
                    </p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
