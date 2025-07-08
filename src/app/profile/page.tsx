
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Trash2, User, Link2 as LinkIcon, Upload, GripVertical, Save, Building, Linkedin, Phone, Mail, Globe, ExternalLink, Loader2, Nfc } from "lucide-react"
import { useEffect, useState, useRef, useMemo } from "react";
import QRCode from 'qrcode.react';
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { availableIconNames, linkIconData, linkIcons } from "@/lib/link-icons";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageCropper from "@/components/image-cropper";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUser, type User as AppUser } from "@/lib/users";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/storage";
import Link from "next/link";
import { Separator } from "../ui/separator"

const publicProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(50, "Name cannot be longer than 50 characters."),
  username: z.string().min(3, "Username must be at least 3 characters long.").max(30, "Username cannot be longer than 30 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
});
type PublicProfileFormValues = z.infer<typeof publicProfileSchema>;

const businessCardSchema = z.object({
  title: z.string().max(50, "Title cannot be longer than 50 characters.").optional(),
  company: z.string().max(50, "Company cannot be longer than 50 characters.").optional(),
  phone: z.string().max(30, "Phone number cannot be longer than 30 characters.").optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  location: z.string().max(100, "Location cannot be longer than 100 characters.").optional(),
});
type BusinessCardFormValues = z.infer<typeof businessCardSchema>;

const linksFormSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(), // dnd-kit needs an id
      icon: z.enum(availableIconNames, {
        errorMap: () => ({ message: "Please select an icon." }),
      }),
      title: z.string().min(1, "Title cannot be empty.").max(50, "Title must be 50 characters or less."),
      url: z.string().url("Please enter a valid URL."),
    })
  ),
});
type LinksFormValues = z.infer<typeof linksFormSchema>;

const escapeVCard = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
};

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
    <Card ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 p-4 touch-none bg-muted/30">
        <div {...listeners} className="cursor-grab p-2 pt-3">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                    control={control}
                    name={`links.${index}.icon`}
                    render={({ field }) => (
                        <FormItem className="sm:col-span-1">
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
                        <FormItem className="sm:col-span-2">
                        <FormLabel>Link Title</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="My Awesome Portfolio" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
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
            className="shrink-0"
            onClick={() => remove(index)}
        >
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
    </Card>
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
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const publicProfileForm = useForm<PublicProfileFormValues>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues: {
      name: "",
      username: "",
      bio: "",
    },
    mode: 'onChange',
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
    mode: 'onChange',
  });

  const linksForm = useForm<LinksFormValues>({
    resolver: zodResolver(linksFormSchema),
    defaultValues: { links: [] },
    mode: 'onChange',
  });
  
  const { fields, append, remove, move } = useFieldArray({
    control: linksForm.control,
    name: "links",
  });
  
  const watchedLinks = linksForm.watch("links");

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
        links: user.links.map((link, index) => ({...link, id: `link-${index}`})),
      });
      setCroppedImageUrl(user.avatarUrl || null);
    }
  }, [user, publicProfileForm, businessCardForm, linksForm]);

  const watchedPublicProfile = publicProfileForm.watch();
  const watchedBusinessCard = businessCardForm.watch();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSaveProfileAndCard = async () => {
    const isPublicProfileValid = await publicProfileForm.trigger();
    const isBusinessCardValid = await businessCardForm.trigger();

    if (!isPublicProfileValid || !isBusinessCardValid) {
        toast({ title: "Validation Error", description: "Please correct the errors before saving.", variant: "destructive" });
        return;
    }

    if (!firebaseUser) return;
    setIsSavingProfile(true);

    try {
        const publicData = publicProfileForm.getValues();
        const cardData = businessCardForm.getValues();
        
        let dataToUpdate: Partial<AppUser> = {
            name: publicData.name,
            bio: publicData.bio,
            businessCard: cardData,
        };

        // Only include username if it has changed, to avoid unnecessary uniqueness checks
        if (publicData.username !== user?.username) {
            dataToUpdate.username = publicData.username;
        }

        await updateUser(firebaseUser.uid, dataToUpdate);

        // Reset dirty state after successful save
        publicProfileForm.reset({ ...publicData });
        businessCardForm.reset({ ...cardData });

        toast({
            title: "Profile Saved",
            description: "Your information has been successfully updated.",
        });

    } catch(error: any) {
       if (error.message.includes("Username is already taken")) {
           publicProfileForm.setError("username", { type: "manual", message: "This username is already taken. Please choose another." });
           toast({ title: "Update Failed", description: "This username is already taken.", variant: 'destructive'});
       } else {
           toast({ title: "Error saving profile", description: "An unexpected error occurred.", variant: 'destructive'});
       }
    } finally {
        setIsSavingProfile(false);
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
      linksForm.reset(data); // Reset form to new values to clear dirty state
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
    
    setIsUploadingAvatar(true);
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
      toast({
        title: "Error Uploading Avatar",
        description: "There was a problem uploading your picture. Please try again.",
        variant: 'destructive'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
    
    setIsCropperOpen(false);
  }
  
  const vCardData = useMemo(() => {
    if (!user) return '';
    return `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCard(watchedPublicProfile.name || user.name)}
ORG:${escapeVCard(watchedBusinessCard.company)}
TITLE:${escapeVCard(watchedBusinessCard.title)}
TEL;TYPE=WORK,VOICE:${watchedBusinessCard.phone || ''}
EMAIL:${watchedBusinessCard.email || ''}
URL:${watchedBusinessCard.website || ''}
X-SOCIALPROFILE;type=linkedin:${watchedBusinessCard.linkedin || ''}
ADR;TYPE=WORK:;;${escapeVCard(watchedBusinessCard.location)}
END:VCARD`;
  }, [
    user,
    watchedPublicProfile.name,
    watchedBusinessCard.company,
    watchedBusinessCard.title,
    watchedBusinessCard.phone,
    watchedBusinessCard.email,
    watchedBusinessCard.website,
    watchedBusinessCard.linkedin,
    watchedBusinessCard.location,
  ]);

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }
  
  const isProfileDirty = publicProfileForm.formState.isDirty || businessCardForm.formState.isDirty;

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
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile & Card</TabsTrigger>
          <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4"/>Links</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                        <CardTitle>Public Profile & Digital Card</CardTitle>
                        <CardDescription>This information appears on your public pages. Changes are shown in the live preview on the right.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <Form {...publicProfileForm}>
                                <form className="space-y-6">
                                    <h3 className="text-lg font-medium">Public Information</h3>
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
                                            <AvatarImage src={croppedImageUrl || user.avatarUrl} />
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
                                </form>
                            </Form>

                            <Separator />
                            
                            <Form {...businessCardForm}>
                                <form className="space-y-6">
                                    <h3 className="text-lg font-medium">Digital Card Details</h3>
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
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl>
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
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter>
                            <Button type="button" onClick={handleSaveProfileAndCard} disabled={!isProfileDirty || isSavingProfile || isUploadingAvatar}>
                                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSavingProfile ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <div className="md:sticky top-20 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Live Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full max-w-[280px] bg-muted/30 p-6 rounded-xl shadow-lg border mx-auto">
                                    <div className="text-center">
                                    <Avatar className="h-20 w-20 mx-auto mb-2">
                                        <AvatarImage src={croppedImageUrl || user.avatarUrl} />
                                        <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-headline font-semibold text-lg">{watchedPublicProfile.name || 'Your Name'}</p>
                                    <p className="text-primary text-sm">{watchedBusinessCard.title || 'Your Title'}</p>
                                    <p className="text-muted-foreground text-xs flex items-center justify-center gap-1.5 mt-1"><Building className="h-3.5 w-3.5"/>{watchedBusinessCard.company || 'Your Company'}</p>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                    {vCardData ? (
                                        <QRCode value={vCardData} size={150} bgColor="transparent" fgColor="hsl(var(--foreground))" level="Q" />
                                    ) : (
                                        <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse mx-auto rounded-md" />
                                    )}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center mt-2">Scan to save contact</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="max-w-[280px] mx-auto text-center border-primary/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base flex items-center justify-center gap-2">
                                    <Nfc className="h-5 w-5 text-primary"/>
                                    Get Your BYD BioTAG
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">Bridge the physical and digital worlds. Share with a single tap.</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href="/bydtag">Learn More</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="links">
          <FormProvider {...linksForm}>
            <form onSubmit={linksForm.handleSubmit(onLinksSubmit)}>
              <div className="grid md:grid-cols-3 gap-8 mt-4">
                <div className="md:col-span-2">
                  <Card>
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
                             {fields.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                    You haven't added any links yet.
                                </div>
                             )}
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
                        {linksForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {linksForm.formState.isSubmitting ? "Saving..." : "Save Links"}
                       </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="md:col-span-1">
                  <div className="md:sticky top-20">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full max-w-[300px] bg-background p-4 rounded-2xl shadow-lg border mx-auto">
                                <div className="bg-muted/40 p-4 rounded-lg h-[500px] overflow-y-auto">
                                    <div className="flex flex-col items-center text-center">
                                        <Avatar className="h-20 w-20 mb-3 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                                            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                                        </Avatar>
                                        <h1 className="font-headline text-xl font-bold">{user.name}</h1>
                                        <p className="text-muted-foreground text-sm">@{user.username}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 mt-6">
                                        {watchedLinks && watchedLinks.length > 0 ? (
                                            watchedLinks.map((link, index) => {
                                                const Icon = linkIcons[link.icon as keyof typeof linkIcons] || LinkIcon;
                                                return (
                                                    <div key={index} className="w-full group">
                                                        <div className="w-full h-14 text-base font-semibold flex items-center p-3 rounded-lg bg-secondary">
                                                            <Icon className="h-5 w-5 text-secondary-foreground/80" />
                                                            <span className="flex-1 text-center text-secondary-foreground">{link.title || "Link Title"}</span>
                                                            <ExternalLink className="h-4 w-4 text-secondary-foreground/50" />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center text-sm text-muted-foreground py-10">
                                                Your links will appear here.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </TabsContent>
      </Tabs>
    </div>
  )
}
