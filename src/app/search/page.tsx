
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tag, Calendar, Users, Tags, DollarSign, Gift, Eye } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { User } from '@/lib/users';
import { useAuth } from '@/components/auth-provider';
import { searchUsers, getUsersByIds } from '@/lib/users';
import { followUser, unfollowUser } from '@/lib/connections';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing, Offer, Job, Event } from '@/lib/users';

type ItemWithAuthor<T> = T & { author: User };
type SearchResults = {
    users: User[];
    listings: ItemWithAuthor<Listing>[];
    opportunities: ItemWithAuthor<Job>[];
    events: ItemWithAuthor<Event>[];
    offers: ItemWithAuthor<Offer>[];
}

function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('...');
  useEffect(() => {
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);
  return <>{formattedDate}</>;
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], listings: [], opportunities: [], events: [], offers: [] });

  useEffect(() => {
    const performSearch = async () => {
        if (!queryParam) return;
        setIsLoading(true);

        try {
            const lowerCaseQuery = queryParam.toLowerCase();

            // Search users
            const userResults = await searchUsers(queryParam);
            
            // Search content collections
            const collectionsToSearch = ['listings', 'jobs', 'events', 'offers', 'businesses'];
            const contentPromises = collectionsToSearch.map(col => getDocs(query(collection(db, col), where('searchableKeywords', 'array-contains', lowerCaseQuery))));
            
            const [listingsSnap, jobsSnap, eventsSnap, offersSnap, businessesSnap] = await Promise.all(contentPromises);

            const allContent: (any & { type: string })[] = [
                ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
                ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
                ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
                ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
                ...businessesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'business' })),
            ];

            const authorIds = [...new Set(allContent.map(item => item.authorId))];
            const authors = await getUsersByIds(authorIds);
            const authorMap = new Map(authors.map(author => [author.uid, author]));
            
            const newResults: SearchResults = {
                users: userResults.filter(u => u.uid !== user?.uid),
                listings: [],
                opportunities: [],
                events: [],
                offers: [],
            };

            allContent.forEach(item => {
                const author = authorMap.get(item.authorId);
                if (author) {
                    switch (item.type) {
                        case 'listing': newResults.listings.push({ ...item, author }); break;
                        case 'job': newResults.opportunities.push({ ...item, author }); break;
                        case 'event': newResults.events.push({ ...item, date: item.date.toDate().toISOString(), author }); break;
                        case 'offer': newResults.offers.push({ ...item, releaseDate: item.releaseDate.toDate().toISOString(), author }); break;
                    }
                }
            });

            setResults(newResults);

        } catch (err) {
            console.error("Search failed:", err);
            toast({ title: "Search failed", description: "Could not perform search.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    performSearch();
  }, [queryParam, user, toast]);

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
      setResults(prev => ({
          ...prev,
          users: prev.users.map(u => u.uid === targetUserId ? { ...u, isFollowedByCurrentUser: !isCurrentlyFollowing } : u)
      }));
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };


  if (!queryParam) {
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
        <p className="text-muted-foreground">Showing results for: <span className="text-foreground font-semibold">"{queryParam}"</span></p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="users">Users ({results.users.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({results.listings.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Jobs ({results.opportunities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({results.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4">
            {results.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => {
                        const isFollowedByCurrentUser = user?.following.includes(u.uid) || false;
                        return (
                        <Card key={u.uid} className="transition-all hover:shadow-md">
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
                            <Button size="sm" variant={isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => handleToggleFollow(u.uid, isFollowedByCurrentUser)}>
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
                        <p>We couldn't find any users matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        
        <TabsContent value="listings" className="pt-4">
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
                        <p>We couldn't find any listings matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>

        <TabsContent value="opportunities" className="pt-4">
            {results.opportunities.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {results.opportunities.map((job) => (
                        <Card key={job.id} className="flex flex-col transition-all hover:shadow-md">
                            {job.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office workspace" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {job.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                                </div>
                                {job.remuneration && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <DollarSign className="mr-2 h-4 w-4" /> {job.remuneration}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/o/${job.id}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Opportunities Found</h3>
                        <p>We couldn't find any jobs matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="events" className="pt-4">
            {results.events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {results.events.map((event) => (
                        <Card key={event.id} className="flex flex-col transition-all hover:shadow-md">
                            {event.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                    <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="event poster" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} formatStr="PPP" />
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/events/${event.id}`}>Learn More</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Events Found</h3>
                        <p>We couldn't find any events matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="offers" className="pt-4">
            {results.offers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {results.offers.map((offer) => (
                        <Card key={offer.id} className="flex flex-col transition-all hover:shadow-md">
                            {offer.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                <Image src={offer.imageUrl} alt={offer.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="special offer" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{offer.title}</CardTitle>
                                <CardDescription>{offer.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                                <div className="flex items-center pt-2 text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Releases: <ClientFormattedDate dateString={offer.releaseDate} formatStr="PPP" /></span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/offer/${offer.id}`}>Claim Offer</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Offers Found</h3>
                        <p>We couldn't find any offers matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
