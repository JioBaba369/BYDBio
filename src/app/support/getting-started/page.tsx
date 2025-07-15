
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const steps = [
    {
        step: 1,
        title: "Create Your Account",
        description: "Sign up for a free account to unlock all features. The process is quick, easy, and secure."
    },
    {
        step: 2,
        title: "Edit Your Profile",
        description: "Navigate to the Profile Editor to fill in your bio, upload a professional avatar, and set your unique username. Use our AI tools to help generate content!"
    },
    {
        step: 3,
        title: "Add Your Links",
        description: "Go to the 'Links' tab in the editor to create your link-in-bio page. Add all your social media profiles, websites, and other important URLs."
    },
    {
        step: 4,
        title: "Create Your First Piece of Content",
        description: "Use the 'Create New' button to post an event, a job opening, a listing, or a simple status update. Engage with the community and build your presence."
    },
    {
        step: 5,
        title: "Share Your Profile",
        description: "Share your public profile URL (byd.bio/u/your-username) on your social media, email signature, and everywhere else to consolidate your online identity."
    }
]

export default function GettingStartedPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline">Getting Started</CardTitle>
        <CardDescription>Welcome to BYD.Bio! Follow these simple steps to get your professional hub up and running.</CardDescription>
      </CardHeader>
      
      <div className="space-y-6">
        {steps.map((item, index) => (
          <Card key={index} className="flex items-start gap-6 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
              {item.step}
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
