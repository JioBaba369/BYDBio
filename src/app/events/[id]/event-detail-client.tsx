
'use client';

import { useState, useEffect } from 'react';
import type { Event, User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, ArrowLeft, Users, Ticket, User as UserIcon, BellRing, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import ShareButton from '@/components/share-button';
import { Logo } from '@/components/logo';
import * as ics from 'ics';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

interface EventDetailClientProps {
    event: Event;
    author: User;
}

// Client-side date formatter to prevent hydration issues
function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('...');
  useEffect(() => {
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);
  return <>{formattedDate}</>;
}


export default function EventDetailClient({ event, author }: EventDetailClientProps) {
    const attendeeCount = event.rsvps || 0;
    const { toast } = useToast();

    const handleSetReminder = () => {
        toast({
            title: "Reminder Set!",
            description: `We'll remind you about "${event.title}" an hour before it starts.`,
        });
    }

    const handleAddToCalendar = () => {
        const date = parseISO(event.date);
        const icsEvent = {
            start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()] as ics.DateArray,
            duration: { hours: 2 }, // Default duration
            title: event.title,
            description: event.description,
            location: event.location,
            url: window.location.href,
            status: 'CONFIRMED' as ics.EventStatus,
            busyStatus: 'BUSY' as ics.BusyStatus,
            organizer: { name: author.name, email: 'noreply@byd.bio' }, // Using a placeholder email
        };

        const { error, value } = ics.createEvent(icsEvent);

        if (error) {
            console.error(error);
            toast({
                title: "Error creating calendar file",
                description: "There was an issue generating the .ics file. Please try again.",
                variant: "destructive"
            });
            return;
        }

        if (value) {
            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            saveAs(blob, `${event.title.replace(/ /g,"_")}.ics`);
        }
    };


    return (
        <div className="bg-muted/40 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                 <Button asChild variant="ghost" className="pl-0">
                    <Link href={`/u/${author.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {author.name}'s Profile
                    </Link>
                </Button>
                <Card>
                    {event.imageUrl && (
                         <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                            <Image 
                                src={event.imageUrl} 
                                alt={event.title} 
                                width={1200} 
                                height={400} 
                                className="w-full h-full object-cover"
                                data-ai-hint="event poster"
                            />
                        </div>
                    )}
                    <CardContent className="p-6 space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div className='flex-1'>
                                <CardTitle className="text-3xl font-bold font-headline">{event.title}</CardTitle>
                                <CardDescription className="text-base pt-2 flex items-center gap-2">Hosted by <Link href={`/u/${author.username}`} className="font-semibold text-primary hover:underline">{author.name}</Link></CardDescription>
                            </div>
                            <div className='flex items-center gap-2 flex-wrap justify-end'>
                                <Button variant="outline" onClick={handleAddToCalendar}>
                                    <CalendarPlus className="mr-2 h-4 w-4"/>
                                    Add to Calendar
                                </Button>
                                <Button variant="outline" onClick={handleSetReminder}>
                                    <BellRing className="mr-2 h-4 w-4"/>
                                    Set Reminder
                                </Button>
                                <Button asChild size="lg">
                                    <Link href={`/events/${event.id}/register`}>
                                        <Ticket className="mr-2 h-5 w-5"/>
                                        Register Now
                                    </Link>
                                </Button>
                                <ShareButton />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Date</p>
                                    <p className="text-muted-foreground"><ClientFormattedDate dateString={event.date} formatStr="PPP" /></p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Time</p>
                                    <p className="text-muted-foreground"><ClientFormattedDate dateString={event.date} formatStr="p" /></p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Location</p>
                                    <p className="text-muted-foreground">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h3 className="font-semibold text-lg mb-2">About this event</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                        </div>
                        
                        {event.itinerary && event.itinerary.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Event Schedule</h3>
                                <div className="relative border-l-2 border-primary/20 ml-2 space-y-8">
                                    {event.itinerary.map((item, index) => (
                                        <div key={index} className="relative pl-8">
                                            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                                            <p className="font-semibold text-primary">{item.time}</p>
                                            <h4 className="font-semibold text-lg mt-1">{item.title}</h4>
                                            {item.speaker && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                    <UserIcon className="h-3.5 w-3.5" />
                                                    <span>{item.speaker}</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.attendees && event.attendees.length > 0 && (
                             <div>
                                <Separator className="my-8" />
                                <h3 className="font-semibold text-lg mb-2">{attendeeCount} Attendees</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                     <TooltipProvider>
                                        {event.attendees.map(attendee => (
                                            <Tooltip key={attendee.id}>
                                                <TooltipTrigger>
                                                    <Link href={`/u/${author.username}`}>
                                                        <Avatar>
                                                            <AvatarImage src={attendee.avatarUrl} alt={attendee.name} data-ai-hint="person portrait"/>
                                                            <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{attendee.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </TooltipProvider>
                                    {event.attendees.length < (event.rsvps || 0) && (
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                            +{(event.rsvps || 0) - event.attendees.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card className="mt-8">
                    <CardContent className="p-6 text-center">
                        <Logo className="mx-auto text-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                        Want to create your own events?
                        </p>
                        <Button asChild className="mt-4 font-bold">
                            <Link href="/">Create Your Profile & Get Started</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
