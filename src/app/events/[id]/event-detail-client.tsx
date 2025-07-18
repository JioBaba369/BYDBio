
'use client';

import type { User } from '@/lib/users';
import type { Event } from '@/lib/events';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, ArrowLeft, Users, Ticket, User as UserIcon, CalendarPlus, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import ShareButton from '@/components/share-button';
import * as ics from 'ics';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { parseISO } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { AuthorCard } from '@/components/author-card';
import { CouponDisplay } from '@/components/coupon-display';
import { FollowButton } from '@/components/follow-button';
import { Badge } from '@/components/ui/badge';


interface EventDetailClientProps {
    event: Event;
    author: User;
}

export default function EventDetailClient({ event, author }: EventDetailClientProps) {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const attendeeCount = event.rsvps?.length || 0;
    const isOwner = currentUser && currentUser.uid === author.uid;
    const isFollowing = currentUser?.subscriptions?.events?.includes(event.id) || false;

    const handleAddToCalendar = () => {
        const date = parseISO(event.startDate as string);
        const icsEvent: ics.EventAttributes = {
            start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
            title: event.title,
            description: event.description,
            location: event.location,
            url: window.location.href,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: { name: author.name, email: 'noreply@byd.bio' }, // Using a placeholder email
        };

        if (event.endDate) {
            const endDate = parseISO(event.endDate as string);
            icsEvent.end = [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()];
        } else {
            icsEvent.duration = { hours: 2 }; // Default duration
        }


        const { error, value } = ics.createEvent(icsEvent);

        if (error) {
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
        <div className="bg-dot min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                 <Button asChild variant="ghost" className="pl-0">
                    <Link href={`/u/${author.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {author.name}'s Profile
                    </Link>
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            {event.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                                    <Image 
                                        src={event.imageUrl} 
                                        alt={event.title} 
                                        width={1200} 
                                        height={400} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardContent className="p-6 space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                    <div className='flex-1'>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {event.category && <Badge variant="secondary">{event.category}</Badge>}
                                            {event.subCategory && <Badge variant="outline">{event.subCategory}</Badge>}
                                        </div>
                                        <CardTitle className="text-3xl font-bold font-headline mt-2">{event.title}</CardTitle>
                                        {event.subTitle && <p className="text-lg text-muted-foreground mt-1">{event.subTitle}</p>}
                                        <CardDescription className="text-base pt-2 flex items-center gap-2">Hosted by <Link href={`/u/${author.username}`} className="font-semibold text-primary hover:underline">{author.name}</Link></CardDescription>
                                    </div>
                                    <div className='flex items-center gap-2 flex-wrap justify-end'>
                                        {isOwner && (
                                            <Button asChild variant="outline">
                                                <Link href={`/events/${event.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit Event
                                                </Link>
                                            </Button>
                                        )}
                                        {!isOwner && currentUser && (
                                            <FollowButton
                                            contentId={event.id}
                                            contentType="events"
                                            authorId={author.uid}
                                            entityTitle={event.title}
                                            initialIsFollowing={isFollowing}
                                            />
                                        )}
                                        <ShareButton variant="outline" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{event.endDate ? 'Starts' : 'Date'}</p>
                                            <p className="text-muted-foreground"><ClientFormattedDate date={event.startDate as string} formatStr="PPP" /></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">Time</p>
                                            <p className="text-muted-foreground"><ClientFormattedDate date={event.startDate as string} formatStr="p" /></p>
                                        </div>
                                    </div>
                                    {event.endDate ? (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Ends</p>
                                                <p className="text-muted-foreground"><ClientFormattedDate date={event.endDate as string} formatStr="PPP" /></p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Location</p>
                                                <p className="text-muted-foreground">{event.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />
                                
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">About this event</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                                    {event.couponCode && <CouponDisplay code={event.couponCode} />}
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
                                                            <Link href={`/u/${attendee.username}`}>
                                                                <Avatar>
                                                                    <AvatarImage src={attendee.avatarUrl} alt={attendee.name} />
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
                                            {event.attendees.length < (event.rsvps?.length || 0) && (
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                    +{(event.rsvps?.length || 0) - event.attendees.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                <div className='flex items-center gap-2 flex-wrap justify-start w-full'>
                                    <Button variant="outline" onClick={handleAddToCalendar}>
                                        <CalendarPlus className="mr-2 h-4 w-4"/>
                                        Add to Calendar
                                    </Button>
                                    {!isOwner && (
                                        event.ctaLink ? (
                                            <Button asChild size="lg">
                                                <a href={event.ctaLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-5 w-5"/>
                                                    Register Now
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button asChild size="lg">
                                                <Link href={`/events/${event.id}/register`}>
                                                    <Ticket className="mr-2 h-5 w-5"/>
                                                    Register Now
                                                </Link>
                                            </Button>
                                        )
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                     <div className="md:col-span-1 space-y-6">
                        <AuthorCard author={author} isOwner={isOwner} authorTypeLabel="Host" />
                    </div>
                </div>
            </div>
        </div>
    );
}
