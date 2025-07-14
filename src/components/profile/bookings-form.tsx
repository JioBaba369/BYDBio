
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField, FormControl, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BookingSettings } from '@/lib/users';
import { ProfileFormValues } from '@/lib/schemas/profile';

const daysOfWeek: (keyof BookingSettings['availability'])[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

export function BookingsForm() {
  const { control, watch } = useFormContext<ProfileFormValues>();
  const isAcceptingAppointments = watch("bookingSettings.acceptingAppointments");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Bookings</CardTitle>
        <CardDescription>Allow others to book meetings with you directly from your profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={control}
          name="bookingSettings.acceptingAppointments"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Accept Appointments</FormLabel>
                <FormDescription>Enable this to let people book time on your calendar.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        <div className={cn("space-y-6", !isAcceptingAppointments && "opacity-50 pointer-events-none")}>
          <Separator />
          <h3 className="text-lg font-medium">Weekly Availability</h3>
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <FormField
                key={day}
                control={control}
                name={`bookingSettings.availability.${day}.enabled`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <label className="flex-1 text-sm font-medium capitalize cursor-pointer" htmlFor={field.name}>{day}</label>
                    <div className={cn("flex items-center gap-2", !field.value && "opacity-50 pointer-events-none")}>
                      <FormField control={control} name={`bookingSettings.availability.${day}.startTime`} render={({ field }) => (<FormControl><Input type="time" className="w-28" {...field} /></FormControl>)} />
                      <span>-</span>
                      <FormField control={control} name={`bookingSettings.availability.${day}.endTime`} render={({ field }) => (<FormControl><Input type="time" className="w-28" {...field} /></FormControl>)} />
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
