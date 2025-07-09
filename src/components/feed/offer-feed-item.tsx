
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Offer } from "@/lib/offers";

export function OfferFeedItem({ item }: { item: Offer }) {
  return (
    <div className="pt-2 space-y-2">
      <Link href={`/offer/${item.id}`} className="hover:underline font-semibold text-lg">{item.title}</Link>
      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
      <div className="pt-1">
          <Badge variant="secondary">{item.category}</Badge>
      </div>
    </div>
  );
}

    