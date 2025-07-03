import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-headline text-xl font-bold tracking-tighter text-sidebar-foreground", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Share2 className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div>BYD.Bio</div>
        <div className="text-xs font-normal text-muted-foreground -mt-1 leading-tight">Build Your Dream Bio</div>
      </div>
    </div>
  );
}
