
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import type { Event } from "@/lib/events";

export function EventFeedItem({ item }: { item: Event }) {
  return (
    <Link href={`/events/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4 space-y-2">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.title}
          width={600}
          height={200}
          className="rounded-lg object-cover w-full aspect-video"
          data-ai-hint="event poster"
        />
      )}
      <p className="font-semibold pt-1">{item.title}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4"/> <ClientFormattedDate date={item.startDate} formatStr="PPP p"/></p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
    </Link>
  );
}
