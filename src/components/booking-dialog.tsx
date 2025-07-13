
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { User } from '@/lib/users';
import { getAvailableSlots } from '@/lib/appointments';

interface BookingDialogProps {
  user: User;
}

export function BookingDialog({ user }: BookingDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !user.bookingSettings?.acceptingAppointments) {
      setTimeSlots([]);
      return;
    }

    setIsLoading(true);
    getAvailableSlots(user.uid, date)
      .then(slots => {
        setTimeSlots(slots);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

  }, [date, user.uid, user.bookingSettings]);

  const handleBooking = () => {
    // This is where you would call a server action to create the appointment
    alert(`Appointment booked with ${user.name} on ${date?.toLocaleDateString()} at ${selectedTime}`);
  };

  if (!user.bookingSettings?.acceptingAppointments) {
    return null;
  }
  
  const availableDays = Object.keys(user.bookingSettings.availability).filter(
      day => user.bookingSettings?.availability[day as keyof typeof user.bookingSettings.availability]?.enabled
  ).map(day => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
            <CalendarIcon className="mr-2 h-4 w-4" /> Book a Meeting
        </Button>
      </DialogTrigger>
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
                disabled={(d) => d < new Date() || !availableDays.includes(d.getDay())}
                className="rounded-md border mt-4"
            />
          </div>
          <div className="p-2 space-y-4">
              <h4 className="font-semibold text-center">{date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}</h4>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : timeSlots.length > 0 ? (
                    timeSlots.map(slot => (
                        <Button 
                            key={slot} 
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(slot)}
                        >
                            {slot}
                        </Button>
                    ))
                ) : (
                    <p className="col-span-3 text-center text-sm text-muted-foreground p-8">No available slots on this day.</p>
                )}
              </div>
              <Button onClick={handleBooking} disabled={!selectedTime} className="w-full">
                Confirm for {selectedTime}
              </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
