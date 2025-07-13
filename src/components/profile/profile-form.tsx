
'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Sparkles, Loader2, X } from 'lucide-react';
import { UnifiedProfileFormValues } from '@/app/profile/page';
import { useState, useRef } from 'react';
import ImageCropper from '../image-cropper';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage';
import { useAuth } from '../auth-provider';
import { AIBioGenerator } from '../ai/bio-generator';
import { suggestHashtags, type HashtagSuggestInput } from '@/ai/flows/hashtag-suggester-flow';
import { Badge } from '../ui/badge';
import { AIAvatarGenerator } from '../ai/avatar-generator';

export function ProfileForm() {
  const form = useFormContext<UnifiedProfileFormValues>();
  const { firebaseUser, user } = useAuth();
  const { toast } = useToast();
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isBioGeneratorOpen, setIsBioGeneratorOpen] = useState(false);
  const [isAvatarGeneratorOpen, setIsAvatarGeneratorOpen] = useState(false);

  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  
  const watchedAvatar = form.watch('avatarUrl');
  const watchedHashtags = form.watch('hashtags', []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hashtags',
  });

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
    form.setValue('avatarUrl', newAvatarUrl, { shouldDirty: true });
    toast({ title: "Avatar Updated!", description: "Your new profile picture has been set. Remember to save your changes." });
  };

  const handleCropComplete = async (url: string) => {
    handleAvatarSelect(url);
    setIsCropperOpen(false);
  };
  
  const handleGenerateHashtags = async () => {
    setIsGeneratingHashtags(true);
    const { name, bio, businessCard } = form.getValues();
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
    append(tag);
    setSuggestedHashtags(current => current.filter(t => t !== tag));
  };


  return (
    <>
      <ImageCropper imageSrc={imageToCrop} open={isCropperOpen} onOpenChange={setIsCropperOpen} onCropComplete={handleCropComplete} isRound={true} aspectRatio={1} />
      <AIBioGenerator open={isBioGeneratorOpen} onOpenChange={setIsBioGeneratorOpen} onSelectBio={(bio) => { form.setValue('bio', bio, { shouldDirty: true }); }} />
      <AIAvatarGenerator open={isAvatarGeneratorOpen} onOpenChange={setIsAvatarGeneratorOpen} onSelectAvatar={handleAvatarSelect} />
      
      <Card>
        <CardHeader>
          <CardTitle>Public Profile & Digital Card</CardTitle>
          <CardDescription>This information appears on your public pages. Changes are shown in the live preview.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Public Information</h3>
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="username" render={({ field }) => ( <FormItem> <FormLabel>Username</FormLabel> <FormControl><Input placeholder="janedoe" {...field} /></FormControl> <FormDescription>This will be used in your public profile URL.</FormDescription> <FormMessage /> </FormItem> )}/>
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={watchedAvatar || user?.avatarUrl} />
                  <AvatarFallback>{user?.avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAvatarGeneratorOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={onFileChange} />
              </div>
            </div>
            <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <div className="flex items-center justify-between"> <FormLabel>Bio</FormLabel> <Button type="button" variant="outline" size="sm" onClick={() => setIsBioGeneratorOpen(true)}> <Sparkles className="mr-2 h-4 w-4"/> Generate with AI </Button> </div> <FormControl><Textarea rows={3} {...field} placeholder="Tell everyone a little bit about yourself..." /></FormControl> <FormMessage /> </FormItem> )}/>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Hashtags</h3>
                <p className="text-sm text-muted-foreground">Add tags to improve your profile's discoverability in search.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateHashtags} disabled={isGeneratingHashtags}>
                {isGeneratingHashtags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest with AI
              </Button>
            </div>
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[2.25rem] items-center">
                {fields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center gap-1.5 pr-1">
                    {field.value}
                    <button type="button" onClick={() => remove(index)} className="rounded-full hover:bg-destructive/20 p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {fields.length === 0 && <p className="text-sm text-muted-foreground px-2">No hashtags added yet.</p>}
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
             <FormField
                control={form.control}
                name="hashtags"
                render={() => ( <FormItem><FormMessage /></FormItem> )}
            />
          </div>
          <Separator />
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Digital Card Details</h3>
            <FormField control={form.control} name="businessCard.title" render={({ field }) => ( <FormItem> <FormLabel>Job Title</FormLabel> <FormControl><Input placeholder="Senior Product Designer" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.company" render={({ field }) => ( <FormItem> <FormLabel>Company</FormLabel> <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl><Input placeholder="San Francisco, CA" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.phone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input type="email" placeholder="jane.doe@acme.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.website" render={({ field }) => ( <FormItem> <FormLabel>Website</FormLabel> <FormControl><Input placeholder="https://janedoe.design" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="businessCard.linkedin" render={({ field }) => ( <FormItem> <FormLabel>LinkedIn</FormLabel> <FormControl><Input placeholder="https://linkedin.com/in/janedoe" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
