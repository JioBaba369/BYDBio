
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/users';
import { Search, Compass } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { FollowButton } from '@/components/follow-button';
import { useAuth } from '@/components/auth-provider';

export default function CreatorsClient({ initialUsers }: { initialUsers: User[] }) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedTerm) ||
      user.username.toLowerCase().includes(lowercasedTerm) ||
      (user.bio && user.bio.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, users]);
  
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
                            {currentUser && currentUser.uid !== user.uid && (
                                <div className="mt-4">
                                    <FollowButton
                                        targetUserId={user.uid}
                                        initialIsFollowing={currentUser.following.includes(user.uid)}
                                        initialFollowerCount={user.followerCount}
                                    />
                                </div>
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
