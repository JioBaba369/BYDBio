
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image";
import { PlusCircle, Eye, MousePointerClick, Calendar, Tags, List, LayoutGrid, Bell, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { type ListingWithAuthor } from "@/lib/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { ClientFormattedCurrency } from "@/components/client-formatted-currency";
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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  if (authLoading) {
    return <ListingPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Marketplace</h1>
          <p className="text-muted-foreground">Discover products and services from the community.</p>
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
      
      {initialListings.length > 0 ? (
        view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialListings.map((item) => (
            <Card key={item.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
              {item.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                    <Link href={`/l/${item.id}`}><Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" /></Link>
                  </div>
              )}
              <CardHeader className="p-4">
                <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                <CardTitle className="text-lg pt-1"><Link href={`/l/${item.id}`} className="hover:underline">{item.title}</Link></CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2 flex-grow">
                <p className="font-bold text-lg text-primary flex items-center gap-1"><DollarSign className="h-5 w-5" /><ClientFormattedCurrency value={item.price} /></p>
                {(item.startDate || item.endDate) && (
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" /> 
                      <span>
                          {item.startDate && <ClientFormattedDate date={item.startDate as string} />}
                          {item.endDate && <> - <ClientFormattedDate date={item.endDate as string} /></>}
                      </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-3 p-4 border-t">
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{item.views?.toLocaleString() ?? 0} Views</div>
                      <div className="flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" />{item.clicks?.toLocaleString() ?? 0} Clicks</div>
                      <div className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{item.followerCount?.toLocaleString() ?? 0} Following</div>
                  </div>
                  <Button asChild variant="secondary" className="w-full">
                      <Link href={`/l/${item.id}`}>
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
                {initialListings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.title} width={100} height={56} className="rounded-md object-cover hidden sm:block aspect-video" />
                          )}
                          <div className="space-y-1">
                            <Link href={`/l/${item.id}`} className="font-semibold hover:underline">{item.title}</Link>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={item.author.avatarUrl} />
                                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                by {item.author.name}
                              </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="secondary">{item.category}</Badge></TableCell>
                      <TableCell className="font-medium"><ClientFormattedCurrency value={item.price} /></TableCell>
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
