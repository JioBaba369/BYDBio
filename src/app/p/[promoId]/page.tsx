
import type { Metadata } from 'next';
import { getPromoPageAndAuthor } from '@/lib/promo-pages';
import PromoPageClient from './promo-page-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { promoId: string } }): Promise<Metadata> {
  const data = await getPromoPageAndAuthor(params.promoId);

  if (!data) {
    return {
      title: 'Page Not Found | BYD.Bio',
      description: "The page you're looking for doesn't exist.",
    };
  }

  const { promoPage } = data;
  const imageUrl = promoPage.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${promoPage.name} | BYD.Bio`,
    description: promoPage.description,
    openGraph: {
      title: `${promoPage.name} | BYD.Bio`,
      description: promoPage.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: promoPage.name,
        },
      ],
      url: `/p/${promoPage.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${promoPage.name} | BYD.Bio`,
      description: promoPage.description,
      images: [imageUrl],
    },
  };
}


export default async function PublicPromoPage({ params }: { params: { promoId: string } }) {
    const data = await getPromoPageAndAuthor(params.promoId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Page Not Found</h1>
                <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist or has been moved.</p>
                <Button asChild className="mt-6">
                    <Link href="/explore">Back to Explore</Link>
                </Button>
            </div>
        )
    }

    return <PromoPageClient promoPage={data.promoPage} author={data.author} />;
}
