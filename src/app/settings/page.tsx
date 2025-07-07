
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Monitor, Moon, Sun, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteUserAccount, updateUser, type NotificationSettings } from "@/lib/users";
import { useSearchParams } from 'next/navigation';
import { ChangePasswordDialog } from "@/components/change-password-dialog";

const SettingsPageSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
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
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    </div>
);


export default function SettingsPage() {
    const { user, firebaseUser, loading } = useAuth();
    const { setTheme, theme } = useTheme();
    const { toast } = useToast();
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const validTabs = ['profile', 'appearance', 'notifications', 'security'];
    const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile';
    
    useEffect(() => {
        if (user) {
            setNotificationSettings(user.notificationSettings);
        }
    }, [user]);

    const handleSaveNotificationSettings = async () => {
        if (!user || !notificationSettings) return;

        setIsSavingNotifications(true);
        try {
            await updateUser(user.uid, { notificationSettings });
            toast({ title: "Settings saved", description: "Your notification preferences have been updated." });
        } catch (error) {
            console.error("Failed to update notification settings:", error);
            toast({ title: "Error saving settings", variant: "destructive" });
        } finally {
            setIsSavingNotifications(false);
        }
    };


    const handleDeleteAccount = async () => {
       if (!firebaseUser) {
            toast({ title: "Error", description: "You must be logged in to delete your account.", variant: "destructive" });
            return;
        }

        try {
            await deleteUserAccount(firebaseUser);
            toast({
                title: "Account Deleted",
                description: "Your account and all associated data have been permanently deleted.",
            });
            // The AuthProvider will automatically handle redirecting the user on logout.
            setIsDeleteDialogOpen(false);
        } catch(error: any) {
            console.error("Account deletion error:", error);
            // Firebase often requires recent login for this action.
            if (error.code === 'auth/requires-recent-login') {
                 toast({
                    title: "Re-authentication Required",
                    description: "For your security, please sign out and sign back in before deleting your account.",
                    variant: "destructive",
                    duration: 10000,
                });
            } else {
                 toast({
                    title: "Deletion Failed",
                    description: error.message || "An unexpected error occurred while deleting your account.",
                    variant: "destructive",
                });
            }
        }
    };

    if (loading || !user || !notificationSettings) {
        return <SettingsPageSkeleton />;
    }
    
    return (
        <>
            <DeleteConfirmationDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteAccount}
                itemName="account"
                confirmationText={user.username}
                confirmationLabel={`This action is permanent. To confirm, please type your username "${user.username}" below.`}
            />
            <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings, appearance, and preferences.
                    </p>
                </div>
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Public Profile</CardTitle>
                                <CardDescription>
                                    This is your public information. Update it on the Profile Editor page.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={user.name} disabled readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={user.email || ''} disabled readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" value={user.username} disabled readOnly />
                                </div>
                            </CardContent>
                            <CardFooter>
                               <Button asChild>
                                    <Link href="/profile">Edit Profile</Link>
                               </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>
                                    Customize the look and feel of the app. Your selection will be saved for your next visit.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={theme}
                                    onValueChange={setTheme}
                                    className="grid max-w-md grid-cols-1 sm:grid-cols-3 gap-8 pt-2"
                                >
                                    <Label className="relative cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                        <RadioGroupItem value="light" className="sr-only" />
                                        <div className="flex flex-col items-center justify-between rounded-md p-2">
                                            <Sun className="h-8 w-8" />
                                            <span className="block w-full p-2 text-center font-normal">Light</span>
                                        </div>
                                    </Label>
                                    <Label className="relative cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                        <RadioGroupItem value="dark" className="sr-only" />
                                        <div className="flex flex-col items-center justify-between rounded-md p-2">
                                            <Moon className="h-8 w-8" />
                                            <span className="block w-full p-2 text-center font-normal">Dark</span>
                                        </div>
                                    </Label>
                                    <Label className="relative cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                        <RadioGroupItem value="system" className="sr-only" />
                                        <div className="flex flex-col items-center justify-between rounded-md p-2">
                                            <Monitor className="h-8 w-8" />
                                            <span className="block w-full p-2 text-center font-normal">System</span>
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Manage how you receive notifications.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="new-follower" className="font-normal">New Followers</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify me when someone new follows me.
                                        </p>
                                    </div>
                                    <Switch
                                        id="new-follower"
                                        checked={notificationSettings.newFollowers}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev!, newFollowers: checked}))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="post-likes" className="font-normal">Post Likes & Comments</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify me when someone engages with my posts.
                                        </p>
                                    </div>
                                    <Switch
                                        id="post-likes"
                                        checked={notificationSettings.newLikes}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev!, newLikes: checked}))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="event-rsvps" className="font-normal">Event RSVPs</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notify me when someone RSVPs to an event I created.
                                        </p>
                                    </div>
                                    <Switch
                                        id="event-rsvps"
                                        checked={notificationSettings.eventRsvps}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev!, eventRsvps: checked}))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="offers-updates" className="font-normal">Offers & Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about new features and special offers.
                                        </p>
                                    </div>
                                    <Switch
                                        id="offers-updates"
                                        checked={notificationSettings.offersAndUpdates}
                                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev!, offersAndUpdates: checked}))}
                                    />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button onClick={handleSaveNotificationSettings} disabled={isSavingNotifications}>
                                    {isSavingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Settings
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>
                                    Manage your account security and data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">
                                            Update your password. You will need to enter your current password.
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsChangePasswordOpen(true)}>Change Password</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-destructive">Delete Account</p>
                                        <p className="text-sm text-muted-foreground">
                                            Permanently delete your account and all of your content. This action is not reversible.
                                        </p>
                                    </div>
                                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete My Account</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </>
    );
}
