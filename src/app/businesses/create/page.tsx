
'use client';

import { BusinessForm, BusinessFormValues } from "@/components/forms/business-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createBusiness } from "@/lib/businesses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadImage } from "@/lib/storage";

export default function CreateBusinessPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: BusinessFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a business.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = { ...data };

            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `businesses/${user.uid}/${Date.now()}_header`);
                dataToSave.imageUrl = newImageUrl;
            }
            if (dataToSave.logoUrl && dataToSave.logoUrl.startsWith('data:image')) {
                const newLogoUrl = await uploadImage(dataToSave.logoUrl, `businesses/${user.uid}/${Date.now()}_logo`);
                dataToSave.logoUrl = newLogoUrl;
            }

            await createBusiness(user.uid, dataToSave);
            toast({
                title: "Business Page Created!",
                description: "Your new business page has been created successfully.",
            });
            router.push('/businesses');
        } catch (error) {
            console.error("Error creating business page:", error);
            toast({
                title: "Error",
                description: "Failed to create business page. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
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
