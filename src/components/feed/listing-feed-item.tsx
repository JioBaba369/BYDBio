
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/listings";
import { ClientFormattedCurrency } from "../client-formatted-currency";

export function ListingFeedItem({ item }: { item: Listing }) {
  return (
    <div className="flex gap-4 items-start pt-2">
      {item.imageUrl && (
        <Link href={`/l/${item.id}`}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={120}
            height={80}
            className="rounded-lg object-cover aspect-[3/2] border"
            data-ai-hint="product design"
          />
        </Link>
      )}
      <div className="flex-1 space-y-1">
        <Link href={`/l/${item.id}`} className="hover:underline font-semibold">{item.title}</Link>
        <p className="text-primary font-bold text-lg">
          <ClientFormattedCurrency value={item.price} />
        </p>
        <Badge variant="secondary" className="mt-1">{item.category}</Badge>
      </div>
    </div>
  );
}

    