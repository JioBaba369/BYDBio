
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { currentUser } from "@/lib/mock-data";
import Image from "next/image";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Archive, Tags, Eye, MousePointerClick, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Listing } from "@/lib/users";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Separator } from "@/components/ui/separator";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>(currentUser.listings);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleArchive = (listingId: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === listingId ? { ...listing, status: listing.status === 'active' ? 'archived' : 'active' } : listing
    ));
    toast({ title: 'Listing status updated!' });
  };

  const handleDelete = () => {
    if (!selectedListingId) return;
    setListings(prev => prev.filter(listing => listing.id !== selectedListingId));
    toast({ title: 'Listing deleted!' });
    setIsDeleteDialogOpen(false);
    setSelectedListingId(null);
  };
  
  const openDeleteDialog = (listingId: string) => {
    setSelectedListingId(listingId);
    setIsDeleteDialogOpen(true);
  }
  
  const activeListings = listings.filter(l => l.status === 'active');
  const archivedListings = listings.filter(l => l.status === 'archived');

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
            <p className="text-muted-foreground">Manage your products, services, and digital goods.</p>
          </div>
          <Button asChild>
            <Link href="/listings/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Listing
            </Link>
          </Button>
        </div>
        
        {activeListings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeListings.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <div className="overflow-hidden rounded-t-lg">
                  <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                </div>
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
                      <DropdownMenuItem asChild><Link href={`/listings/${item.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(item.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(item.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{item.category}</Badge>
                    <p className="font-bold text-lg">{item.price}</p>
                  </div>
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
                        <Link href="#">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Listing
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <CardTitle>No Listings Yet</CardTitle>
                <CardDescription>Get started by creating your first listing.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Tags className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/listings/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Listing
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        )}

        {archivedListings.length > 0 && (
           <div className="space-y-4">
             <h2 className="text-xl font-bold font-headline">Archived Listings</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedListings.map((item) => (
                <Card key={item.id} className="flex flex-col opacity-70">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                    <Badge className="absolute top-2 right-2">Archived</Badge>
                  </div>
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
                        <DropdownMenuItem onClick={() => handleArchive(item.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Unarchive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(item.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <div className="flex justify-between items-center">
                        <Badge variant="secondary">{item.category}</Badge>
                        <p className="font-bold text-lg">{item.price}</p>
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
