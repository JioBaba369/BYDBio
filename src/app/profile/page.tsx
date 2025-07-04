
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Trash2, User, CreditCard, Link2 as LinkIcon, Upload, GripVertical, Save } from "lucide-react"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useEffect, useState, useRef } from "react";
import QRCode from 'qrcode.react';
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { availableIconNames, linkIconData } from "@/lib/link-icons";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BioGenerator from "@/components/ai/bio-generator";
import ImageCropper from "@/components/image-cropper";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUser } from "@/lib/users";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/storage";

const publicProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty."),
  username: z.string().min(3, "Username must be at least 3 characters long.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
});
type PublicProfileFormValues = z.infer<typeof publicProfileSchema>;

const businessCardSchema = z.object({
  title: z.string().min(1, "Title is required."),
  company: z.string().min(1, "Company is required."),
  phone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  location: z.string().optional(),
});
type BusinessCardFormValues = z.infer<typeof businessCardSchema>;

const linksFormSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(), // dnd-kit needs an id
      icon: z.enum(availableIconNames, {
        errorMap: () => ({ message: "Please select an icon." }),
      }),
      title: z.string().min(1, "Title cannot be empty."),
      url: z.string().url("Please enter a valid URL."),
    })
  ),
});
type LinksFormValues = z.infer<typeof linksFormSchema>;


const SortableLinkItem = ({ field, index, remove }: { field: { id: string }, index: number, remove: (index: number) => void }) => {
  const { control, setValue } = useFormContext<LinksFormValues>();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 p-4 border rounded-lg bg-background/50 touch-none">
      <div {...listeners} className="mt-8 shrink-0 cursor-grab p-2 -ml-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        <FormField
          control={control}
          name={`links.${index}.icon`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const data = linkIconData[value as keyof typeof linkIconData];
                  if (data) {
                    setValue(`links.${index}.title`, data.title, { shouldDirty: true });
                    setValue(`links.${index}.url`, data.urlPrefix, { shouldDirty: true });
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className={cn(!field.value && "text-muted-foreground")}>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIconNames.map((iconName) => {
                    const data = linkIconData[iconName];
                    const LoopIcon = data.icon;
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <LoopIcon className="h-4 w-4" />
                          <span>{data.title}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`links.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Awesome Portfolio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`links.${index}.url`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-8 shrink-0"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

const ProfilePageSkeleton = () => (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
       <Card>
        <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-lg mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-24" />
        </CardFooter>
       </Card>
    </div>
)

export default function ProfilePage() {
  const { user, firebaseUser, loading } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const publicProfileForm = useForm<PublicProfileFormValues>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues: {
      name: "",
      username: "",
      bio: "",
    },
    mode: 'onBlur',
  });

  const businessCardForm = useForm<BusinessCardFormValues>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: {
        title: "",
        company: "",
        phone: "",
        email: "",
        website: "",
        linkedin: "",
        location: "",
    },
    mode: 'onBlur',
  });

  const linksForm = useForm<LinksFormValues>({
    resolver: zodResolver(linksFormSchema),
    defaultValues: { links: [] },
    mode: 'onBlur',
  });
  
  const { fields, append, remove, move } = useFieldArray({
    control: linksForm.control,
    name: "links",
  });
  
  useEffect(() => {
    if (user) {
      publicProfileForm.reset({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
      });
      businessCardForm.reset({
        title: user.businessCard?.title || '',
        company: user.businessCard?.company || '',
        phone: user.businessCard?.phone || '',
        email: user.businessCard?.email || '',
        website: user.businessCard?.website || '',
        linkedin: user.businessCard?.linkedin || '',
        location: user.businessCard?.location || '',
      });
      linksForm.reset({
        links: user.links.map((link, index) => ({...link, id: `link-${index}`})) || [],
      });
      setCroppedImageUrl(user.avatarUrl || null);
    }
  }, [user, publicProfileForm, businessCardForm, linksForm]);

  const watchedPublicProfile = publicProfileForm.watch();
  const watchedBusinessCard = businessCardForm.watch();
  const watchedBio = publicProfileForm.watch('bio');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function onPublicProfileSubmit(data: PublicProfileFormValues) {
    if (!firebaseUser) return;
    try {
      await updateUser(firebaseUser.uid, { name: data.name, username: data.username, handle: data.username, bio: data.bio });
      toast({
        title: "Profile Saved",
        description: "Your public information has been updated.",
      });
    } catch(error) {
       toast({ title: "Error saving profile", variant: 'destructive'});
    }
  }

  async function onBusinessCardSubmit(data: BusinessCardFormValues) {
    if (!firebaseUser) return;
    try {
      await updateUser(firebaseUser.uid, { businessCard: data });
      toast({
        title: "Business Card Saved",
        description: "Your digital card has been updated.",
      });
    } catch(error) {
       toast({ title: "Error saving card", variant: 'destructive'});
    }
  }

  async function onLinksSubmit(data: LinksFormValues) {
     if (!firebaseUser) return;
     try {
       // remove the temporary 'id' field before saving to Firestore
      const linksToSave = data.links.map(({id, ...rest}) => rest);
      await updateUser(firebaseUser.uid, { links: linksToSave });
      toast({
        title: "Links Saved",
        description: "Your link-in-bio page has been updated.",
      });
    } catch(error) {
       toast({ title: "Error saving links", variant: 'destructive'});
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (active.id !== over?.id) {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over!.id);
        move(oldIndex, newIndex);
    }
  }

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
  
  const handleCropComplete = async (url: string) => {
    if (!firebaseUser) return;
    
    toast({ title: "Uploading...", description: "Please wait while we upload your new avatar." });

    try {
      const downloadURL = await uploadImage(url, `avatars/${firebaseUser.uid}`);
      
      await updateUser(firebaseUser.uid, { avatarUrl: downloadURL });
      
      setCroppedImageUrl(downloadURL);
      
      toast({
        title: "Avatar Updated!",
        description: "Your new profile picture has been saved.",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Error Uploading Avatar",
        description: "There was a problem uploading your picture. Please try again.",
        variant: 'destructive'
      });
    }
    
    setIsCropperOpen(false);
  }

  useEffect(() => {
    if (!user) return;
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${watchedPublicProfile.name || user.name}
ORG:${watchedBusinessCard.company || ''}
TITLE:${watchedBusinessCard.title || ''}
TEL;TYPE=WORK,VOICE:${watchedBusinessCard.phone || ''}
EMAIL:${watchedBusinessCard.email || ''}
URL:${watchedBusinessCard.website || ''}
ADR;TYPE=WORK:;;${watchedBusinessCard.location || ''}
END:VCARD`;
    setQrCodeUrl(vCardData);
  }, [watchedBusinessCard, watchedPublicProfile, user]);

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ImageCropper
        imageSrc={imageToCrop}
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        onCropComplete={handleCropComplete}
        isRound={true}
        aspectRatio={1}
      />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Profile Editor</h1>
        <p className="text-muted-foreground">Manage your public presence and connections.</p>
      </div>
      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="public"><User className="mr-2 h-4 w-4" />Public Profile</TabsTrigger>
          <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4" />Digital Card</TabsTrigger>
          <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4"/>Links</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <FormProvider {...publicProfileForm}>
            <form onSubmit={publicProfileForm.handleSubmit(onPublicProfileSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Public Information</CardTitle>
                  <CardDescription>This information will be displayed on your public profile and link-in-bio page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={publicProfileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={publicProfileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="janedoe" {...field} />
                        </FormControl>
                         <FormDescription>
                          This will be used in your public profile URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={croppedImageUrl || user.avatarUrl} data-ai-hint="woman smiling"/>
                        <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/> Change Photo</Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={onFileChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={publicProfileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} placeholder="Tell everyone a little bit about yourself..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <BioGenerator onSelectBio={(bio) => publicProfileForm.setValue('bio', bio, { shouldDirty: true })} />
                    <div className="space-y-2">
                        <HashtagSuggester content={watchedBio} onSelectHashtag={(tag) => {
                          publicProfileForm.setValue('bio', `${watchedBio.trim()} ${tag}`, { shouldDirty: true });
                        }} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={publicProfileForm.formState.isSubmitting || !publicProfileForm.formState.isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        <TabsContent value="card">
           <FormProvider {...businessCardForm}>
              <form onSubmit={businessCardForm.handleSubmit(onBusinessCardSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Digital Business Card</CardTitle>
                    <CardDescription>Enter your details to generate a shareable digital business card and QR code.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <FormField
                          control={businessCardForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl><Input placeholder="Senior Product Designer" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={businessCardForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessCardForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessCardForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl><Input type="email" placeholder="jane.doe@acme.com" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={businessCardForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl><Input placeholder="https://janedoe.design" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={businessCardForm.control}
                          name="linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl><Input placeholder="https://linkedin.com/in/janedoe" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       <FormField
                          control={businessCardForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
                      <p className="font-semibold mb-4 text-center">Card Preview</p>
                      <div className="w-full max-w-[280px] bg-background p-6 rounded-xl shadow-lg border">
                        <div className="text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-2">
                            <AvatarImage src={croppedImageUrl || user.avatarUrl} data-ai-hint="woman smiling"/>
                            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                          </Avatar>
                          <p className="font-headline font-semibold text-lg">{watchedPublicProfile.name || 'Your Name'}</p>
                          <p className="text-primary text-sm">{watchedBusinessCard.title || 'Your Title'}</p>
                        </div>
                        <div className="flex justify-center mt-4">
                          {qrCodeUrl ? (
                            <QRCode value={qrCodeUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="Q" />
                          ) : (
                            <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse mx-auto rounded-md" />
                          )}
                        </div>
                         <p className="text-xs text-muted-foreground text-center mt-2">Scan to save contact</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                     <Button type="submit" disabled={businessCardForm.formState.isSubmitting || !businessCardForm.formState.isDirty}>
                        <Save className="mr-2 h-4 w-4" />
                        Update Card
                     </Button>
                  </CardFooter>
                </Card>
              </form>
            </FormProvider>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <FormProvider {...linksForm}>
              <form onSubmit={linksForm.handleSubmit(onLinksSubmit)}>
                <CardHeader>
                  <CardTitle>Manage Links</CardTitle>
                  <CardDescription>Add, edit, or remove links for your link-in-bio page. Drag to reorder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <SortableLinkItem
                            key={field.id}
                            field={field}
                            index={index}
                            remove={remove}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ icon: 'Link', title: '', url: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                  </Button>
                </CardContent>
                <CardFooter>
                   <Button type="submit" disabled={linksForm.formState.isSubmitting || !linksForm.formState.isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Links
                   </Button>
                </CardFooter>
              </form>
            </FormProvider>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
