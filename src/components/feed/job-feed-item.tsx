
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import type { Job } from "@/lib/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function JobFeedItem({ item }: { item: Job }) {
  return (
     <Card className="shadow-sm transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base"><Link href={`/job/${item.id}`} className="hover:underline">{item.title}</Link></CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4"/> {item.company}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
        <div className="pt-2">
          <Badge variant="destructive">{item.type}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
