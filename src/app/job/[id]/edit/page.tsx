
'use client';

import { JobForm, JobFormValues } from "@/components/forms/job-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getJob, updateJob, type Job } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

const combineDateAndTime = (date: Date, timeString: string | undefined | null): Date => {
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0
    }
    return newDate;
};


export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const jobId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

    useEffect(() => {
        if (!jobId || !user) return;

        setIsLoading(true);
        getJob(jobId)
            .then((jobData) => {
                if (!jobData) {
                    toast({ title: "Not Found", description: "This job does not exist.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                if (jobData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                setJobToEdit(jobData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/calendar');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [jobId, user, router, toast]);

    const formDefaultValues = useMemo(() => {
        if (!jobToEdit) {
            return undefined;
        }
        return {
            ...jobToEdit,
            closingDate: jobToEdit.closingDate ? new Date(jobToEdit.closingDate) : null,
            startDate: jobToEdit.startDate ? new Date(jobToEdit.startDate) : null,
            endDate: jobToEdit.endDate ? new Date(jobToEdit.endDate) : null,
        };
    }, [jobToEdit]);

    const onSubmit = async (data: JobFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, closingDate, startDate, endDate, startTime, endTime, ...restOfData } = data;
            const combinedStartDate = startDate ? combineDateAndTime(startDate, startTime) : null;
            const combinedEndDate = endDate ? combineDateAndTime(endDate, endTime) : null;
            
            const dataToSave: Partial<Omit<Job, 'id' | 'authorId' | 'createdAt'>> = {
                ...restOfData,
                closingDate: closingDate || null,
                startDate: combinedStartDate,
                endDate: combinedEndDate,
            };

            await updateJob(jobId, dataToSave);

            if (imageUrl && imageUrl.startsWith('data:image')) {
                toast({ title: "Job Updated!", description: "Your job posting has been saved. Your new image is being uploaded.", });
                router.push('/calendar');

                uploadImage(imageUrl, `jobs/${user.uid}/${jobId}/image`)
                    .then(newImageUrl => {
                        updateJob(jobId, { imageUrl: newImageUrl });
                    })
                    .catch(err => {
                        console.error("Failed to upload image in background:", err);
                        toast({ title: "Image Upload Failed", description: "Your job was updated, but the new image failed to upload.", variant: "destructive", duration: 9000 });
                    });
            } else {
                 toast({ title: "Job Updated!", description: "The job has been updated successfully." });
                 router.push('/calendar');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update job. Please try again.",
                variant: "destructive",
            });
             setIsSaving(false);
        }
    }

    if (isLoading || !jobToEdit) {
        return <EditJobPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Job</h1>
                    <p className="text-muted-foreground">Modify the details of the job below.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/calendar">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Content
                    </Link>
                </Button>
            </div>
            <JobForm defaultValues={formDefaultValues} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
