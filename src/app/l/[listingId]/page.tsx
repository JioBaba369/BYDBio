import type { Metadata } from 'next';
import { getListingAndAuthor, type Listing } from '@/lib/listings';
import ListingDetailClient from './listing-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { listingId: string } }): Promise<Metadata> {
  const data = await getListingAndAuthor(params.listingId);

  if (!data) {
    return {
      title: 'Listing Not Found | BYD.Bio',
      description: "The listing you're looking for doesn't exist.",
    };
  }

  const { listing } = data;
  const imageUrl = listing.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${listing.title} | BYD.Bio`,
    description: listing.description,
    openGraph: {
      title: `${listing.title} | BYD.Bio`,
      description: listing.description,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: listing.title } ],
      url: `/l/${listing.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${listing.title} | BYD.Bio`,
      description: listing.description,
      images: [imageUrl],
    },
  };
}


export default async function PublicListingPage({ params }: { params: { listingId: string } }) {
    const data = await getListingAndAuthor(params.listingId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Listing Not Found</h1>
                <p className="text-muted-foreground mt-2">The listing page you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/listings">Back to Listings</Link>
                </Button>
            </div>
        )
    }

    const serializableListing = {
        ...data.listing,
        createdAt: (data.listing.createdAt as Timestamp).toDate().toISOString(),
    };

    return <ListingDetailClient listing={serializableListing} author={data.author} />;
}
