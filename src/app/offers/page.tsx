
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Calendar, PlusCircle, DollarSign, Eye, Gift, ExternalLink, List, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type OfferWithAuthor, getAllOffers } from "@/lib/offers";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    setIsLoading(true);
    getAllOffers()
      .then(setOffers)
      .finally(() => setIsLoading(false));
  }, []);

  if (authLoading || isLoading) {
    return <OfferPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Offers</h1>
          <p className="text-muted-foreground">Discover special offers and deals from the community.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-md bg-muted p-1">
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                  <List className="h-4 w-4" />
              </Button>
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                  <LayoutGrid className="h-4 w-4" />
              </Button>
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
      </div>

      {offers.length > 0 ? (
        view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex flex-col">
              {offer.imageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <Image src={offer.imageUrl} alt={offer.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="special offer" />
                </div>
              )}
              <CardHeader>
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
                        View Details
                      </Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        ) : (
            <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Stats</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.title} width={100} height={56} className="rounded-md object-cover hidden sm:block aspect-video" data-ai-hint="special offer" />
                          )}
                          <div className="space-y-1">
                            <Link href={`/offer/${item.id}`} className="font-semibold hover:underline">{item.title}</Link>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                by {item.author.name}
                              </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="secondary">{item.category}</Badge></TableCell>
                      <TableCell className="text-sm">
                          <div><span className="font-medium">Starts:</span> <ClientFormattedDate date={item.startDate as Date} formatStr="MMM d, yyyy" /></div>
                          {item.endDate && <div><span className="font-medium">Ends:</span> <ClientFormattedDate date={item.endDate as Date} formatStr="MMM d, yyyy" /></div>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views?.toLocaleString() ?? 0}</div>
                          <div className="flex items-center gap-1"><Gift className="h-3 w-3" />{item.claims?.toLocaleString() ?? 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                              <Link href={`/offer/${item.id}`}>View Details</Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        )
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
    </div>
  );
}
