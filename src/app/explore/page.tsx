
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { getAllPublicContent, type PublicContentItem } from '@/lib/content';
import { Search, MapPin, Tag, Briefcase, DollarSign, X, Clock, ExternalLink, Tags, Calendar as CalendarIconLucide, Building2, List, LayoutGrid, Eye, MousePointerClick, Gift, Users, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ExploreSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
        </div>
        <Card>
            <CardContent className="p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
            </CardContent>
        </Card>
        <div className="flex items-center justify-between">
             <div className="h-7 bg-muted rounded w-1/4"></div>
             <div className="h-10 w-20 bg-muted rounded-md"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
                    <CardContent><div className="h-4 bg-muted rounded w-full"></div></CardContent>
                    <CardFooter><div className="h-10 bg-muted rounded w-full"></div></CardFooter>
                </Card>
            ))}
        </div>
    </div>
);

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(['event', 'offer', 'job', 'listing', 'business']));
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<PublicContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setIsLoading(true);
    getAllPublicContent()
      .then(setAllItems)
      .catch(err => {
        console.error("Failed to fetch public content", err);
        toast({ title: "Error", description: "Could not load content.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, [toast]);

  const areFiltersActive = !!searchTerm || !!locationFilter || typeFilters.size < 5;

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (!typeFilters.has(item.type)) {
        return false;
      }
      const searchMatch = searchTerm.length > 0
        ? (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          ('company' in item && item.company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ('category' in item && item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const locationMatch = locationFilter.length > 0
        ? 'location' in item && item.location?.toLowerCase().includes(locationFilter.toLowerCase())
        : true;

      return searchMatch && locationMatch;
    });
  }, [allItems, searchTerm, locationFilter, typeFilters]);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilters(new Set(['event', 'offer', 'job', 'listing', 'business']));
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
        case 'business': return 'default';
        default: return 'default';
    }
  }
  
  const contentTypes: { name: string, label: string, icon: React.ElementType, variant: VariantProps<typeof badgeVariants>['variant'] }[] = [
    { name: 'event', label: 'Events', icon: CalendarIconLucide, variant: 'default' },
    { name: 'offer', label: 'Offers', icon: Gift, variant: 'secondary' },
    { name: 'job', label: 'Jobs', icon: Briefcase, variant: 'destructive' },
    { name: 'listing', label: 'Listings', icon: Tags, variant: 'outline' },
    { name: 'business', label: 'Businesses', icon: Building2, variant: 'default' },
  ];

  const getLink = (item: PublicContentItem) => {
      switch (item.type) {
          case 'event': return `/events/${item.id}`;
          case 'offer': return `/offer/${item.id}`;
          case 'job': return `/o/${item.id}`;
          case 'listing': return `/l/${item.id}`;
          case 'business': return `/b/${item.id}`;
      }
  }

  if (isLoading) {
    return <ExploreSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Explore Content</h1>
          <p className="text-muted-foreground">Discover what the community is creating and sharing.</p>
        </div>

        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by keyword..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative md:col-span-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Filter by location..." className="pl-10" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
                    </div>
                    <Button variant="outline" onClick={handleClearFilters} className="w-full md:col-span-1">
                        <X className="mr-2 h-4 w-4" /> Clear All Filters
                    </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Filter by type</Label>
                    <div className="flex flex-wrap gap-2">
                        {contentTypes.map(({ name, label, icon: Icon, variant }) => (
                            <Button key={name} variant={typeFilters.has(name) ? variant : 'outline'} size="sm" onClick={() => handleTypeFilterChange(name)} className={cn(variant === 'outline' && typeFilters.has(name) && 'bg-accent text-accent-foreground border-accent-foreground/30', 'transition-all')}>
                                <Icon className="mr-2 h-4 w-4" /> {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-headline">
                    Community Content ({filteredItems.length})
                </h2>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
                </div>
              </div>
              {filteredItems.length > 0 ? (
                  view === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems.map((item) => (
                          <Card key={`${item.type}-${item.id}`} className="shadow-sm flex flex-col">
                              {item.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                  <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office laptop" />
                                </div>
                              )}
                              <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                      <div>
                                        <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                                        <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-2 text-sm text-muted-foreground flex-grow">
                                  {'location' in item && item.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{item.location}</span></div>}
                                  {'category' in item && item.category && <div className="flex items-center gap-2"><Tag className="h-4 w-4" /><span>{item.category}</span></div>}
                                  {'company' in item && item.company && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{item.company}</span></div>}
                                  {'price' in item && item.price && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span className="font-semibold">{formatCurrency(item.price)}</span></div>}
                              </CardContent>
                              <CardFooter className="border-t pt-4 px-4 pb-4">
                                <Button asChild className="w-full">
                                    <Link href={getLink(item)}>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Details
                                    </Link>
                                </Button>
                              </CardFooter>
                          </Card>
                      ))}
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
                                {filteredItems.map(item => (
                                    <TableRow key={`${item.type}-${item.id}`}>
                                        <TableCell>
                                            <div className="font-medium">{item.title}</div>
                                            {'company' in item && <div className="text-xs text-muted-foreground">{item.company}</div>}
                                        </TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge></TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait"/>
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
                                ))}
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
