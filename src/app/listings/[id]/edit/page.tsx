'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditListingPage() {
    const router = useRouter();
    const params = useParams();
    const listingId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch this data from an API
    const listingToEdit = currentUser.listings.find(l => l.id === listingId);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: ListingFormValues) => {
        setIsSaving(true);
        console.log("Updating listing:", listingId, data);
        setTimeout(() => {
            toast({
                title: "Listing Updated!",
                description: "Your listing has been updated successfully.",
            });
            setIsSaving(false);
            router.push('/listings');
        }, 1000);
    }

    if (!listingToEdit) {
        return <div>Listing not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Listing</h1>
                <p className="text-muted-foreground">Modify the details of your listing below.</p>
            </div>
            <ListingForm defaultValues={listingToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
