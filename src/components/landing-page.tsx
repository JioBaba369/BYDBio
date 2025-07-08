
'use client';

import { useState, useEffect } from 'react';
import { getAllPublicContent, type PublicContentItem } from '@/lib/content';
import ExploreClient from '@/app/explore/explore-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

const LandingPageSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
        </div>
        <Card>
            <Skeleton className="h-24 w-full" />
        </Card>
        <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-52 w-full rounded-t-lg" />
                    <Skeleton className="h-32 w-full p-4" />
                </Card>
            ))}
        </div>
    </div>
);


export function LandingPage() {
    const [items, setItems] = useState<PublicContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        getAllPublicContent()
            .then(setItems)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <LandingPageSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="text-center py-12 md:py-16 px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">Your All-in-One Professional Hub</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Create a dynamic public profile, share a link-in-bio page, post content, manage events, and much more. It's the central point for your online presence.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg">
                        <Link href="/auth/sign-up">
                            Get Started for Free
                        </Link>
                    </Button>
                </div>
            </div>
            <ExploreClient initialItems={items} />
        </div>
    );
}
