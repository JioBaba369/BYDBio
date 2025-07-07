'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tag, Calendar, Users, Tags, DollarSign, Gift, Eye, Building2, ExternalLink, Megaphone, Loader2, Rss } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { User } from '@/lib/users';
import { useAuth } from '@/components/auth-provider';
import { searchUsers, getUsersByIds } from '@/lib/users';
import { followUser, unfollowUser } from '@/lib/connections';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/lib/listings';
import type { Offer } from '@/lib/offers';
import type { Job } from '@/lib/jobs';
import type { Event } from '@/lib/events';
import type { PromoPage } from '@/lib/promo-pages';
import type { Post } from '@/lib/posts';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type ItemWithAuthor<T> = T & { author: User };
type SearchResults = {
    users: User[];
    listings: ItemWithAuthor<Listing>[];
    jobs: ItemWithAuthor<Job>[];
    events: ItemWithAuthor<Event>[];
    offers: ItemWithAuthor<Offer>[];
    promoPages: ItemWithAuthor<PromoPage>[];
    posts: ItemWithAuthor<Post>[];
}

const SearchPageSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
        </div>
        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
                <TabsTrigger value="users" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
                <TabsTrigger value="posts" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
                <TabsTrigger value="promoPages" disabled><Skeleton className="h-5 w-24" /></TabsTrigger>
                <TabsTrigger value="listings" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
                <TabsTrigger value="jobs" disabled><Skeleton className="h-5 w-16" /></TabsTrigger>
                <TabsTrigger value="events" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
                <TabsTrigger value="offers" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-24 rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
);


export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], listings: [], jobs: [], events: [], offers: [], promoPages: [], posts: [] });
  const [togglingFollowId, setTogglingFollowId] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
        if (!queryParam) return;
        setIsLoading(true);

        try {
            const searchKeywords = queryParam.toLowerCase().split(' ').filter(Boolean).slice(0, 10);
            if (searchKeywords.length === 0) {
                setResults({ users: [], listings: [], jobs: [], events: [], offers: [], promoPages: [], posts: [] });
                setIsLoading(false);
                return;
            }

            // Search users
            const userResults = await searchUsers(queryParam);
            
            // Search content collections
            const collectionsToSearch = ['listings', 'jobs', 'events', 'offers', 'promoPages', 'posts'];
            const contentPromises = collectionsToSearch.map(col => getDocs(query(collection(db, col), where('searchableKeywords', 'array-contains-any', searchKeywords))));
            
            const [listingsSnap, jobsSnap, eventsSnap, offersSnap, promoPagesSnap, postsSnap] = await Promise.all(contentPromises);

            const allContent: (any & { type: string })[] = [
                ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
                ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
                ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
                ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
                ...promoPagesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'promoPage' })),
                ...postsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'post' })),
            ];

            const authorIds = [...new Set(allContent.map(item => item.authorId))];
            const authors = await getUsersByIds(authorIds);
            const authorMap = new Map(authors.map(author => [author.uid, author]));
            
            const newResults: SearchResults = {
                users: userResults.filter(u => u.uid !== user?.uid),
                listings: [],
                jobs: [],
                events: [],
                offers: [],
                promoPages: [],
                posts: [],
            };

            allContent.forEach(item => {
                const author = authorMap.get(item.authorId);
                if (author) {
                    switch (item.type) {
                        case 'listing': newResults.listings.push({ ...item, author }); break;
                        case 'job': newResults.jobs.push({ ...item, author }); break;
                        case 'event': newResults.events.push({ ...item, author }); break;
                        case 'offer': newResults.offers.push({ ...item, author }); break;
                        case 'promoPage': newResults.promoPages.push({ ...item, author }); break;
                        case 'post': newResults.posts.push({ ...item, author }); break;
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
    
    if (!authLoading && queryParam) {
        performSearch();
    }
  }, [queryParam, authLoading, user?.uid, toast]);

  const handleToggleFollow = async (targetUser: User) => {
    if (!user || togglingFollowId) return;
    
    setTogglingFollowId(targetUser.uid);
    const isCurrentlyFollowing = user.following.includes(targetUser.uid);
    const previousResults = { ...results };

    // Optimistic update
    setResults(prev => ({
        ...prev,
        users: prev.users.map(u => 
            u.uid === targetUser.uid 
            ? { 
                ...u, 
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
        setResults(previousResults);
        toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
        setTogglingFollowId(null);
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
                <p className="text-muted-foreground">Search for users, listings, jobs, and more.</p>
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
    return <SearchPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        {queryParam ? (
            <>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
                <SearchIcon className="h-8 w-8" />
                Search Results
            </h1>
            <p className="text-muted-foreground">Showing results for: <span className="text-foreground font-semibold">"{queryParam}"</span></p>
            </>
        ) : (
            <>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
                <SearchIcon className="h-8 w-8" />
                Search
            </h1>
            <p className="text-muted-foreground">Start a search to find users, content, and more.</p>
            </>
        )}
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="users">Users ({results.users.length})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({results.posts.length})</TabsTrigger>
            <TabsTrigger value="promoPages">Promo Pages ({results.promoPages.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({results.listings.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({results.jobs.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({results.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4">
            {results.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => {
                        const isFollowed = user?.following.includes(u.uid);
                        const isProcessing = togglingFollowId === u.uid;
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
                                <p className="text-sm text-muted-foreground">@{u.username}</p>
                            </div>
                            </Link>
                            <Button size="sm" variant={isFollowed ? 'secondary' : 'default'} onClick={() => handleToggleFollow(u)} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFollowed ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowed ? 'Following' : 'Follow'}
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
        
        <TabsContent value="posts" className="pt-4">
            {results.posts.length > 0 ? (
                <div className="space-y-4">
                    {results.posts.map(post => (
                        <Card key={post.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Link href={`/u/${post.author.username}`}>
                                        <Avatar>
                                            <AvatarImage src={post.author.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <Link href={`/u/${post.author.username}`} className="hover:underline">
                                                <p className="font-semibold">{post.author.name}</p>
                                                <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                                            </Link>
                                            <Link href={`/u/${post.author.username}`} className="text-sm text-muted-foreground hover:underline">
                                                <ClientFormattedDate date={post.createdAt} relative />
                                            </Link>
                                        </div>
                                        <p className="mt-2 text-sm whitespace-pre-wrap line-clamp-3">{post.content}</p>
                                        {post.imageUrl && (
                                            <div className="mt-2 rounded-lg overflow-hidden border">
                                                <Image src={post.imageUrl} alt="Post image" width={500} height={281} className="object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Rss className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Posts Found</h3>
                        <p>We couldn't find any posts matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="promoPages" className="pt-4">
             {results.promoPages.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <TabsContent value="jobs" className="pt-4">
            {results.jobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.jobs.map((job) => (
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
                        <h3 className="text-lg font-semibold text-foreground">No Jobs Found</h3>
                        <p>We couldn't find any jobs matching "{queryParam}". Try a different search.</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        <TabsContent value="events" className="pt-4">
            {results.events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
