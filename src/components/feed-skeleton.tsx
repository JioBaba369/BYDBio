
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardHeader>
            <CardFooter className="flex justify-end">
                 <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
        
        {[...Array(2)].map((_, i) => (
            <Card key={i}>
                <div className="p-4 flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="w-full space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="h-8 flex justify-between">
                            <Skeleton className="h-full w-40" />
                            <Skeleton className="h-full w-8" />
                        </div>
                    </div>
                </div>
            </Card>
        ))}
    </div>
);
