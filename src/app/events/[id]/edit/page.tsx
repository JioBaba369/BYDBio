
'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getEvent, updateEvent, type Event } from "@/lib/events";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";

const EditEventPageSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Skeleton className="h-[400px] rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);


export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const eventId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

    useEffect(() => {
        if (eventId) {
            setIsLoading(true);
            getEvent(eventId)
                .then(setEventToEdit)
                .finally(() => setIsLoading(false));
        }
    }, [eventId]);
    
    const onSubmit = async (data: EventFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<EventFormValues> = { ...data };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `events/${user.uid}/${eventId}/image`);
                dataToSave.imageUrl = newImageUrl;
            }

            await updateEvent(eventId, dataToSave);
            toast({
                title: "Event Updated!",
                description: "Your event has been updated successfully.",
            });
            router.push('/events');
        } catch (error) {
            console.error("Error updating event:", error);
            toast({
                title: "Error",
                description: "Failed to update event. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EditEventPageSkeleton />;
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
