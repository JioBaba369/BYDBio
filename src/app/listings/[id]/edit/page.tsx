
'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getListing, updateListing, type Listing } from "@/lib/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const EditListingPageSkeleton = () => (
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

export default function EditListingPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const listingId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);

    useEffect(() => {
        if (listingId) {
            setIsLoading(true);
            getListing(listingId)
                .then(setListingToEdit)
                .finally(() => setIsLoading(false));
        }
    }, [listingId]);
    
    const onSubmit = async (data: ListingFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = { ...data };
            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `listings/${user.uid}/${listingId}/image`);
                dataToSave.imageUrl = newImageUrl;
            }

            await updateListing(listingId, dataToSave);
            toast({
                title: "Listing Updated!",
                description: "Your listing has been updated successfully.",
            });
            router.push('/listings');
        } catch (error) {
            console.error("Error updating listing:", error);
            toast({
                title: "Error",
                description: "Failed to update listing. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EditListingPageSkeleton />;
    }

    if (!listingToEdit) {
        return <div>Listing not found.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Listing</h1>
                    <p className="text-muted-foreground">Modify the details of your listing below.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/listings">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Listings
                    </Link>
                </Button>
            </div>
            <ListingForm defaultValues={listingToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
