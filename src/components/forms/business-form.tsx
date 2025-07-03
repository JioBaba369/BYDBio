
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import ImageCropper from "../image-cropper"

const businessFormSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters.").max(100, "Name must not be longer than 100 characters."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must not be longer than 500 characters."),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  address: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>

interface BusinessFormProps {
  defaultValues?: Partial<BusinessFormValues>
  onSubmit: (values: BusinessFormValues) => void;
  isSaving: boolean;
}

export function BusinessForm({ defaultValues, onSubmit, isSaving }: BusinessFormProps) {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues,
    mode: "onChange",
  })
  
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
        aspectRatio={2/1}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Acme Inc." {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Tell us about your business..."
                                        className="resize-none"
                                        rows={5}
                                        {...field}
                                        />
                                    </FormControl>
                                     <FormDescription>
                                        Provide a short, compelling overview of your business.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="e.g. contact@acme.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Website (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://acme.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Address / Location (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, Anytown, USA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Header Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-[2/1] w-full rounded-md border border-dashed flex items-center justify-center">
                                {watchedImageUrl ? (
                                    <Image src={watchedImageUrl} alt="Business image" width={400} height={200} className="object-cover rounded-md w-full h-full" />
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
