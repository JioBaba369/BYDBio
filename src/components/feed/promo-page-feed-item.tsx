
import Image from "next/image";
import Link from "next/link";
import type { PromoPage } from "@/lib/promo-pages";

export function PromoPageFeedItem({ item }: { item: PromoPage }) {
  return (
    <Link href={`/p/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
      <div className="flex gap-4">
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
          <p className="font-semibold">{item.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      </div>
    </Link>
  );
}
