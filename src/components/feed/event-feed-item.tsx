
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import type { Event } from "@/lib/events";

export function EventFeedItem({ item }: { item: Event }) {
  return (
    <div className="pt-2 space-y-2">
      <Link href={`/events/${item.id}`} className="hover:underline font-semibold text-lg">{item.title}</Link>
      {item.imageUrl && (
        <Link href={`/events/${item.id}`}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={600}
            height={200}
            className="rounded-lg object-cover w-full aspect-video border"
            data-ai-hint="event poster"
          />
        </Link>
      )}
      <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-1"><Calendar className="h-4 w-4"/> <ClientFormattedDate date={item.startDate} formatStr="PPP p"/></p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
    </div>
  );
}

    