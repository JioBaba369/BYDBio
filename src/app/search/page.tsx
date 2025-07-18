

'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tags, Calendar, Users, Gift, Eye, Building2, ExternalLink, Megaphone, Loader2, MousePointerClick, DollarSign } from "lucide-react";
import { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { User } from '@/lib/users';
import { useAuth } from '@/components/auth-provider';
import { searchUsers, getUsersByIds } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Listing } from '@/lib/listings';
import type { Offer } from '@/lib/offers';
import type { Job } from '@/lib/jobs';
import type { Event } from '@/lib/events';
import type { PromoPage } from '@/lib/promo-pages';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { ClientFormattedCurrency } from '@/components/client-formatted-currency';
import { useRouter } from 'next/navigation';
import { FollowButton } from '@/components/follow-button';

type ItemWithAuthor<T> = T & { author: User };
type SearchResults = {
    users: User[];
    listings: ItemWithAuthor<Listing>[];
    jobs: ItemWithAuthor<Job>[];
    events: ItemWithAuthor<Event>[];
    offers: ItemWithAuthor<Offer>[];
    promoPages: ItemWithAuthor<PromoPage>[];
}

const SearchPageSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
        </div>
        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="users" disabled><Skeleton className="h-5 w-20" /></TabsTrigger>
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
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], listings: [], jobs: [], events: [], offers: [], promoPages: [] });

  const performSearch = useCallback(async () => {
    if (!queryParam) return;
    setIsLoading(true);

    try {
        const searchKeywords = queryParam.toLowerCase().split(' ').filter(Boolean).slice(0, 10);
        if (searchKeywords.length === 0) {
            setResults({ users: [], listings: [], jobs: [], events: [], offers: [], promoPages: [] });
            setIsLoading(false);
            return;
        }

        const userResults = await searchUsers(queryParam);
        
        const collectionsToSearch = ['listings', 'jobs', 'events', 'offers', 'promoPages'];
        
        const contentPromises = collectionsToSearch.map(colName => {
            const queryConstraints: any[] = [
                where('searchableKeywords', 'array-contains-any', searchKeywords),
                where('status', '==', 'active'),
                limit(50)
            ];
            
            const finalQuery = query(collection(db, colName), ...queryConstraints);
            return getDocs(finalQuery);
        });
        
        const [listingsSnap, jobsSnap, eventsSnap, offersSnap, promoPagesSnap] = await Promise.all(contentPromises);

        const allContent: (any & { type: string })[] = [
            ...listingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'listing' })),
            ...jobsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'job' })),
            ...eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'event' })),
            ...offersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'offer' })),
            ...promoPagesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'promoPage' })),
        ];

        const authorIds = new Set<string>();
        allContent.forEach(item => {
            if (item.authorId) authorIds.add(item.authorId);
        });
        
        const authors = await getUsersByIds(Array.from(authorIds));
        const authorMap = new Map(authors.map(author => [author.uid, author]));
        
        const newResults: SearchResults = {
            users: userResults.filter(u => u.uid !== user?.uid),
            listings: [],
            jobs: [],
            events: [],
            offers: [],
            promoPages: [],
        };
        
        allContent.forEach(item => {
            const author = authorMap.get(item.authorId);
            if (!author) {
                return;
            }
            
            switch (item.type) {
                case 'listing': newResults.listings.push({ ...item, author }); break;
                case 'job': newResults.jobs.push({ ...item, author }); break;
                case 'event': newResults.events.push({ ...item, author }); break;
                case 'offer': newResults.offers.push({ ...item, author }); break;
                case 'promoPage': newResults.promoPages.push({ ...item, author }); break;
            }
        });
        
        setResults(newResults);

    } catch (err) {
        console.error("Search error:", err);
        toast({ title: "Search failed", description: "Could not perform search.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [queryParam, user?.uid, toast]);

  useEffect(() => {
    if (!authLoading && queryParam) {
        performSearch();
    }
  }, [queryParam, authLoading, performSearch]);

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
    <>
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="users">Users ({results.users.length})</TabsTrigger>
            <TabsTrigger value="promoPages">Business Pages ({results.promoPages.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({results.listings.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({results.jobs.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({results.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4">
            {results.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.users.map(u => (
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
                                {user && user.uid !== u.uid && (
                                    <FollowButton
                                        targetUserId={u.uid}
                                        initialIsFollowing={user.following.includes(u.uid)}
                                        initialFollowerCount={u.followerCount}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.promoPages.map((item) => (
                    <Card key={item.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                      {item.imageUrl &&
                        <Link href={`/p/${item.id}`} className="block overflow-hidden rounded-t-lg">
                          <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" data-ai-hint="office storefront"/>
                        </Link>
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
                      <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                        <div className="flex justify-between w-full text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{item.views?.toLocaleString() ?? 0} Views</div>
                            <div className="flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" />{item.clicks?.toLocaleString() ?? 0} Clicks</div>
                        </div>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href={`/p/${item.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
             ) : (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Business Pages Found</h3>
                        <p>We couldn't find any business pages matching "{queryParam}". Try a different search.</p>
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
                                <Link href={`/l/${item.id}`} className="block overflow-hidden rounded-t-lg">
                                    <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                                </Link>
                            )}
                            <CardHeader>
                                <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                                <CardTitle className="mt-1">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="font-bold text-lg text-primary"><ClientFormattedCurrency value={item.price} /></p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant="secondary">
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
                                <Badge variant="destructive" className="w-fit">{job.type}</Badge>
                                <CardTitle className="mt-1">{job.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5"><Building2 className="h-4 w-4"/>{job.company}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {job.location}
                                </div>
                                {job.remuneration && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <DollarSign className="mr-2 h-4 w-4" /> <ClientFormattedCurrency value={job.remuneration} />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant="secondary">
                                    <Link href={`/job/${job.id}`}>View Details</Link>
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
                                <Link href={`/events/${event.id}`} className="block overflow-hidden rounded-t-lg">
                                    <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="event poster" />
                                </Link>
                            )}
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
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
                                <Button asChild className="w-full" variant="secondary">
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
                                <Badge variant="secondary" className="w-fit">{offer.category}</Badge>
                                <CardTitle className="mt-1">{offer.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant="secondary">
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
    </>
  );
}
