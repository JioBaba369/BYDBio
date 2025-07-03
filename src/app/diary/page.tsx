
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/mock-data';
import type { Event } from '@/lib/users';
import { format, parseISO, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookText, Calendar, MapPin, Save } from 'lucide-react';
import Link from 'next/link';

type EventWithNotes = Event & { notes?: string };

export default function DiaryPage() {
    const [events, setEvents] = useState<EventWithNotes[]>(
        currentUser.events.map(e => ({...e, notes: e.id === 'event1' ? 'Prepare a few questions for the Q&A session.' : ''}))
    );
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
                                    <CardTitle>{event.title}</CardTitle>
                                    <CardDescription className="space-y-1 text-sm text-muted-foreground pt-1">
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" /> {format(parseISO(event.date), "PPP 'at' p")}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                        </div>
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
                                    <CardTitle>{event.title}</CardTitle>
                                     <CardDescription className="space-y-1 text-sm text-muted-foreground pt-1">
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" /> {format(parseISO(event.date), "PPP")}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                        </div>
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
