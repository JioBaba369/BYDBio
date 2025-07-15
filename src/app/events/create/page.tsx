
'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createEvent, updateEvent, type Event } from "@/lib/events";
import { uploadImage } from "@/lib/storage";

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


export default function CreateEventPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: EventFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create an event.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        
        try {
            const { imageUrl, startDate, endDate, startTime, endTime, ...restOfData } = data;
            const combinedStartDate = combineDateAndTime(startDate, startTime);
            const combinedEndDate = endDate ? combineDateAndTime(endDate, endTime) : null;

            const dataToSave: Partial<Omit<Event, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'rsvps' | 'searchableKeywords' | 'followerCount' | 'imageUrl'>> = {
                ...restOfData,
                startDate: combinedStartDate,
                endDate: combinedEndDate,
                imageUrl: null, // Save without image first
            };

            // Create the event document and get its ID
            const eventId = await createEvent(user.uid, dataToSave);

            toast({
                title: "Event Created!",
                description: "Your new event has been created. Image is processing if added.",
            });
            router.push('/my-content');

            // If there's an image, upload it in the background
            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `events/${user.uid}/${eventId}/image`)
                    .then(newImageUrl => {
                        updateEvent(eventId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({
                            title: "Image Upload Failed",
                            description: "Your event was created, but the image failed to upload. You can edit the event to try again.",
                            variant: "destructive",
                            duration: 9000
                        });
                    });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create event. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Event</h1>
                <p className="text-muted-foreground">Fill out the form below to create a new event.</p>
            </div>
            <EventForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
