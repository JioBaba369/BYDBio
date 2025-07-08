
'use client';

import { EventForm, EventFormValues } from "@/components/forms/event-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getEvent, updateEvent, type Event } from "@/lib/events";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


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
        if (!eventId || !user) return;

        setIsLoading(true);
        getEvent(eventId)
            .then((eventData) => {
                if (!eventData) {
                    toast({ title: "Not Found", description: "This event does not exist.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                if (eventData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                setEventToEdit(eventData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/calendar');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [eventId, user, router, toast]);

    const formDefaultValues = useMemo(() => {
        if (!eventToEdit) {
            return undefined;
        }
        // Ensure date objects are correctly typed for the form
        return {
            ...eventToEdit,
            startDate: eventToEdit.startDate ? new Date(eventToEdit.startDate) : new Date(),
            endDate: eventToEdit.endDate ? new Date(eventToEdit.endDate) : null,
        };
    }, [eventToEdit]);
    
    const onSubmit = async (data: EventFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        
        try {
            const { imageUrl, ...restOfData } = data; // Separate imageUrl from other data
            
            // If there's a new image to upload
            if (imageUrl && imageUrl.startsWith('data:image')) {
                const combinedStartDate = combineDateAndTime(restOfData.startDate, restOfData.startTime);
                const combinedEndDate = restOfData.endDate ? combineDateAndTime(restOfData.endDate, restOfData.endTime) : null;
                const { startDate, endDate, startTime, endTime, ...finalTextData } = restOfData;

                // First, update all the text-based data immediately
                await updateEvent(eventId, { 
                    ...finalTextData,
                    startDate: combinedStartDate,
                    endDate: combinedEndDate,
                });

                // Show success and navigate away, letting the image upload in the background
                toast({
                    title: "Event Updated!",
                    description: "Your changes have been saved. Your new image is being uploaded.",
                });
                router.push('/calendar');

                // Now, upload the image and update the doc again
                uploadImage(imageUrl, `events/${user.uid}/${eventId}/image`)
                    .then(newImageUrl => {
                        updateEvent(eventId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({
                            title: "Image Upload Failed",
                            description: "Your event was updated, but the new image failed to upload.",
                            variant: "destructive",
                            duration: 9000
                        });
                    });
            } else {
                // If no new image, just do a normal update with all data
                const combinedStartDate = combineDateAndTime(data.startDate, data.startTime);
                const combinedEndDate = data.endDate ? combineDateAndTime(data.endDate, data.endTime) : null;
                const { startDate, endDate, startTime, endTime, ...finalData } = data;
                
                await updateEvent(eventId, {
                    ...finalData,
                    startDate: combinedStartDate,
                    endDate: combinedEndDate,
                });

                toast({
                    title: "Event Updated!",
                    description: "Your changes have been saved.",
                });
                router.push('/calendar');
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update event. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false); // Only set to false on error
        }
    }

    if (isLoading || !eventToEdit) {
        return <EditEventPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Event</h1>
                    <p className="text-muted-foreground">Modify the details of your event below.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/calendar">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Content
                    </Link>
                </Button>
            </div>
            <EventForm defaultValues={formDefaultValues} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
