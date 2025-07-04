
'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getJob, updateJob, type Job } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";

const EditJobPageSkeleton = () => (
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


export default function EditOpportunityPage() {
    const router = useRouter();
    const params = useParams();
    const opportunityId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

    useEffect(() => {
        if (opportunityId) {
            setIsLoading(true);
            getJob(opportunityId)
                .then(setJobToEdit)
                .finally(() => setIsLoading(false));
        }
    }, [opportunityId]);

    const onSubmit = async (data: OpportunityFormValues) => {
        setIsSaving(true);
        try {
            const dataToSave: Partial<OpportunityFormValues> = { ...data };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `jobs/${opportunityId}/image`);
                dataToSave.imageUrl = newImageUrl;
            }

            await updateJob(opportunityId, dataToSave);
            toast({
                title: "Opportunity Updated!",
                description: "The opportunity has been updated successfully.",
            });
            router.push('/opportunities');
        } catch (error) {
            console.error("Error updating opportunity:", error);
            toast({
                title: "Error",
                description: "Failed to update opportunity. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <EditJobPageSkeleton />;
    }

    if (!jobToEdit) {
        return <div>Opportunity not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Opportunity</h1>
                <p className="text-muted-foreground">Modify the details of the job opportunity below.</p>
            </div>
            <OpportunityForm defaultValues={jobToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
