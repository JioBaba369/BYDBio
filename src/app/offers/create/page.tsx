
'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createOffer, updateOffer, type Offer } from "@/lib/offers";
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
            const { imageUrl, startDate, endDate, startTime, endTime, ...restOfData } = data;
            const combinedStartDate = combineDateAndTime(startDate, startTime);
            const combinedEndDate = endDate ? combineDateAndTime(endDate, endTime) : null;
            
            const dataToSave: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'claims' | 'searchableKeywords' | 'followerCount' | 'imageUrl'>> = {
                ...restOfData,
                startDate: combinedStartDate,
                endDate: combinedEndDate,
                imageUrl: null,
            };

            const offerId = await createOffer(user.uid, dataToSave);
            
            toast({ title: "Offer Created!", description: "Your new offer has been created. Image is processing." });
            router.push('/my-content');

            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `offers/${user.uid}/${offerId}/image`)
                    .then(newImageUrl => {
                        updateOffer(offerId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({ title: "Image Upload Failed", description: "Your offer was created, but the image failed to upload.", variant: "destructive", duration: 9000 });
                    });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create offer. Please try again.",
                variant: "destructive",
            });
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
