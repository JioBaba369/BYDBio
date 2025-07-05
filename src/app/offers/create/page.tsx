
'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createOffer } from "@/lib/offers";
import { uploadImage } from "@/lib/storage";

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
            const dataToSave = { ...data, imageUrl: data.imageUrl || null };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `offers/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createOffer(user.uid, dataToSave);
            toast({
                title: "Offer Created!",
                description: "Your new offer has been created successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            console.error("Error creating offer:", error);
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
