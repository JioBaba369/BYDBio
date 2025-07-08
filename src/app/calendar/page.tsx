
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { getCalendarItems, toggleRsvp, deleteEvent, type CalendarItem } from '@/lib/events';
import { useAuth } from '@/components/auth-provider';
import { Search, MapPin, Tag, Briefcase, DollarSign, X, Clock, MoreHorizontal, Edit, Trash2, PlusCircle, Tags, Calendar as CalendarIconLucide, Building2, List, LayoutGrid, Eye, MousePointerClick, Gift, Users, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { deleteListing } from '@/lib/listings';
import { deleteJob } from '@/lib/jobs';
import { deleteOffer } from '@/lib/offers';
import { deletePromoPage } from '@/lib/promo-pages';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { ClientFormattedCurrency } from '@/components/client-formatted-currency';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { KillChainTracker } from '@/components/kill-chain-tracker';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const ContentHubSkeleton = () => (
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


export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(
    new Set(['Event', 'Offer', 'Job', 'Listing', 'Business Page'])
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list' | 'calendar'>('grid');
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date>();

  useEffect(() => {
    // Initialize date states on the client to avoid hydration errors
    const today = new Date();
    setSelectedDate(today);
    setMonth(today);
  }, []);
  
  useEffect(() => {
    if (user?.uid) {
        setIsLoading(true);
        getCalendarItems(user.uid)
            .then(setAllItems)
            .catch(err => {
                toast({ title: "Error", description: "Could not load calendar items.", variant: "destructive" });
            })
            .finally(() => setIsLoading(false));
    }
  }, [user?.uid, toast]);


  const areFiltersActive = !!searchTerm || !!locationFilter || typeFilters.size < 5;

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (!typeFilters.has(item.type)) {
        return false;
      }

      const searchMatch = searchTerm.length > 0 ?
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const locationMatch = locationFilter.length > 0 ?
        (item.location && item.location.toLowerCase().includes(locationFilter.toLowerCase()))
        : true;

      return searchMatch && locationMatch;
    });
  }, [allItems, searchTerm, locationFilter, typeFilters]);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilters(new Set(['Event', 'Offer', 'Job', 'Listing', 'Business Page']));
  }
  
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

  const openDeleteDialog = (item: CalendarItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleDelete = async () => {
    if (!selectedItem || !user) return;
    setIsDeleting(true);

    const previousItems = [...allItems];
    // Optimistic UI update
    setAllItems(prev => prev.filter(item => item.id !== selectedItem.id));

    try {
        switch (selectedItem.type) {
            case 'Event':
                if (selectedItem.isExternal) {
                    await toggleRsvp(selectedItem.id, user.uid);
                    toast({ title: 'Removed from calendar', description: `You are no longer attending "${selectedItem.title}".`});
                } else {
                    await deleteEvent(selectedItem.id);
                    toast({ title: 'Event deleted!' });
                }
                break;
            case 'Offer':
                await deleteOffer(selectedItem.id);
                toast({ title: 'Offer deleted!' });
                break;
            case 'Job':
                await deleteJob(selectedItem.id);
                toast({ title: 'Job deleted!' });
                break;
            case 'Listing':
                await deleteListing(selectedItem.id);
                toast({ title: 'Listing deleted!' });
                break;
            case 'Business Page':
                await deletePromoPage(selectedItem.id);
                toast({ title: 'Business Page deleted!' });
                break;
        }
    } catch (error) {
        toast({ title: 'Error', description: `Failed to delete ${selectedItem.type}.`, variant: 'destructive' });
        // Rollback on error
        setAllItems(previousItems);
    } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
    }
  };

  const getBadgeVariant = (itemType: CalendarItem['type']): VariantProps<typeof badgeVariants>['variant'] => {
    switch (itemType) {
        case 'Event': return 'default';
        case 'Offer': return 'secondary';
        case 'Job': return 'destructive';
        case 'Listing': return 'outline';
        case 'Business Page': return 'default';
        default: return 'default';
    }
  }
  
  const contentTypes: { name: CalendarItem['type'], icon: React.ElementType, variant: VariantProps<typeof badgeVariants>['variant'] }[] = [
    { name: 'Event', icon: CalendarIconLucide, variant: 'default' },
    { name: 'Offer', icon: Gift, variant: 'secondary' },
    { name: 'Job', icon: Briefcase, variant: 'destructive' },
    { name: 'Listing', icon: Tags, variant: 'outline' },
    { name: 'Business Page', icon: Megaphone, variant: 'default' },
  ];
  
  const getStatsValue = (item: CalendarItem): number => {
     switch (item.type) {
        case 'Event': return item.rsvps?.length ?? 0;
        case 'Offer': return item.claims ?? 0;
        case 'Job': return item.applicants ?? 0;
        case 'Listing': return item.clicks ?? 0;
        case 'Business Page': return item.clicks ?? 0;
        default: return 0;
    }
  }
  
  const getInteractionLabel = (itemType: CalendarItem['type']): string => {
    switch (itemType) {
        case 'Event': return 'RSVPs';
        case 'Offer': return 'Claims';
        case 'Job': return 'Applicants';
        case 'Listing': return 'Clicks';
        case 'Business Page': return 'Clicks';
        default: return 'Interactions';
    }
  }
  
  const eventDays = useMemo(() => {
    return allItems.map(item => new Date(item.date));
  }, [allItems]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    const day = format(selectedDate, 'yyyy-MM-dd');
    return allItems.filter(item => format(new Date(item.date), 'yyyy-MM-dd') === day);
  }, [selectedDate, allItems]);
  
  const CalendarItemCard = ({item}: {item: CalendarItem}) => (
    <Card className="shadow-sm">
        <CardHeader className="p-3">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CardTitle className="text-base mt-1 truncate" title={item.title}>{item.title}</CardTitle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.title}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                        <Link href={item.editPath} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> {item.isExternal ? 'View Details' : 'Edit'}
                        </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal ? 'Remove from Calendar' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1 text-xs text-muted-foreground">
            {item.location && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span>{item.location}</span></div>}
            {item.company && <div className="flex items-center gap-2"><Briefcase className="h-3 w-3" /><span>{item.company}</span></div>}
            {item.price && <div className="flex items-center gap-2"><DollarSign className="h-3 w-3" /><span className="font-semibold"><ClientFormattedCurrency value={item.price} /></span></div>}
        </CardContent>
    </Card>
  )

  if (authLoading || isLoading) {
    return <ContentHubSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        itemName={selectedItem?.type.toLowerCase() ?? 'item'}
        itemDescription={selectedItem?.isExternal ? "This will only remove it from your calendar, not delete the event itself." : `This action cannot be undone. To confirm, please type "DELETE" below.`}
        confirmationText={selectedItem?.isExternal ? undefined : "DELETE"}
        confirmationLabel={selectedItem?.isExternal ? `Remove "${selectedItem.title}" from your calendar?` : `This will permanently delete this ${selectedItem?.type.toLowerCase()}.`}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Content</h1>
            <p className="text-muted-foreground">View, create, and manage all your content in one place.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Create New Content</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                <Link href="/promo/create" className="cursor-pointer">
                    <Megaphone className="mr-2 h-4 w-4" />
                    <span>New Business Page</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/listings/create" className="cursor-pointer">
                    <Tags className="mr-2 h-4 w-4" />
                    <span>New Listing</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/job/create" className="cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>New Job</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/events/create" className="cursor-pointer">
                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                    <span>New Event</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/offers/create" className="cursor-pointer">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>New Offer</span>
                </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by keyword..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative md:col-span-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by location..."
                            className="pl-10"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={handleClearFilters} className="w-full md:col-span-1">
                        <X className="mr-2 h-4 w-4" />
                        Clear All Filters
                    </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Filter by type</Label>
                    <div className="flex flex-wrap gap-2">
                        {contentTypes.map(({ name, icon: Icon, variant }) => {
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
                                        variant === 'outline' && isSelected && 'bg-foreground text-background border-transparent hover:bg-foreground/90',
                                    )}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <Icon className="mr-2 h-4 w-4" /> {name}s
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-headline">
                    All Content ({filteredItems.length})
                </h2>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('calendar')}>
                        <CalendarIconLucide className="h-4 w-4" />
                    </Button>
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              {view === 'calendar' ? (
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                    <Card className="flex justify-center">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={{ event: eventDays }}
                            modifiersClassNames={{ event: 'day-with-event' }}
                        />
                    </Card>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">
                            {selectedDate ? format(selectedDate, 'PPP') : 'Select a day'}
                        </h3>
                        {selectedDayItems.length > 0 ? (
                            selectedDayItems.map(item => <CalendarItemCard key={item.id} item={item} />)
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No items on this day.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
              ) : filteredItems.length > 0 ? (
                  view === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems.map((item) => {
                         return (
                          <Card key={item.id} className="shadow-sm flex flex-col">
                              {item.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg">
                                  <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" />
                                </div>
                              )}
                              <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                      <div>
                                        <Badge variant={getBadgeVariant(item.type)} className="capitalize">{item.isExternal ? 'Attending' : item.type}</Badge>
                                        <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem asChild>
                                            <Link href={item.editPath} className="cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" /> {item.isExternal ? 'View Details' : 'Edit'}
                                            </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal ? 'Remove from Calendar' : 'Delete'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                  </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 space-y-2 text-sm text-muted-foreground flex-grow">
                                  <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span><ClientFormattedDate date={item.date} formatStr="PPP"/></span>
                                  </div>
                                  {item.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{item.location}</span></div>}
                                  {item.category && <div className="flex items-center gap-2"><Tag className="h-4 w-4" /><span>{item.category}</span></div>}
                                  {item.company && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{item.company}</span></div>}
                                  {item.price && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span className="font-semibold"><ClientFormattedCurrency value={item.price} /></span></div>}
                              </CardContent>
                              <CardFooter className="border-t pt-3 px-4 pb-3">
                                <KillChainTracker 
                                    views={item.views ?? 0}
                                    interactions={getStatsValue(item)}
                                    interactionLabel={getInteractionLabel(item.type)}
                                />
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
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell><Badge variant={getBadgeVariant(item.type)} className="capitalize">{item.type}</Badge></TableCell>
                                        <TableCell><ClientFormattedDate date={item.date} formatStr="PPP"/></TableCell>
                                        <TableCell><Badge variant={item.status === 'active' ? 'secondary' : 'outline'}>{item.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={item.editPath} className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" /> {item.isExternal ? 'View Details' : 'Edit'}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal ? 'Remove from Calendar' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                  )
              ) : (
                  <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                          {areFiltersActive
                            ? "No items match your filters."
                            : "You haven't created any content yet."
                          }
                      </CardContent>
                  </Card>
              )}
          </div>
      </div>
    </>
  );
}
