
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { currentUser } from '@/lib/mock-data';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths, isBefore } from 'date-fns';
import { Search, MapPin, Tag, Briefcase, DollarSign, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import Image from 'next/image';

type CalendarItem = {
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
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setIsMounted(true);
  }, []);

  const calendarItems: CalendarItem[] = useMemo(() => {
    const events = currentUser.events.map(event => ({
      type: 'Event' as const,
      date: parseISO(event.date),
      title: event.title,
      description: `Event at ${event.location}`,
      location: event.location,
      imageUrl: event.imageUrl,
    }));
    const offers = currentUser.offers.map(offer => ({
      type: 'Offer' as const,
      date: parseISO(offer.releaseDate),
      title: offer.title,
      description: offer.description,
      category: offer.category,
      imageUrl: offer.imageUrl,
    }));
    const jobs = currentUser.jobs.map(job => ({
        type: 'Job' as const,
        date: parseISO(job.postingDate),
        title: job.title,
        description: `${job.type} at ${job.company}`,
        company: job.company,
        jobType: job.type,
        location: job.location,
        imageUrl: job.imageUrl,
    }));
    const listings = currentUser.listings.map(listing => ({
        type: 'Listing' as const,
        date: parseISO(listing.publishDate),
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: listing.price,
        imageUrl: listing.imageUrl,
    }));
    return [...events, ...offers, ...jobs, ...listings].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const filteredItems = useMemo(() => {
    return calendarItems.filter(item => {
      const searchMatch = searchTerm.length > 1 ?
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const locationMatch = locationFilter.length > 1 ?
        (item.location && item.location.toLowerCase().includes(locationFilter.toLowerCase()))
        : true;

      return searchMatch && locationMatch;
    });
  }, [calendarItems, searchTerm, locationFilter]);
  
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredItems.filter(item => isSameDay(item.date, selectedDate));
  }, [filteredItems, selectedDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  }

  const getBadgeVariant = (type: CalendarItem['type']): VariantProps<typeof badgeVariants>['variant'] => {
    switch (type) {
        case 'Event': return 'default';
        case 'Offer': return 'secondary';
        case 'Job': return 'destructive';
        case 'Listing': return 'outline';
        default: return 'default';
    }
  }

  if (!isMounted || !currentMonth) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Content Calendar</h1>
        <p className="text-muted-foreground">View events, offers, jobs, and listings in a calendar format.</p>
      </div>

      <Card>
        <CardContent className="p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            Clear Filters
          </Button>
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
                                        variant={getBadgeVariant(item.type)}
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
                        {itemsForSelectedDate.map((item, index) => (
                            <Card key={index} className="shadow-sm flex flex-col">
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
                                        <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
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
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No items scheduled for this day.
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
  );
}
