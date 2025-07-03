'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateOpportunityPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: OpportunityFormValues) => {
        setIsSaving(true);
        console.log("Creating new opportunity:", data);
        setTimeout(() => {
            toast({
                title: "Opportunity Created!",
                description: "Your new opportunity has been created successfully.",
            });
            setIsSaving(false);
            router.push('/opportunities');
        }, 1000);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Post New Opportunity</h1>
                <p className="text-muted-foreground">Fill out the form below to post a new job opportunity.</p>
            </div>
            <OpportunityForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
