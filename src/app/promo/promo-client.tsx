'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { PlusCircle, Globe, Mail, Phone, MapPin, Eye, MousePointerClick, ExternalLink, Building2, List, LayoutGrid, Megaphone, MoreHorizontal, Edit, Trash2, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { deletePromoPage, type PromoPageWithAuthor } from "@/lib/promo-pages";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

const PromoPageSkeleton = () => (
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

export default function PromoClient({ initialPromoPages }: { initialPromoPages: PromoPageWithAuthor[] }) {
  const { user, loading: authLoading } = useAuth();
  const [promoPages, setPromoPages] = useState<PromoPageWithAuthor[]>(initialPromoPages);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promoPageToDelete, setPromoPageToDelete] = useState<PromoPageWithAuthor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPromoPages(initialPromoPages);
  }, [initialPromoPages]);
  
  const openDeleteDialog = (promoPage: PromoPageWithAuthor) => {
    setPromoPageToDelete(promoPage);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promoPageToDelete) return;
    try {
      await deletePromoPage(promoPageToDelete.id);
      setPromoPages(prev => prev.filter(p => p.id !== promoPageToDelete.id));
      toast({ title: "Promo Page Deleted" });
    } catch (error) {
      console.error("Error deleting promo page:", error);
      toast({ title: "Failed to delete promo page", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setPromoPageToDelete(null);
    }
  };

  if (authLoading) {
    return <PromoPageSkeleton />;
  }

  return (
    <>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemName="promo page"
        itemDescription="This action cannot be undone. This will permanently delete this promo page."
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Business Pages</h1>
            <p className="text-muted-foreground">Discover business pages and company profiles from the community.</p>
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
                <Link href="/promo/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Page
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {promoPages.length > 0 ? (
          view === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {promoPages.map((item) => (
              <Card key={item.id} className="flex flex-col">
                {item.imageUrl &&
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" />
                  </div>
                }
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription className="pt-2">
                              <Link href={`/u/${item.author.username}`} className="flex items-center gap-2 hover:underline">
                                  <Avatar className="h-6 w-6">
                                      <AvatarImage src={item.author.avatarUrl} />
                                      <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">by {item.author.name}</span>
                              </Link>
                          </CardDescription>
                      </div>
                      {user?.uid === item.author.uid && (
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild><Link href={`/promo/${item.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      )}
                  </div>
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
                    <div className="flex justify-between w-full text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{item.views?.toLocaleString() ?? 0} Views</div>
                        <div className="flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" />{item.clicks?.toLocaleString() ?? 0} Clicks</div>
                        <div className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{item.followerCount?.toLocaleString() ?? 0} Following</div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/p/${item.id}`}>
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
                    <TableHead>Business Page</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell text-center">Stats</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoPages.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {item.logoUrl && (
                              <Image src={item.logoUrl} alt={item.name} width={40} height={40} className="rounded-full object-contain bg-background hidden sm:block aspect-square" />
                            )}
                            <div className="space-y-1">
                              <Link href={`/p/${item.id}`} className="font-semibold hover:underline">{item.name}</Link>
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
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {item.email && <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.email}</span></div>}
                            {item.website && <div className="flex items-center gap-2 truncate"><Globe className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.website}</span></div>}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views?.toLocaleString() ?? 0}</div>
                            <div className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{item.clicks?.toLocaleString() ?? 0}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {user?.uid === item.author.uid ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild><Link href={`/p/${item.id}`} className="cursor-pointer"><ExternalLink className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                                  <DropdownMenuItem asChild><Link href={`/promo/${item.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDeleteDialog(item)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/p/${item.id}`}>View Details</Link>
                              </Button>
                            )}
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
                <CardTitle>No Business Pages Yet</CardTitle>
                <CardDescription>Get started by creating your first business page.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Megaphone className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            {user && (
              <CardFooter>
                  <Button asChild className="w-full">
                      <Link href="/promo/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Page
                      </Link>
                  </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
