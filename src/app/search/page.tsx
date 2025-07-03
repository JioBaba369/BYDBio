
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from 'react';
import { allUsers as initialUsers } from '@/lib/users';
import { currentUser } from '@/lib/mock-data';

// We need to map the full user list to include whether the current user follows them
const mapUsersWithFollowingState = (users: typeof initialUsers, me: typeof currentUser) => {
    return users
      .filter(u => u.id !== me.id) // Exclude current user from search results
      .map(user => ({
        ...user,
        isFollowedByCurrentUser: me.following.includes(user.id),
      }));
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  // State to hold the mapped users, initialized with the current following state
  const [users, setUsers] = useState(mapUsersWithFollowingState(initialUsers, currentUser));

  const filteredUsers = useMemo(() => {
    if (!query) {
      return [];
    }
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.handle.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, users]);

  // This is a mock function. In a real app this would be an API call.
  // This will only affect the client state and will be reset on page refresh.
  const toggleFollow = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isFollowedByCurrentUser: !user.isFollowedByCurrentUser } : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <SearchIcon className="h-8 w-8" />
            Search Results
        </h1>
        {query && <p className="text-muted-foreground">Showing results for: "{query}"</p>}
      </div>

      {!query ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Please enter a search term in the sidebar to find users.</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.handle}</p>
                  </div>
                </div>
                <Button size="sm" variant={user.isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => toggleFollow(user.id)}>
                  {user.isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {user.isFollowedByCurrentUser ? 'Following' : 'Follow'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No users found for "{query}".</p>
        </div>
      )}
    </div>
  );
}
