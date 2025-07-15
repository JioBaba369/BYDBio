
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";

const proFeatures = [
    "Advanced profile analytics",
    "Customizable themes for your profile page",
    "Priority support",
    "Remove 'Powered by BYD.Bio' branding",
    "Access to exclusive beta features",
    "Unlimited content creation"
];

export default function BydBioProPage() {
  return (
    <div className="space-y-8">
      <CardHeader className="px-0 text-center">
        <Star className="mx-auto h-12 w-12 text-yellow-500 fill-yellow-400" />
        <CardTitle className="text-4xl font-bold font-headline mt-4">Unlock BYD.Bio Pro</CardTitle>
        <CardDescription className="text-lg max-w-2xl mx-auto">
          Supercharge your professional presence with advanced tools, customization, and analytics.
        </CardDescription>
      </CardHeader>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold">$10<span className="text-xl text-muted-foreground">/month</span></CardTitle>
            <CardDescription>Billed monthly. Cancel anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                    </li>
                ))}
            </ul>
             <Button size="lg" className="w-full mt-4">
                <Star className="mr-2 h-4 w-4" /> Go Pro
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
