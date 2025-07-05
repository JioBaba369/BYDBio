
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tag, Calendar, Users, Tags, DollarSign, Gift, Eye, Building2, ExternalLink, Megaphone } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { User, PromoPage } from '@/lib/users';
import { useAuth } from '@/components/auth-provider';
import { searchUsers, getUsersByIds } from '@/lib/users';
import { followUser, unfollowUser } from '@/lib/connections';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing, Offer, Job, Event } from '@/lib/users';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type ItemWithAuthor<T> = T & { author: User };
type SearchResults = {
    users: User[];
    listings: ItemWithAuthor<Listing>[];
    opportunities: ItemWithAuthor<Job>[];
    events: ItemWithAuthor<Event>[];
    offers: ItemWithAuthor<Offer>[];
    promoPages: ItemWithAuthor<PromoPage>[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], listings: [], opportunities: [], events: [], offers: [], promoPages: [] });

  useEffect(() => {
    const performSearch = async () => {
        if (!queryParam) return;
        setIsLoading(true);

        try {
            const lowerCaseQuery = queryParam.toLowerCase();

            // Search users
            const userResults = await searchUsers(queryParam);
            
            // Search content collections
            const collectionsToSearch = ['listings', 'jobs', 'events', 'offers', 'promoPages'];
            const contentPromises = collectionsToSearch.map(col => getDocs(query(collection(db, col), where('searchableKeywords', 'array-contains', lowerCaseQuery))));
            
            const [listingsSnap, jobsSnap, eventsSnap, offersSnap, promoPagesSnap] = await Promise.all(contentPromises);

            const allContent: (any & { type: string })[] = [
                ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
                ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
                ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
                ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
                ...promoPagesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'promoPage' })),
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
                promoPages: [],
            };

            allContent.forEach(item => {
                const author = authorMap.get(item.authorId);
                if (author) {
                    switch (item.type) {
                        case 'listing': newResults.listings.push({ ...item, author }); break;
                        case 'job': newResults.opportunities.push({ ...item, author }); break;
                        case 'event': newResults.events.push({ ...item, author }); break;
                        case 'offer': newResults.offers.push({ ...item, author }); break;
                        case 'promoPage': newResults.promoPages.push({ ...item, author }); break;
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

  const handleToggleFollow = async (targetUser: User) => {
    if (!user) return;
    const isCurrentlyFollowing = targetUser.isFollowedByCurrentUser ?? user.following.includes(targetUser.uid);
    const previousResults = results;

    // Optimistic update
    setResults(prev => ({
        ...prev,
        users: prev.users.map(u => 
            u.uid === targetUser.uid 
            ? { 
                ...u, 
                isFollowedByCurrentUser: !isCurrentlyFollowing,
                followerCount: (u.followerCount || 0) + (isCurrentlyFollowing ? -1 : 1)
              } 
            : u)
    }));

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(user.uid, targetUser.uid);
        toast({ title: "Unfollowed" });
      } else {
        await followUser(user.uid, targetUser.uid);
        toast({ title: "Followed" });
      }
    } catch (error) {
        // Revert on error
        setResults(previousResults);
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="users">Users ({results.users.length})</TabsTrigger>
            <TabsTrigger value="promoPages">Promo Pages ({results.promoPages.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({results.listings.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Jobs ({results.opportunities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({results.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4">
            {results.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => {
                        const isFollowedByCurrentUser = u.isFollowedByCurrentUser ?? user?.following.includes(u.uid) ?? false;
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
                            <Button size="sm" variant={isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => handleToggleFollow(u)}>
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

        <TabsContent value="promoPages" className="pt-4">
             {results.promoPages.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {results.promoPages.map((item) => (
                    <Card key={item.id} className="flex flex-col">
                      {item.imageUrl &&
                        <div className="overflow-hidden rounded-t-lg">
                          <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" data-ai-hint="office storefront"/>
                        </div>
                      }
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                          <CardDescription className="pt-2">
                              <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                  <Avatar className="h-6 w-6">
                                      <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                      <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">by {item.author.name}</span>
                              </Link>
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      </CardContent>
                      <Separator className="my-4" />
                      <CardFooter>
                          <Button asChild variant="outline" className="w-full">
                              <Link href={`/p/${item.id}`}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Details
                              </Link>
                          </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
             ) : (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Promo Pages Found</h3>
                        <p>We couldn't find any promo pages matching "{queryParam}". Try a different search.</p>
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
                                <CardDescription className="pt-2">
                                  <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                      <Avatar className="h-6 w-6">
                                          <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">by {item.author.name}</span>
                                  </Link>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <div className="flex justify-between items-center">
                                  <Badge variant="secondary">{item.category}</Badge>
                                  <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/l/${item.id}`}>View Details</Link>
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
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                                <CardDescription className="pt-2">
                                  <Link href={`/u/${job.author.username}`} className="flex items-center gap-2 hover:underline">
                                      <Avatar className="h-6 w-6">
                                          <AvatarImage src={job.author.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{job.author.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">by {job.author.name}</span>
                                  </Link>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {job.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                                </div>
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
                                <CardDescription className="pt-2">
                                  <Link href={`/u/${event.author.username}`} className="flex items-center gap-2 hover:underline">
                                      <Avatar className="h-6 w-6">
                                          <AvatarImage src={event.author.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">by {event.author.name}</span>
                                  </Link>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate date={event.startDate} formatStr="PPP" />
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
                           <CardHeader>
                                <CardTitle>{offer.title}</CardTitle>
                                 <CardDescription className="pt-2">
                                  <Link href={`/u/${offer.author.username}`} className="flex items-center gap-2 hover:underline">
                                      <Avatar className="h-6 w-6">
                                          <AvatarImage src={offer.author.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{offer.author.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">by {offer.author.name}</span>
                                  </Link>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                                <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
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
