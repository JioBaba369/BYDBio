
'use client';

import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, UserCheck, Search as SearchIcon, Briefcase, MapPin, Tag, Calendar, Users, Tags, DollarSign } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import { allUsers as initialUsers } from '@/lib/users';
import { currentUser } from '@/lib/mock-data';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { User, Listing, Job, Event, Offer } from '@/lib/users';

// Augment item types with author info
type ItemWithAuthor<T> = T & { author: Pick<User, 'id' | 'name' | 'handle' | 'avatarUrl' | 'avatarFallback'> };

// We need to map the full user list to include whether the current user follows them
const mapUsersWithFollowingState = (users: typeof initialUsers, me: typeof currentUser) => {
    return users
      .filter(u => u.id !== me.id) // Exclude current user from search results
      .map(user => ({
        ...user,
        isFollowedByCurrentUser: me.following.includes(user.id),
      }));
}

function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);

  if (!formattedDate) {
    return <span>...</span>;
  }

  return <>{formattedDate}</>;
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [users, setUsers] = useState(mapUsersWithFollowingState(initialUsers, currentUser));

  // This is a mock function. In a real app this would be an API call.
  const toggleFollow = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isFollowedByCurrentUser: !user.isFollowedByCurrentUser } : user
      )
    );
    // Also update the currentUser mock following list for consistency within the session
    const me = currentUser;
    if (me.following.includes(userId)) {
        me.following = me.following.filter(id => id !== userId);
    } else {
        me.following.push(userId);
    }
  };

  const allContent = useMemo(() => {
    const listings: ItemWithAuthor<Listing>[] = [];
    const opportunities: ItemWithAuthor<Job>[] = [];
    const events: ItemWithAuthor<Event>[] = [];
    const offers: ItemWithAuthor<Offer>[] = [];

    initialUsers.forEach(user => {
      const author = { 
        id: user.id, 
        name: user.name, 
        handle: user.handle, 
        avatarUrl: user.avatarUrl,
        avatarFallback: user.avatarFallback
      };
      user.listings.forEach(l => listings.push({ ...l, author }));
      user.jobs.forEach(j => opportunities.push({ ...j, author }));
      user.events.forEach(e => events.push({ ...e, author }));
      user.offers.forEach(o => offers.push({ ...o, author }));
    });
    return { listings, opportunities, events, offers };
  }, []);

  const filteredContent = useMemo(() => {
    if (!query) {
      return {
        users: [],
        listings: [],
        opportunities: [],
        events: [],
        offers: [],
      };
    }
    const lowerCaseQuery = query.toLowerCase();

    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(lowerCaseQuery) ||
      user.handle.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredListings = allContent.listings.filter(item => 
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.description.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredOpportunities = allContent.opportunities.filter(item => 
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.company.toLowerCase().includes(lowerCaseQuery) ||
      item.location.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredEvents = allContent.events.filter(item => 
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.location.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredOffers = allContent.offers.filter(item => 
      item.title.toLowerCase().includes(lowerCaseQuery) ||
      item.description.toLowerCase().includes(lowerCaseQuery) ||
      item.category.toLowerCase().includes(lowerCaseQuery)
    );
    
    return { users: filteredUsers, listings: filteredListings, opportunities: filteredOpportunities, events: filteredEvents, offers: filteredOffers };

  }, [query, users, allContent]);


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
            <TabsTrigger value="users">Users ({filteredContent.users.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({filteredContent.listings.length})</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities ({filteredContent.opportunities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({filteredContent.events.length})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({filteredContent.offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
            {filteredContent.users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredContent.users.map(user => (
                        <Card key={user.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <Link href={`/u/${user.handle}`} className="flex items-center gap-4 hover:underline">
                            <Avatar>
                                <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">@{user.handle}</p>
                            </div>
                            </Link>
                            <Button size="sm" variant={user.isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => toggleFollow(user.id)}>
                            {user.isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {user.isFollowedByCurrentUser ? 'Following' : 'Follow'}
                            </Button>
                        </CardContent>
                        </Card>
                    ))}
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
             {filteredContent.listings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredContent.listings.map((item) => (
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
                                 <div className="text-sm text-muted-foreground pt-3 border-t">
                                     <Link href={`/u/${item.author.handle}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{item.author.name}</span>
                                     </Link>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <p className="font-bold text-lg">{item.price}</p>
                                <Button asChild>
                                    <Link href={`/u/${item.author.handle}#listings`}>View</Link>
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
        
        <TabsContent value="opportunities">
             {filteredContent.opportunities.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredContent.opportunities.map((item) => (
                        <Card key={item.id} className="flex flex-col transition-all hover:shadow-md">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.company}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {item.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="mr-2 h-4 w-4" /> {item.type}
                                </div>
                                 <div className="text-sm text-muted-foreground pt-3 border-t">
                                     <Link href={`/u/${item.author.handle}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>Posted by {item.author.name}</span>
                                     </Link>
                                </div>
                            </CardContent>
                            <CardFooter>
                               <Button asChild className="w-full">
                                    <Link href={`/u/${item.author.handle}#jobs`}>View Details</Link>
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
                        <p>We couldn't find any opportunities matching "{query}". Try a different search.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>

        <TabsContent value="events">
             {filteredContent.events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredContent.events.map((item) => (
                        <Card key={item.id} className="flex flex-col transition-all hover:shadow-md">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow">
                                <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={item.date} formatStr="PPP p" />
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" /> {item.location}
                                </div>
                                 <div className="text-sm text-muted-foreground pt-3 border-t">
                                     <Link href={`/u/${item.author.handle}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>Hosted by {item.author.name}</span>
                                     </Link>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/u/${item.author.handle}#events`}>Learn More</Link>
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
                        <p>We couldn't find any events matching "{query}". Try a different search.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>

        <TabsContent value="offers">
             {filteredContent.offers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredContent.offers.map((item) => (
                         <Card key={item.id} className="flex flex-col transition-all hover:shadow-md">
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-grow">
                                <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{item.category}</Badge>
                                <div className="flex items-center pt-2 text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> 
                                    <span>Releases: <ClientFormattedDate dateString={item.releaseDate} formatStr="PPP" /></span>
                                </div>
                                 <div className="text-sm text-muted-foreground pt-3 border-t">
                                     <Link href={`/u/${item.author.handle}`} className="flex items-center gap-2 hover:underline">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>Offered by {item.author.name}</span>
                                     </Link>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/u/${item.author.handle}#offers`}>Claim Offer</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
             ) : (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-foreground">No Offers Found</h3>
                        <p>We couldn't find any offers matching "{query}". Try a different search.</p>
                    </CardContent>
                </Card>
             )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
