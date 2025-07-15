
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PublicContentItem } from '@/lib/users';
import { Search, Compass, LayoutGrid, List, X } from 'lucide-react';
import { PublicContentCard } from '@/components/public-content-card';
import { ExplorePageSkeleton } from '@/components/explore-skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CONTENT_TYPES, getContentTypeMetadata, type ContentTypeMetadata } from '@/lib/content-types';

const ALL_CONTENT_TYPE_NAMES = CONTENT_TYPES.filter(t => t.name !== 'Appointment').map(t => t.name);

// Color mapping for active filter buttons.
const TYPE_COLORS: Record<string, string> = {
    Event: 'bg-primary text-primary-foreground hover:bg-primary/90',
    Offer: 'bg-info text-info-foreground hover:bg-info/90',
    Job: 'bg-success text-success-foreground hover:bg-success/90',
    Listing: 'bg-warning text-warning-foreground hover:bg-warning/90',
    'Business Page': 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

// A reusable filter button component
const FilterButton = ({
    typeMeta,
    isSelected,
    onClick,
}: {
    typeMeta: ContentTypeMetadata | { name: 'All'; label: 'All'; icon: typeof Compass };
    isSelected: boolean;
    onClick: () => void;
}) => {
    const Icon = typeMeta.icon;
    const activeColorClass = typeMeta.name === 'All'
        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
        : TYPE_COLORS[typeMeta.name] || 'bg-primary text-primary-foreground hover:bg-primary/90';

    return (
        <Button
            variant={'outline'}
            onClick={onClick}
            className={cn(
                'transition-all',
                isSelected ? `border-transparent ${activeColorClass}` : 'hover:bg-accent/50',
            )}
        >
            <Icon className="mr-2 h-4 w-4" /> {typeMeta.label}
        </Button>
    );
};


export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(ALL_CONTENT_TYPE_NAMES));
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Simplified filter toggle logic
  const handleTypeFilterChange = (type: string) => {
    setTypeFilters(prev => {
        const newSet = new Set(prev);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        return newSet;
    });
  };

  const handleSelectAll = () => {
    if (typeFilters.size === ALL_CONTENT_TYPE_NAMES.length) {
      setTypeFilters(new Set()); // Deselect all
    } else {
      setTypeFilters(new Set(ALL_CONTENT_TYPE_NAMES)); // Select all
    }
  };
  
  const areFiltersActive = useMemo(() => {
    return !!searchTerm || typeFilters.size < ALL_CONTENT_TYPE_NAMES.length;
  }, [searchTerm, typeFilters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilters(new Set(ALL_CONTENT_TYPE_NAMES));
  };


  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
        const typeMatch = typeFilters.size === 0 || typeFilters.has(item.type);
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
                         <FilterButton 
                            typeMeta={{ name: 'All', label: 'All', icon: Compass }}
                            isSelected={typeFilters.size === ALL_CONTENT_TYPE_NAMES.length}
                            onClick={handleSelectAll}
                         />
                        {CONTENT_TYPES.filter(type => type.name !== 'Appointment').map((typeMeta) => (
                           <FilterButton 
                                key={typeMeta.name}
                                typeMeta={typeMeta}
                                isSelected={typeFilters.has(typeMeta.name)}
                                onClick={() => handleTypeFilterChange(typeMeta.name)}
                           />
                        ))}
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

