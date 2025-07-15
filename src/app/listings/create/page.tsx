
'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createListing, updateListing, type Listing } from "@/lib/listings";
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
            const { imageUrl, ...restOfData } = data;

            const dataToSave: Partial<Omit<Listing, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'clicks' | 'searchableKeywords' | 'followerCount' | 'imageUrl'>> = {
                ...restOfData,
                imageUrl: null,
            };

            const listingId = await createListing(user.uid, dataToSave);
            
            toast({ title: "Listing Created!", description: "Your new listing has been created. Image is processing." });
            router.push('/my-content');

            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `listings/${user.uid}/${listingId}/image`)
                    .then(newImageUrl => {
                        updateListing(listingId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({ title: "Image Upload Failed", description: "Your listing was created, but the image failed to upload.", variant: "destructive", duration: 9000 });
                    });
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create listing. Please try again.",
                variant: "destructive",
            });
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
