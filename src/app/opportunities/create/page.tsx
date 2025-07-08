
'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createJob, type Job } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


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
            const combinedStartDate = data.startDate ? combineDateAndTime(data.startDate, data.startTime) : null;
            const combinedEndDate = data.endDate ? combineDateAndTime(data.endDate, data.endTime) : null;

            const { startTime, endTime, ...restOfData } = data;

            const dataToSave: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt' | 'status' | 'views' | 'applicants' | 'postingDate' | 'searchableKeywords' | 'followerCount'>> = {
                ...restOfData,
                closingDate: data.closingDate ? data.closingDate.toISOString() : undefined,
                startDate: combinedStartDate ? combinedStartDate.toISOString() : undefined,
                endDate: combinedEndDate ? combinedEndDate.toISOString() : undefined,
            };

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
