
'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createJob } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";

export default function CreateJobPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: OpportunityFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a job.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<OpportunityFormValues> = {
                title: data.title,
                company: data.company,
                description: data.description,
                location: data.location,
                type: data.type,
            };

            if (data.remuneration) dataToSave.remuneration = data.remuneration;
            if (data.closingDate) dataToSave.closingDate = data.closingDate;
            if (data.startDate) dataToSave.startDate = data.startDate;
            if (data.endDate) dataToSave.endDate = data.endDate;
            if (data.applicationUrl) dataToSave.applicationUrl = data.applicationUrl;
            if (data.contactInfo) dataToSave.contactInfo = data.contactInfo;

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `jobs/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createJob(user.uid, dataToSave);
            toast({
                title: "Job Created!",
                description: "Your new job has been created successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            console.error("Error creating job:", error);
            toast({
                title: "Error",
                description: "Failed to create job. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Job</h1>
                <p className="text-muted-foreground">Fill out the form below to post a new job.</p>
            </div>
            <OpportunityForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
