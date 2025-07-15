
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { updateUser, type User as AppUser, type BookingSettings } from '@/lib/users';
import { profileSchema, type ProfileFormValues } from '@/lib/schemas/profile';
import { ProfilePageSkeleton } from '@/components/profile-skeleton';

import { Button } from '@/components/ui/button';
import { Save, Loader2, User, Link as LinkIcon, Hash, Edit, Upload, Sparkles, X, GripVertical, Trash2, PlusCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { ProfilePreview } from '@/components/profile/profile-preview';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImageCropper from '@/components/image-cropper';
import { AIBioGenerator } from '@/components/ai/bio-generator';
import { suggestHashtags, type HashtagSuggestInput } from '@/ai/flows/hashtag-suggester-flow';
import { Badge } from '@/components/ui/badge';
import { AIAvatarGenerator } from '@/components/ai/avatar-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableIconNames, linkIconData } from '@/lib/link-icons';
import { cn } from '@/lib/utils';

// --- Links DnD Subcomponent ---
const SortableLinkItem = ({ index, remove }: { index: number, remove: (index: number) => void }) => {
  const { control, setValue, getValues } = useFormContext<ProfileFormValues>();
  const fieldId = getValues(`links.${index}.id`) || `link-${index}`;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: fieldId });
  const style = { transform: CSS.Transform.toString(transform), transition };

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
                    <SelectTrigger className={cn(!field.value && "text-muted-foreground")}><SelectValue placeholder="Select icon" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIconNames.map((iconName) => {
                      const data = linkIconData[iconName];
                      const LoopIcon = data.icon;
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2"><LoopIcon className="h-4 w-4" /><span>{data.title}</span></div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={control} name={`links.${index}.title`} render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel>Link Title</FormLabel> <FormControl><Input {...field} placeholder="My Awesome Portfolio" /></FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        <FormField control={control} name={`links.${index}.url`} render={({ field }) => ( <FormItem> <FormLabel>URL</FormLabel> <FormControl><Input {...field} placeholder="https://example.com" /></FormControl> <FormMessage /> </FormItem> )}/>
      </div>
      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </Card>
  );
};


// --- Constants ---
const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  acceptingAppointments: false,
  availability: {
    sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  },
};

// --- Main Component ---
export default function ProfilePage() {
  const { user, firebaseUser, loading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isBioGeneratorOpen, setIsBioGeneratorOpen] = useState(false);
  const [isAvatarGeneratorOpen, setIsAvatarGeneratorOpen] = useState(false);

  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      avatarUrl: '',
      hashtags: [],
      businessCard: {},
      links: [],
      bookingSettings: DEFAULT_BOOKING_SETTINGS,
    },
  });
  
  const { control, formState: { isDirty }, reset, setError, getValues, setValue } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'links',
  });
  
  const watchedAvatar = form.watch('avatarUrl');
  const watchedHashtags = form.watch('hashtags', []);

  // Initialize form with user data once available
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        hashtags: user.hashtags || [],
        businessCard: user.businessCard || {},
        links: (user.links || []).map((link, i) => ({ ...link, id: `link-${i}` })),
        bookingSettings: user.bookingSettings || DEFAULT_BOOKING_SETTINGS,
      });
    }
  }, [user, reset]);

  const handleSaveAll = useCallback(async (data: ProfileFormValues) => {
    if (!firebaseUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const dataToUpdate: Partial<AppUser> = {
        name: data.name,
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        hashtags: data.hashtags,
        businessCard: data.businessCard,
        links: data.links.map(({ id, ...rest }) => rest),
        bookingSettings: data.bookingSettings,
      };

      const updatedUser = await updateUser(firebaseUser.uid, dataToUpdate);

      if (updatedUser) {
        reset({
          name: updatedUser.name || '',
          username: updatedUser.username || '',
          bio: updatedUser.bio || '',
          avatarUrl: updatedUser.avatarUrl || '',
          hashtags: updatedUser.hashtags || [],
          businessCard: updatedUser.businessCard || {},
          links: (updatedUser.links || []).map((link, i) => ({ ...link, id: `link-${i}` })),
          bookingSettings: updatedUser.bookingSettings || DEFAULT_BOOKING_SETTINGS,
        });
        toast({ title: "Profile Saved", description: "Your information has been successfully updated." });
      }
    } catch (error: any) {
      if (error.message.includes("Username is already taken")) {
        setError("username", { type: "manual", message: "This username is already taken. Please choose another." });
        toast({ title: "Update Failed", description: "This username is already taken.", variant: 'destructive' });
      } else {
        toast({ title: "Error saving profile", description: "An unexpected error occurred. Please try again.", variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  }, [firebaseUser, reset, setError, toast]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageToCrop(reader.result as string); setIsCropperOpen(true); });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };
  
  const handleAvatarSelect = (newAvatarUrl: string) => {
    setValue('avatarUrl', newAvatarUrl, { shouldDirty: true });
    toast({ title: "Avatar Updated!", description: "Your new profile picture has been set. Remember to save your changes." });
  };
  
  const handleCropComplete = async (url: string) => {
    handleAvatarSelect(url);
    setIsCropperOpen(false);
  };
  
  const handleGenerateHashtags = async () => {
    setIsGeneratingHashtags(true);
    const { name, bio, businessCard } = getValues();
    const input: HashtagSuggestInput = {
      name,
      bio: bio || '',
      title: businessCard?.title,
      company: businessCard?.company,
    };
    try {
        const result = await suggestHashtags(input);
        setSuggestedHashtags(result.hashtags.filter(h => !watchedHashtags.includes(h)));
    } catch(e) {
        toast({ title: "Error generating hashtags", variant: "destructive" });
    } finally {
        setIsGeneratingHashtags(false);
    }
  };
  
  const addHashtag = (tag: string) => {
    if (watchedHashtags.length >= 10) {
      toast({ title: "Hashtag limit reached", description: "You can add up to 10 hashtags.", variant: "destructive" });
      return;
    }
    // `useFieldArray`'s `append` expects an object, not a string
    form.setValue('hashtags', [...watchedHashtags, tag]);
    setSuggestedHashtags(current => current.filter(t => t !== tag));
  };
  
  const removeHashtag = (index: number) => {
    const newHashtags = [...watchedHashtags];
    newHashtags.splice(index, 1);
    form.setValue('hashtags', newHashtags, { shouldDirty: true });
  };

  function handleLinkDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => (field.id || `link-${fields.indexOf(field)}`) === active.id);
      const newIndex = fields.findIndex((field) => (field.id || `link-${fields.indexOf(field)}`) === over!.id);
      move(oldIndex, newIndex);
    }
  }

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <FormProvider {...form}>
      <ImageCropper 
        imageSrc={imageToCrop} 
        open={isCropperOpen} 
        onOpenChange={setIsCropperOpen} 
        onCropComplete={handleCropComplete} 
        isRound={true} 
        aspectRatio={1}
        maxSize={{ width: 800, height: 800 }}
      />
      <AIBioGenerator open={isBioGeneratorOpen} onOpenChange={setIsBioGeneratorOpen} onSelectBio={(bio) => { setValue('bio', bio, { shouldDirty: true }); }} />
      <AIAvatarGenerator open={isAvatarGeneratorOpen} onOpenChange={setIsAvatarGeneratorOpen} onSelectAvatar={handleAvatarSelect} />

      <form onSubmit={form.handleSubmit(handleSaveAll)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-headline">Profile Editor</h1>
              <p className="text-muted-foreground">Manage your public presence and connections.</p>
            </div>
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="md:col-span-2">
              <Accordion type="multiple" defaultValue={['public', 'card']} className="w-full">
                
                <AccordionItem value="public">
                  <AccordionTrigger className="text-lg font-medium"><User className="mr-2 h-5 w-5"/>Public Profile</AccordionTrigger>
                  <AccordionContent className="pt-6 space-y-6">
                    <FormField control={control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="username" render={({ field }) => ( <FormItem> <FormLabel>Username</FormLabel> <FormControl><Input placeholder="janedoe" {...field} /></FormControl> <FormDescription>This will be used in your public profile URL.</FormDescription> <FormMessage /> </FormItem> )}/>
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={watchedAvatar || user?.avatarUrl} />
                          <AvatarFallback>{user?.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload Photo
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsAvatarGeneratorOpen(true)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Enhance with AI
                          </Button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={onFileChange} />
                      </div>
                    </div>
                    <FormField control={control} name="bio" render={({ field }) => ( <FormItem> <div className="flex items-center justify-between"> <FormLabel>Bio</FormLabel> <Button type="button" variant="outline" size="sm" onClick={() => setIsBioGeneratorOpen(true)}> <Sparkles className="mr-2 h-4 w-4"/> Generate with AI </Button> </div> <FormControl><Textarea rows={3} {...field} placeholder="Tell everyone a little bit about yourself..." /></FormControl> <FormMessage /> </FormItem> )}/>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="card">
                  <AccordionTrigger className="text-lg font-medium"><Edit className="mr-2 h-5 w-5"/>Digital Card Details</AccordionTrigger>
                  <AccordionContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField control={control} name="businessCard.title" render={({ field }) => ( <FormItem> <FormLabel>Job Title</FormLabel> <FormControl><Input placeholder="Senior Product Designer" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.company" render={({ field }) => ( <FormItem> <FormLabel>Company</FormLabel> <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.phone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input type="email" placeholder="jane.doe@acme.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.website" render={({ field }) => ( <FormItem> <FormLabel>Website</FormLabel> <FormControl><Input placeholder="https://janedoe.design" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="businessCard.linkedin" render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel>LinkedIn Profile URL</FormLabel> <FormControl><Input placeholder="https://linkedin.com/in/janedoe" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="hashtags">
                  <AccordionTrigger className="text-lg font-medium"><Hash className="mr-2 h-5 w-5"/>Hashtags</AccordionTrigger>
                  <AccordionContent className="pt-6 space-y-4">
                    <p className="text-sm text-muted-foreground">Add tags to improve your profile's discoverability in search.</p>
                     <div className="flex items-center justify-between">
                        <p className="font-medium">Your Hashtags</p>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateHashtags} disabled={isGeneratingHashtags}>
                          {isGeneratingHashtags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          Suggest with AI
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[2.25rem] items-center">
                          {watchedHashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1.5 pr-1">
                              {tag}
                              <button type="button" onClick={() => removeHashtag(index)} className="rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {watchedHashtags.length === 0 && <p className="text-sm text-muted-foreground px-2">No hashtags added yet.</p>}
                        </div>
                        {suggestedHashtags.length > 0 && (
                          <div className="space-y-2 pt-4 border-t">
                              <p className="text-sm font-medium">Click to add suggested tags:</p>
                              <div className="flex flex-wrap gap-2">
                                  {suggestedHashtags.map(tag => (
                                      <Badge key={tag} onClick={() => addHashtag(tag)} className="cursor-pointer hover:bg-primary hover:text-primary-foreground">{tag}</Badge>
                                  ))}
                              </div>
                          </div>
                        )}
                      </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="links">
                  <AccordionTrigger className="text-lg font-medium"><LinkIcon className="mr-2 h-5 w-5"/>Link-in-Bio</AccordionTrigger>
                  <AccordionContent className="pt-6 space-y-4">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLinkDragEnd}>
                        <SortableContext items={fields.map((f, i) => f.id || `link-${i}`)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <SortableLinkItem key={field.id || `link-${index}`} index={index} remove={remove} />
                            ))}
                            {fields.length === 0 && <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">You haven't added any links yet.</div>}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <Button type="button" variant="outline" className="w-full" onClick={() => append({ id: `link-${fields.length}`, icon: 'Link', title: '', url: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                      </Button>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
            
            <div className="md:col-span-1">
              <ProfilePreview />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
