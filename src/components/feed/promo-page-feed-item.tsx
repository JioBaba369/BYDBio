
import Image from "next/image";
import Link from "next/link";
import type { PromoPage } from "@/lib/promo-pages";

export function PromoPageFeedItem({ item }: { item: PromoPage }) {
  return (
    <div className="flex gap-4 items-center pt-2">
      {item.logoUrl && (
        <Image
          src={item.logoUrl}
          alt={item.name}
          width={56}
          height={56}
          className="rounded-full object-contain bg-background border self-start"
          data-ai-hint="logo"
        />
      )}
      <div className="flex-1">
        <Link href={`/p/${item.id}`} className="hover:underline font-semibold">{item.name}</Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
      </div>
    </div>
  );
}

    