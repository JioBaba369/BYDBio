import type { Metadata } from 'next';
import { allUsers, type User, type Listing } from '@/lib/users';
import ListingDetailClient from './listing-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper to find listing and its author
function findListingAndAuthor(listingId: string): { listing: Listing; author: User } | null {
    for (const user of allUsers) {
        const listing = user.listings.find(l => l.id === listingId);
        if (listing) {
            return { listing, author: user };
        }
    }
    return null;
}

export async function generateMetadata({ params }: { params: { listingId: string } }): Promise<Metadata> {
  const data = findListingAndAuthor(params.listingId);

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


export default function PublicListingPage({ params }: { params: { listingId: string } }) {
    const data = findListingAndAuthor(params.listingId);

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

    return <ListingDetailClient listing={data.listing} author={data.author} />;
}
