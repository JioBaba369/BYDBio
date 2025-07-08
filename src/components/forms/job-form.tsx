
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { CalendarIcon, Upload, Image as ImageIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import ImageCropper from "../image-cropper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "../ui/calendar"
import { Textarea } from "../ui/textarea"

const jobFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters.").max(100, "Title must not be longer than 100 characters."),
  company: z.string().min(2, "Company name is required."),
  description: z.string().min(10, "A detailed description is required.").max(5000, "Description is too long."),
  location: z.string().min(2, "Location is required."),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  remuneration: z.string().optional(),
  closingDate: z.date().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  startDate: z.date().optional().nullable(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid 24-hour time (HH:MM).").optional(),
  endDate: z.date().optional().nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid 24-hour time (HH:MM).").optional(),
  applicationUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  contactInfo: z.string().max(1000, "Contact info must be less than 1000 characters.").optional(),
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

export type JobFormValues = z.infer<typeof jobFormSchema>

interface JobFormProps {
  defaultValues?: Partial<JobFormValues>
  onSubmit: (values: JobFormValues) => void;
  isSaving: boolean;
}

export function JobForm({ defaultValues, onSubmit, isSaving }: JobFormProps) {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      description: "",
      location: "",
      type: "Full-time",
      category: "",
      subCategory: "",
      remuneration: "",
      applicationUrl: "",
      contactInfo: "",
      imageUrl: null,
      closingDate: null,
      startDate: null,
      startTime: "09:00",
      endDate: null,
      endTime: "17:00",
      ...defaultValues,
    },
    mode: "onChange",
  })
  
  useEffect(() => {
    if (defaultValues) {
      const valuesToSet = {
        ...defaultValues,
        startDate: defaultValues.startDate ? new Date(defaultValues.startDate) : null,
        startTime: defaultValues.startDate ? format(new Date(defaultValues.startDate), 'HH:mm') : '09:00',
        endDate: defaultValues.endDate ? new Date(defaultValues.endDate) : null,
        endTime: defaultValues.endDate ? format(new Date(defaultValues.endDate), 'HH:mm') : '17:00',
        closingDate: defaultValues.closingDate ? new Date(defaultValues.closingDate) : null,
      };
      form.reset(valuesToSet as JobFormValues);
    }
  }, [defaultValues, form.reset]);
  
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
                        <CardContent className="p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Product Manager" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Acme Corporation" {...field} />
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
                                    <FormLabel>Job Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Provide a detailed description of the role, responsibilities, and required qualifications. Include details about the organization, team, and any benefits."
                                        className="resize-none"
                                        rows={8}
                                        {...field}
                                        />
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
                                        <Input placeholder="e.g. San Francisco, CA or Remote" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Job Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a job type" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="remuneration"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Remuneration (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. $120,000 per year" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Category (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Engineering" {...field} />
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
                                            <Input placeholder="e.g. Frontend" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="closingDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Closing Date (Optional)</FormLabel>
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
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Start Date (Optional)</FormLabel>
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
                                name="applicationUrl"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Application URL (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://company.com/apply/job123" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        A direct link to the application page.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactInfo"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact / How to Apply (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="e.g. To apply, please send your resume and a cover letter to contact@company.com with the subject line 'Job Title Application'."
                                        className="resize-none"
                                        rows={4}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this for manual application instructions if an application URL is not available.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-lg font-medium">Header Image</h3>
                            <div className="space-y-2">
                                <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center bg-muted/40">
                                    {watchedImageUrl ? (
                                        <Image src={watchedImageUrl} alt="Job image" width={300} height={169} className="object-cover rounded-md" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm">No image set</p>
                                        </div>
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
                            </div>
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
