
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Offer } from "@/lib/offers";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function OfferFeedItem({ item }: { item: Offer }) {
  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base"><Link href={`/offer/${item.id}`} className="hover:underline">{item.title}</Link></CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="pt-1">
            <Badge variant="secondary">{item.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
