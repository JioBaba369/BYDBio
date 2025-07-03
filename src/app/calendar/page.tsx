
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { currentUser } from '@/lib/mock-data';
import { format, parseISO, isSameDay, startOfMonth } from 'date-fns';
import { Search, MapPin, Tag, Calendar as CalendarIcon, X, Clock } from 'lucide-react';

type CalendarItem = {
  type: 'Event' | 'Offer';
  date: Date;
  title: string;
  description: string;
  location?: string;
  category?: string;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const calendarItems: CalendarItem[] = useMemo(() => {
    const events = currentUser.events.map(event => ({
      type: 'Event' as const,
      date: parseISO(event.date),
      title: event.title,
      description: `Event at ${event.location}`,
      location: event.location,
    }));
    const offers = currentUser.offers.map(offer => ({
      type: 'Offer' as const,
      date: parseISO(offer.releaseDate),
      title: offer.title,
      description: offer.description,
      category: offer.category,
    }));
    return [...events, ...offers].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const filteredItems = useMemo(() => {
    return calendarItems.filter(item => {
      const searchMatch = searchTerm.length > 1 ?
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const daysWithItems = useMemo(() => {
    return filteredItems.map(item => item.date);
  }, [filteredItems]);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Content Calendar</h1>
        <p className="text-muted-foreground">View events and offer release days in a calendar format.</p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-2 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        components={{
                          Day: ({ date, displayMonth }) => {
                            const hasItem = daysWithItems.some(d => isSameDay(date, d));
                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());

                            return (
                              <div
                                className="relative flex items-center justify-center h-9 w-9"
                              >
                                {format(date, 'd')}
                                {hasItem && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></span>}
                              </div>
                            );
                          }
                        }}
                        className="p-0"
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold font-headline">
                {selectedDate ? `Schedule for ${format(selectedDate, 'PPP')}` : 'Select a date'}
            </h2>
            {selectedDate ? (
                itemsForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                        {itemsForSelectedDate.map((item, index) => (
                            <Card key={index} className="shadow-sm">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{item.title}</CardTitle>
                                            <CardDescription className="text-xs pt-1">{item.description}</CardDescription>
                                        </div>
                                        <Badge variant={item.type === 'Event' ? 'default' : 'secondary'}>{item.type}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 space-y-2 text-sm text-muted-foreground">
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No events or offers scheduled for this day.
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
    </div>
  );
}
