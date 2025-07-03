'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateOfferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: OfferFormValues) => {
        setIsSaving(true);
        console.log("Creating new offer:", data);
        setTimeout(() => {
            toast({
                title: "Offer Created!",
                description: "Your new offer has been created successfully.",
            });
            setIsSaving(false);
            router.push('/offers');
        }, 1000);
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
