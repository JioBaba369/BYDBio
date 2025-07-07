
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Offer } from "@/lib/offers";

export function OfferFeedItem({ item }: { item: Offer }) {
  return (
    <Link href={`/offer/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4 space-y-1">
        <p className="font-semibold">{item.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="pt-1">
            <Badge variant="secondary">{item.category}</Badge>
        </div>
    </Link>
  );
}
