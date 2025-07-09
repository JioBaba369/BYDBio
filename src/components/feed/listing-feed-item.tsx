
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/listings";
import { ClientFormattedCurrency } from "../client-formatted-currency";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ListingFeedItem({ item }: { item: Listing }) {
  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
       <CardHeader>
        <CardTitle className="text-base"><Link href={`/l/${item.id}`} className="hover:underline">{item.title}</Link></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-start">
          {item.imageUrl && (
            <Link href={`/l/${item.id}`}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={120}
                height={80}
                className="rounded-lg object-cover aspect-[3/2]"
                data-ai-hint="product design"
              />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-primary font-bold text-lg">
              <ClientFormattedCurrency value={item.price} />
            </p>
            <Badge variant="secondary" className="mt-1">{item.category}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
