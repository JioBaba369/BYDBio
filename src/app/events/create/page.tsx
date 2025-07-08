
'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createEvent } from "@/lib/events";
import { uploadImage } from "@/lib/storage";

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
            const dataToSave: Partial<EventFormValues> = { ...data };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `events/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createEvent(user.uid, dataToSave);
            toast({
                title: "Event Created!",
                description: "Your new event has been created successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create event. Please try again.",
                variant: "destructive",
            });
        } finally {
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
