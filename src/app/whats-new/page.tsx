
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Palette, Bug } from "lucide-react";

type UpdateItem = {
  date: string;
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
    date: 'July 28, 2024',
    version: 'v1.6.0',
    title: 'Smarter Holiday Finder with AI Tools',
    description: 'Our AI holiday scheduler now uses a dedicated tool to fetch holiday data from a reliable source, making it faster and more accurate than ever. This showcases advanced agentic AI behavior!',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: 'July 27, 2024',
    version: 'v1.5.0',
    title: 'Major Aesthetic Overhaul',
    description: 'Introducing a completely redesigned look and feel across the entire application. We\'ve implemented a new, sophisticated color palette and updated our typography to create a more modern, professional, and cohesive user experience.',
    badge: { text: 'Aesthetic', icon: Palette, className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700/80' },
  },
  {
    date: 'July 26, 2024',
    version: 'v1.4.0',
    title: 'Unified Explore Page',
    description: 'Discover all public content—from listings to events—in a single, filterable feed. The new Explore page makes it easier than ever to see what the community is creating.',
    badge: { text: 'New Feature', icon: Rocket, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/80' },
  },
  {
    date: 'July 25, 2024',
    version: 'v1.3.1',
    title: 'Interactive Diary & Content Calendar',
    description: 'We\'ve supercharged the "My Content" and "Diary" pages with new calendar views. Visualize your schedule, manage events with notes, and get a high-level view of all your content in one place.',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: 'July 24, 2024',
    version: 'v1.3.0',
    title: 'Consistent Grid & List Views',
    description: 'All content management pages (Listings, Opportunities, etc.) now feature consistent grid/list view toggles and a denser table layout, giving you more control over how you manage your content.',
    badge: { text: 'Improvement', icon: Zap, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/80' },
  },
  {
    date: 'July 23, 2024',
    version: 'v1.2.1',
    title: 'Security & Bug Fixes',
    description: 'Conducted a comprehensive security audit, hardening Firestore rules and fixing several minor bugs to improve application stability and security.',
    badge: { text: 'Fix', icon: Bug, className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/80' },
  },
  {
    date: 'July 22, 2024',
    version: 'v1.2.0',
    title: 'Digital Business Pages',
    description: 'Launch dedicated pages for your businesses. Showcase your brand, link to your main profile, and make it easier for customers to connect with you.',
    badge: { text: 'New Feature', icon: Rocket, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/80' },
  },
];

export default function WhatsNewPage() {
    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">What's New in BYD.Bio</h1>
                <p className="text-muted-foreground mt-2">Stay up-to-date with our latest features and improvements.</p>
            </div>
            <div className="space-y-8">
                {updates.map((update, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-xl font-headline">{update.title}</CardTitle>
                                <Badge variant="outline" className={update.badge.className}>
                                    <update.badge.icon className="mr-1.5 h-3.5 w-3.5" />
                                    {update.badge.text}
                                </Badge>
                            </div>
                            <CardDescription className="text-sm pt-1">{update.date} &bull; {update.version}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{update.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
