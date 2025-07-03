
import type { Metadata } from 'next';
import { getBusinessAndAuthor } from '@/lib/businesses';
import BusinessPageClient from './business-page-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { businessId: string } }): Promise<Metadata> {
  const data = await getBusinessAndAuthor(params.businessId);

  if (!data) {
    return {
      title: 'Business Not Found | BYD.Bio',
      description: "The business page you're looking for doesn't exist.",
    };
  }

  const { business } = data;
  const imageUrl = business.imageUrl || 'https://placehold.co/1200x630.png';

  return {
    title: `${business.name} | BYD.Bio`,
    description: business.description,
    openGraph: {
      title: `${business.name} | BYD.Bio`,
      description: business.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: business.name,
        },
      ],
      url: `/b/${business.id}`,
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${business.name} | BYD.Bio`,
      description: business.description,
      images: [imageUrl],
    },
  };
}


export default async function PublicBusinessPage({ params }: { params: { businessId: string } }) {
    const data = await getBusinessAndAuthor(params.businessId);

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-4xl font-bold">Business Not Found</h1>
                <p className="text-muted-foreground mt-2">The business page you're looking for doesn't exist.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        )
    }

    return <BusinessPageClient business={data.business} author={data.author} />;
}
