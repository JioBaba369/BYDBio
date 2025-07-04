
import type { Metadata } from 'next';
import { getEventAndAuthor } from '@/lib/events';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EventRegistrationClient from './registration-client';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getEventAndAuthor(params.id);

  if (!data) {
    return {
      title: 'Event Not Found | BYD.Bio',
    };
  }

  const { event } = data;

  return {
    title: `Register for ${event.title} | BYD.Bio`,
    description: `Sign up to attend ${event.title}.`,
  };
}


export default async function EventRegistrationPage({ params }: { params: { id: string } }) {
    const data = await getEventAndAuthor(params.id);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Event Not Found</h1>
                <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/events">Back to Events</Link>
                </Button>
            </div>
        )
    }

    return <EventRegistrationClient event={data.event} author={data.author} />;
}
