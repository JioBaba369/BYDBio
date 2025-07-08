
import type { Metadata } from 'next';
import { getEventAndAuthor } from '@/lib/events';
import EventDetailClient from './event-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getEventAndAuthor(params.id);

  if (!data) {
    return {
      title: 'Event Not Found | BYD.Bio',
      description: "The event you're looking for doesn't exist.",
    };
  }

  const { event } = data;
  const imageUrl = event.imageUrl || 'https://placehold.co/1200x630.png';
  const description = event.subTitle ? `${event.subTitle} - ${event.description}` : event.description;

  return {
    title: `${event.title} | BYD.Bio`,
    description: description,
    openGraph: {
      title: `${event.title} | BYD.Bio`,
      description: description,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: event.title } ],
      url: `/events/${event.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${event.title} | BYD.Bio`,
      description: description,
      images: [imageUrl],
    },
  };
}


export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const data = await getEventAndAuthor(params.id);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Event Not Found</h1>
                <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/explore">Back to Explore</Link>
                </Button>
            </div>
        )
    }

    const serializableEvent = {
        ...data.event,
        startDate: (data.event.startDate as Date).toISOString(),
        endDate: data.event.endDate ? (data.event.endDate as Date).toISOString() : null,
        createdAt: (data.event.createdAt as Timestamp).toDate().toISOString(),
        subTitle: data.event.subTitle || null,
    };

    return <EventDetailClient event={serializableEvent} author={data.author} />;
}
