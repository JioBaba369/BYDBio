
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap } from "lucide-react";

const topics = [
    {
        title: "Using the AI Bio Generator",
        content: "Navigate to the 'Profile Editor' page. In the 'Bio' section, click the 'Generate with AI' button. Enter keywords or bullet points about your skills and experience. The AI will provide several professional bio suggestions under 160 characters. Click 'Use this' to apply a suggestion to your bio field."
    },
    {
        title: "Creating a Digital Business Page",
        content: "From the dashboard or any content page, click 'Create New' and select 'New Business Page'. Fill in your business details, including name, description, contact information, and upload a header image and logo. This creates a shareable, public page for your business or brand."
    },
    {
        title: "Setting Up Appointment Bookings",
        content: "Go to the 'Profile Editor' and click on the 'Bookings' tab. Enable the 'Accept Appointments' switch. Then, for each day of the week, check the box to enable it and set your available start and end times. A 'Book a Meeting' button will now appear on your public profile."
    },
    {
        title: "Managing Your Link-in-Bio Page",
        content: "In the 'Profile Editor', go to the 'Links' tab. Click 'Add Link' to create a new entry. Select an icon, provide a title, and paste the URL. You can add up to 10 links. Drag and drop the links using the grip handle to reorder them."
    },
    {
        title: "Using the QR Code Scanner",
        content: "From the 'Connections' page, click the 'Scan to Connect' button. Grant camera permissions if prompted. Point your camera at another user's profile QR code or a vCard QR code. The app will automatically redirect you to their profile or prompt you to save their contact information."
    }
]

export default function FeaturesAndHowTosPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2"><Zap />Features & How-Tos</CardTitle>
        <CardDescription>Learn how to get the most out of BYD.Bio's powerful features.</CardDescription>
      </CardHeader>
      
       <Accordion type="single" collapsible className="w-full">
        {topics.map((topic, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg">{topic.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {topic.content}
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
