'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { getCalendarItems, toggleRsvp, deleteEvent, type CalendarItem, deleteAppointment } from '@/lib/events';
import { useAuth } from '@/components/auth-provider';
import { Clock, MoreHorizontal, Edit, Trash2, PlusCircle, CalendarPlus, UserCheck, CalendarDays as CalendarIconLucide } from 'lucide-react'; // Changed Calendar to CalendarDays to avoid naming conflict
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- Components ---

/**
 * Renders a skeleton loader for the Diary page.
 */
const DiarySkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </div>
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card><Skeleton className="h-[300px]" /></Card>
      <div className="space-y-4">
        <Skeleton className="h-7 w-1/3" />
        <Card><Skeleton className="h-24" /></Card>
        <Card><Skeleton className="h-24" /></Card>
      </div>
    </div>
  </div>
);

/**
 * Helper function to determine the badge variant for a calendar item type.
 */
const getBadgeVariant = (itemType: CalendarItem['type']): VariantProps<typeof badgeVariants>['variant'] => {
  switch (itemType) {
    case 'Event': return 'default';
    case 'Appointment': return 'secondary';
    default: return 'default';
  }
};

interface CalendarItemCardProps {
  item: CalendarItem;
  onAddToCalendar: (item: CalendarItem) => void;
  onOpenDeleteDialog: (item: CalendarItem) => void;
}

/**
 * Renders a single calendar item within the diary.
 */
const CalendarItemCard = ({ item, onAddToCalendar, onOpenDeleteDialog }: CalendarItemCardProps) => (
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
            <DropdownMenuItem onClick={() => onAddToCalendar(item)} className="cursor-pointer">
              <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
            </DropdownMenuItem>
            {item.type === 'Event' && (
              <DropdownMenuItem asChild>
                <Link href={`/events/${item.id}`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onOpenDeleteDialog(item)} className="text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> {item.isExternal || item.type === 'Appointment' ? 'Remove from Diary' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent className="p-3 pt-0 space-y-1 text-xs text-muted-foreground">
      {item.startTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span><ClientFormattedDate date={item.startTime} formatStr="p" /></span>
        </div>
      )}
      {item.type === 'Appointment' && item.bookerName && (
        <div className="flex items-center gap-2">
          <UserCheck className="h-3 w-3" />
          <span>{item.bookerName}</span>
        </div>
      )}
    </CardContent>
  </Card>
);


// --- Main Component ---

export default function DiaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [allItems, setAllItems] = useState<CalendarItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true); // Renamed for clarity

  // Initialize date states directly to current date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  /**
   * Fetches calendar items for the current user.
   */
  const fetchCalendarItems = useCallback(async () => {
    if (!user?.uid) {
      setIsLoadingItems(false); // Ensure loading state is false if no user
      return;
    }
    setIsLoadingItems(true);
    try {
      const items = await getCalendarItems(user.uid, 'schedule');
      setAllItems(items);
    } catch (err) {
      console.error("Failed to load diary items:", err);
      toast({ title: "Error", description: "Could not load diary items.", variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
  }, [user?.uid, toast]);

  // Fetch items on component mount and when user UID changes
  useEffect(() => {
    fetchCalendarItems();
  }, [fetchCalendarItems]);

  /**
   * Opens the delete confirmation dialog for a specific item.
   */
  const handleOpenDeleteDialog = useCallback((item: CalendarItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Handles the deletion or removal of a calendar item.
   */
  const handleDelete = useCallback(async () => {
    if (!selectedItem || !user) {
      toast({ title: "Error", description: "No item selected for deletion.", variant: "destructive" });
      return;
    }

    setIsDeleting(true);

    // Optimistic UI update: remove item immediately from view
    setAllItems(prev => prev.filter(item => item.id !== selectedItem.id));
    const previousItems = allItems; // Store for rollback

    try {
      if (selectedItem.type === 'Appointment') {
        await deleteAppointment(selectedItem.id);
        toast({ title: 'Appointment deleted!', description: `The appointment "${selectedItem.title}" has been removed.` });
      } else if (selectedItem.type === 'Event') {
        if (selectedItem.isExternal) {
          // If external, it means the user RSVP'd and now wants to un-RSVP
          await toggleRsvp(selectedItem.id, user.uid);
          toast({ title: 'Removed from diary', description: `You are no longer attending "${selectedItem.title}".` });
        } else {
          // If not external, it's an event created by the user
          await deleteEvent(selectedItem.id);
          toast({ title: 'Event deleted!', description: `The event "${selectedItem.title}" has been permanently deleted.` });
        }
      }
    } catch (error) {
      console.error(`Failed to remove ${selectedItem.type}:`, error);
      toast({ title: 'Error', description: `Failed to remove ${selectedItem.type}. Please try again.`, variant: 'destructive' });
      // Rollback UI on error
      setAllItems(previousItems);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  }, [selectedItem, user, allItems, toast]);

  /**
   * Generates and downloads an ICS file for a given calendar item.
   */
  const handleAddToCalendar = useCallback(async (item: CalendarItem) => {
    if (!user || !item.startTime || !item.endTime) {
      toast({ title: "Error", description: "Missing event details or user info.", variant: "destructive" });
      return;
    }
    try {
      const icsContent = await generateIcsContent(
        item.title,
        item.startTime,
        item.endTime,
        user.name || 'Anonymous User', // Fallback for user name
        user.email || 'noreply@byd.bio', // Fallback for user email
        item.bookerName || 'Guest'
      );
      if (icsContent) {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        saveAs(blob, `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(item.date), 'yyyyMMdd')}.ics`); // Sanitize filename
        toast({ title: "Calendar file downloaded!", description: "Add this file to your preferred calendar app." });
      }
    } catch (e) {
      console.error("Error creating ICS file:", e);
      toast({ title: "Error creating calendar file", description: "Could not generate file for your calendar.", variant: "destructive" });
    }
  }, [user, toast]);

  // Memoize event days for the calendar picker to optimize re-renders
  const eventDays = useMemo(() => {
    return allItems.map(item => new Date(item.date));
  }, [allItems]);

  // Memoize items for the currently selected day
  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return allItems
      .filter(item => isSameDay(new Date(item.date), selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedDate, allItems]);


  // Display skeleton while authentication is loading or items are being fetched
  if (authLoading || isLoadingItems) {
    return <DiarySkeleton />;
  }

  // If user is not authenticated after loading, perhaps redirect or show message
  if (!user) {
    // This case should ideally be handled by a higher-level route guard
    // or auth redirect in a real application.
    return (
      <div className="max-w-2xl mx-auto py-10 text-center text-muted-foreground">
        <CalendarIconLucide className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold">Please log in to view your diary.</h2>
        <p className="mt-2">You need to be authenticated to access this page.</p>
        <Button asChild className="mt-4">
            <Link href="/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          // Clear selected item if dialog is closed without confirmation
          if (!isOpen) setSelectedItem(null);
          setIsDeleteDialogOpen(isOpen);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        itemName={selectedItem?.type.toLowerCase() ?? 'item'}
        // Adjust description based on item type for clarity
        itemDescription={
          selectedItem?.type === 'Event' && !selectedItem.isExternal
            ? `This will permanently delete the event "${selectedItem.title}" for all attendees.`
            : `This will remove "${selectedItem?.title}" from your diary. It will not delete the original event if it's external.`
        }
        confirmationText="Confirm" // Changed to a generic "Confirm" for broader use
        confirmationLabel={`Are you sure you want to ${selectedItem?.type === 'Event' && !selectedItem.isExternal ? 'delete' : 'remove'} this ${selectedItem?.type.toLowerCase()}?`}
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
          <Card className="flex justify-center p-4"> {/* Added padding to card */}
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ event: eventDays }}
              modifiersClassNames={{ event: 'day-with-event' }}
              // Add a footer to show how to add new items
              footer={
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Click a date to see its entries.</p>
                  <p>Days with <span className="day-with-event px-1 py-0.5 rounded-full inline-block">a dot</span> have events.</p>
                </div>
              }
            />
          </Card>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              {selectedDate ? format(selectedDate, 'PPP') : 'Select a day to view items'}
            </h3>
            {selectedDayItems.length > 0 ? (
              selectedDayItems.map(item => (
                <CalendarItemCard
                  key={`${item.type}-${item.id}`} // Ensure unique key combining type and id
                  item={item}
                  onAddToCalendar={handleAddToCalendar}
                  onOpenDeleteDialog={handleOpenDeleteDialog}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No items scheduled for this day.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}