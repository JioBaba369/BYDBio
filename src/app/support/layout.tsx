
'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeHelp, BookUser, ShieldAlert, Star, Zap, HelpCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const supportNavItems = [
  { href: '/support', label: 'Support Center', icon: BadgeHelp },
  { href: '/support/getting-started', label: 'Getting Started', icon: BookUser },
  { href: '/support/features-and-how-tos', label: 'Features & How-Tos', icon: Zap },
  { href: '/support/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/support/byd-bio-pro', label: 'BYD.Bio Pro', icon: Star },
  { href: '/support/report-a-violation', label: 'Report a Violation', icon: ShieldAlert },
];


export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-8 items-start">
        <aside className="hidden md:flex flex-col gap-2 md:sticky top-20">
             <nav className="grid gap-1">
                {supportNavItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
                ))}
            </nav>
        </aside>
        <main className="w-full overflow-hidden">
            {children}
        </main>
    </div>
  );
}
