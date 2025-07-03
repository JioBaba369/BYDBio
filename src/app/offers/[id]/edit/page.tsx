'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditOfferPage() {
    const router = useRouter();
    const params = useParams();
    const offerId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch this data from an API
    const offerToEdit = currentUser.offers.find(o => o.id === offerId);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: OfferFormValues) => {
        setIsSaving(true);
        console.log("Updating offer:", offerId, data);
        setTimeout(() => {
            toast({
                title: "Offer Updated!",
                description: "Your offer has been updated successfully.",
            });
            setIsSaving(false);
            router.push('/offers');
        }, 1000);
    }

    if (!offerToEdit) {
        return <div>Offer not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Offer</h1>
                <p className="text-muted-foreground">Modify the details of your offer below.</p>
            </div>
            <OfferForm defaultValues={offerToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
