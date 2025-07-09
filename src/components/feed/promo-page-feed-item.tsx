
import Image from "next/image";
import Link from "next/link";
import type { PromoPage } from "@/lib/promo-pages";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PromoPageFeedItem({ item }: { item: PromoPage }) {
  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-4">
        <Link href={`/p/${item.id}`} className="flex gap-4 items-center">
          {item.logoUrl && (
            <Image
              src={item.logoUrl}
              alt={item.name}
              width={56}
              height={56}
              className="rounded-full object-contain bg-background"
              data-ai-hint="logo"
            />
          )}
          <div className="flex-1">
            <p className="font-semibold text-base">{item.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
