'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch this data from an API
    const eventToEdit = currentUser.events.find(e => e.id === eventId);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: EventFormValues) => {
        setIsSaving(true);
        console.log("Updating event:", eventId, data);
        setTimeout(() => {
            toast({
                title: "Event Updated!",
                description: "Your event has been updated successfully.",
            });
            setIsSaving(false);
            router.push('/events');
        }, 1000);
    }

    if (!eventToEdit) {
        return <div>Event not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Event</h1>
                <p className="text-muted-foreground">Modify the details of your event below.</p>
            </div>
            <EventForm defaultValues={eventToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
