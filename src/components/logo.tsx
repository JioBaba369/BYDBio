import { Atom } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-headline text-xl font-bold tracking-tighter text-foreground", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Atom className="h-5 w-5 text-primary" />
      </div>
      <span>BYD.Bio</span>
    </div>
  );
}
