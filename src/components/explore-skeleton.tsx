
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ContentCardSkeleton = () => (
    <Card>
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-3/4 mt-1" />
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
             <div className="flex items-center pt-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24 ml-2" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </CardContent>
        <CardHeader className="p-4 pt-0">
             <Skeleton className="h-10 w-full" />
        </CardHeader>
    </Card>
);

export const ExplorePageSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <Card>
            <CardContent className="p-4 space-y-4">
                 <Skeleton className="h-11 w-full" />
                 <Skeleton className="h-px w-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                 </div>
            </CardContent>
        </Card>
        <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-64" />
            <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <ContentCardSkeleton key={i} />
            ))}
        </div>
    </div>
);
