
'use client';

import { BusinessForm, BusinessFormValues } from "@/components/forms/business-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getBusiness, updateBusiness, type Business } from "@/lib/businesses";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage } from "@/lib/storage";

const EditBusinessPageSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const businessId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);

    useEffect(() => {
        if (businessId) {
            setIsLoading(true);
            getBusiness(businessId)
                .then(setBusinessToEdit)
                .finally(() => setIsLoading(false));
        }
    }, [businessId]);
    
    const onSubmit = async (data: BusinessFormValues) => {
        setIsSaving(true);
        try {
            const dataToSave = { ...data };

            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `businesses/${businessId}/header`);
                dataToSave.imageUrl = newImageUrl;
            }
            if (dataToSave.logoUrl && dataToSave.logoUrl.startsWith('data:image')) {
                const newLogoUrl = await uploadImage(dataToSave.logoUrl, `businesses/${businessId}/logo`);
                dataToSave.logoUrl = newLogoUrl;
            }

            await updateBusiness(businessId, dataToSave);
            toast({
                title: "Business Page Updated!",
                description: "Your business page has been updated successfully.",
            });
            router.push('/businesses');
        } catch (error) {
            console.error("Error updating business page:", error);
            toast({
                title: "Error",
                description: "Failed to update business page. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EditBusinessPageSkeleton />;
    }

    if (!businessToEdit) {
        return <div>Business page not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Business Page</h1>
                <p className="text-muted-foreground">Modify the details of your business below.</p>
            </div>
            <BusinessForm defaultValues={businessToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
