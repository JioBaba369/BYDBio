
'use client';

import { useParams } from 'next/navigation';
import { allUsers } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { businessId: string } }): Promise<Metadata> {
  const businessId = params.businessId;
  let business;
  let author;

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


export default function PublicBusinessPage() {
    const params = useParams();
    const businessId = params.businessId as string;

    // In a real app, you would fetch this from an API.
    let business;
    let author;
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

    return (
        <div className="bg-muted/40 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                 <Button asChild variant="ghost" className="pl-0">
                    <Link href={`/u/${author.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {author.name}'s Profile
                    </Link>
                </Button>
                <Card>
                    {business.imageUrl && (
                         <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                            <Image 
                                src={business.imageUrl} 
                                alt={business.name} 
                                width={1200} 
                                height={400} 
                                className="w-full h-full object-cover"
                                data-ai-hint="office storefront"
                            />
                        </div>
                    )}
                    <CardContent className="p-6">
                         <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16">
                            {business.logoUrl && (
                                <Image
                                    src={business.logoUrl}
                                    alt={`${business.name} logo`}
                                    width={120}
                                    height={120}
                                    className="rounded-full border-4 border-background bg-background shrink-0"
                                    data-ai-hint="logo"
                                />
                            )}
                            <div className="pt-16 flex-1">
                                <CardTitle className="text-3xl font-bold font-headline">{business.name}</CardTitle>
                                <CardDescription className="text-base pt-2">{business.description}</CardDescription>
                            </div>
                        </div>

                        <div className="mt-8 grid md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Contact Information</h3>
                                <div className="space-y-3 text-muted-foreground">
                                    {business.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                            <span>{business.address}</span>
                                        </div>
                                    )}
                                    {business.email && (
                                        <a href={`mailto:${business.email}`} className="flex items-center gap-3 hover:text-primary">
                                            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span>{business.email}</span>
                                        </a>
                                    )}
                                    {business.phone && (
                                        <a href={`tel:${business.phone}`} className="flex items-center gap-3 hover:text-primary">
                                            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span>{business.phone}</span>
                                        </a>
                                    )}
                                    {business.website && (
                                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary">
                                            <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span>{business.website.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Location</h3>
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">[Map Placeholder]</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="mt-8">
                    <CardContent className="p-6 text-center">
                        <Logo className="mx-auto text-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                        Want to create your own business page?
                        </p>
                        <Button asChild className="mt-4 font-bold">
                            <Link href="/">Create Your Profile & Get Started</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
