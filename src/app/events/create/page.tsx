'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEventPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: EventFormValues) => {
        setIsSaving(true);
        console.log("Creating new event:", data);
        setTimeout(() => {
            toast({
                title: "Event Created!",
                description: "Your new event has been created successfully.",
            });
            setIsSaving(false);
            router.push('/events');
        }, 1000);
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
