
'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Shield, Cookie, CandlestickChart, Handshake, Files } from 'lucide-react';

const trustNavItems = [
  { href: '/trust', label: 'Trust Center', icon: Shield },
  { href: '/trust/terms', label: 'Terms & Conditions', icon: Scale },
  { href: '/trust/privacy', label: 'Privacy Notice', icon: Handshake },
  { href: '/trust/cookies', label: 'Cookie Notice', icon: Cookie },
  { href: '/trust/transparency', label: 'Transparency Report', icon: CandlestickChart },
  { href: '/trust/law-enforcement', label: 'Law Enforcement', icon: Files },
];


export default function TrustLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-8 items-start">
        <aside className="hidden md:flex flex-col gap-2 md:sticky top-20">
             <nav className="grid gap-1">
                {trustNavItems.map((item) => (
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
