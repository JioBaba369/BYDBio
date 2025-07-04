
import type { Metadata } from 'next';
import { getOfferAndAuthor } from '@/lib/offers';
import OfferDetailClient from './offer-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { offerId: string } }): Promise<Metadata> {
  const data = await getOfferAndAuthor(params.offerId);

  if (!data) {
    return {
      title: 'Offer Not Found | BYD.Bio',
      description: "The offer you're looking for doesn't exist.",
    };
  }

  const { offer } = data;
  const imageUrl = offer.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${offer.title} | BYD.Bio`,
    description: offer.description,
    openGraph: {
      title: `${offer.title} | BYD.Bio`,
      description: offer.description,
      images: [ { url: imageUrl, width: 1200, height: 630, alt: offer.title } ],
      url: `/offer/${offer.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${offer.title} | BYD.Bio`,
      description: offer.description,
      images: [imageUrl],
    },
  };
}


export default async function PublicOfferPage({ params }: { params: { offerId: string } }) {
    const data = await getOfferAndAuthor(params.offerId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Offer Not Found</h1>
                <p className="text-muted-foreground mt-2">The offer page you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/offers">Back to Offers</Link>
                </Button>
            </div>
        )
    }

    return <OfferDetailClient offer={data.offer} author={data.author} />;
}
