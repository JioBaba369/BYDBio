
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from 'react';

const allUsers = [
  { id: 'user1', name: "Jane Doe", handle: "janedoe", avatarUrl: "https://placehold.co/100x100.png", following: false },
  { id: 'user2', name: "John Smith", handle: "johnsmith", avatarUrl: "https://placehold.co/100x100.png", following: true },
  { id: 'user3', name: "Alex Johnson", handle: "alexj", avatarUrl: "https://placehold.co/100x100.png", following: false },
  { id: 'user4', name: "Maria Garcia", handle: "mariag", avatarUrl: "https://placehold.co/100x100.png", following: true },
  { id: 'user5', name: "Chris Lee", handle: "chrisl", avatarUrl: "https://placehold.co/100x100.png", following: false },
  { id: 'user6', name: "Patricia Williams", handle: "patriciaw", avatarUrl: "https://placehold.co/100x100.png", following: false },
  { id: 'user7', name: "Michael Brown", handle: "mikeb", avatarUrl: "https://placehold.co/100x100.png", following: false },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [users, setUsers] = useState(allUsers);

  const filteredUsers = useMemo(() => {
    if (!query) {
      return [];
    }
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.handle.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, users]);

  const toggleFollow = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, following: !user.following } : user
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
                <Button size="sm" variant={user.following ? 'secondary' : 'default'} onClick={() => toggleFollow(user.id)}>
                  {user.following ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {user.following ? 'Following' : 'Follow'}
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
