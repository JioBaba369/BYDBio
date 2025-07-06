
'use client';

import { Progress } from "@/components/ui/progress";
import { Eye, Zap } from "lucide-react";

interface KillChainTrackerProps {
    views: number;
    interactions: number;
    interactionLabel: string;
}

export function KillChainTracker({ views, interactions, interactionLabel }: KillChainTrackerProps) {
  const conversionRate = views > 0 ? (interactions / views) * 100 : 0;

  return (
    <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between items-center text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{views.toLocaleString()} Views</span>
            </div>
             <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                <span>{interactions.toLocaleString()} {interactionLabel}</span>
            </div>
        </div>
      <Progress value={conversionRate} aria-label={`${conversionRate.toFixed(1)}% conversion rate`} />
      <p className="text-xs text-center text-primary font-semibold pt-1">
        {conversionRate.toFixed(1)}% Engagement Rate
      </p>
    </div>
  );
}
