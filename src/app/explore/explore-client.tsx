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
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExploreClient({ initialItems }: { initialItems: PublicContentItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(['event', 'offer', 'job', 'listing', 'promoPage']));
  const [allItems] = useState<PublicContentItem[]>(initialItems);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'popularity'>('date');

  const areFiltersActive = !!searchTerm || !!locationFilter || typeFilters.size < 5;

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
  
  const contentTypes: { name: string, label: string, icon: React.ElementType, variant: VariantProps<typeof badgeVariants>['variant'] }[] = [
    { name: 'event', label: 'Events', icon: CalendarIconLucide, variant: 'default' },
    { name: 'offer', label: 'Offers', icon: Gift, variant: 'secondary' },
    { name: 'job', label: 'Jobs', icon: Briefcase, variant: 'destructive' },
    { name: 'listing', label: 'Listings', icon: Tags, variant: 'outline' },
    { name: 'promoPage', label: 'Promo Pages', icon: Megaphone, variant: 'default' },
  ];

  const getLink = (item: PublicContentItem) => {
      switch (item.type) {
          case 'event': return `/events/${item.id}`;
          case 'offer': return `/offer/${item.id}`;
          case 'job': return `/o/${item.id}`;
          case 'listing': return `/l/${item.id}`;
          case 'promoPage': return `/p/${item.id}`;
      }
  }
  
  const getPrimaryStat = (item: PublicContentItem) => {
        const value = getPopularity(item);
        let icon = MousePointerClick; // default
        if (item.type === 'event' || item.type === 'job') icon = Users;
        if (item.type === 'offer') icon = Gift;
        return { icon, value };
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">What's On</h1>
          <p className="text-muted-foreground">Discover what the community is creating and sharing.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Filter Content</CardTitle>
                <CardDescription>Refine your search to find exactly what you're looking for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by keyword..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Filter by location..." className="pl-10" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium">Content Type</Label>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {contentTypes.map(({ name, label, icon: Icon, variant }) => {
                            const isSelected = typeFilters.has(name);
                            return (
                                <Button
                                    key={name}
                                    variant={isSelected ? variant : 'outline'}
                                    size="sm"
                                    onClick={() => handleTypeFilterChange(name)}
                                    className={cn(
                                        'transition-all',
                                        variant === 'outline' && isSelected && 'bg-foreground text-background border-transparent hover:bg-foreground/90'
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" /> {label}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" onClick={handleClearFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear All Filters
                </Button>
            </CardFooter>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedItems.map((item) => {
                          const title = (item as any).title;
                          const primaryStat = getPrimaryStat(item);
                          const itemTypeLabel = item.type === 'promoPage' ? 'Promo Page' : item.type;
                          
                          return (
                            <Card key={`${item.type}-${item.id}`} className="shadow-sm flex flex-col">
                                {item.imageUrl && (
                                    <Link href={getLink(item)} className="block overflow-hidden rounded-t-lg">
                                        <Image src={item.imageUrl} alt={title} width={600} height={400} className="w-full object-cover aspect-video transition-transform hover:scale-105" data-ai-hint="office laptop" />
                                    </Link>
                                )}
                                <CardHeader className="p-4 pb-2">
                                    <Badge variant={getBadgeVariant(item.type)} className="w-fit capitalize">{itemTypeLabel}</Badge>
                                    <CardTitle className="text-base mt-1"><Link href={getLink(item)} className="hover:underline">{title}</Link></CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 space-y-3 text-sm text-muted-foreground flex-grow">
                                    <div className="flex items-center pt-1">
                                        <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={item.author.avatarUrl} alt={item.author.name} data-ai-hint="person portrait"/>
                                                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs">{item.author.name}</span>
                                        </Link>
                                    </div>
                                    <p className="line-clamp-2">{item.description}</p>
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-4 border-t pt-4 px-4 pb-4">
                                    <div className="flex justify-between w-full text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>{(item as any).views?.toLocaleString() ?? 0} views</span>
                                        </div>
                                        {primaryStat && (
                                        <div className="flex items-center gap-1.5">
                                            <primaryStat.icon className="h-3.5 w-3.5" />
                                            <span>{primaryStat.value.toLocaleString()}</span>
                                        </div>
                                        )}
                                    </div>
                                    <Button asChild variant="secondary" className="w-full">
                                        <Link href={getLink(item)}>
                                            View Details
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                          )
                        })}
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
                                    const itemTypeLabel = item.type === 'promoPage' ? 'Promo Page' : item.type;
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
