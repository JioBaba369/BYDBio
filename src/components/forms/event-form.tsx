
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon, Upload, PlusCircle, Trash2 } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Image from "next/image"
import ImageCropper from "../image-cropper"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"

const eventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title must not be longer than 100 characters."),
  subTitle: z.string().max(150, "Subtitle must not be longer than 150 characters.").optional(),
  description: z.string().min(10, "A description of at least 10 characters is required.").max(2000, "Description must be less than 2000 characters."),
  location: z.string().min(2, "Location is required."),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid 24-hour time (HH:MM).").optional(),
  endDate: z.date().optional().nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid 24-hour time (HH:MM).").optional(),
  imageUrl: z.string().optional().nullable(),
  couponCode: z.string().optional(),
  ctaLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  itinerary: z.array(z.object({
    time: z.string().min(1, "Time is required. (e.g., 09:00 AM)"),
    title: z.string().min(2, "Title is required."),
    description: z.string().min(2, "Description is required."),
    speaker: z.string().optional(),
  })).optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        const combineDateAndTime = (date: Date, timeString?: string): Date => {
            const newDate = new Date(date);
            if (timeString) {
                const [hours, minutes] = timeString.split(':').map(Number);
                newDate.setHours(hours, minutes, 0, 0);
            }
            return newDate;
        };
        const startDateTime = combineDateAndTime(data.startDate, data.startTime);
        const endDateTime = combineDateAndTime(data.endDate, data.endTime);
        return endDateTime >= startDateTime;
    }
    return true;
}, {
    message: "End date/time must be on or after the start date/time.",
    path: ["endDate"],
});


export type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>
  onSubmit: (values: EventFormValues) => void;
  isSaving: boolean;
}

export function EventForm({ defaultValues, onSubmit, isSaving }: EventFormProps) {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      subTitle: "",
      description: "",
      location: "",
      category: "",
      subCategory: "",
      startDate: undefined,
      startTime: "09:00",
      endDate: null,
      endTime: "17:00",
      imageUrl: null,
      couponCode: "",
      ctaLink: "",
      itinerary: [],
      ...defaultValues,
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      startTime: defaultValues?.startDate ? format(new Date(defaultValues.startDate), 'HH:mm') : '09:00',
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : null,
      endTime: defaultValues?.endDate ? format(new Date(defaultValues.endDate), 'HH:mm') : '17:00',
    },
    mode: "onChange",
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });
  
  const watchedImageUrl = form.watch("imageUrl");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };
  
  const handleCropComplete = (url: string) => {
    form.setValue('imageUrl', url, { shouldDirty: true });
    setIsCropperOpen(false);
    toast({
      title: "Image updated",
      description: "The new image has been set.",
    });
  }

  return (
    <>
      <ImageCropper
        imageSrc={imageToCrop}
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        onCropComplete={handleCropComplete}
        aspectRatio={16/9}
        isRound={false}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Event Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Design Thinking Workshop" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="subTitle"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Subtitle (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. A Deep Dive into Modern UI/UX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Event Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell everyone about your event..." {...field} rows={6} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Online or San Francisco, CA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Category (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Technology" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Sub-Category (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. AI/ML" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                            date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>End Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < (form.getValues("startDate") || new Date("1900-01-01"))
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="ctaLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Call to Action Link (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/register" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Link to an external registration or information page.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="couponCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. SAVE20" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A coupon code for attendees.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Schedule / Itinerary</CardTitle>
                            <CardDescription>Add a schedule, tour dates, or movie showtimes for your event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/30">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`itinerary.${index}.time`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Time / Date</FormLabel>
                                                    <FormControl><Input placeholder="e.g., 09:00 AM or July 14" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`itinerary.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl><Input placeholder="Opening Keynote" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`itinerary.${index}.speaker`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Speaker (Optional)</FormLabel>
                                                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`itinerary.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl><Textarea placeholder="A brief description of this session..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ time: '', title: '', description: '', speaker: '' })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Itinerary Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center">
                                {watchedImageUrl ? (
                                    <Image src={watchedImageUrl} alt="Event image" width={300} height={169} className="object-cover rounded-md" />
                                ) : (
                                    <p className="text-sm text-muted-foreground">No image</p>
                                )}
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> Change Image
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={onFileChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
      </Form>
    </>
  )
}
