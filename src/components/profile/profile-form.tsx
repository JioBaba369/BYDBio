
import { useFormContext } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { UnifiedProfileFormValues } from '@/app/profile/page';
import { useState, useRef } from 'react';
import ImageCropper from '../image-cropper';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage';
import { useAuth } from '../auth-provider';
import { AIBioGenerator } from '../ai/bio-generator';

export function ProfileForm() {
  const form = useFormContext<UnifiedProfileFormValues>();
  const { firebaseUser, user } = useAuth();
  const { toast } = useToast();
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isBioGeneratorOpen, setIsBioGeneratorOpen] = useState(false);
  
  const watchedAvatar = form.watch('avatarUrl');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageToCrop(reader.result as string); setIsCropperOpen(true); });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = async (url: string) => {
    if (!firebaseUser) return;
    setIsUploading(true);
    toast({ title: "Uploading...", description: "Please wait while we upload your new avatar." });
    try {
      const downloadURL = await uploadImage(url, `avatars/${firebaseUser.uid}`);
      form.setValue('avatarUrl', downloadURL, { shouldDirty: true });
      toast({ title: "Avatar Updated!", description: "Your new profile picture has been saved." });
    } catch (error) {
      toast({ title: "Error Uploading Avatar", variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
    setIsCropperOpen(false);
  };

  return (
    <>
      <ImageCropper imageSrc={imageToCrop} open={isCropperOpen} onOpenChange={setIsCropperOpen} onCropComplete={handleCropComplete} isRound={true} aspectRatio={1} />
      <AIBioGenerator open={isBioGeneratorOpen} onOpenChange={setIsBioGeneratorOpen} onSelectBio={(bio) => { form.setValue('bio', bio, { shouldDirty: true }); }} />
      
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
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Change Photo
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={onFileChange} />
              </div>
            </div>
            <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <div className="flex items-center justify-between"> <FormLabel>Bio</FormLabel> <Button type="button" variant="outline" size="sm" onClick={() => setIsBioGeneratorOpen(true)}> <Sparkles className="mr-2 h-4 w-4"/> Generate with AI </Button> </div> <FormControl><Textarea rows={3} {...field} placeholder="Tell everyone a little bit about yourself..." /></FormControl> <FormMessage /> </FormItem> )}/>
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
