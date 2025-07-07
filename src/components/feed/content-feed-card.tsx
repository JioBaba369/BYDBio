
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import type { ReactNode } from "react";

interface ContentFeedCardProps {
  title: ReactNode;
  date: string;
  children: ReactNode;
}

export function ContentFeedCard({ title, date, children }: ContentFeedCardProps) {
  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2">
        <ClientFormattedDate date={date} relative />
      </CardFooter>
    </Card>
  );
}
