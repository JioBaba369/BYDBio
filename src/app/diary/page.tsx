
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/mock-data';
import { allUsers, type Event, type User } from '@/lib/users';
import { format, parseISO, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookText, Calendar, MapPin, Save, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


type EventWithNotes = Event & { 
  notes?: string; 
  source: 'created' | 'rsvped';
  author?: Pick<User, 'name' | 'username' | 'avatarUrl'>;
};

// This component safely formats the date on the client-side to prevent hydration errors.
function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('...');

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);

  return <>{formattedDate}</>;
}


export default function DiaryPage() {
    const [events, setEvents] = useState<EventWithNotes[]>(() => {
      // 1. Get user's own events
      const ownEvents: EventWithNotes[] = currentUser.events.map(e => ({
        ...e, 
        notes: e.id === 'event1' ? 'Prepare a few questions for the Q&A session.' : '',
        source: 'created'
      }));

      // 2. Get events user has RSVP'd to
      const rsvpedEvents: EventWithNotes[] = [];
      if (currentUser.rsvpedEventIds) {
          for (const eventId of currentUser.rsvpedEventIds) {
              for (const user of allUsers) {
                  const event = user.events.find(e => e.id === eventId);
                  if (event) {
                      rsvpedEvents.push({
                          ...event,
                          source: 'rsvped',
                          author: { name: user.name, username: user.username, avatarUrl: user.avatarUrl },
                          notes: ''
                      });
                      break;
                  }
              }
          }
      }
      
      return [...ownEvents, ...rsvpedEvents];
    });

    const { toast } = useToast();

    const handleNoteChange = (eventId: string, note: string) => {
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === eventId ? { ...event, notes: note } : event
            )
        );
    };

    const handleSaveNote = (eventId: string) => {
        const event = events.find(e => e.id === eventId);
        console.log(`Saving note for event ${eventId}:`, event?.notes);
        toast({
            title: "Note Saved!",
            description: `Your notes for "${event?.title}" have been saved.`,
        });
    };

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const sortedEvents = [...events].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        const upcoming = sortedEvents.filter(e => !isPast(parseISO(e.date)));
        const past = sortedEvents.filter(e => isPast(parseISO(e.date))).reverse();
        return { upcomingEvents: upcoming, pastEvents: past };
    }, [events]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Diary</h1>
                <p className="text-muted-foreground">Keep track of your events and personal notes.</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold font-headline">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {upcomingEvents.map(event => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <CardTitle>{event.title}</CardTitle>
                                      <Badge variant={event.source === 'created' ? 'default' : 'secondary'}>
                                        {event.source === 'created' ? 'My Event' : 'Attending'}
                                      </Badge>
                                    </div>
                                    <CardDescription className="space-y-1 text-sm text-muted-foreground pt-1">
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} formatStr="PPP 'at' p" />
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                        </div>
                                        {event.source === 'rsvped' && event.author && (
                                            <div className="flex items-center pt-2">
                                                <Link href={`/u/${event.author.username}`} className="flex items-center gap-2 hover:underline">
                                                  <Avatar className="h-6 w-6">
                                                      <AvatarImage src={event.author.avatarUrl} data-ai-hint="person portrait" />
                                                      <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-xs">Hosted by {event.author.name}</span>
                                                </Link>
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label htmlFor={`notes-${event.id}`}>My Notes</Label>
                                    <Textarea
                                        id={`notes-${event.id}`}
                                        placeholder="Jot down your thoughts, questions, or key takeaways..."
                                        value={event.notes}
                                        onChange={(e) => handleNoteChange(event.id, e.target.value)}
                                        rows={4}
                                    />
                                    <Button size="sm" onClick={() => handleSaveNote(event.id)}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Note
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Calendar className="h-12 w-12" />
                            <p>You have no upcoming events.</p>
                             <Button asChild>
                                <Link href="/events">Explore Events</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>

             <section className="space-y-4">
                <h2 className="text-xl font-bold font-headline">Past Events</h2>
                {pastEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                         {pastEvents.map(event => (
                            <Card key={event.id} className="opacity-80">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                      <CardTitle>{event.title}</CardTitle>
                                      <Badge variant={event.source === 'created' ? 'default' : 'secondary'}>
                                        {event.source === 'created' ? 'My Event' : 'Attended'}
                                      </Badge>
                                    </div>
                                     <CardDescription className="space-y-1 text-sm text-muted-foreground pt-1">
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} formatStr="PPP" />
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                        </div>
                                         {event.source === 'rsvped' && event.author && (
                                            <div className="flex items-center pt-2">
                                                <Link href={`/u/${event.author.username}`} className="flex items-center gap-2 hover:underline">
                                                  <Avatar className="h-6 w-6">
                                                      <AvatarImage src={event.author.avatarUrl} data-ai-hint="person portrait" />
                                                      <AvatarFallback>{event.author.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-xs">Hosted by {event.author.name}</span>
                                                </Link>
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label htmlFor={`notes-${event.id}`}>My Reflections</Label>
                                    <Textarea
                                        id={`notes-${event.id}`}
                                        placeholder="Add your reflections..."
                                        value={event.notes}
                                        onChange={(e) => handleNoteChange(event.id, e.target.value)}
                                        rows={4}
                                    />
                                    <Button size="sm" onClick={() => handleSaveNote(event.id)}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Note
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <BookText className="h-12 w-12" />
                            <p>Your event diary is empty.<br/>Notes from past events will appear here.</p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
