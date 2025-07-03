
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Update your account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="jane.doe@example.com" />
          </div>
          <Button>Update Email</Button>
          <Separator />
           <div className="space-y-2">
            <Label>Password</Label>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-follower">New Followers</Label>
              <p className="text-sm text-muted-foreground">
                Notify me when someone new follows me.
              </p>
            </div>
            <Switch id="new-follower" defaultChecked />
          </div>
          <Separator />
           <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="post-likes">Post Likes & Comments</Label>
              <p className="text-sm text-muted-foreground">
                Notify me when someone engages with my posts.
              </p>
            </div>
            <Switch id="post-likes" defaultChecked/>
          </div>
           <Separator />
           <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="offers-updates">Offers & Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and special offers.
              </p>
            </div>
            <Switch id="offers-updates" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Manage your account data and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your content.
              </p>
            </div>
            <Button variant="destructive">Delete My Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
