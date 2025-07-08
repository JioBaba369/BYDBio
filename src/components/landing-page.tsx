
'use client';

import { useState, useEffect } from 'react';
import { getAllPublicContent, type PublicContentItem } from '@/lib/content';
import ExploreClient from '@/app/explore/explore-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <LandingPageSkeleton />;
    }

    return <ExploreClient initialItems={items} />;
}
