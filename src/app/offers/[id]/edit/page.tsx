
'use client';

import { OfferForm, OfferFormValues } from "@/components/forms/offer-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getOffer, updateOffer, type Offer } from "@/lib/offers";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


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
        if (!offerId || !user) return;

        setIsLoading(true);
        getOffer(offerId)
            .then((offerData) => {
                if (!offerData) {
                    toast({ title: "Not Found", description: "This offer does not exist.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                if (offerData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                setOfferToEdit(offerData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/canvas');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [offerId, user, router, toast]);

    const formDefaultValues = useMemo(() => {
        if (!offerToEdit) {
            return undefined;
        }
        return {
            ...offerToEdit,
            startDate: offerToEdit.startDate ? new Date(offerToEdit.startDate) : new Date(),
            endDate: offerToEdit.endDate ? new Date(offerToEdit.endDate) : null,
        };
    }, [offerToEdit]);

    const onSubmit = async (data: OfferFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, startDate, endDate, startTime, endTime, ...restOfData } = data;
            const combinedStartDate = combineDateAndTime(startDate, startTime);
            const combinedEndDate = endDate ? combineDateAndTime(endDate, endTime) : null;
            
            const dataToSave: Partial<Omit<Offer, 'id' | 'authorId' | 'createdAt'>> = {
                ...restOfData,
                startDate: combinedStartDate,
                endDate: combinedEndDate,
            };

            await updateOffer(offerId, dataToSave);
            
            if (imageUrl && imageUrl.startsWith('data:image')) {
                toast({ title: "Offer Updated!", description: "Your offer has been updated. Image is uploading." });
                router.push('/canvas');

                uploadImage(imageUrl, `offers/${user.uid}/${offerId}/image`)
                    .then(newImageUrl => {
                        updateOffer(offerId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({ title: "Image Upload Failed", description: "Your offer was updated, but the new image failed to upload.", variant: "destructive", duration: 9000 });
                    });
            } else {
                toast({ title: "Offer Updated!", description: "Your offer has been updated successfully." });
                router.push('/canvas');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update offer. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    }

    if (isLoading || !offerToEdit) {
        return <EditOfferPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Offer</h1>
                    <p className="text-muted-foreground">Modify the details of your offer below.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/canvas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Canvas
                    </Link>
                </Button>
            </div>
            <OfferForm defaultValues={formDefaultValues} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
