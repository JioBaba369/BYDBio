
'use client';

import { JobForm, JobFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
                console.error("Error fetching job for edit:", err);
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/calendar');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [jobId, user, router, toast]);

    const onSubmit = async (data: JobFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<JobFormValues> = { ...data };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `jobs/${user.uid}/${jobId}/image`);
                dataToSave.imageUrl = newImageUrl;
            }

            await updateJob(jobId, dataToSave);
            toast({
                title: "Job Updated!",
                description: "The job has been updated successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            console.error("Error updating job:", error);
            toast({
                title: "Error",
                description: "Failed to update job. Please try again.",
                variant: "destructive",
            });
        } finally {
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
            <JobForm defaultValues={jobToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
