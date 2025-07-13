import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConnectionCardSkeleton = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </CardContent>
    </Card>
);

export const ConnectionsPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-40" />
        </div>
        <Tabs defaultValue="followers">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="followers"><Skeleton className="h-5 w-28" /></TabsTrigger>
                <TabsTrigger value="following"><Skeleton className="h-5 w-28" /></TabsTrigger>
                <TabsTrigger value="suggestions"><Skeleton className="h-5 w-28" /></TabsTrigger>
            </TabsList>
            <TabsContent value="followers" className="flex flex-col gap-4 pt-4">
                <ConnectionCardSkeleton />
                <ConnectionCardSkeleton />
                <ConnectionCardSkeleton />
            </TabsContent>
        </Tabs>
    </div>
);
