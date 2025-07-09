
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { PublicContentItem } from '@/lib/content';
import { Eye, MousePointerClick, Gift, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { VariantProps } from 'class-variance-authority';
import { cn } from "@/lib/utils";
import { ClientFormattedDate } from "./client-formatted-date";

const getBadgeVariant = (itemType: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (itemType) {
        case 'event': return 'default';
        case 'offer': return 'secondary';
        case 'job': return 'destructive';
        case 'listing': return 'outline';
        case 'promoPage': return 'default';
        default: return 'default';
    }
}

const getLink = (item: PublicContentItem) => {
    switch (item.type) {
        case 'event': return `/events/${item.id}`;
        case 'offer': return `/offer/${item.id}`;
        case 'job': return `/job/${item.id}`;
        case 'listing': return `/l/${item.id}`;
        case 'promoPage': return `/p/${item.id}`;
    }
}

const getPopularity = (item: PublicContentItem) => {
  switch (item.type) {
      case 'event': return (item as any).rsvps?.length ?? 0;
      case 'offer': return (item as any).claims ?? 0;
      case 'job': return (item as any).applicants ?? 0;
      case 'listing': return (item as any).clicks ?? 0;
      case 'promoPage': return (item as any).clicks ?? 0;
      default: return 0;
  }
};

const getPrimaryStat = (item: PublicContentItem) => {
    const value = getPopularity(item);
    let icon = MousePointerClick; // default
    if (item.type === 'event' || item.type === 'job') icon = Users;
    if (item.type === 'offer') icon = Gift;
    return { icon, value };
}

export function PublicContentCard({ item }: { item: PublicContentItem }) {
    const title = (item as any).title || (item as any).name;
    const primaryStat = getPrimaryStat(item);
    const itemTypeLabel = item.type === 'promoPage' ? 'Business Page' : item.type;
    const itemLink = getLink(item);

    return (
        <Card className="shadow-sm flex flex-col hover:shadow-lg transition-shadow duration-200">
            {item.imageUrl && (
                <Link href={itemLink} className="block overflow-hidden rounded-t-lg">
                    <Image src={item.imageUrl} alt={title} width={600} height={400} className="w-full object-cover aspect-video transition-transform hover:scale-105" data-ai-hint="office laptop" />
                </Link>
            )}
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <Badge variant={getBadgeVariant(item.type)} className="capitalize">{itemTypeLabel}</Badge>
                    <ClientFormattedDate date={item.date} relative/>
                </div>
                <CardTitle className="text-base mt-1"><Link href={itemLink} className="hover:underline">{title}</Link></CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-sm text-muted-foreground flex-grow">
                 <div className="flex items-center pt-1">
                    <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={item.author.avatarUrl} alt={item.author.name} data-ai-hint="person portrait"/>
                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{item.author.name}</span>
                    </Link>
                </div>
                <p className="line-clamp-2 h-10">{item.description}</p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-4 px-4 pb-4">
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{(item as any).views?.toLocaleString() ?? 0} views</span>
                    </div>
                    {primaryStat && (
                    <div className="flex items-center gap-1.5">
                        <primaryStat.icon className="h-3.5 w-3.5" />
                        <span>{primaryStat.value.toLocaleString()}</span>
                    </div>
                    )}
                </div>
                <Button asChild variant="secondary" className="w-full">
                    <Link href={itemLink}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
