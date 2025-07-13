
'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { updateUser, type User as AppUser } from '@/lib/users';
import { profileSchema, type ProfileFormValues, type BookingSettings } from '@/lib/schemas/profile';
import { ProfilePageSkeleton } from '@/components/profile-skeleton';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Link2 as LinkIcon, Calendar as CalendarIcon, Save, Loader2 } from 'lucide-react';

import { ProfileForm } from '@/components/profile/profile-form';
import { LinksForm } from '@/components/profile/links-form';
import { BookingsForm } from '@/components/profile/bookings-form';
import { ProfilePreview } from '@/components/profile/profile-preview';

// --- Main Component ---
export default function ProfilePage() {
  const { user, firebaseUser, loading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const defaultBookingSettings: BookingSettings = {
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  const { formState: { isDirty }, reset } = form;

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
        bookingSettings: user.bookingSettings || defaultBookingSettings,
      });
    }
  }, [user, reset]);


  const handleSaveAll = async (data: ProfileFormValues) => {
    if (!firebaseUser) return;
    setIsSaving(true);
    
    try {
      const dataToUpdate: Partial<AppUser> = {
        name: data.name,
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        hashtags: data.hashtags,
        businessCard: data.businessCard,
        links: data.links.map(({ id, ...rest }) => rest), // Remove temporary 'id' for dnd
        bookingSettings: data.bookingSettings,
      };

      const updatedUser = await updateUser(firebaseUser.uid, dataToUpdate);

      if (updatedUser) {
        // Reset the form with the fresh data from the server
        reset({
          name: updatedUser.name || '',
          username: updatedUser.username || '',
          bio: updatedUser.bio || '',
          avatarUrl: updatedUser.avatarUrl || '',
          hashtags: updatedUser.hashtags || [],
          businessCard: updatedUser.businessCard || {},
          links: (updatedUser.links || []).map((link, i) => ({ ...link, id: `link-${i}` })),
          bookingSettings: updatedUser.bookingSettings || defaultBookingSettings,
        });
        toast({ title: "Profile Saved", description: "Your information has been successfully updated." });
      }

    } catch (error: any) {
      if (error.message.includes("Username is already taken")) {
        form.setError("username", { type: "manual", message: "This username is already taken. Please choose another." });
        toast({ title: "Update Failed", description: "This username is already taken.", variant: 'destructive' });
      } else {
        toast({ title: "Error saving profile", description: "An unexpected error occurred.", variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <FormProvider {...form}>
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

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
              <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4" />Links</TabsTrigger>
              <TabsTrigger value="booking"><CalendarIcon className="mr-2 h-4 w-4" />Bookings</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              <div className="md:col-span-2 space-y-4">
                <TabsContent value="profile" className="m-0"><ProfileForm /></TabsContent>
                <TabsContent value="links" className="m-0"><LinksForm /></TabsContent>
                <TabsContent value="booking" className="m-0"><BookingsForm /></TabsContent>
              </div>
              <div className="md:col-span-1">
                <ProfilePreview />
              </div>
            </div>
          </Tabs>
           <Button type="submit" disabled={!isDirty || isSaving} className="mt-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
        </div>
      </form>
    </FormProvider>
  );
}
