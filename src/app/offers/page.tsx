
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Calendar, PlusCircle, MoreHorizontal, Edit, Archive, Trash2, DollarSign, Eye, Gift, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type Offer, deleteOffer, updateOffer, getAllOffers, type OfferWithAuthor } from "@/lib/offers";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OfferPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-5 w-48" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
);

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<OfferWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsLoading(true);
    getAllOffers()
      .then(setOffers)
      .finally(() => setIsLoading(false));
  }, []);

  const handleArchive = async (offerId: string, currentStatus: 'active' | 'archived') => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      await updateOffer(offerId, { status: newStatus });
      setOffers(prev => prev.map(offer => 
        offer.id === offerId ? { ...offer, status: newStatus } : offer
      ));
      toast({ title: 'Offer status updated!' });
    } catch (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedOfferId) return;
    try {
      await deleteOffer(selectedOfferId);
      setOffers(prev => prev.filter(offer => offer.id !== selectedOfferId));
      toast({ title: 'Offer deleted!' });
    } catch (error) {
      toast({ title: 'Error deleting offer', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedOfferId(null);
    }
  };
  
  const openDeleteDialog = (offerId: string) => {
    setSelectedOfferId(offerId);
    setIsDeleteDialogOpen(true);
  }
  
  const activeOffers = offers.filter(o => o.status === 'active');
  const archivedOffers = user ? offers.filter(o => o.status === 'archived' && o.authorId === user.uid) : [];

  if (authLoading || isLoading) {
    return <OfferPageSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName="offer"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Offers</h1>
            <p className="text-muted-foreground">Discover special offers and deals from the community.</p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/offers/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Offer
              </Link>
            </Button>
          )}
        </div>

        {activeOffers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeOffers.map((offer) => {
              const isOwner = user && offer.authorId === user.uid;
              return (
              <Card key={offer.id} className="flex flex-col">
                {offer.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={offer.imageUrl} alt={offer.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="special offer" />
                  </div>
                )}
                <CardHeader className="flex flex-row justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{offer.title}</CardTitle>
                    <CardDescription className="pt-2">
                        <Link href={`/u/${offer.author.username}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={offer.author.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback>{offer.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">by {offer.author.name}</span>
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
                        <DropdownMenuItem asChild><Link href={`/offers/${offer.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(offer.id, offer.status)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(offer.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                  <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                   <div className="flex items-center pt-2 text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> 
                    <span>
                        Starts: <ClientFormattedDate date={offer.startDate as Date} />
                        {offer.endDate && <>, Ends: <ClientFormattedDate date={offer.endDate as Date} /></>}
                    </span>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex-col items-start gap-4 pt-4">
                    <div className="flex justify-between w-full">
                        <div className="flex items-center text-sm font-medium">
                            <Eye className="mr-2 h-4 w-4 text-primary" />
                            <span>{offer.views?.toLocaleString() ?? 0} views</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                            <Gift className="mr-2 h-4 w-4 text-primary" />
                            <span>{offer.claims?.toLocaleString() ?? 0} claims</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/offer/${offer.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Offer
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <CardTitle>No Active Offers</CardTitle>
                <CardDescription>No one has posted an offer yet. Be the first!</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <DollarSign className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            {user && (
              <CardFooter>
                  <Button asChild className="w-full">
                      <Link href="/offers/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Offer
                      </Link>
                  </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {archivedOffers.length > 0 && (
          <div className="space-y-4 pt-8">
             <h2 className="text-xl font-bold font-headline">My Archived Offers</h2>
             <div className="grid gap-6 md:grid-cols-2">
              {archivedOffers.map((offer) => (
                <Card key={offer.id} className="flex flex-col opacity-70">
                  {offer.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg relative">
                      <Image src={offer.imageUrl} alt={offer.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="special offer" />
                      <Badge className="absolute top-2 right-2">Archived</Badge>
                    </div>
                  )}
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{offer.title}</CardTitle>
                      <CardDescription>{offer.description}</CardDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleArchive(offer.id, offer.status)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Unarchive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(offer.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-2 flex-grow">
                    <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                     <div className="flex items-center pt-2 text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> 
                      <span>
                          Starts: <ClientFormattedDate date={offer.startDate as Date} />
                          {offer.endDate && <>, Ends: <ClientFormattedDate date={offer.endDate as Date} /></>}
                      </span>
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
