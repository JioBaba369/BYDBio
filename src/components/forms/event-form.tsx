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
  description: z.string().min(10, "A description of at least 10 characters is required.").max(2000, "Description must be less than 2000 characters."),
  location: z.string().min(2, "Location is required."),
  date: z.date({
    required_error: "A date is required.",
  }),
  imageUrl: z.string().optional().nullable(),
  itinerary: z.array(z.object({
    time: z.string().min(1, "Time is required. (e.g., 09:00 AM)"),
    title: z.string().min(2, "Title is required."),
    description: z.string().min(2, "Description is required."),
    speaker: z.string().optional(),
  })).optional(),
})

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
      ...defaultValues,
      date: defaultValues?.date ? new Date(defaultValues.date) : undefined,
      itinerary: defaultValues?.itinerary || [],
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
            <div className="grid md:grid-cols-3 gap-8">
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
                           <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Event Date & Time</FormLabel>
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
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Itinerary</CardTitle>
                            <CardDescription>Add a schedule for your event.</CardDescription>
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
                                                    <FormLabel>Time</FormLabel>
                                                    <FormControl><Input placeholder="09:00 AM" {...field} /></FormControl>
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
            <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
      </Form>
    </>
  )
}
