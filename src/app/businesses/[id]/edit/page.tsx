
'use client';

import { BusinessForm, BusinessFormValues } from "@/components/forms/business-form";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const businessId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch this data from an API
    const businessToEdit = currentUser.businesses.find(b => b.id === businessId);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: BusinessFormValues) => {
        setIsSaving(true);
        console.log("Updating business page:", businessId, data);
        setTimeout(() => {
            toast({
                title: "Business Page Updated!",
                description: "Your business page has been updated successfully.",
            });
            setIsSaving(false);
            router.push('/businesses');
        }, 1000);
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
