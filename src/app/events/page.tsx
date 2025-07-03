
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, PlusCircle, MoreHorizontal, Archive, Trash2, Edit, Eye, Users, CheckCircle2, LayoutGrid, List } from "lucide-react"
import { currentUser } from "@/lib/mock-data";
import { allUsers } from "@/lib/users";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import type { Event as EventType, User } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type EventWithAuthor = EventType & { author: Pick<User, 'id' | 'name' | 'handle' | 'avatarUrl'> };

// This component safely formats the date on the client-side to prevent hydration errors.
function ClientFormattedDate({ dateString, formatStr }: { dateString: string, formatStr?: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setFormattedDate(format(parseISO(dateString), formatStr || "PPP p"));
  }, [dateString, formatStr]);

  // Render a placeholder or nothing until the client-side formatting is complete.
  if (!formattedDate) {
    return <span>...</span>;
  }

  return <>{formattedDate}</>;
}


export default function EventsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [allEvents, setAllEvents] = useState<EventWithAuthor[]>(() => 
      allUsers.flatMap(user => 
          user.events.map(event => ({
              ...event,
              author: { id: user.id, name: user.name, handle: user.handle, avatarUrl: user.avatarUrl }
          }))
      ).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
  );
  
  // Use state to track RSVP status for instant UI feedback
  const [rsvpedEventIds, setRsvpedEventIds] = useState(new Set(currentUser.rsvpedEventIds || []));

  const handleArchive = (eventId: string) => {
    setAllEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: event.status === 'active' ? 'archived' : 'active' } : event
    ));
    toast({ title: 'Event status updated!' });
  };

  const handleDelete = () => {
    if (!selectedEventId) return;
    setAllEvents(prev => prev.filter(event => event.id !== selectedEventId));
    toast({ title: 'Event deleted!' });
    setIsDeleteDialogOpen(false);
    setSelectedEventId(null);
  };
  
  const handleRsvp = (eventId: string, eventTitle: string) => {
    setRsvpedEventIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(eventId)) {
            newSet.delete(eventId);
            toast({ title: "You are no longer attending", description: `"${eventTitle}" has been removed from your diary.` });
        } else {
            newSet.add(eventId);
            toast({ title: "You're going!", description: `"${eventTitle}" has been added to your diary.` });
        }
        return newSet;
    });
  }
  
  const openDeleteDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsDeleteDialogOpen(true);
  }

  const activeEvents = allEvents.filter(e => e.status === 'active');
  const archivedEvents = allEvents.filter(e => e.status === 'archived' && e.author.id === currentUser.id);

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName="event"
      />
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
            <Button asChild>
                <Link href="/events/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
                </Link>
            </Button>
          </div>
        </div>
        
        {activeEvents.length > 0 ? (
          view === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2">
              {activeEvents.map((event) => {
                const isOwner = event.author.id === currentUser.id;
                const isRsvped = rsvpedEventIds.has(event.id);

                return (
                <Card key={event.id} className="flex flex-col">
                  {event.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg">
                      <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="event poster" />
                    </div>
                  )}
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="pt-2">
                          <Link href={`/u/${event.author.handle}`} className="flex items-center gap-2 hover:underline">
                              <Avatar className="h-6 w-6">
                                  <AvatarImage src={event.author.avatarUrl} data-ai-hint="person portrait" />
                                  <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">Hosted by {event.author.name}</span>
                          </Link>
                      </CardDescription>
                    </div>
                    {isOwner && (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/events/${event.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(event.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} />
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" /> {event.location}
                    </div>
                  </CardContent>
                  <Separator/>
                  <CardFooter className="flex-col items-start gap-4 pt-4">
                      <div className="flex justify-between w-full">
                          <div className="flex items-center text-sm font-medium">
                              <Eye className="mr-2 h-4 w-4 text-primary" />
                              <span>{event.views?.toLocaleString() ?? 0} views</span>
                          </div>
                          <div className="flex items-center text-sm font-medium">
                              <Users className="mr-2 h-4 w-4 text-primary" />
                              <span>{event.rsvps?.toLocaleString() ?? 0} RSVPs</span>
                          </div>
                      </div>
                      <div className="w-full flex gap-2">
                        <Button asChild className="flex-1">
                            <Link href={`/events/${event.id}`}>Learn More</Link>
                        </Button>
                        {!isOwner && (
                          <Button variant={isRsvped ? "secondary" : "default"} onClick={() => handleRsvp(event.id, event.title)}>
                              {isRsvped ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                              {isRsvped ? 'Attending' : 'Add to Diary'}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeEvents.map((event) => {
                    const isOwner = event.author.id === currentUser.id;
                    const isRsvped = rsvpedEventIds.has(event.id);

                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {event.imageUrl && (
                              <Image src={event.imageUrl} alt={event.title} width={100} height={56} className="rounded-md object-cover hidden sm:block aspect-video" data-ai-hint="event poster" />
                            )}
                            <div className="space-y-1">
                              <Link href={`/events/${event.id}`} className="font-semibold hover:underline">{event.title}</Link>
                               <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <Avatar className="h-4 w-4">
                                      <AvatarImage src={event.author.avatarUrl} data-ai-hint="person portrait" />
                                      <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  by {event.author.name}
                                </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium"><ClientFormattedDate dateString={event.date} formatStr="MMM d, yyyy" /></div>
                          <div className="text-xs text-muted-foreground"><ClientFormattedDate dateString={event.date} formatStr="p" /></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{event.location}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{event.views?.toLocaleString() ?? 0}</div>
                            <div className="flex items-center gap-1"><Users className="h-3 w-3" />{event.rsvps?.toLocaleString() ?? 0}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/events/${event.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(event.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button size="sm" variant={isRsvped ? "secondary" : "default"} onClick={() => handleRsvp(event.id, event.title)}>
                                {isRsvped ? <CheckCircle2 className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                {isRsvped ? 'Attending' : 'Attend'}
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
                <CardDescription>Create an event to engage with your audience.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Calendar className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/events/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Event
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        )}
        
        {archivedEvents.length > 0 && (
          <div className="space-y-4">
             <h2 className="text-xl font-bold font-headline">My Archived Events</h2>
             <div className="grid gap-6 md:grid-cols-2">
              {archivedEvents.map((event) => (
                <Card key={event.id} className="flex flex-col opacity-70">
                   {event.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg relative">
                      <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="event poster" />
                       <Badge className="absolute top-2 right-2">Archived</Badge>
                    </div>
                  )}
                  <CardHeader className="flex flex-row justify-between items-start">
                    <CardTitle>{event.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleArchive(event.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Unarchive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                   <CardContent className="space-y-2 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} />
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" /> {event.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
