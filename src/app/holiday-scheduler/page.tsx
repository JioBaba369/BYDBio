
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getHolidays, type GetHolidaysOutput } from '@/ai/flows/get-holidays-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

const HolidaySchedulerSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
);

export default function PublicHolidaysPage() {
    const [country, setCountry] = useState('US');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [holidays, setHolidays] = useState<GetHolidaysOutput['holidays']>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchHolidays = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!country || !year) {
            toast({ title: "Please enter a country and year.", variant: "destructive" });
            return;
        }
        
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
             toast({ title: "Invalid Year", description: "Please enter a valid year.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        setHolidays([]);
        try {
            const result = await getHolidays({ country, year: yearNum });
            if (result && result.holidays) {
                setHolidays(result.holidays);
            } else {
                toast({ title: "No holidays found", description: "Could not find any holidays for the selected country and year.", variant: "destructive" });
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
                    Public Holidays
                </h1>
                <p className="text-muted-foreground">
                    Find public holidays for any country and year using our AI-powered helper.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Find Public Holidays</CardTitle>
                    <CardDescription>Enter a country name or 2-letter code (e.g., "United States", "GB") and a year.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFetchHolidays} className="grid sm:grid-cols-3 gap-4 items-end">
                         <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g., US, Canada"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g., 2024"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? 'Finding...' : 'Find Holidays'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {(isLoading || holidays.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <HolidaySchedulerSkeleton />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Holiday Name</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {holidays.map((holiday, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{holiday.date}</TableCell>
                                            <TableCell>{holiday.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
