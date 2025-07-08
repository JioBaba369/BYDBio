
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/listings";
import { ClientFormattedCurrency } from "../client-formatted-currency";

export function ListingFeedItem({ item }: { item: Listing }) {
  return (
    <Link href={`/l/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
      <div className="flex gap-4 items-center">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={120}
            height={80}
            className="rounded-lg object-cover"
            data-ai-hint="product design"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="text-primary font-bold">
            <ClientFormattedCurrency value={item.price} />
          </p>
          <Badge variant="secondary" className="mt-1">{item.category}</Badge>
        </div>
      </div>
    </Link>
  );
}
