
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { PublicContentItem } from '@/lib/content';
import { Search, MapPin, Tags, Briefcase, X, ExternalLink, Calendar as CalendarIconLucide, List, LayoutGrid, Eye, MousePointerClick, Gift, Users, Compass, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { ClientFormattedCurrency } from '@/components/client-formatted-currency';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PublicContentCard } from '@/components/public-content-card';

export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(['event', 'offer', 'job', 'listing', 'promoPage']));
  const [allItems] = useState<PublicContentItem[]>(initialItems);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'popularity'>('date');

  const areFiltersActive = !!searchTerm || !!locationFilter || typeFilters.size < 5;
  
  const getBadgeVariant = (itemType: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (itemType) {
        case 'event': return 'default';
        case 'offer': return 'secondary';
        case 'job': return 'destructive';
        case 'listing': return 'outline';
        case 'promoPage': return 'default';
        default: return 'default';
    }
  }

  const getLink = (item: PublicContentItem) => {
      switch (item.type) {
          case 'event': return `/events/${item.id}`;
          case 'offer': return `/offer/${item.id}`;
          case 'job': return `/job/${item.id}`;
          case 'listing': return `/l/${item.id}`;
          case 'promoPage': return `/p/${item.id}`;
      }
  }

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (!typeFilters.has(item.type)) {
        return false;
      }
      const searchMatch = searchTerm.length > 0
        ? ((item as any).title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          ('company' in item && item.company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ('category' in item && item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const locationMatch = locationFilter.length > 0
        ? ('location' in item && item.location?.toLowerCase().includes(locationFilter.toLowerCase()) || ('address' in item && item.address?.toLowerCase().includes(locationFilter.toLowerCase())))
        : true;

      return searchMatch && locationMatch;
    });
  }, [allItems, searchTerm, locationFilter, typeFilters]);
  
  const getPopularity = (item: PublicContentItem) => {
    switch (item.type) {
        case 'event': return (item as any).rsvps?.length ?? 0;
        case 'offer': return (item as any).claims ?? 0;
        case 'job': return (item as any).applicants ?? 0;
        case 'listing': return (item as any).clicks ?? 0;
        case 'promoPage': return (item as any).clicks ?? 0;
        default: return 0;
    }
  };
  
  const sortedItems = useMemo(() => {
    let sorted = [...filteredItems];
    switch (sortBy) {
        case 'views':
            sorted.sort((a, b) => ((b as any).views ?? 0) - ((a as any).views ?? 0));
            break;
        case 'popularity':
            sorted.sort((a, b) => getPopularity(b) - getPopularity(a));
            break;
        case 'date':
        default:
            sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
    }
    return sorted;
  }, [filteredItems, sortBy]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilters(new Set(['event', 'offer', 'job', 'listing', 'promoPage']));
  }
  
  const handleTypeFilterChange = (type: string) => {
    setTypeFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) newSet.delete(type); else newSet.add(type);
      return newSet;
    });
  };
  
  const contentTypes: { name: string, label: string, icon: React.ElementType, variant: VariantProps<typeof badgeVariants>['variant'] }[] = [
    { name: 'event', label: 'Events', icon: CalendarIconLucide, variant: 'default' },
    { name: 'offer', label: 'Offers', icon: Gift, variant: 'secondary' },
    { name: 'job', label: 'Jobs', icon: Briefcase, variant: 'destructive' },
    { name: 'listing', label: 'Listings', icon: Tags, variant: 'outline' },
    { name: 'promoPage', label: 'Business Pages', icon: Megaphone, variant: 'default' },
  ];
  
  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">What's On</h1>
          <p className="text-muted-foreground">Discover what the community is creating and sharing.</p>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search by keyword..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Filter by location..."
                      className="pl-10"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                  />
              </div>
              <Separator orientation="vertical" className="h-6 mx-2 hidden lg:block" />
              <div className="flex flex-wrap gap-2 items-center">
                  {contentTypes.map(({ name, label, icon: Icon, variant }) => {
                      const isSelected = typeFilters.has(name);
                      return (
                          <Badge
                              key={name}
                              variant={isSelected ? variant : 'outline'}
                              onClick={() => handleTypeFilterChange(name)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTypeFilterChange(name); }}
                              className={cn(
                                  'cursor-pointer transition-all py-1.5 px-3 text-sm',
                                  !isSelected && 'hover:bg-accent/50',
                                  variant === 'outline' && isSelected && 'bg-foreground text-background border-transparent hover:bg-foreground/90'
                              )}
                              role="button"
                              tabIndex={0}
                          >
                              <Icon className="mr-2 h-4 w-4" /> {label}
                          </Badge>
                      )
                  })}
              </div>
              {areFiltersActive && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
                      <X className="mr-2 h-4 w-4" />
                      Clear
                  </Button>
              )}
          </CardContent>
        </Card>
        
        <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold font-headline">
                    Community Content ({sortedItems.length})
                </h2>
                <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger className="w-[150px] h-9 text-sm">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Newest</SelectItem>
                            <SelectItem value="views">Most Viewed</SelectItem>
                            <SelectItem value="popularity">Most Popular</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                        <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
                    </div>
                </div>
              </div>
              {sortedItems.length > 0 ? (
                  view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {sortedItems.map((item) => <PublicContentCard key={`${item.type}-${item.id}`} item={item} />)}
                    </div>
                  ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="hidden md:table-cell">Author</TableHead>
                                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedItems.map(item => {
                                    const title = (item as any).title;
                                    const itemTypeLabel = item.type === 'promoPage' ? 'Business Page' : item.type;
                                    return (
                                    <TableRow key={`${item.type}-${item.id}`}>
                                        <TableCell>
                                            <div className="font-medium">{title}</div>
                                            {'company' in item && <div className="text-xs text-muted-foreground">{item.company}</div>}
                                        </TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(item.type)} className="capitalize">{itemTypeLabel}</Badge></TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={item.author.avatarUrl} alt={item.author.name} data-ai-hint="person portrait"/>
                                                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs">{item.author.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <ClientFormattedDate date={item.date} formatStr="PPP" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={getLink(item)}>View Details</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </Card>
                  )
              ) : (
                  <Card>
                      <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <Compass className="h-12 w-12 text-gray-400" />
                          <h3 className="font-semibold text-foreground">
                            {areFiltersActive ? "No Content Found" : "Nothing to show"}
                          </h3>
                          <p>
                          {areFiltersActive
                            ? "No content matches your current filters. Try removing some to see more."
                            : "There is no public content available yet. Be the first to create something!"
                          }
                          </p>
                      </CardContent>
                  </Card>
              )}
          </div>
      </div>
    </>
  );
}
