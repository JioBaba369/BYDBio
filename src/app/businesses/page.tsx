
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Archive, Globe, Mail, Phone, MapPin, Eye, MousePointerClick, ExternalLink, Building2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type Business, getBusinessesByUser, deleteBusiness, updateBusiness } from "@/lib/businesses";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <Skeleton className="h-52 w-full rounded-t-lg" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
            <Card>
                <Skeleton className="h-52 w-full rounded-t-lg" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    </div>
);

export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      getBusinessesByUser(user.uid)
        .then(setBusinesses)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleArchive = async (businessId: string, currentStatus: 'active' | 'archived') => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await updateBusiness(businessId, { status: newStatus });
      setBusinesses(prev => prev.map(business => 
        business.id === businessId ? { ...business, status: newStatus } : business
      ));
      toast({ title: 'Business page status updated!' });
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedBusinessId) return;
    try {
      await deleteBusiness(selectedBusinessId);
      setBusinesses(prev => prev.filter(business => business.id !== selectedBusinessId));
      toast({ title: 'Business page deleted!' });
    } catch (error) {
      toast({ title: 'Error deleting business', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBusinessId(null);
    }
  };
  
  const openDeleteDialog = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setIsDeleteDialogOpen(true);
  }
  
  const activeBusinesses = businesses.filter(b => b.status === 'active');
  const archivedBusinesses = businesses.filter(b => b.status === 'archived');
  
  if (authLoading || isLoading) {
    return <BusinessPageSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName="business page"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">My Business Pages</h1>
            <p className="text-muted-foreground">Manage your business profiles and information.</p>
          </div>
          <Button asChild>
            <Link href="/businesses/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Business Page
            </Link>
          </Button>
        </div>
        
        {activeBusinesses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {activeBusinesses.map((item) => (
              <Card key={item.id} className="flex flex-col">
                {item.imageUrl &&
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" data-ai-hint="office storefront"/>
                  </div>
                }
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/businesses/${item.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(item.id, item.status)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(item.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-muted-foreground">
                        {item.email && <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.email}</span></div>}
                        {item.phone && <div className="flex items-center gap-2 truncate"><Phone className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.phone}</span></div>}
                        {item.website && <div className="flex items-center gap-2 truncate"><Globe className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.website}</span></div>}
                        {item.address && <div className="flex items-center gap-2 truncate col-span-2"><MapPin className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.address}</span></div>}
                    </div>
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex-col items-start gap-4">
                    <div className="flex justify-between w-full">
                        <div className="flex items-center text-sm font-medium">
                            <Eye className="mr-2 h-4 w-4 text-primary" />
                            <span>{item.views?.toLocaleString() ?? 0} views</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                            <MousePointerClick className="mr-2 h-4 w-4 text-primary" />
                            <span>{item.clicks?.toLocaleString() ?? 0} clicks</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/b/${item.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Public Page
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <CardTitle>No Business Pages Yet</CardTitle>
                <CardDescription>Get started by creating your first business page.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Building2 className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/businesses/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Business Page
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        )}

        {archivedBusinesses.length > 0 && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold font-headline">Archived Business Pages</h2>
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {archivedBusinesses.map((item) => (
                <Card key={item.id} className="flex flex-col opacity-70">
                  <div className="overflow-hidden rounded-t-lg relative">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" data-ai-hint="office building"/> }
                    <Badge className="absolute top-2 right-2">Archived</Badge>
                  </div>
                   <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleArchive(item.id, item.status)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Unarchive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(item.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                </Card>
              ))}
            </div>
           </div>
        )}
      </div>
    </>
  );
}
