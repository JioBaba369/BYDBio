
'use client';

import { useState, useEffect } from 'react';
import { getAllPublicContent } from '@/lib/users';
import type { PublicContentItem } from '@/lib/users';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { PublicContentCard } from '@/components/public-content-card';
import { ArrowRight } from 'lucide-react';
import { useAuth } from './auth-provider';
import { ClientYear } from '@/components/client-year';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

const LandingPageSkeleton = () => (
    <div className="space-y-16 animate-pulse">
        <div className="text-center py-12 md:py-16 px-4">
            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto mt-4" />
            <Skeleton className="h-12 w-48 mx-auto mt-8" />
        </div>
         <div className="space-y-8">
            <div className="text-center">
                <Skeleton className="h-9 w-72 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-40 w-full rounded-t-lg" />
                        <Skeleton className="h-44 w-full p-4" />
                    </Card>
                ))}
            </div>
            <div className="text-center">
                <Skeleton className="h-11 w-36 mx-auto" />
            </div>
        </div>
    </div>
);


export function LandingPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<PublicContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        getAllPublicContent()
            .then(content => setItems(content.slice(0, 6))) // Only take the first 6 items
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <LandingPageSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <div className="space-y-16">
                <section className="relative">
                    <div className="absolute inset-0 bg-dot opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_60%)]"></div>
                    <div className="relative z-10 container mx-auto text-center py-16 md:py-24 px-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">Your All-in-One Professional Hub</h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Create a dynamic public profile, share a link-in-bio page, post content, manage events, and much more. It's the central point for your online presence.
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg">
                                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                                    {user ? "Go to Dashboard" : "Get Started for Free"}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                <div className="space-y-8 container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-headline font-bold">Latest from the Community</h2>
                        <p className="mt-2 text-muted-foreground">See what others are creating and sharing right now.</p>
                    </div>
                    
                    {items.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => <PublicContentCard key={`${item.type}-${item.id}`} item={item} />)}
                            </div>
                            <div className="text-center">
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/explore">
                                        Explore All Content <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="p-10 text-center">
                                <p className="text-muted-foreground">Nothing has been posted by the community yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
          </main>
          <footer className="bg-muted/40 mt-16">
            <div className="container mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <Logo />
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <Link href="/support" className="hover:text-primary">Support</Link>
                    <Link href="/trust" className="hover:text-primary">Trust Center</Link>
                    <Link href="/whats-new" className="hover:text-primary">What's New</Link>
                    <Link href="/url-tree" className="hover:text-primary">URL Tree</Link>
                </nav>
              </div>
              <Separator className="my-6" />
              <p className="text-center text-sm text-muted-foreground">&copy; <ClientYear /> BYD.Bio. All Rights Reserved.</p>
            </div>
          </footer>
        </div>
    );
}
