
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { getDiaryEvents, saveDiaryNote } from '@/lib/events';
import type { Event, User } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookText, Calendar, MapPin, Save, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { reflectOnEvent } from '@/ai/flows/reflect-on-event';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isPast } from 'date-fns';
import { HolidayFeed } from '@/components/holiday-feed';
import { Separator } from '@/components/ui/separator';

type EventWithNotes = Event & { 
  notes?: string; 
  source: 'created' | 'rsvped';
  author?: Pick<User, 'name' | 'username' | 'avatarUrl'>;
};


const DiarySkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="w-full">
                <CardContent className="p-2 sm:p-4 flex justify-center">
                    <Skeleton className="h-80 w-full max-w-sm" />
                </CardContent>
            </Card>
            <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <Card className="border-dashed"><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    </div>
);

const EventCard = ({ event }: { event: EventWithNotes }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [reflecting, setReflecting] = useState(false);
    const [reflections, setReflections] = useState<string[]>([]);
    const [notes, setNotes] = useState(event.notes || '');

    const handleSaveNote = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await saveDiaryNote(user.uid, event.id, notes);
            toast({ title: "Note Saved!", description: `Your notes for "${event.title}" have been saved.` });
        } catch (error) {
            toast({ title: "Failed to save note", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleGenerateReflections = async () => {
        setReflecting(true);
        try {
            const result = await reflectOnEvent({
                eventTitle: event.title,
                eventDescription: event.description,
                userNotes: notes,
            });
            setReflections(result.reflectionPrompts || []);
        } catch (error) {
            toast({ title: "AI Reflection Failed", variant: "destructive" });
        } finally {
            setReflecting(false);
        }
    };
    
    const isEventPast = isPast(event.startDate as Date);

    return (
        <Card className="shadow-none border">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={event.source === 'created' ? 'default' : 'secondary'}>
                        {isEventPast ? (event.source === 'created' ? 'My Event' : 'Attended') : (event.source === 'created' ? 'My Event' : 'Attending')}
                    </Badge>
                </div>
                <CardDescription className="space-y-1 text-sm text-muted-foreground pt-1">
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> 
                        <ClientFormattedDate date={event.startDate as Date} formatStr="PPP 'at' p" />
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
            <CardContent className="pt-0 pb-4 space-y-4">
                 <Separator />
                 <div>
                    <Label htmlFor={`notes-${event.id}`} className="text-base font-semibold">Notes & Reflections</Label>
                    <Textarea
                        id={`notes-${event.id}`}
                        placeholder={isEventPast ? "What did you learn? How can you apply it?" : "Jot down your thoughts, questions, or key takeaways..."}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="mt-2"
                    />
                </div>
                 {reflections.length > 0 && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="text-sm font-semibold">AI Reflection Prompts</h4>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                            {reflections.map((prompt, i) => <li key={i}>{prompt}</li>)}
                        </ul>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex flex-col sm:flex-row items-center gap-4">
                 <Button size="sm" onClick={handleSaveNote} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Note'}
                </Button>

                {isEventPast && (
                    <Button size="sm" variant="secondary" onClick={handleGenerateReflections} disabled={reflecting}>
                        {reflecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {reflecting ? 'Generating...' : 'AI Reflection Prompts'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};


export default function DiaryPage() {
    const { user, loading: authLoading } = useAuth();
    const [events, setEvents] = useState<EventWithNotes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [month, setMonth] = useState<Date>(new Date());
    
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getDiaryEvents(user.uid)
                .then(setEvents)
                .catch(err => {
                    console.error("Error fetching diary events:", err);
                    toast({ title: "Failed to load diary", variant: "destructive" });
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, toast]);

    const eventDays = useMemo(() => {
        return events.map(event => new Date(event.startDate));
    }, [events]);

    const selectedDayItems = useMemo(() => {
        if (!selectedDate) return [];
        const day = format(selectedDate, 'yyyy-MM-dd');
        return events
            .filter(item => format(new Date(item.startDate), 'yyyy-MM-dd') === day)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [selectedDate, events]);
    
    if (authLoading || isLoading) {
        return <DiarySkeleton />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Diary</h1>
                <p className="text-muted-foreground">Select a date to view your schedule and add reflections.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="md:col-span-1">
                    <CardContent className="p-2 sm:p-4 flex justify-center">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={{ hasEvent: eventDays }}
                            modifiersClassNames={{ hasEvent: 'day-with-event' }}
                            className="w-full"
                        />
                    </CardContent>
                </Card>
                
                <div className="md:col-span-1 space-y-4">
                     <h2 className="text-xl font-bold font-headline">
                        Schedule for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </h2>
                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                        {selectedDayItems.length > 0 ? (
                            selectedDayItems.map(event => <EventCard key={event.id} event={event} />)
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                    <BookText className="h-12 w-12" />
                                    <p>No events scheduled for this day.</p>
                                    <Button asChild>
                                        <Link href="/events">Explore Events</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <Separator />
            <HolidayFeed />
        </div>
    );
}
