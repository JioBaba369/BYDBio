

import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedSkeletonProps {
    count?: number;
}

export const FeedSkeleton = ({ count = 2 }: FeedSkeletonProps) => {
    return (
        <div className="space-y-6">
            {count === 2 && ( // Only show the posting card skeleton on initial full load
                <Card>
                    <CardHeader>
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-9 w-24" />
                    </CardFooter>
                </Card>
            )}
            
            {[...Array(count)].map((_, i) => (
                <Card key={i}>
                    <div className="p-4 flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="w-full space-y-3">
                            <div className="flex justify-between">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="w-full aspect-video rounded-lg" />
                            <div className="h-8 flex justify-start gap-2 pt-2">
                                <Skeleton className="h-full w-16" />
                                <Skeleton className="h-full w-16" />
                                <Skeleton className="h-full w-16" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
