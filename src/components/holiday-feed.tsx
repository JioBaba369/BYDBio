'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getHolidays } from '@/ai/flows/get-holidays-flow';
import { ClientFormattedDate } from './client-formatted-date';
import { CalendarSearch } from 'lucide-react';
import { isFuture, parseISO, startOfToday, format } from 'date-fns';

type Holiday = {
  name: string;
  date: string;
};

export function HolidayFeed() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      try {
        const response = await getHolidays({ country: 'Australia', year: currentYear });
        const upcomingHolidays = response.holidays
            .map(h => ({ ...h, dateObj: parseISO(h.date) }))
            .filter(h => isFuture(h.dateObj) || h.date === format(startOfToday(), 'yyyy-MM-dd'))
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .slice(0, 5); // Limit to the next 5 holidays
        setHolidays(upcomingHolidays);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
        toast({
          title: "Could not load holidays",
          description: "There was an issue fetching Australian holidays.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center gap-2">
            <CalendarSearch className="h-5 w-5 text-primary" />
            Upcoming Australian Holidays
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : holidays.length > 0 ? (
          <ul className="space-y-3">
            {holidays.map((holiday) => (
              <li key={holiday.name} className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{holiday.name}</span>
                <span className="text-muted-foreground">
                    <ClientFormattedDate date={holiday.date} formatStr="EEE, d MMM" />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No upcoming holidays found for this year.</p>
        )}
      </CardContent>
    </Card>
  );
}
