
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
                    toast({ title: "Not Found", description: "This promo page does not exist.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                if (promoPageData.authorId !== user.uid) {
                    toast({ title: "Unauthorized", description: "You do not have permission to edit this item.", variant: "destructive" });
                    router.push('/calendar');
                    return;
                }
                setPromoPageToEdit(promoPageData);
            })
            .catch((err) => {
                toast({ title: "Error", description: "Could not load item for editing.", variant: "destructive" });
                router.push('/calendar');
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
            const dataToSave = { ...data };

            if (dataToSave.imageUrl && dataToSave.imageUrl.startsWith('data:image')) {
                const newImageUrl = await uploadImage(dataToSave.imageUrl, `promoPages/${user.uid}/${promoPageId}/header`);
                dataToSave.imageUrl = newImageUrl;
            }
            if (dataToSave.logoUrl && dataToSave.logoUrl.startsWith('data:image')) {
                const newLogoUrl = await uploadImage(dataToSave.logoUrl, `promoPages/${user.uid}/${promoPageId}/logo`);
                dataToSave.logoUrl = newLogoUrl;
            }

            await updatePromoPage(promoPageId, dataToSave);
            toast({
                title: "Promo Page Updated!",
                description: "Your promo page has been updated successfully.",
            });
            router.push('/calendar');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update promo page. Please try again.",
                variant: "destructive",
            });
        } finally {
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
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Edit Promo Page</h1>
                    <p className="text-muted-foreground">Modify the details of your promo page below.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/calendar">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Content
                    </Link>
                </Button>
            </div>
            <PromoPageForm defaultValues={promoPageToEdit} onSubmit={onSubmit} isSaving={isSaving} />
        </div>
    )
}
