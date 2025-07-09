
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import type { Job } from "@/lib/jobs";

export function JobFeedItem({ item }: { item: Job }) {
  return (
    <div className="pt-2 space-y-1">
      <Link href={`/job/${item.id}`} className="hover:underline font-semibold text-lg">{item.title}</Link>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4"/> {item.company}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
      <div className="pt-2">
        <Badge variant="destructive">{item.type}</Badge>
      </div>
    </div>
  );
}

    