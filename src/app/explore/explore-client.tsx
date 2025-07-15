
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PublicContentItem } from '@/lib/content';
import { Search, Compass } from 'lucide-react';
import { PublicContentCard } from '@/components/public-content-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

type ContentType = 'all' | 'listing' | 'job' | 'event' | 'offer' | 'promoPage';

const ExplorePageSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
              <Card key={i}>
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex items-center gap-2 pt-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-10 w-full pt-4" />
                  </div>
              </Card>
          ))}
      </div>
    </div>
);


export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
        const typeMatch = activeTab === 'all' || item.type === activeTab;
        if (!typeMatch) return false;

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
  
  const getTabLabel = (value: ContentType) => {
    const item = contentTabs.find(tab => tab.value === value);
    const count = value === 'all' ? initialItems.length : initialItems.filter(i => i.type === value).length;
    return `${item?.label} (${count})`
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Content</h1>
            <p className="text-muted-foreground">Discover the latest listings, jobs, events, and more from the community.</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)} className="w-full">
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search all content..."
                        className="pl-12 h-12 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <TabsList className="h-auto flex-wrap justify-start">
                    {contentTabs.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex-grow sm:flex-grow-0">{getTabLabel(tab.value)}</TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <TabsContent value={activeTab} className="pt-6">
                 {isLoading ? (
                    <ExplorePageSkeleton />
                 ) : filteredItems.length > 0 ? (
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
                                We couldn't find any content matching your filters. Try a different term or filter.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}
