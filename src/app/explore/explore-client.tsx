
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PublicContentItem } from '@/lib/content';
import { Search, Compass } from 'lucide-react';
import { PublicContentCard } from '@/components/public-content-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ContentType = 'all' | 'listing' | 'job' | 'event' | 'offer' | 'promoPage';

export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType>('all');

  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
        // Tab filter
        const typeMatch = activeTab === 'all' || item.type === activeTab;
        if (!typeMatch) return false;

        // Search term filter
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        
        const title = (item as any).title || (item as any).name || '';
        return title.toLowerCase().includes(lowercasedTerm) ||
               item.description.toLowerCase().includes(lowercasedTerm) ||
               item.author.name.toLowerCase().includes(lowercasedTerm) ||
               (item.category && item.category.toLowerCase().includes(lowercasedTerm));
    });
  }, [searchTerm, initialItems, activeTab]);
  
  const contentTabs: { value: ContentType, label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'listing', label: 'Listings' },
    { value: 'job', label: 'Jobs' },
    { value: 'event', label: 'Events' },
    { value: 'offer', label: 'Offers' },
    { value: 'promoPage', label: 'Business Pages' },
  ];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Content</h1>
            <p className="text-muted-foreground">Discover the latest listings, jobs, events, and more from the community.</p>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search all content..."
                className="pl-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {contentTabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value={activeTab} className="pt-6">
                 {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <PublicContentCard key={`${item.type}-${item.id}`} item={item} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Compass className="h-12 w-12 text-gray-400" />
                            <h3 className="font-semibold text-foreground">No Content Found</h3>
                            <p>
                                We couldn't find any content matching your search. Try a different term or filter.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}
