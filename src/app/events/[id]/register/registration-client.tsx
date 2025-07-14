
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/users';
import type { Event } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { toggleRsvp } from '@/lib/events';

interface EventRegistrationClientProps {
  event: Event;
  author: User;
}

export default function EventRegistrationClient({ event, author }: EventRegistrationClientProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formattedDateTime, setFormattedDateTime] = useState('...');

  useEffect(() => {
    // This effect runs only on the client, after initial render, to prevent hydration errors.
    if (event.startDate) {
      try {
        const dateObj = typeof event.startDate === 'string' ? parseISO(event.startDate) : (event.startDate as any).toDate();
        setFormattedDateTime(format(dateObj, "PPP 'at' p"));
      } catch (e) {
        setFormattedDateTime('Invalid Date');
      }
    }
  }, [event.startDate]);

  const handleRsvp = async () => {
    if (!user) {
        toast({ title: "Please sign in to RSVP", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
        await toggleRsvp(event.id, user.uid);
        toast({
            title: "Registration Successful!",
            description: `You're all set for ${event.title}. We've added it to your diary.`,
        });
        setIsSubmitted(true);
    } catch (error) {
        toast({ title: "Failed to RSVP", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
        <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="mt-4">You're Attending!</CardTitle>
                    <CardDescription>
                        You have successfully RSVP'd to <span className="font-semibold">{event.title}</span>. The event has been added to your diary.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Hosted by {author.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {formattedDateTime}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/events/${event.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Event Details
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Attendance</CardTitle>
          <CardDescription>
            You're about to RSVP for <span className="font-semibold">{event.title}</span> on {formattedDateTime}.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Click the button below to confirm you're going. This event will be added to your personal diary.</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button onClick={handleRsvp} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Confirming..." : (
                <>
                <Ticket className="mr-2 h-4 w-4" />
                Confirm and RSVP
                </>
            )}
            </Button>
            <Button asChild variant="ghost" size="sm" className="mx-auto">
              <Link href={`/events/${event.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel and return to event
              </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
