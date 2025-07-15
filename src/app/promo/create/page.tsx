
'use client';

import { PromoPageForm, PromoPageFormValues } from "@/components/forms/promo-page-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createPromoPage, updatePromoPage } from "@/lib/promo-pages";
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
            toast({ title: "Authentication Error", description: "You must be logged in to create a business page.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, logoUrl, ...restOfData } = data;

            const pageId = await createPromoPage(user.uid, {
                ...restOfData,
                imageUrl: null,
                logoUrl: null,
            });

            toast({ title: "Business Page Created!", description: "Your new business page has been created successfully. Images are processing." });
            router.push('/my-content');

            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `promoPages/${user.uid}/${pageId}/header`)
                    .then(newImageUrl => updatePromoPage(pageId, { imageUrl: newImageUrl }))
                    .catch(err => toast({ title: "Header Image Upload Failed", variant: "destructive" }));
            }
            if (logoUrl && logoUrl.startsWith('data:image')) {
                uploadImage(logoUrl, `promoPages/${user.uid}/${pageId}/logo`)
                    .then(newLogoUrl => updatePromoPage(pageId, { logoUrl: newLogoUrl }))
                    .catch(err => toast({ title: "Logo Upload Failed", variant: "destructive" }));
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create business page. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Create New Business Page</h1>
                <p className="text-muted-foreground">Fill out the form below to add a new business page to your profile.</p>
            </div>
            <PromoPageForm onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
