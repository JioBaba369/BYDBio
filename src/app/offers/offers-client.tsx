
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PlusCircle, Eye, Gift, ExternalLink, List, LayoutGrid, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { type OfferWithAuthor } from "@/lib/offers";
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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

export default function OffersClient({ initialOffers }: { initialOffers: OfferWithAuthor[] }) {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<OfferWithAuthor[]>(initialOffers);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setOffers(initialOffers);
  }, [initialOffers]);
  
  if (authLoading) {
    return <OfferPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Community Offers</h1>
          <p className="text-muted-foreground">Discover special offers, deals, and promotions.</p>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
              {offer.imageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <Link href={`/offer/${offer.id}`}><Image src={offer.imageUrl} alt={offer.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="special offer" /></Link>
                </div>
              )}
              <CardHeader className="p-4">
                <Badge variant="secondary" className="w-fit">{offer.category}</Badge>
                <CardTitle className="text-lg pt-1"><Link href={`/offer/${offer.id}`} className="hover:underline">{offer.title}</Link></CardTitle>
                <CardDescription className="pt-1">
                    <Link href={`/u/${offer.author.username}`} className="flex items-center gap-2 hover:underline">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={offer.author.avatarUrl} data-ai-hint="person portrait" />
                            <AvatarFallback>{offer.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">by {offer.author.name}</span>
                    </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                <div className="flex items-center pt-2 text-xs text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> 
                    <span>
                        <ClientFormattedDate date={offer.startDate as string} />
                        {offer.endDate && <> - <ClientFormattedDate date={offer.endDate as string} /></>}
                    </span>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-3 p-4 border-t">
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{offer.views?.toLocaleString() ?? 0} Views</div>
                      <div className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" />{offer.claims?.toLocaleString() ?? 0} Claims</div>
                      <div className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{offer.followerCount?.toLocaleString() ?? 0} Following</div>
                  </div>
                  <Button asChild variant="secondary" className="w-full">
                      <Link href={`/offer/${offer.id}`}>
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
                          <div><span className="font-medium">Starts:</span> <ClientFormattedDate date={item.startDate as string} formatStr="MMM d, yyyy" /></div>
                          {item.endDate && <div><span className="font-medium">Ends:</span> <ClientFormattedDate date={item.endDate as string} formatStr="MMM d, yyyy" /></div>}
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
              <Gift className="h-16 w-16 text-muted-foreground" />
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
