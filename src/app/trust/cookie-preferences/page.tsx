'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CookiePreferencesPage() {
    const { toast } = useToast();
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: true,
        marketing: false,
    });

    const handleSave = () => {
        toast({
            title: "Preferences Saved",
            description: "Your cookie preferences have been updated.",
        });
    };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
            <Cookie /> Cookie Preferences
        </CardTitle>
        <CardDescription>
            Manage your cookie settings for our website. You can enable or disable different categories of cookies below.
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="essential" className="font-semibold">Strictly Necessary Cookies</Label>
                    <p className="text-sm text-muted-foreground">These cookies are essential for the website to function and cannot be switched off.</p>
                </div>
                <Switch id="essential" checked={preferences.essential} disabled />
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="analytics" className="font-semibold">Analytics Cookies</Label>
                    <p className="text-sm text-muted-foreground">These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
                </div>
                <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences(p => ({...p, analytics: checked}))}
                />
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="marketing" className="font-semibold">Marketing Cookies</Label>
                    <p className="text-sm text-muted-foreground">These cookies may be set through our site by our advertising partners to build a profile of your interests.</p>
                </div>
                 <Switch
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => setPreferences(p => ({...p, marketing: checked}))}
                />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave}>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
