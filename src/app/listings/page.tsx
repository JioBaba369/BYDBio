
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Archive, Tags, Eye, MousePointerClick, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type Listing, deleteListing, updateListing, getAllListings, type ListingWithAuthor } from "@/lib/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ListingPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
);


export default function ListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<ListingWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getAllListings()
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, []);

  const handleArchive = async (listingId: string, currentStatus: 'active' | 'archived') => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await updateListing(listingId, { status: newStatus });
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));
      toast({ title: 'Listing status updated!' });
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedListingId) return;
    try {
      await deleteListing(selectedListingId);
      setListings(prev => prev.filter(listing => listing.id !== selectedListingId));
      toast({ title: 'Listing deleted!' });
    } catch (error) {
      toast({ title: 'Error deleting listing', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedListingId(null);
    }
  };
  
  const openDeleteDialog = (listingId: string) => {
    setSelectedListingId(listingId);
    setIsDeleteDialogOpen(true);
  }
  
  const activeListings = listings.filter(l => l.status === 'active');
  const archivedListings = user ? listings.filter(l => l.status === 'archived' && l.authorId === user.uid) : [];

  if (authLoading || isLoading) {
    return <ListingPageSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName="listing"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Product & Service Listings</h1>
            <p className="text-muted-foreground">Discover products, services, and digital goods from the community.</p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/listings/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Listing
              </Link>
            </Button>
          )}
        </div>
        
        {activeListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeListings.map((item) => {
              const isOwner = user && item.authorId === user.uid;
              return (
              <Card key={item.id} className="flex flex-col">
                {item.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg">
                    <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                    </div>
                )}
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{item.title}</CardTitle>
                     <CardDescription className="pt-2">
                        <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">by {item.author.name}</span>
                        </Link>
                    </CardDescription>
                  </div>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${item.id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4"/>Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(item.id, item.status)} className="cursor-pointer">
                          <Archive className="mr-2 h-4 w-4"/>Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(item.id)} className="text-destructive cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4"/>Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{item.category}</Badge>
                    <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                  </div>
                  {(item.startDate || item.endDate) && (
                    <div className="flex items-center pt-2 text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" /> 
                        <span>
                            {item.startDate && <ClientFormattedDate date={item.startDate as Date} />}
                            {item.endDate && <> - <ClientFormattedDate date={item.endDate as Date} /></>}
                        </span>
                    </div>
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="flex-col items-start gap-4 pt-4">
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
                        <Link href={`/l/${item.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Listing
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <CardTitle>No Listings Yet</CardTitle>
                <CardDescription>No one has posted a listing yet. Be the first!</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Tags className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            {user && (
              <CardFooter>
                  <Button asChild className="w-full">
                      <Link href="/listings/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Listing
                      </Link>
                  </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {archivedListings.length > 0 && (
           <div className="space-y-4 pt-8">
             <h2 className="text-xl font-bold font-headline">My Archived Listings</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedListings.map((item) => (
                <Card key={item.id} className="flex flex-col opacity-70">
                  {item.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg relative">
                        <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                        <Badge className="absolute top-2 right-2">Archived</Badge>
                    </div>
                  )}
                   <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
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
                  <CardContent className="flex-grow">
                     <div className="flex justify-between items-center">
                        <Badge variant="secondary">{item.category}</Badge>
                        <p className="font-bold text-lg">{formatCurrency(item.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
           </div>
        )}
      </div>
    </>
  );
}
