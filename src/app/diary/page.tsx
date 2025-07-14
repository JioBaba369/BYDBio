
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { getCalendarItems, toggleRsvp, deleteEvent, type CalendarItem, deleteAppointment } from '@/lib/events';
import { useAuth } from '@/components/auth-provider';
import { Clock, MoreHorizontal, Edit, Trash2, PlusCircle, Calendar as CalendarIconLucide, CalendarPlus, UserCheck } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay } from 'date-fns';
import { saveAs } from 'file-saver';
import { generateIcsContent } from '@/lib/appointments';

const DiarySkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
            <Card><div className="h-[300px] bg-muted"></div></Card>
            <div className="space-y-4">
                <div className="h-7 bg-muted rounded w-1/3"></div>
                <Card><div className="h-24 bg-muted"></div></Card>
                <Card><div className="h-24 bg-muted"></div></Card>
            </div>
        </div>
    </div>
);


export default function DiaryPage() {
  const { user, loading: authLoading } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date | undefined>();

  useEffect(() => {
    // Initialize date states on the client to avoid hydration errors
    const today = new Date();
    setSelectedDate(today);
    setMonth(today);
  }, []);
  
  useEffect(() => {
    if (user?.uid) {
        setIsLoading(true);
        getCalendarItems(user.uid, 'schedule')
            .then(setAllItems)
            .catch(err => {
                toast({ title: "Error", description: "Could not load diary items.", variant: "destructive" });
            })
            .finally(() => setIsLoading(false));
    }
  }, [user?.uid, toast]);

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
        if (selectedItem.type === 'Appointment') {
            await deleteAppointment(selectedItem.id);
            toast({ title: 'Appointment deleted!' });
        } else if (selectedItem.type === 'Event') {
            if (selectedItem.isExternal) {
                await toggleRsvp(selectedItem.id, user.uid);
                toast({ title: 'Removed from diary', description: `You are no longer attending "${selectedItem.title}".`});
            } else {
                await deleteEvent(selectedItem.id);
                toast({ title: 'Event deleted!' });
            }
        }
    } catch (error) {
        toast({ title: 'Error', description: `Failed to remove ${selectedItem.type}.`, variant: 'destructive' });
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
        case 'Appointment': return 'secondary';
        default: return 'default';
    }
  }

  const handleAddToCalendar = async (item: CalendarItem) => {
    if (!user || !item.startTime || !item.endTime) return;
    try {
        const icsContent = await generateIcsContent(item.title, item.startTime, item.endTime, user.name, user.email || 'noreply@byd.bio', item.bookerName || 'Guest');
        if (icsContent) {
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            saveAs(blob, `${item.title.replace(/ /g,"_")}.ics`);
        }
    } catch(e) {
        toast({ title: "Error creating calendar file", variant: "destructive" });
    }
  };
  
  const eventDays = useMemo(() => {
    return allItems.map(item => new Date(item.date));
  }, [allItems]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return allItems
      .filter(item => isSameDay(new Date(item.date), selectedDate))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
                        <DropdownMenuItem onClick={() => handleAddToCalendar(item)} className="cursor-pointer">
                            <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
                        </DropdownMenuItem>
                        {item.type === 'Event' && (
                            <DropdownMenuItem asChild>
                            <Link href={`/events/${item.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> View Details
                            </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal || item.type === 'Appointment' ? 'Remove from Diary' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1 text-xs text-muted-foreground">
            {item.startTime && <div className="flex items-center gap-2"><Clock className="h-3 w-3" /><span><ClientFormattedDate date={item.startTime} formatStr="p"/></span></div>}
        </CardContent>
    </Card>
  )

  if (authLoading || isLoading) {
    return <DiarySkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedItem(null);
            setIsDeleteDialogOpen(isOpen);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        itemName={selectedItem?.type.toLowerCase() ?? 'item'}
        itemDescription="This will only remove it from your diary, not delete it permanently."
        confirmationText={undefined}
        confirmationLabel={`Remove "${selectedItem?.title}" from your diary?`}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Diary</h1>
            <p className="text-muted-foreground">Your personal calendar of events and appointments.</p>
          </div>
          <Button asChild>
            <Link href="/events/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
        
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
                    selectedDayItems.map(item => <CalendarItemCard key={`${item.type}-${item.id}`} item={item} />)
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No items on this day.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </>
  );
}
