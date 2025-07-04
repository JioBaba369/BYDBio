
'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createJob } from "@/lib/jobs";
import { uploadImage } from "@/lib/storage";

export default function CreateOpportunityPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: OpportunityFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create an opportunity.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = { ...data, imageUrl: data.imageUrl || null };

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `jobs/${user.uid}/${Date.now()}`);
                dataToSave.imageUrl = newImageUrl;
            }

            await createJob(user.uid, dataToSave);
            toast({
                title: "Opportunity Created!",
                description: "Your new opportunity has been created successfully.",
            });
            router.push('/opportunities');
        } catch (error) {
            console.error("Error creating opportunity:", error);
            toast({
                title: "Error",
                description: "Failed to create opportunity. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create an Opportunity</h1>
                <p className="text-muted-foreground">Share a new job posting with your network. Fill out the details below to attract the best candidates.</p>
            </div>
            <OpportunityForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
