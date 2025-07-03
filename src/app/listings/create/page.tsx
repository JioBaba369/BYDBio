'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateListingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: ListingFormValues) => {
        setIsSaving(true);
        console.log("Creating new listing:", data);
        setTimeout(() => {
            toast({
                title: "Listing Created!",
                description: "Your new listing has been created successfully.",
            });
            setIsSaving(false);
            router.push('/listings');
        }, 1000);
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
