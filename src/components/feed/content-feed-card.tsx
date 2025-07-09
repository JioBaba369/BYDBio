
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import type { ReactNode } from "react";
import type { User } from "@/lib/users";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ContentFeedCardProps {
  author: User;
  date: string;
  category: string;
  children: ReactNode;
}

const formatCategory = (category: string) => {
    switch (category) {
        case 'promoPage': return 'Business Page';
        case 'listing': return 'Listing';
        case 'job': return 'Job';
        case 'event': return 'Event';
        case 'offer': return 'Offer';
        default: return 'Update';
    }
};

export function ContentFeedCard({ author, date, category, children }: ContentFeedCardProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <Link href={`/u/${author.username}`} className="flex items-center gap-3 hover:underline">
                <Avatar>
                    <AvatarImage src={author.avatarUrl} />
                    <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{author.name}</p>
                    <p className="text-sm text-muted-foreground">@{author.username} · <ClientFormattedDate date={date} relative /></p>
                </div>
            </Link>
            <Badge variant="secondary">{formatCategory(category)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

    