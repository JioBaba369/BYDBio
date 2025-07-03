
import type { Metadata } from 'next';
import { allUsers, type User, type Event } from '@/lib/users';
import EventDetailClient from './event-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper to find event and its author
function findEventAndAuthor(eventId: string): { event: Event; author: User } | null {
    for (const user of allUsers) {
        const event = user.events.find(e => e.id === eventId);
        if (event) {
            return { event, author: user };
        }
    }
    return null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = findEventAndAuthor(params.id);

  if (!data) {
    return {
      title: 'Event Not Found | BYD.Bio',
      description: "The event you're looking for doesn't exist.",
    };
  }

  const { event } = data;
  const imageUrl = event.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${event.title} | BYD.Bio`,
    description: event.description,
    openGraph: {
      title: `${event.title} | BYD.Bio`,
      description: event.description,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: event.title } ],
      url: `/events/${event.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${event.title} | BYD.Bio`,
      description: event.description,
      images: [imageUrl],
    },
  };
}


export default function EventDetailPage({ params }: { params: { id: string } }) {
    const data = findEventAndAuthor(params.id);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Event Not Found</h1>
                <p className="text-muted-foreground mt-2">The event page you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/events">Back to Events</Link>
                </Button>
            </div>
        )
    }

    return <EventDetailClient event={data.event} author={data.author} />;
}
