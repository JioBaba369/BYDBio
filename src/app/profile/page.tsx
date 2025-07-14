'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    // Set default values here to ensure form is ready, even if user is null initially
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

  const { formState: { isDirty }, reset, setError } = form;

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
        // Map links to include a temporary 'id' for react-hook-form's array field management
        links: (user.links || []).map((link, i) => ({ ...link, id: `link-${i}` })),
        bookingSettings: user.bookingSettings || DEFAULT_BOOKING_SETTINGS,
      });
    }
  }, [user, reset]);

  /**
   * Handles the saving of all profile changes.
   * @param data The form data to be saved.
   */
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
      // Prepare data for update, removing the temporary 'id' from links
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
        // Reset the form with the fresh data from the server to clear dirty state
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
      } else {
        // This case should ideally not be reached if updateUser always returns a user on success
        toast({ title: "Update Failed", description: "Profile update failed, but no specific error was reported.", variant: 'destructive' });
      }
    } catch (error: any) {
      console.error("Error saving profile:", error); // Log full error for debugging

      if (error.message.includes("Username is already taken")) {
        setError("username", { type: "manual", message: "This username is already taken. Please choose another." });
        toast({ title: "Update Failed", description: "This username is already taken.", variant: 'destructive' });
      } else {
        toast({ title: "Error saving profile", description: "An unexpected error occurred. Please try again.", variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  }, [firebaseUser, reset, setError, toast]); // Include all dependencies

  // Show skeleton while authentication or user data is loading
  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSaveAll)}>
        <div className="space-y-6">
          {/* Header and Save Button (Top) */}
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

          {/* Tabs and Content */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
              <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4" />Links</TabsTrigger>
              <TabsTrigger value="booking"><CalendarIcon className="mr-2 h-4 w-4" />Bookings</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              {/* Form Sections */}
              <div className="md:col-span-2 space-y-4">
                <TabsContent value="profile" className="m-0"><ProfileForm /></TabsContent>
                <TabsContent value="links" className="m-0"><LinksForm /></TabsContent>
                <TabsContent value="booking" className="m-0"><BookingsForm /></TabsContent>
              </div>
              {/* Profile Preview */}
              <div className="md:col-span-1">
                <ProfilePreview />
              </div>
            </div>
          </Tabs>

          {/* Save Button (Bottom) - Removed duplication and unnecessary class */}
          {/* Consider if a second save button is truly necessary or if the top one suffices */}
          {/* <Button type="submit" disabled={!isDirty || isSaving} className="mt-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button> */}
        </div>
      </form>
    </FormProvider>
  );
}