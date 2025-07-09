
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Bug, Calendar, Nfc, ScanLine, Sparkles, PackageSearch, Redo, PaintBrush } from "lucide-react";
import { ClientFormattedDate } from "@/components/client-formatted-date";

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Zap,
  Bug,
  Calendar,
  Nfc,
  ScanLine,
  Sparkles,
  PackageSearch,
  Redo,
  PaintBrush,
};


type UpdateItem = {
  date: string; // ISO 8601 date string
  version: string;
  title: string;
  description: string;
  badge: {
    text: 'New Feature' | 'Improvement' | 'Aesthetic' | 'Fix';
    icon: keyof typeof iconMap;
  };
};

const updates: UpdateItem[] = [
  {
    date: '2025-07-09T10:00:00Z',
    version: 'v2.1.0',
    title: 'Scan to Connect with QR Codes',
    description: 'Networking just got even easier. Use the new in-app QR code scanner to instantly connect with other users or add their digital business cards to your contacts. Perfect for events and face-to-face meetings.',
    badge: { text: 'New Feature', icon: 'ScanLine' },
  },
  {
    date: '2025-07-05T10:00:00Z',
    version: 'v2.0.0',
    title: 'AI-Powered Content Creation',
    description: 'Supercharge your content with our new AI assistant. Generate professional bios, suggest event titles, and brainstorm ideas for your next post, all with the power of generative AI. Look for the ✨ sparkle icon to get started!',
    badge: { text: 'New Feature', icon: 'Sparkles' },
  },
   {
    date: '2025-06-28T12:00:00Z',
    version: 'v1.9.0',
    title: 'Introducing the BYD BioTAG',
    description: 'Bridge the physical and digital worlds with BYD BioTAG. This NFC-enabled tag links directly to your digital business card, allowing you to share your profile with a single tap. A modern, impressive, and eco-friendly way to network.',
    badge: { text: 'New Feature', icon: 'Nfc' },
  },
  {
    date: '2025-06-25T12:00:00Z',
    version: 'v1.7.0',
    title: 'Foundational Refactoring & Major Bug Bash',
    description: 'In our most significant update yet, we have performed a deep-dive refactoring of the entire application. This addresses over a dozen subtle "misfiring" bugs, improves data consistency, and enhances performance across the board. Key improvements include optimized database queries, more robust user interaction logic, and a streamlined codebase for future features.',
    badge: { text: 'Improvement', icon: 'Zap' },
  },
  {
    date: '2025-06-20T12:00:00Z',
    version: 'v1.5.0',
    title: 'Major Aesthetic Overhaul',
    description: 'Introducing a completely redesigned look and feel across the entire application. We\'ve implemented a new, sophisticated color palette and updated our typography to create a more modern, professional, and cohesive user experience.',
    badge: { text: 'Aesthetic', icon: 'PaintBrush' },
  },
  {
    date: '2025-06-15T12:00:00Z',
    version: 'v1.4.0',
    title: 'Unified Explore Page',
    description: 'Discover all public content—from listings to events—in a single, filterable feed. The new Explore page makes it easier than ever to see what the community is creating.',
    badge: { text: 'New Feature', icon: 'PackageSearch' },
  },
  {
    date: '2025-06-10T12:00:00Z',
    version: 'v1.3.1',
    title: 'Interactive Diary & Content Calendar',
    description: 'We\'ve supercharged the "My Content" and "Diary" pages with new calendar views. Visualize your schedule, manage events with notes, and get a high-level view of all your content in one place.',
    badge: { text: 'Improvement', icon: 'Calendar' },
  },
  {
    date: '2025-06-05T12:00:00Z',
    version: 'v1.3.0',
    title: 'Consistent Grid & List Views',
    description: 'All content management pages (Listings, Opportunities, etc.) now feature consistent grid/list view toggles and a denser table layout, giving you more control over how you manage your content.',
    badge: { text: 'Improvement', icon: 'Redo' },
  },
  {
    date: '2025-05-30T12:00:00Z',
    version: 'v1.2.1',
    title: 'Security & Bug Fixes',
    description: 'Conducted a comprehensive security audit, hardening Firestore rules and fixing several minor bugs to improve application stability and security.',
    badge: { text: 'Fix', icon: 'Bug' },
  },
  {
    date: '2025-05-25T12:00:00Z',
    version: 'v1.2.0',
    title: 'Digital Business Pages',
    description: 'Launch dedicated pages for your businesses. Showcase your brand, link to your main profile, and make it easier for customers to connect with you.',
    badge: { text: 'New Feature', icon: 'Rocket' },
  },
];

const UpdateCard = ({ item }: { item: UpdateItem }) => {
    const Icon = iconMap[item.badge.icon];
    if (!Icon) return null; // Safety check in case of a typo in the data
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle>{item.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        {item.badge.text}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-x-4 text-xs pt-2 font-mono">
                    <span><ClientFormattedDate date={item.date} formatStr="d MMMM yyyy" /></span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{item.version}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
        </Card>
    )
};


export default function WhatsNewPage() {
    // Group updates by year
    const updatesByYear = updates.reduce((acc, update) => {
        const year = new Date(update.date).getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(update);
        return acc;
    }, {} as Record<number, UpdateItem[]>);

    const sortedYears = Object.keys(updatesByYear).map(Number).sort((a, b) => b - a);

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">What's New in BYD.Bio</h1>
                <p className="text-muted-foreground mt-2">Stay up-to-date with our latest features and improvements.</p>
            </div>
            <div className="space-y-12">
                {sortedYears.map(year => (
                    <div key={year}>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 font-headline">
                            <Calendar className="w-6 h-6 text-primary" /> {year} Updates
                        </h2>
                        <div className="space-y-6">
                            {updatesByYear[year].map((update, index) => (
                                <UpdateCard key={index} item={update} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
