
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  };
};

const updates: UpdateItem[] = [
  {
    date: 'July 27, 2024',
    version: 'v1.5.0',
    title: 'Major Aesthetic Overhaul',
    description: 'Introducing a completely redesigned look and feel across the entire application. We\'ve implemented a new, sophisticated color palette and updated our typography to create a more modern, professional, and cohesive user experience.',
    badge: {
      text: 'Aesthetic',
      icon: Palette,
    },
  },
  {
    date: 'July 26, 2024',
    version: 'v1.4.0',
    title: 'Unified Explore Page',
    description: 'Discover all public content—from listings to events—in a single, filterable feed. The new Explore page makes it easier than ever to see what the community is creating.',
    badge: {
      text: 'New Feature',
      icon: Rocket,
    },
  },
  {
    date: 'July 25, 2024',
    version: 'v1.3.1',
    title: 'Interactive Diary & Content Calendar',
    description: 'We\'ve supercharged the "My Content" and "Diary" pages with new calendar views. Visualize your schedule, manage events with notes, and get a high-level view of all your content in one place.',
    badge: {
      text: 'Improvement',
      icon: Zap,
    },
  },
   {
    date: 'July 24, 2024',
    version: 'v1.3.0',
    title: 'Consistent Grid & List Views',
    description: 'All content management pages (Listings, Opportunities, etc.) now feature consistent grid/list view toggles and a denser table layout, giving you more control over how you manage your content.',
    badge: {
      text: 'Improvement',
      icon: Zap,
    },
  },
  {
    date: 'July 23, 2024',
    version: 'v1.2.1',
    title: 'Security & Bug Fixes',
    description: 'Conducted a comprehensive security audit, hardening Firestore rules and fixing several minor bugs to improve application stability and security.',
    badge: {
      text: 'Fix',
      icon: Bug,
    },
  },
  {
    date: 'July 22, 2024',
    version: 'v1.2.0',
    title: 'Digital Business Pages',
    description: 'Launch dedicated pages for your businesses. Showcase your brand, link to your main profile, and make it easier for customers to connect with you.',
    badge: {
      text: 'New Feature',
      icon: Rocket,
    },
  },
];

export default function WhatsNewPage() {
    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">What's New in BYD.Bio</h1>
                <p className="text-muted-foreground mt-2">Stay up-to-date with our latest features and improvements.</p>
            </div>
            <div className="relative pl-8">
                <div className="absolute left-3 top-3 h-full w-0.5 bg-border -z-10"></div>
                <div className="space-y-12">
                    {updates.map((update, index) => (
                        <div key={index} className="relative flex items-start gap-6">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background absolute -left-12 top-1">
                                <update.badge.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground font-semibold">{update.date}</p>
                                <h2 className="text-xl font-bold font-headline mt-1">{update.title}</h2>
                                <p className="text-muted-foreground mt-2">{update.description}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <Badge variant="secondary">{update.badge.text}</Badge>
                                    <Badge variant="outline">{update.version}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
