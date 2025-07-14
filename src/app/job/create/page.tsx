
'use client';

import { JobForm, JobFormValues } from "@/components/forms/job-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createJob, updateJob, type Job } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";

export default function CreateJobPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: JobFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a job.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, ...restOfData } = data;

            const jobId = await createJob(user.uid, restOfData);
            
            toast({
                title: "Job Created!",
                description: "Your new job has been created. Image is processing if added.",
            });
            router.push('/canvas');

            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `jobs/${user.uid}/${jobId}/image`)
                    .then(newImageUrl => {
                        updateJob(jobId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({
                            title: "Image Upload Failed",
                            description: "Your job was created, but the image failed to upload.",
                            variant: "destructive",
                            duration: 9000
                        });
                    });
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create job. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Job</h1>
                <p className="text-muted-foreground">Fill out the form below to post a new job.</p>
            </div>
            <JobForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
