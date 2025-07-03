'use client';

import { OpportunityForm, OpportunityFormValues } from "@/components/forms/opportunity-form";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditOpportunityPage() {
    const router = useRouter();
    const params = useParams();
    const opportunityId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch this data from an API
    const opportunityToEdit = currentUser.jobs.find(j => j.id === opportunityId);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: OpportunityFormValues) => {
        setIsSaving(true);
        console.log("Updating opportunity:", opportunityId, data);
        setTimeout(() => {
            toast({
                title: "Opportunity Updated!",
                description: "The opportunity has been updated successfully.",
            });
            setIsSaving(false);
            router.push('/opportunities');
        }, 1000);
    }

    if (!opportunityToEdit) {
        return <div>Opportunity not found.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Opportunity</h1>
                <p className="text-muted-foreground">Modify the details of the job opportunity below.</p>
            </div>
            <OpportunityForm defaultValues={opportunityToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
