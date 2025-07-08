
'use client';

import { PromoPageForm, PromoPageFormValues } from "@/components/forms/promo-page-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createPromoPage } from "@/lib/promo-pages";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadImage } from "@/lib/storage";

export default function CreatePromoPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const onSubmit = async (data: PromoPageFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a promo page.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<PromoPageFormValues> = {
                name: data.name,
                description: data.description,
                email: data.email,
            };

            if (data.phone) dataToSave.phone = data.phone;
            if (data.website) dataToSave.website = data.website;
            if (data.address) dataToSave.address = data.address;

            if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(data.imageUrl, `promoPages/${user.uid}/${Date.now()}_header`);
                dataToSave.imageUrl = newImageUrl;
            }
            if (data.logoUrl && data.logoUrl.startsWith('data:image')) {
                const newLogoUrl = await uploadImage(data.logoUrl, `promoPages/${user.uid}/${Date.now()}_logo`);
                dataToSave.logoUrl = newLogoUrl;
            }

            await createPromoPage(user.uid, dataToSave);
            toast({
                title: "Promo Page Created!",
                description: "Your new promo page has been created successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            console.error("Error creating promo page:", error);
            toast({
                title: "Error",
                description: "Failed to create promo page. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Promo Page</h1>
                <p className="text-muted-foreground">Fill out the form below to add a new promo page to your profile.</p>
            </div>
            <PromoPageForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
