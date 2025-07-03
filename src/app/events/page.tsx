'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, PlusCircle, MoreHorizontal, Archive, Trash2, Edit } from "lucide-react"
import { currentUser } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Event } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(currentUser.events);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleArchive = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: event.status === 'active' ? 'archived' : 'active' } : event
    ));
    toast({ title: 'Event status updated!' });
  };

  const handleDelete = () => {
    if (!selectedEventId) return;
    setEvents(prev => prev.filter(event => event.id !== selectedEventId));
    toast({ title: 'Event deleted!' });
    setIsDeleteDialogOpen(false);
    setSelectedEventId(null);
  };
  
  const openDeleteDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsDeleteDialogOpen(true);
  }

  const activeEvents = events.filter(e => e.status === 'active');
  const archivedEvents = events.filter(e => e.status === 'archived');

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
          <Button asChild>
            <Link href="/events/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
        
        {activeEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeEvents.map((event) => (
              <Card key={event.id} className="flex flex-col">
                {event.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="event poster" />
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
                      <DropdownMenuItem asChild><Link href={`/events/${event.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(event.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(event.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> {format(parseISO(event.date), "PPP p")}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" /> {event.location}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              You have no active events. Create one to get started!
            </CardContent>
          </Card>
        )}
        
        {archivedEvents.length > 0 && (
          <div className="space-y-4">
             <h2 className="text-xl font-bold font-headline">Archived Events</h2>
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
                      <Calendar className="mr-2 h-4 w-4" /> {format(parseISO(event.date), "PPP p")}
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
