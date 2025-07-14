
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { User } from '@/lib/users';
import { getAvailableSlots, createAppointment } from '@/lib/appointments';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface BookingDialogProps {
  user: User;
}

export function BookingDialog({ user }: BookingDialogProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!date) {
        setDate(new Date());
    }
  }, [date]);

  useEffect(() => {
    if (!date || !user.bookingSettings?.acceptingAppointments) {
      setTimeSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    getAvailableSlots(user.uid, date)
      .then(slots => {
        setTimeSlots(slots);
        setSelectedTime(null); // Reset selected time when date changes
      })
      .catch(console.error)
      .finally(() => setIsLoadingSlots(false));

  }, [date, user.uid, user.bookingSettings]);
  
  const handleTimeSelect = (time12h: string) => {
    // Convert 12h "1:30 PM" to 24h "13:30"
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const time24h = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    setSelectedTime(time24h);
  };

  const handleBooking = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to book an appointment.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (!date || !selectedTime) {
        toast({ title: "Please select a date and time.", variant: "destructive" });
        return;
    }
    
    setIsBooking(true);
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    try {
      await createAppointment(user.uid, currentUser.uid, currentUser.name, appointmentDateTime);
      toast({
        title: "Appointment Booked!",
        description: `Your meeting with ${user.name} is confirmed. It has been added to your diary.`,
      });
      setIsDialogOpen(false); // Close dialog on success
    } catch (error: any) {
       toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsBooking(false);
    }
  };

  if (!user.bookingSettings?.acceptingAppointments) {
    return null;
  }
  
  const availableDays = Object.keys(user.bookingSettings.availability).filter(
      day => user.bookingSettings?.availability[day as keyof typeof user.bookingSettings.availability]?.enabled
  ).map(day => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day));

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <TooltipProvider>
        <DialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Book a Meeting
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schedule a meeting directly</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
      </TooltipProvider>
      <DialogContent className="sm:max-w-2xl grid-cols-1 md:grid-cols-2">
          <div className="p-2">
            <DialogHeader>
                <DialogTitle>Book a meeting with {user.name}</DialogTitle>
                <DialogDescription>Select a date and time that works for you.</DialogDescription>
            </DialogHeader>
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    return d < today || !availableDays.includes(d.getDay());
                }}
                className="rounded-md border mt-4"
            />
          </div>
          <div className="p-2 space-y-4">
              <h4 className="font-semibold text-center">{date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}</h4>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                {isLoadingSlots ? (
                    <div className="col-span-3 flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : timeSlots.length > 0 ? (
                    timeSlots.map(slot12h => {
                        const [time, modifier] = slot12h.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        if (modifier === 'PM' && hours < 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;
                        const time24h = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        
                        return (
                            <Button 
                                key={slot12h} 
                                variant={selectedTime === time24h ? 'default' : 'outline'}
                                onClick={() => handleTimeSelect(slot12h)}
                            >
                                {slot12h}
                            </Button>
                        )
                    })
                ) : (
                    <p className="col-span-3 text-center text-sm text-muted-foreground p-8">No available slots on this day.</p>
                )}
              </div>
              <Button onClick={handleBooking} disabled={!selectedTime || isBooking} className="w-full">
                {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isBooking ? 'Confirming...' : selectedTime ? `Confirm for ${new Date(`1970-01-01T${selectedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Select a time'}
              </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
