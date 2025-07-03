
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Event, User } from '@/lib/users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface EventRegistrationClientProps {
  event: Event;
  author: User;
}

export default function EventRegistrationClient({ event, author }: EventRegistrationClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    console.log("Event registration data:", data);
    // Mock API call
    setTimeout(() => {
      toast({
        title: "Registration Successful!",
        description: `You're all set for ${event.title}. We've sent a confirmation to your email.`,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
        <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="mt-4">You're Registered!</CardTitle>
                    <CardDescription>
                        Thank you for registering for <span className="font-semibold">{event.title}</span>. A confirmation has been sent to your email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Hosted by {author.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {format(parseISO(event.date), "PPP 'at' p")}
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
          <CardTitle>Register for Event</CardTitle>
          <CardDescription>
            You're registering for <span className="font-semibold">{event.title}</span> on {format(parseISO(event.date), "PPP")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : (
                  <>
                    <Ticket className="mr-2 h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
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
