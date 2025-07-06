'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import { PlusCircle, Eye, MousePointerClick, ExternalLink, Calendar, Tags, List, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type ListingWithAuthor } from "@/lib/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function ListingsClient({ initialListings }: { initialListings: ListingWithAuthor[] }) {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<ListingWithAuthor[]>(initialListings);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);
  
  if (authLoading) {
    return <ListingPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Product & Service Listings</h1>
          <p className="text-muted-foreground">Discover products, services, and digital goods from the community.</p>
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
              <Link href="/listings/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Listing
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {listings.length > 0 ? (
        view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <Card key={item.id} className="flex flex-col">
              {item.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                  <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                  </div>
              )}
              <CardHeader>
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
                          {item.startDate && <ClientFormattedDate date={item.startDate as string} />}
                          {item.endDate && <> - <ClientFormattedDate date={item.endDate as string} /></>}
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
                  <TableHead>Listing</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Stats</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.title} width={100} height={56} className="rounded-md object-cover hidden sm:block aspect-video" data-ai-hint="product design" />
                          )}
                          <div className="space-y-1">
                            <Link href={`/l/${item.id}`} className="font-semibold hover:underline">{item.title}</Link>
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
                      <TableCell className="font-medium">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views?.toLocaleString() ?? 0}</div>
                          <div className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{item.clicks?.toLocaleString() ?? 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                              <Link href={`/l/${item.id}`}>View Details</Link>
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
    </div>
  );
}
