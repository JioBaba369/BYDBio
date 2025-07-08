
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import type { Job } from "@/lib/jobs";

export function JobFeedItem({ item }: { item: Job }) {
  return (
    <Link href={`/opportunities/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4 space-y-1">
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4"/> {item.company}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
      <div className="pt-1">
        <Badge variant="destructive">{item.type}</Badge>
      </div>
    </Link>
  );
}
