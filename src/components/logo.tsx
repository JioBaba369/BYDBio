import { Atom } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold tracking-tighter text-foreground", className)}>
      <Atom className="h-6 w-6 text-primary" />
      <span className="font-semibold">BYD.Bio</span>
    </Link>
  );
}
