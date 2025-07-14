
'use client';

import { PromoPageForm, PromoPageFormValues } from "@/components/forms/promo-page-form";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPromoPage, updatePromoPage, type PromoPage } from "@/lib/promo-pages";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const EditPromoPageSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);

export default function EditPromoPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const promoPageId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [promoPageToEdit, setPromoPageToEdit] = useState<PromoPage | null>(null);

    useEffect(() => {
        if (!promoPageId || !user) return;

        setIsLoading(true);
        getPromoPage(promoPageId)
            .then((promoPageData) => {
                if (!promoPageData) {
                    toast({ title: "Not Found", description: "This business page does not exist.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                if (promoPageData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/canvas');
                    return;
                }
                setPromoPageToEdit(promoPageData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/canvas');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [promoPageId, user, router, toast]);
    
    const onSubmit = async (data: PromoPageFormValues) => {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const { imageUrl, logoUrl, ...restOfData } = data;

            await updatePromoPage(promoPageId, restOfData);
            
            toast({ title: "Business Page Updated!", description: "Your business page has been saved. Images are uploading." });
            router.push('/canvas');

            if (imageUrl && imageUrl.startsWith('data:image')) {
                uploadImage(imageUrl, `promoPages/${user.uid}/${promoPageId}/header`)
                    .then(newImageUrl => updatePromoPage(promoPageId, { imageUrl: newImageUrl }))
                    .catch(err => toast({ title: "Header Image Upload Failed", variant: "destructive" }));
            }
            if (logoUrl && logoUrl.startsWith('data:image')) {
                uploadImage(logoUrl, `promoPages/${user.uid}/${promoPageId}/logo`)
                    .then(newLogoUrl => updatePromoPage(promoPageId, { logoUrl: newLogoUrl }))
                    .catch(err => toast({ title: "Logo Upload Failed", variant: "destructive" }));
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update business page. Please try again.",
                variant: "destructive",
            });
            setIsSaving(false);
        }
    }

    if (isLoading || !promoPageToEdit) {
        return <EditPromoPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Business Page</h1>
                    <p className="text-muted-foreground">Modify the details of your business page below.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/canvas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Canvas
                    </Link>
                </Button>
            </div>
            <PromoPageForm defaultValues={promoPageToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
