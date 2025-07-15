
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCalendarItems, toggleRsvp, deleteEvent, type CalendarItem } from '@/lib/events';
import { useAuth } from '@/components/auth-provider';
import { Search, MapPin, Tag, Briefcase, DollarSign, X, Clock, MoreHorizontal, Edit, Trash2, PlusCircle, List, LayoutGrid, CalendarPlus, UserCheck, Calendar as CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { saveAs } from 'file-saver';
import { KillChainTracker } from '@/components/kill-chain-tracker';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { generateIcsContent, deleteAppointment } from '@/lib/appointments';
import { CONTENT_TYPES, getContentTypeMetadata, ContentTypeMetadata } from '@/lib/content-types';
import { parseISO } from 'date-fns';

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

// Custom hook for data fetching and filtering
function useMyContentManagement(userId: string | undefined, toast: ReturnType<typeof useToast>['toast']) {
    const [allItems, setAllItems] = useState<CalendarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [typeFilters, setTypeFilters] = useState<Set<string>>(
        new Set(CONTENT_TYPES.map(type => type.name))
    );

    const fetchContent = useCallback(() => {
         if (userId) {
            setIsLoading(true);
            Promise.all([
                getCalendarItems(userId, 'author'),
                getCalendarItems(userId, 'schedule')
            ]).then(([authoredItems, scheduleItems]) => {
                // Combine and remove duplicates, giving preference to authored items
                const combinedMap = new Map<string, CalendarItem>();
                authoredItems.forEach(item => combinedMap.set(item.id, item));
                scheduleItems.forEach(item => {
                    if (!combinedMap.has(item.id)) {
                        combinedMap.set(item.id, item);
                    }
                });
                setAllItems(Array.from(combinedMap.values()));
            }).catch(err => {
                toast({ title: "Error", description: "Could not load content.", variant: "destructive" });
            }).finally(() => setIsLoading(false));
        }
    }, [userId, toast]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

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

    const areFiltersActive = useMemo(() => {
      return !!searchTerm || !!locationFilter || typeFilters.size < CONTENT_TYPES.length;
    }, [searchTerm, locationFilter, typeFilters]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setLocationFilter('');
        setTypeFilters(new Set(CONTENT_TYPES.map(type => type.name)));
    }, []);

    const handleTypeFilterChange = useCallback((type: string) => {
        setTypeFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    }, []);

    return {
        allItems,
        setAllItems,
        isLoading,
        searchTerm,
        setSearchTerm,
        locationFilter,
        setLocationFilter,
        typeFilters,
        handleTypeFilterChange,
        filteredItems,
        areFiltersActive,
        handleClearFilters,
        refetch: fetchContent,
    };
}


export default function MyContentPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const {
      allItems,
      setAllItems,
      isLoading,
      searchTerm,
      setSearchTerm,
      locationFilter,
      setLocationFilter,
      typeFilters,
      handleTypeFilterChange,
      filteredItems,
      areFiltersActive,
      handleClearFilters,
      refetch,
  } = useMyContentManagement(user?.uid, toast);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'calendar'>('grid');
  
  const openDeleteDialog = (item: CalendarItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }

  const handleDelete = async () => {
    if (!selectedItem || !user) return;

    setIsDeleting(true);

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
            case 'Offer': await deleteOffer(selectedItem.id); toast({ title: 'Offer deleted!' }); break;
            case 'Job': await deleteJob(selectedItem.id); toast({ title: 'Job deleted!' }); break;
            case 'Listing': await deleteListing(selectedItem.id); toast({ title: 'Listing deleted!' }); break;
            case 'Business Page': await deletePromoPage(selectedItem.id); toast({ title: 'Business Page deleted!' }); break;
            case 'Appointment': await deleteAppointment(selectedItem.id); toast({ title: 'Appointment deleted!' }); break;
        }
        refetch(); // Refetch all content after deletion
    } catch (error) {
        toast({ title: 'Error', description: `Failed to delete ${selectedItem.type}.`, variant: 'destructive' });
    } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
    }
  };

  const handleAddToCalendar = async (item: CalendarItem) => {
    const startTime = typeof item.startTime === 'string' ? parseISO(item.startTime) : (item.startTime as Date);
    const endTime = typeof item.endTime === 'string' ? parseISO(item.endTime) : (item.endTime as Date);

    if (!user || !startTime || !endTime) {
        toast({ title: "Error", description: "Missing event details or user info.", variant: "destructive" });
        return;
    }
    
    try {
        const safeTitle = item.title.replace(/[^a-zA-Z0-9]/g,"_");
        const userName = user.name || 'Anonymous User';
        const userEmail = user.email || 'noreply@byd.bio';
        const bookerName = item.bookerName || 'Guest';

        const icsContent = await generateIcsContent(item.title, startTime.toISOString(), endTime.toISOString(), userName, userEmail, bookerName);
        if (icsContent) {
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            saveAs(blob, `${safeTitle}.ics`);
            toast({ title: "Calendar file downloaded!", description: "Add this file to your preferred calendar app." });
        }
    } catch(e) {
        toast({ title: "Error creating calendar file", variant: "destructive" });
    }
  };
  
    const daysWithEvents = useMemo(() => {
        return allItems.map(item => new Date(item.date));
    }, [allItems]);
    
    const [month, setMonth] = useState(new Date());
    
    const eventsForSelectedDay = useMemo(() => {
        if (!month) return [];
        return allItems.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getFullYear() === month.getFullYear() &&
                   itemDate.getMonth() === month.getMonth() &&
                   itemDate.getDate() === month.getDate();
        });
    }, [allItems, month]);


  if (authLoading || isLoading) {
    return <ContentHubSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedItem(null);
            }
            setIsDeleteDialogOpen(isOpen);
        }}
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
            <p className="text-muted-foreground">View, create, and manage all your content and events in one place.</p>
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
                {CONTENT_TYPES.filter(type => type.name !== 'Appointment').map((typeMeta) => {
                  const linkPath = `/${typeMeta.name.toLowerCase().replace(/ /g, '')}s/create`;
                  const label = typeMeta.name === 'Business Page' ? typeMeta.name : `New ${typeMeta.name}`;
                  const Icon = typeMeta.icon;
                  return (
                    <DropdownMenuItem asChild key={typeMeta.name}>
                      <Link href={linkPath} className="cursor-pointer">
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
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
                        {CONTENT_TYPES.map((typeMeta: ContentTypeMetadata) => {
                            const isSelected = typeFilters.has(typeMeta.name);
                            const label = typeMeta.label; // Use label from metadata
                            const Icon = typeMeta.icon;
                            return (
                                <Badge
                                    key={typeMeta.name}
                                    variant={isSelected ? typeMeta.variant : 'outline'}
                                    onClick={() => handleTypeFilterChange(typeMeta.name)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTypeFilterChange(typeMeta.name); }}
                                    className={cn(
                                        'cursor-pointer transition-all py-1.5 px-3 text-sm',
                                        !isSelected && 'hover:bg-accent/50',
                                        typeMeta.variant === 'outline' && isSelected && 'bg-foreground text-background border-transparent hover:bg-foreground/90',
                                    )}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <Icon className="mr-2 h-4 w-4" /> {label}
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
                    {view === 'calendar' ? 'My Calendar' : `All Content (${filteredItems.length})`}
                </h2>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                     <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('calendar')}>
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              
              {view === 'calendar' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <DayPicker
                          mode="single"
                          selected={month}
                          onSelect={(day) => day && setMonth(day)}
                          month={month}
                          onMonthChange={setMonth}
                          modifiers={{ withEvent: daysWithEvents }}
                          modifiersClassNames={{ withEvent: 'day-with-event' }}
                          className="p-4"
                        />
                    </Card>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-headline">
                          Schedule for <ClientFormattedDate date={month} />
                        </h3>
                        {eventsForSelectedDay.length > 0 ? (
                            <div className="space-y-4">
                                {eventsForSelectedDay.map(item => {
                                   const typeMeta = getContentTypeMetadata(item.type);
                                   if (!typeMeta) return null;
                                   return (
                                     <Card key={item.id}>
                                         <CardContent className="p-4 flex items-start gap-4">
                                            <div className="h-full w-1.5 rounded-full" style={{ backgroundColor: `hsl(var(--${typeMeta.variant === 'destructive' ? 'destructive' : typeMeta.variant === 'secondary' ? 'secondary' : 'primary'}))` }} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-sm text-muted-foreground"><ClientFormattedDate date={item.date} formatStr="p" /></p>
                                                  </div>
                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                                          <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                        {item.type === 'Appointment' ? (
                                                            <DropdownMenuItem onClick={() => handleAddToCalendar(item)} className="cursor-pointer"><CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar</DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem asChild><Link href={item.editPath} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" /> {item.isExternal ? 'View' : 'Edit'}</Link></DropdownMenuItem>
                                                        )}
                                                          <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> {item.isExternal ? 'Remove' : 'Delete'}</DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                         </CardContent>
                                     </Card>
                                   )
                                })}
                            </div>
                        ) : (
                            <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                                <Info className="h-8 w-8 mb-2"/>
                                <p>No events or appointments scheduled for this day.</p>
                            </Card>
                        )}
                    </div>
                </div>
              ) : filteredItems.length > 0 ? (
                  view === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems.map((item) => {
                        const typeMeta = getContentTypeMetadata(item.type);
                        if (!typeMeta) return null;

                        const BadgeIcon = typeMeta.icon;

                         if (item.type === 'Appointment') {
                             return (
                                 <Card key={item.id} className="shadow-sm flex flex-col bg-secondary/40">
                                     <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant={typeMeta.variant}>{item.type}</Badge>
                                                <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => handleAddToCalendar(item)} className="cursor-pointer">
                                                        <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                     </CardHeader>
                                     <CardContent className="p-4 pt-2 space-y-2 text-sm text-muted-foreground flex-grow">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span><ClientFormattedDate date={item.startTime!} formatStr="p" /> - <ClientFormattedDate date={item.endTime!} formatStr="p" /></span>
                                        </div>
                                     </CardContent>
                                     <CardFooter className="border-t pt-3 px-4 pb-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <UserCheck className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Booked by: {item.bookerName}</span>
                                        </div>
                                     </CardFooter>
                                 </Card>
                             )
                         }
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
                                        <Badge variant={typeMeta.variant} className="capitalize">{item.isExternal ? 'Attending' : typeMeta.label.replace(/s$/, '')}</Badge>
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
                                    interactions={typeMeta.getStatsValue(item)}
                                    interactionLabel={typeMeta.getInteractionLabel(item.type)}
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
                                {filteredItems.map(item => {
                                  const typeMeta = getContentTypeMetadata(item.type);
                                  if (!typeMeta) return null;

                                    return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell><Badge variant={typeMeta.variant} className="capitalize">{item.isExternal ? 'Attending' : typeMeta.label.replace(/s$/, '')}</Badge></TableCell>
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
                                                    {item.type === 'Appointment' ? (
                                                        <DropdownMenuItem onClick={() => handleAddToCalendar(item)} className="cursor-pointer">
                                                            <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={item.editPath} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" /> {item.isExternal ? 'View Details' : 'Edit'}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal ? 'Remove from Calendar' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )})}
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
