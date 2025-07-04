
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tag, Calendar, Users, Tags, DollarSign } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { User } from '@/lib/users';
import { useAuth } from '@/components/auth-provider';
import { searchUsers } from '@/lib/users';
import { followUser, unfollowUser } from '@/lib/connections';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
// Note: Full-text search across all content is not scalable on the client.
// This is a simplified implementation for demonstration.
// A production app should use a dedicated search service like Algolia or Typesense.
import { getAllEvents } from '@/lib/events';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/lib/listings';
import type { Job } from '@/lib/jobs';
import type { Event, EventWithAuthor } from '@/lib/events';
import type { Offer } from '@/lib/offers';

type ItemWithAuthor<T> = T & { author: Pick<User, 'id' | 'name' | 'username' | 'avatarUrl' | 'avatarFallback'> };

function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('...');

  useEffect(() => {
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);

  return <>{formattedDate}</>;
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    users: User[];
    listings: any[];
    opportunities: any[];
    events: any[];
    offers: any[];
  }>({ users: [], listings: [], opportunities: [], events: [], offers: [] });

  useEffect(() => {
    const performSearch = async () => {
        if (!query) return;
        setIsLoading(true);

        try {
            // User search is indexed and efficient
            const userResults = await searchUsers(query);

            // The following searches are NOT scalable and are for demonstration only.
            // They fetch all documents and filter on the client.
            const lowerCaseQuery = query.toLowerCase();

            const listingsRef = collection(db, 'listings');
            const jobsRef = collection(db, 'jobs');
            const eventsRef = collection(db, 'events');
            const offersRef = collection(db, 'offers');

            const [listingsSnap, jobsSnap, eventsSnap, offersSnap] = await Promise.all([
                getDocs(listingsRef),
                getDocs(jobsRef),
                getDocs(eventsRef),
                getDocs(offersRef),
            ]);

            const listingsResults = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
            const jobsResults = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.title.toLowerCase().includes(lowerCaseQuery) || item.company.toLowerCase().includes(lowerCaseQuery));
            const eventsResults = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
            const offersResults = offersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.title.toLowerCase().includes(lowerCaseQuery));
            
            setResults({
                users: userResults.filter(u => u.id !== user?.id), // Exclude self from results
                listings: listingsResults,
                opportunities: jobsResults,
                events: eventsResults,
                offers: offersResults
            });

        } catch (err) {
            console.error("Search failed:", err);
            toast({ title: "Search failed", description: "Could not perform search.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    performSearch();
  }, [query, user, toast]);

  const handleToggleFollow = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!user) return;
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(user.uid, targetUserId);
        toast({ title: "Unfollowed" });
      } else {
        await followUser(user.uid, targetUserId);
        toast({ title: "Followed" });
      }
      // Optimistically update the UI
      setResults(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === targetUserId ? { ...u, isFollowedByCurrentUser: !isCurrentlyFollowing } : u)
      }));
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };


  if (!query) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
                    <SearchIcon className="h-8 w-8" />
                    Search
                </h1>
                <p className="text-muted-foreground">Search for users, listings, opportunities, and more.</p>
            </div>
             <Card className="text-center">
              <CardContent className="p-10 text-muted-foreground">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-foreground">Find what you're looking for</h3>
                <p>Use the search bar in the sidebar to discover users, content, and more across the platform.</p>
              </CardContent>
            </Card>
        </div>
    )
  }

  if (isLoading || authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Card><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
            <SearchIcon className="h-8 w-8" />
            Search Results
        </h1>
        <p className="text-muted-foreground">Showing results for: <span className="text-foreground font-semibold">"{query}"</span></p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="users">Users ({results.users.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({results.listings.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities ({results.opportunities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({results.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
            {results.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => {
                        const isFollowedByCurrentUser = user?.following.includes(u.id) || false;
                        return (
                        <Card key={u.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <Link href={`/u/${u.username}`} className="flex items-center gap-4 hover:underline">
                            <Avatar>
                                <AvatarImage src={u.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{u.name}</p>
                                <p className="text-sm text-muted-foreground">@{u.handle}</p>
                            </div>
                            </Link>
                            <Button size="sm" variant={isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => handleToggleFollow(u.id, isFollowedByCurrentUser)}>
                            {isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowedByCurrentUser ? 'Following' : 'Follow'}
                            </Button>
                        </CardContent>
                        </Card>
                    )})}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Users Found</h3>
                        <p>We couldn't find any users matching "{query}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        
        <TabsContent value="listings">
             {results.listings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.listings.map((item) => (
                        <Card key={item.id} className="flex flex-col transition-all hover:shadow-md">
                            {item.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <Badge variant="secondary">{item.category}</Badge>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <p className="font-bold text-lg">{item.price}</p>
                                <Button asChild>
                                    <Link href={`/l/${item.id}`}>View</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
             ) : (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Tags className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Listings Found</h3>
                        <p>We couldn't find any listings matching "{query}". Try a different search.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
