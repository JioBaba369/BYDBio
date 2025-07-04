
'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createListing } from "@/lib/listings";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadImage } from "@/lib/storage";

export default function CreateListingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: ListingFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a listing.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = { ...data };
            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `listings/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createListing(user.uid, dataToSave);
            toast({
                title: "Listing Created!",
                description: "Your new listing has been created successfully.",
            });
            router.push('/listings');
        } catch (error) {
            console.error("Error creating listing:", error);
            toast({
                title: "Error",
                description: "Failed to create listing. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Listing</h1>
                <p className="text-muted-foreground">Fill out the form below to create a new product or service listing.</p>
            </div>
            <ListingForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
