
'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createOffer, type Offer } from "@/lib/offers";
import { uploadImage } from "@/lib/storage";

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


export default function CreateOfferPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: OfferFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create an offer.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const combinedStartDate = combineDateAndTime(data.startDate, data.startTime);
            const combinedEndDate = data.endDate ? combineDateAndTime(data.endDate, data.endTime) : null;
            
            const { startDate, endDate, startTime, endTime, ...restOfData } = data;
            
            const dataToSave: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'claims' | 'searchableKeywords' | 'followerCount'>> = {
                ...restOfData,
                startDate: combinedStartDate.toISOString(),
                endDate: combinedEndDate ? combinedEndDate.toISOString() : null,
            };

            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `offers/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createOffer(user.uid, dataToSave);
            toast({
                title: "Offer Created!",
                description: "Your new offer has been created successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create offer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Offer</h1>
                <p className="text-muted-foreground">Fill out the form below to create a new offer.</p>
            </div>
            <OfferForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
