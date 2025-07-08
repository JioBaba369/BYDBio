'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, PlusCircle, Eye, Users, CheckCircle2, LayoutGrid, List, Loader2, ExternalLink, Bell } from "lucide-react"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/auth-provider";
import { type EventWithAuthor, toggleRsvp } from "@/lib/events";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";


const EventPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-20 hidden sm:block" />
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-52 w-full rounded-t-lg" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="flex-col gap-4 pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
)

export default function EventsClient({ initialEvents }: { initialEvents: EventWithAuthor[] }) {
  const { user, loading: authLoading } = useAuth();
  const [allEvents, setAllEvents] = useState<EventWithAuthor[]>(initialEvents);
  const [rsvpingEventId, setRsvpingEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    setAllEvents(initialEvents);
  }, [initialEvents]);

  const handleRsvp = async (eventId: string, eventTitle: string) => {
    if (!user) {
        toast({ title: "Please sign in to RSVP", variant: "destructive" });
        return;
    }
    if (rsvpingEventId) return;
    
    setRsvpingEventId(eventId);
    const originalEvents = [...allEvents];

    // Optimistic UI update
    setAllEvents(prev => prev.map(event => {
        if (event.id === eventId) {
            const isCurrentlyRsvped = event.rsvps?.includes(user.uid);
            const newRsvps = isCurrentlyRsvped 
                ? (event.rsvps || []).filter(uid => uid !== user.uid)
                : [...(event.rsvps || []), user.uid];
            return { ...event, rsvps: newRsvps };
        }
        return event;
    }));

    try {
        const isNowRsvped = await toggleRsvp(eventId, user.uid);
        toast({
            title: isNowRsvped ? "You're going!" : "You are no longer attending",
            description: `"${eventTitle}" status updated in your diary.`
        });
    } catch (error) {
        console.error("RSVP error:", error);
        toast({ title: "Failed to update RSVP", variant: "destructive" });
        // Rollback on error
        setAllEvents(originalEvents);
    } finally {
        setRsvpingEventId(null);
    }
  }

  if (authLoading) {
      return <EventPageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Events</h1>
          <p className="text-muted-foreground">Discover curated events to expand your network and knowledge.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-md bg-muted p-1">
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                  <List className="h-4 w-4" />
              </Button>
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                  <LayoutGrid className="h-4 w-4" />
              </Button>
          </div>
          {user && (
            <Button asChild>
                <Link href="/events/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
                </Link>
            </Button>
          )}
        </div>
      </div>
      
      {allEvents.length > 0 ? (
        view === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allEvents.map((event) => {
              const isOwner = user && event.author.uid === user.uid;
              const isRsvped = user && event.rsvps?.includes(user.uid);
              const isProcessing = rsvpingEventId === event.id;

              return (
              <Card key={event.id} className="flex flex-col">
                {event.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" />
                  </div>
                )}
                <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="pt-2">
                        <Link href={`/u/${event.author.username}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={event.author.avatarUrl} />
                                <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">Hosted by {event.author.name}</span>
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> 
                    <span>
                      <ClientFormattedDate date={event.startDate as string} formatStr="PPP p" />
                      {event.endDate && <> - <ClientFormattedDate date={event.endDate as string} formatStr="PPP" /></>}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" /> {event.location}
                  </div>
                </CardContent>
                <Separator/>
                <CardFooter className="flex-col items-start gap-4 pt-4">
                    <div className="flex justify-between w-full text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{event.views?.toLocaleString() ?? 0} Views</div>
                        <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{event.rsvps?.length.toLocaleString() ?? 0} RSVPs</div>
                        <div className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{event.followerCount?.toLocaleString() ?? 0} Following</div>
                    </div>
                    <div className="w-full flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                          <Link href={`/events/${event.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                          </Link>
                      </Button>
                      {!isOwner && user && (
                        <Button className="flex-1" variant={isRsvped ? "secondary" : "default"} onClick={() => handleRsvp(event.id, event.title)} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isRsvped ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                            {isRsvped ? 'Attending' : 'RSVP'}
                        </Button>
                      )}
                    </div>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Stats</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEvents.map((event) => {
                  const isOwner = user && event.author.uid === user.uid;
                  const isRsvped = user && event.rsvps?.includes(user.uid);
                  const isProcessing = rsvpingEventId === event.id;

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {event.imageUrl && (
                            <Image src={event.imageUrl} alt={event.title} width={100} height={56} className="rounded-md object-cover hidden sm:block aspect-video" />
                          )}
                          <div className="space-y-1">
                            <Link href={`/events/${event.id}`} className="font-semibold hover:underline">{event.title}</Link>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={event.author.avatarUrl} />
                                    <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                by {event.author.name}
                              </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium"><ClientFormattedDate date={event.startDate as string} formatStr="MMM d, yyyy" /></div>
                        <div className="text-xs text-muted-foreground"><ClientFormattedDate date={event.startDate as string} formatStr="p" /></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{event.location}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{event.views?.toLocaleString() ?? 0}</div>
                          <div className="flex items-center gap-1"><Users className="h-3 w-3" />{event.rsvps?.length.toLocaleString() ?? 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {!isOwner && user ? (
                          <Button size="sm" variant={isRsvped ? "secondary" : "default"} onClick={() => handleRsvp(event.id, event.title)} disabled={isProcessing}>
                              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isRsvped ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                              {isRsvped ? 'Attending' : 'RSVP'}
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/events/${event.id}`}>View Details</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        <Card className="text-center">
          <CardHeader>
              <CardTitle>No Active Events</CardTitle>
              <CardDescription>Create an event to engage with your audience, or check back later for events from others.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-10">
              <Calendar className="h-16 w-16 text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
