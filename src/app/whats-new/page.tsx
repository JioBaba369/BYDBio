
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Palette, Bug, Calendar as CalendarIcon, Nfc } from "lucide-react";
import { ClientFormattedDate } from "@/components/client-formatted-date";

type UpdateItem = {
  date: string; // ISO 8601 date string
  version: string;
  title: string;
  description: string;
  badge: {
    text: 'New Feature' | 'Improvement' | 'Aesthetic' | 'Fix';
    icon: React.ElementType;
    className: string;
  };
};

const updates: UpdateItem[] = [
   {
    date: '2025-07-31T12:00:00Z',
    version: 'v1.9.0',
    title: 'Introducing the BYDTAG',
    description: 'Bridge the physical and digital worlds with BYDTAG. This NFC-enabled tag links directly to your digital business card, allowing you to share your profile with a single tap. A modern, impressive, and eco-friendly way to network.',
    badge: { text: 'New Feature', icon: Nfc, className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/80' },
  },
  {
    date: '2025-07-29T12:00:00Z',
    version: 'v1.7.0',
    title: 'Foundational Refactoring & Major Bug Bash',
    description: 'In our most significant update yet, we have performed a deep-dive refactoring of the entire application. This addresses over a dozen subtle "misfiring" bugs, improves data consistency, and enhances performance across the board. Key improvements include optimized database queries, more robust user interaction logic, and a streamlined codebase for future features.',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: '2025-07-27T12:00:00Z',
    version: 'v1.5.0',
    title: 'Major Aesthetic Overhaul',
    description: 'Introducing a completely redesigned look and feel across the entire application. We\'ve implemented a new, sophisticated color palette and updated our typography to create a more modern, professional, and cohesive user experience.',
    badge: { text: 'Aesthetic', icon: Palette, className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700/80' },
  },
  {
    date: '2025-07-26T12:00:00Z',
    version: 'v1.4.0',
    title: 'Unified Explore Page',
    description: 'Discover all public content—from listings to events—in a single, filterable feed. The new Explore page makes it easier than ever to see what the community is creating.',
    badge: { text: 'New Feature', icon: Rocket, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/80' },
  },
  {
    date: '2025-07-25T12:00:00Z',
    version: 'v1.3.1',
    title: 'Interactive Diary & Content Calendar',
    description: 'We\'ve supercharged the "My Content" and "Diary" pages with new calendar views. Visualize your schedule, manage events with notes, and get a high-level view of all your content in one place.',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: '2025-07-24T12:00:00Z',
    version: 'v1.3.0',
    title: 'Consistent Grid & List Views',
    description: 'All content management pages (Listings, Opportunities, etc.) now feature consistent grid/list view toggles and a denser table layout, giving you more control over how you manage your content.',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: '2025-07-23T12:00:00Z',
    version: 'v1.2.1',
    title: 'Security & Bug Fixes',
    description: 'Conducted a comprehensive security audit, hardening Firestore rules and fixing several minor bugs to improve application stability and security.',
    badge: { text: 'Fix', icon: Bug, className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/80' },
  },
  {
    date: '2025-07-22T12:00:00Z',
    version: 'v1.2.0',
    title: 'Digital Business Pages',
    description: 'Launch dedicated pages for your businesses. Showcase your brand, link to your main profile, and make it easier for customers to connect with you.',
    badge: { text: 'New Feature', icon: Rocket, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/80' },
  },
];

const UpdateCard = ({ item }: { item: UpdateItem }) => (
    <div className="relative pl-8 sm:pl-12 py-6 group">
        <div className="flex sm:items-center flex-col sm:flex-row mb-1">
            <div className="absolute w-px h-full bg-border -translate-x-4 sm:-translate-x-6 top-0" />
            <div className="absolute h-3 w-3 rounded-full bg-primary -translate-x-4 sm:-translate-x-6 top-8 ring-4 ring-background" />
            <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-primary-foreground bg-primary rounded-full">
                <ClientFormattedDate date={item.date} formatStr="MMM d" />
            </time>
            <h3 className="text-xl font-headline font-semibold text-foreground">{item.title}</h3>
            <Badge variant="outline" className={`ml-auto hidden sm:flex ${item.badge.className}`}>
                <item.badge.icon className="mr-1.5 h-3.5 w-3.5" />
                {item.badge.text}
            </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 sm:mt-0">{item.version}</p>
        <p className="mt-2 text-muted-foreground">{item.description}</p>
        <Badge variant="outline" className={`mt-2 flex sm:hidden w-fit ${item.badge.className}`}>
            <item.badge.icon className="mr-1.5 h-3.5 w-3.5" />
            {item.badge.text}
        </Badge>
    </div>
);


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
                        <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6" /> {year}
                        </h2>
                        <div className="relative">
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
