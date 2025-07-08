
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
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import ImageCropper from "../image-cropper"

const promoPageFormSchema = z.object({
  name: z.string().min(2, "Page name must be at least 2 characters.").max(100, "Name must not be longer than 100 characters."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must not be longer than 500 characters."),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  address: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
})

export type PromoPageFormValues = z.infer<typeof promoPageFormSchema>

interface PromoPageFormProps {
  defaultValues?: Partial<PromoPageFormValues>
  onSubmit: (values: PromoPageFormValues) => void;
  isSaving: boolean;
}

export function PromoPageForm({ defaultValues, onSubmit, isSaving }: PromoPageFormProps) {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [logoToCrop, setLogoToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isLogoCropperOpen, setIsLogoCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<PromoPageFormValues>({
    resolver: zodResolver(promoPageFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subCategory: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      imageUrl: null,
      logoUrl: null,
      ...defaultValues,
    },
    mode: "onChange",
  })
  
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form.reset]);
  
  const watchedImageUrl = form.watch("imageUrl");
  const watchedLogoUrl = form.watch("logoUrl");

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
  
  const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setLogoToCrop(reader.result as string);
        setIsLogoCropperOpen(true);
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

  const handleLogoCropComplete = (url: string) => {
    form.setValue('logoUrl', url, { shouldDirty: true });
    setIsLogoCropperOpen(false);
    toast({
      title: "Logo updated",
      description: "The new logo has been set.",
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
      <ImageCropper
        imageSrc={logoToCrop}
        open={isLogoCropperOpen}
        onOpenChange={setIsLogoCropperOpen}
        onCropComplete={handleLogoCropComplete}
        aspectRatio={1}
        isRound={true}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Promo Page Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Promo Page Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. My Awesome Project" {...field} />
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
                                        placeholder="Tell us about your promo page..."
                                        className="resize-none"
                                        rows={5}
                                        {...field}
                                        />
                                    </FormControl>
                                     <FormDescription>
                                        Provide a short, compelling overview.
                                    </FormDescription>
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
                                            <Input placeholder="e.g. SaaS" {...field} />
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
                                            <Input placeholder="e.g. Developer Tools" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                                        <Input type="email" placeholder="e.g. contact@example.com" {...field} />
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
                                        <Input placeholder="https://example.com" {...field} />
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
                                    <Image src={watchedImageUrl} alt="Promo Page image" width={400} height={200} className="object-cover rounded-md w-full h-full" />
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
                    <Card>
                         <CardHeader>
                            <CardTitle>Logo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-square w-full flex items-center justify-center">
                                {watchedLogoUrl ? (
                                    <Image src={watchedLogoUrl} alt="Promo Page logo" width={160} height={160} className="object-contain rounded-full w-40 h-40" />
                                ) : (
                                    <p className="text-sm text-muted-foreground">No logo</p>
                                )}
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={() => logoFileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> Change Logo
                            </Button>
                            <input
                                type="file"
                                ref={logoFileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={onLogoFileChange}
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
