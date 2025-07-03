
'use client';

import { BusinessForm, BusinessFormValues } from "@/components/forms/business-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBusinessPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // This is a mock function. In a real app, this would be an API call.
    const onSubmit = (data: BusinessFormValues) => {
        setIsSaving(true);
        console.log("Creating new business page:", data);
        setTimeout(() => {
            toast({
                title: "Business Page Created!",
                description: "Your new business page has been created successfully.",
            });
            setIsSaving(false);
            router.push('/businesses');
        }, 1000);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Business Page</h1>
                <p className="text-muted-foreground">Fill out the form below to add a new business to your profile.</p>
            </div>
            <BusinessForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
