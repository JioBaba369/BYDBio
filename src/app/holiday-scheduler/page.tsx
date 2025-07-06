
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getHolidays, type GetHolidaysOutput } from '@/ai/flows/get-holidays-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Sparkles } from 'lucide-react';
import { ClientFormattedDate } from '@/components/client-formatted-date';

const HolidaySchedulerSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardContent>
            </Card>
        ))}
    </div>
);

export default function PublicHolidaysPage() {
    const [query, setQuery] = useState('Next public holiday in the United States');
    const [holidays, setHolidays] = useState<GetHolidaysOutput['holidays']>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchHolidays = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!query) {
            toast({ title: "Please enter a query.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setHolidays([]);
        try {
            const result = await getHolidays({ query });
            if (result && result.holidays && result.holidays.length > 0) {
                setHolidays(result.holidays);
            } else {
                toast({ title: "No holidays found", description: "Could not find any holidays for your query.", variant: "destructive" });
            }
        } catch (error: any) {
            console.error("Error fetching holidays:", error);
            toast({ title: "Error", description: error.message || "Could not fetch holidays.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
                    <CalendarDays className="h-8 w-8 text-primary" />
                    AI Holiday Finder
                </h1>
                <p className="text-muted-foreground">
                    Ask our AI assistant about public holidays in any country.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Ask the AI
                    </CardTitle>
                    <CardDescription>
                        Use natural language to ask for holidays. For example: "Public holidays in Canada for 2025" or "Next holiday in Australia".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFetchHolidays} className="flex gap-2">
                        <Input
                            id="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Holidays in the UK this year"
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Finding...' : 'Find Holidays'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HolidaySchedulerSkeleton />
                    </CardContent>
                </Card>
            )}

            {!isLoading && holidays.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {holidays.map((holiday, index) => (
                                <Card key={index} className="text-center bg-muted/30">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{holiday.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="font-semibold text-primary"><ClientFormattedDate date={holiday.date} formatStr="PPP" /></p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
