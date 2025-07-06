
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
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const HolidaySchedulerSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                     <Skeleton className="h-4 w-1/2 mx-auto mt-1" />
                </CardHeader>
                <CardContent className="p-4 pt-2 flex justify-center">
                    <Skeleton className="h-6 w-24" />
                </CardContent>
            </Card>
        ))}
    </div>
);

export default function PublicHolidaysPage() {
    const [query, setQuery] = useState('Holidays in the United States this year');
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
                        Use natural language to ask for holidays. For example: "Public holidays in Canada for 2025" or "Next holiday in Australia". For US states, try "Holidays in California this year".
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
                                <Card key={index} className="text-center bg-muted/30 flex flex-col">
                                    <CardHeader className="p-4 pb-2 flex-grow">
                                        <CardTitle className="text-base">{holiday.name}</CardTitle>
                                        <p className="font-semibold text-primary pt-1"><ClientFormattedDate date={holiday.date} formatStr="PPP" /></p>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        {holiday.isGlobal === false && holiday.counties && holiday.counties.length > 0 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="secondary" className="cursor-default">
                                                            State Holiday ({holiday.counties.length})
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{holiday.counties.join(', ')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <Badge variant="outline" className="cursor-default">National Holiday</Badge>
                                        )}
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
