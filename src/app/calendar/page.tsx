
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { getEventsForDiary } from '@/lib/events';
import { useAuth } from '@/components/auth-provider';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths, isBefore } from 'date-fns';
import { Search, MapPin, Tag, Briefcase, DollarSign, X, Clock, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, PlusCircle, MessageSquare, Tags, Calendar as CalendarIconLucide, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Event, Offer, Job, Listing } from '@/lib/users';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { deleteListing } from '@/lib/listings';
import { deleteJob } from '@/lib/jobs';
import { deleteEvent, toggleRsvp } from '@/lib/events';
import { deleteOffer } from '@/lib/offers';

type CalendarItem = {
  id: string;
  type: 'Event' | 'Offer' | 'Job' | 'Listing';
  date: Date;
  title: string;
  description: string;
  location?: string;
  category?: string;
  company?: string;
  jobType?: string;
  price?: string;
  imageUrl?: string | null;
  editPath: string;
  isExternal?: boolean;
};

const CalendarSkeleton = () => (
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="h-7 bg-muted rounded w-1/3"></div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, i) => <div key={i} className="h-6 bg-muted rounded w-full"></div>)}
                </div>
                <div className="grid grid-cols-7 gap-px mt-2 bg-border border-t border-l">
                    {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-muted border-r border-b border-border"></div>)}
                </div>
            </CardContent>
        </Card>
        <div className="space-y-4">
            <div className="h-7 bg-muted rounded w-1/4"></div>
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Loading items...
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(
    new Set(['Event', 'Offer', 'Job', 'Listing'])
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { toast } = useToast();
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        // This function now fetches all content types for the user's diary/calendar
        getEventsForDiary(user.uid)
            .then((items) => {
                const formattedItems: CalendarItem[] = items.map((item: any) => {
                    switch(item.type) {
                        case 'event':
                            return {
                                id: item.id,
                                type: 'Event' as const,
                                date: item.date as Date,
                                title: item.title,
                                description: `Event at ${item.location}`,
                                location: item.location,
                                imageUrl: item.imageUrl,
                                editPath: `/events/${item.id}/edit`,
                                isExternal: item.source === 'rsvped',
                            };
                        case 'offer':
                             return {
                                id: item.id,
                                type: 'Offer' as const,
                                date: item.releaseDate as Date,
                                title: item.title,
                                description: item.description,
                                category: item.category,
                                imageUrl: item.imageUrl,
                                editPath: `/offers/${item.id}/edit`,
                                isExternal: false,
                            };
                        case 'job':
                             return {
                                id: item.id,
                                type: 'Job' as const,
                                date: item.postingDate as Date,
                                title: item.title,
                                description: `${item.type} at ${item.company}`,
                                company: item.company,
                                jobType: item.type,
                                location: item.location,
                                imageUrl: item.imageUrl,
                                editPath: `/opportunities/${item.id}/edit`,
                                isExternal: false,
                            };
                        case 'listing':
                             return {
                                id: item.id,
                                type: 'Listing' as const,
                                date: item.publishDate as Date,
                                title: item.title,
                                description: item.description,
                                category: item.category,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                editPath: `/listings/${item.id}/edit`,
                                isExternal: false,
                            };
                        default:
                            return null;
                    }
                }).filter((item): item is CalendarItem => item !== null);
                setCalendarItems(formattedItems.sort((a, b) => a.date.getTime() - b.date.getTime()));
            })
            .catch(err => {
                console.error("Failed to fetch calendar items", err);
                toast({ title: "Error", description: "Could not load calendar items.", variant: "destructive" });
            })
            .finally(() => setIsLoading(false));
    }
  }, [user, toast]);


  const areFiltersActive = !!searchTerm || !!locationFilter || typeFilters.size < 4;

  const filteredItems = useMemo(() => {
    return calendarItems.filter(item => {
      if (!typeFilters.has(item.type)) {
        return false;
      }

      const searchMatch = searchTerm.length > 0 ?
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const locationMatch = locationFilter.length > 0 ?
        (item.location && item.location.toLowerCase().includes(locationFilter.toLowerCase()))
        : true;

      return searchMatch && locationMatch;
    });
  }, [calendarItems, searchTerm, locationFilter, typeFilters]);
  
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredItems.filter(item => isSameDay(item.date, selectedDate));
  }, [filteredItems, selectedDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilters(new Set(['Event', 'Offer', 'Job', 'Listing']));
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
    try {
        switch (selectedItem.type) {
            case 'Event':
                if (selectedItem.isExternal) {
                    await toggleRsvp(selectedItem.id, user.uid);
                    toast({ title: 'Removed from diary', description: `You are no longer attending "${selectedItem.title}".`});
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
        }
        setCalendarItems(prev => prev.filter(item => item.id !== selectedItem.id));
    } catch (error) {
        console.error(`Error deleting ${selectedItem.type}:`, error);
        toast({ title: 'Error', description: `Failed to delete ${selectedItem.type}.`, variant: 'destructive' });
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
    }
  };

  const getBadgeVariant = (item: CalendarItem): VariantProps<typeof badgeVariants>['variant'] => {
    if (item.type === 'Event' && item.isExternal) return 'secondary';
    switch (item.type) {
        case 'Event': return 'default';
        case 'Offer': return 'secondary';
        case 'Job': return 'destructive';
        case 'Listing': return 'outline';
        default: return 'default';
    }
  }
  
  const contentTypes: { name: CalendarItem['type'], icon: React.ElementType, variant: VariantProps<typeof badgeVariants>['variant'] }[] = [
    { name: 'Event', icon: CalendarIconLucide, variant: 'default' },
    { name: 'Offer', icon: DollarSign, variant: 'secondary' },
    { name: 'Job', icon: Briefcase, variant: 'destructive' },
    { name: 'Listing', icon: Tags, variant: 'outline' },
  ];

  if (!isMounted || !currentMonth || authLoading || isLoading) {
    return <CalendarSkeleton />;
  }

  // Calendar grid logic
  const firstDayOfMonth = startOfMonth(currentMonth);
  const daysInCalendar = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(endOfMonth(currentMonth))
  });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={selectedItem?.type.toLowerCase() ?? 'item'}
        itemDescription={selectedItem?.isExternal ? "This will only remove it from your calendar, not delete the event itself." : undefined}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Content Calendar</h1>
            <p className="text-muted-foreground">View, create, and manage your scheduled content.</p>
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
                <Link href="/listings/create" className="cursor-pointer">
                    <Tags className="mr-2 h-4 w-4" />
                    <span>New Listing</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/opportunities/create" className="cursor-pointer">
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
                    <DollarSign className="mr-2 h-4 w-4" />
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
                        {contentTypes.map(({ name, icon: Icon, variant }) => (
                            <Button
                                key={name}
                                variant={typeFilters.has(name) ? variant : 'outline'}
                                size="sm"
                                onClick={() => handleTypeFilterChange(name)}
                                className={cn(
                                    variant === 'outline' && typeFilters.has(name) && 'bg-accent text-accent-foreground border-accent-foreground/30',
                                    'transition-all'
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" /> {name}s
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
              <div className="grid grid-cols-7 gap-2">
                  {weekdays.map(day => (
                      <div key={day} className="text-center font-semibold text-muted-foreground text-sm">{day}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-px mt-2 bg-border border-t border-l">
                  {daysInCalendar.map(day => {
                      const isCurrentMonthDay = isSameMonth(day, currentMonth);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      const isPast = isBefore(day, new Date()) && !isToday;
                      const itemsForDay = filteredItems.filter(item => isSameDay(item.date, day));
                      const hasItems = itemsForDay.length > 0;

                      return (
                          <button
                              key={day.toString()}
                              onClick={() => setSelectedDate(day)}
                              className={cn(
                                  "aspect-square p-2 text-left align-top overflow-hidden relative border-r border-b border-border transition-colors focus:z-10 focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                  isCurrentMonthDay ? "bg-background" : "bg-muted/40 text-muted-foreground/80",
                                  !isCurrentMonthDay && "text-muted-foreground",
                                  isSelected && "bg-primary text-primary-foreground",
                                  !isSelected && isToday && "bg-accent text-accent-foreground",
                                  hasItems && !isSelected && !isToday && isPast && "bg-muted text-muted-foreground",
                                  hasItems && !isSelected && !isToday && !isPast && "bg-primary/10",
                                  !isSelected && isCurrentMonthDay && "hover:bg-accent/50"
                              )}
                          >
                              <span className={cn("font-medium", isSelected ? "text-primary-foreground" : isToday ? "text-accent-foreground" : "text-foreground")}>{format(day, 'd')}</span>
                               <div className="mt-1 space-y-1 overflow-y-auto text-xs h-[calc(100%-2rem)]">
                                  {itemsForDay.slice(0, 2).map((item, idx) => (
                                      <Badge
                                          key={`${item.title}-${idx}`}
                                          variant={getBadgeVariant(item)}
                                          className={cn("w-full truncate block text-left text-xs h-auto", isSelected && "bg-background/20 text-foreground" )}
                                      >
                                          {item.title}
                                      </Badge>
                                  ))}
                                  {itemsForDay.length > 2 && (
                                      <p className={cn("text-xs", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>+ {itemsForDay.length - 2} more</p>
                                  )}
                              </div>
                          </button>
                      )
                  })}
              </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
              <h2 className="text-xl font-bold font-headline">
                  {selectedDate ? `Schedule for ${format(selectedDate, 'PPP')}` : 'Select a date'}
              </h2>
              {selectedDate ? (
                  itemsForSelectedDate.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemsForSelectedDate.map((item) => (
                              <Card key={item.id} className="shadow-sm flex flex-col">
                                  {item.imageUrl && (
                                    <div className="overflow-hidden rounded-t-lg">
                                      <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office laptop" />
                                    </div>
                                  )}
                                  <CardHeader className="p-4 pb-2">
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <CardTitle className="text-base">{item.title}</CardTitle>
                                              <CardDescription className="text-xs pt-1">{item.description}</CardDescription>
                                          </div>
                                          <Badge variant={getBadgeVariant(item)}>{item.isExternal ? 'Attending' : item.type}</Badge>
                                      </div>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-2 space-y-2 text-sm text-muted-foreground flex-grow">
                                      <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>{format(item.date, 'p')}</span>
                                      </div>
                                      {item.location && (
                                          <div className="flex items-center gap-2">
                                              <MapPin className="h-4 w-4" />
                                              <span>{item.location}</span>
                                          </div>
                                      )}
                                      {item.category && (
                                          <div className="flex items-center gap-2">
                                              <Tag className="h-4 w-4" />
                                              <span>{item.category}</span>
                                          </div>
                                      )}
                                      {item.company && (
                                          <div className="flex items-center gap-2">
                                              <Briefcase className="h-4 w-4" />
                                              <span>{item.company} ({item.jobType})</span>
                                          </div>
                                      )}
                                      {item.price && (
                                           <div className="flex items-center gap-2">
                                              <DollarSign className="h-4 w-4" />
                                              <span className="font-semibold">{item.price}</span>
                                          </div>
                                      )}
                                  </CardContent>
                                  <CardFooter className="border-t pt-4 px-4 pb-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                          <MoreHorizontal className="mr-2 h-4 w-4" />
                                          Manage
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
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  ) : (
                      <Card>
                          <CardContent className="p-6 text-center text-muted-foreground">
                              {areFiltersActive
                                ? "No items match your filters for this day."
                                : "No items scheduled for this day."
                              }
                          </CardContent>
                      </Card>
                  )
              ) : (
                  <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                          Please select a date from the calendar to see details.
                      </CardContent>
                  </Card>
              )}
          </div>
      </div>
    </>
  );
}
