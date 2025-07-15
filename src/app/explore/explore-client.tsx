
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PublicContentItem } from '@/lib/content';
import { Search, Compass, LayoutGrid, List, X } from 'lucide-react';
import { PublicContentCard } from '@/components/public-content-card';
import { ExplorePageSkeleton } from '@/components/explore-skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CONTENT_TYPES } from '@/lib/content-types';

type ContentType = 'all' | 'listing' | 'job' | 'event' | 'offer' | 'promoPage';
const ALL_CONTENT_TYPES = CONTENT_TYPES.filter(t => t.name !== 'Appointment').map(t => t.name as ContentType);

export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(ALL_CONTENT_TYPES));
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleTypeFilterChange = (type: string) => {
    setTypeFilters(prev => {
        const newSet = new Set(prev);
        if (newSet.size === ALL_CONTENT_TYPES.length) {
            // If all are selected, clicking one selects only that one
            newSet.clear();
            newSet.add(type);
        } else if (newSet.has(type)) {
            newSet.delete(type);
            // If last one is deselected, select all
            if (newSet.size === 0) {
                ALL_CONTENT_TYPES.forEach(t => newSet.add(t));
            }
        } else {
            newSet.add(type);
        }
        return newSet;
    });
  };

  const areFiltersActive = useMemo(() => {
    return !!searchTerm || typeFilters.size < ALL_CONTENT_TYPES.length;
  }, [searchTerm, typeFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilters(new Set(ALL_CONTENT_TYPES));
  };


  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
        const typeMatch = typeFilters.size === ALL_CONTENT_TYPES.length || typeFilters.has(item.type);
        if (!typeMatch) return false;

        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        
        const title = (item as any).title || (item as any).name || '';
        return title.toLowerCase().includes(lowercasedTerm) ||
               item.description.toLowerCase().includes(lowercasedTerm) ||
               item.author.name.toLowerCase().includes(lowercasedTerm) ||
               (item.category && item.category.toLowerCase().includes(lowercasedTerm));
    });
  }, [searchTerm, initialItems, typeFilters]);

  if (isLoading) {
      return <ExplorePageSkeleton />
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore</h1>
            <p className="text-muted-foreground">Discover the latest listings, jobs, events, and more from the community.</p>
        </div>
        
        <Card>
             <CardContent className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by keyword..."
                            className="pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {areFiltersActive && (
                        <Button variant="ghost" onClick={handleClearFilters} className="w-full md:w-auto">
                            <X className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>
                <Separator />
                 <div className="space-y-2">
                    <Label className="text-sm font-medium">Filter by type</Label>
                    <div className="flex flex-wrap gap-2">
                        {CONTENT_TYPES.filter(type => type.name !== 'Appointment').map((typeMeta) => {
                            const isSelected = typeFilters.has(typeMeta.name as ContentType);
                            const Icon = typeMeta.icon;
                            return (
                                <Badge
                                    key={typeMeta.name}
                                    variant={isSelected ? typeMeta.variant : 'outline'}
                                    onClick={() => handleTypeFilterChange(typeMeta.name as ContentType)}
                                    className={cn(
                                        'cursor-pointer transition-all py-1.5 px-3 text-sm',
                                        !isSelected && 'hover:bg-accent/50',
                                        typeMeta.variant === 'outline' && isSelected && 'bg-foreground text-background border-transparent hover:bg-foreground/90',
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" /> {typeMeta.label}
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">
                Community Content ({filteredItems.length})
            </h2>
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {filteredItems.length > 0 ? (
            view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <PublicContentCard key={`${item.type}-${item.id}`} item={item} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                     {filteredItems.map(item => (
                        <PublicContentCard key={`${item.type}-${item.id}`} item={item} />
                    ))}
                </div>
            )
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
    </div>
  );
}
