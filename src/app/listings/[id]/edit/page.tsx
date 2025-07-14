
'use client';

import { ListingForm, ListingFormValues } from "@/components/forms/listing-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
        if (!listingId || !user) return;

        setIsLoading(true);
        getListing(listingId)
            .then((listingData) => {
                if (!listingData) {
                    toast({ title: "Not Found", description: "This listing does not exist.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                if (listingData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                setListingToEdit(listingData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/canvas');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [listingId, user, router, toast]);

    const formDefaultValues = useMemo(() => {
        if (!listingToEdit) {
            return undefined;
        }
        return {
            ...listingToEdit,
            startDate: listingToEdit.startDate ? new Date(listingToEdit.startDate) : null,
            endDate: listingToEdit.endDate ? new Date(listingToEdit.endDate) : null,
        };
    }, [listingToEdit]);
    
    const onSubmit = async (data: ListingFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, ...restOfData } = data;
            
            await updateListing(listingId, { ...restOfData });
            
            if (imageUrl && imageUrl.startsWith('data:image')) {
                toast({ title: "Listing Updated!", description: "Your listing has been updated. Image is uploading." });
                router.push('/canvas');

                uploadImage(imageUrl, `listings/${user.uid}/${listingId}/image`)
                    .then(newImageUrl => {
                        updateListing(listingId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({ title: "Image Upload Failed", description: "Your listing was updated, but the new image failed to upload.", variant: "destructive", duration: 9000 });
                    });
            } else {
                 toast({ title: "Listing Updated!", description: "Your listing has been updated successfully." });
                 router.push('/canvas');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update listing. Please try again.",
                variant: "destructive",
            });
             setIsSaving(false);
        }
    }

    if (isLoading || !listingToEdit) {
        return <EditListingPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Listing</h1>
                    <p className="text-muted-foreground">Modify the details of your listing below.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/canvas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Canvas
                    </Link>
                </Button>
            </div>
            <ListingForm defaultValues={formDefaultValues} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
