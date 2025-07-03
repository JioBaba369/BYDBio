
import type { Metadata } from 'next';
import { allUsers, type User, type Business } from '@/lib/users';
import BusinessPageClient from './business-page-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { businessId: string } }): Promise<Metadata> {
  const businessId = params.businessId;
  let business: Business | undefined;
  let author: User | undefined;

  for (const user of allUsers) {
    const foundBusiness = user.businesses.find(b => b.id === businessId);
    if (foundBusiness) {
      business = foundBusiness;
      author = user;
      break;
    }
  }

  if (!business || !author) {
    return {
      title: 'Business Not Found | BYD.Bio',
      description: "The business page you're looking for doesn't exist.",
    };
  }

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


export default function PublicBusinessPage({ params }: { params: { businessId: string } }) {
    const businessId = params.businessId as string;

    // In a real app, you would fetch this from an API.
    let business: Business | undefined;
    let author: User | undefined;
    for (const user of allUsers) {
        const foundBusiness = user.businesses.find(b => b.id === businessId);
        if (foundBusiness) {
            business = foundBusiness;
            author = user;
            break;
        }
    }


    if (!business || !author) {
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

    return <BusinessPageClient business={business} author={author} />;
}
