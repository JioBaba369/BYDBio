
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedSkeleton = () => (
    <div className="space-y-6">
        <Card><CardContent className="p-4"><Skeleton className="h-32" /></CardContent></Card>
        <Card><CardHeader className="p-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div></CardHeader><CardContent className="p-4 pt-0 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent><CardFooter className="p-4 border-t"><Skeleton className="h-8 w-full" /></CardFooter></Card>
        <Card><CardHeader className="p-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div></CardHeader><CardContent className="p-4 pt-0 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent><CardFooter className="p-4 border-t"><Skeleton className="h-8 w-full" /></CardFooter></Card>
    </div>
);
