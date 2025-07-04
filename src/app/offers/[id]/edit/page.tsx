
'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getOffer, updateOffer, type Offer } from "@/lib/offers";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";

const EditOfferPageSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Skeleton className="h-64 rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);


export default function EditOfferPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const offerId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);

    useEffect(() => {
        if (offerId) {
            setIsLoading(true);
            getOffer(offerId)
                .then(setOfferToEdit)
                .finally(() => setIsLoading(false));
        }
    }, [offerId]);

    const onSubmit = async (data: OfferFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<OfferFormValues> = { ...data };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `offers/${user.uid}/${offerId}/image`);
                dataToSave.imageUrl = newImageUrl;
            }

            await updateOffer(offerId, dataToSave);
            toast({
                title: "Offer Updated!",
                description: "Your offer has been updated successfully.",
            });
            router.push('/offers');
        } catch (error) {
            console.error("Error updating offer:", error);
            toast({
                title: "Error",
                description: "Failed to update offer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EditOfferPageSkeleton />;
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
