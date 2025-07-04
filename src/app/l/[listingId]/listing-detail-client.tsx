
'use client';

import type { Listing, User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, DollarSign, MessageSquare, Calendar, Edit, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency } from '@/lib/utils';


interface ListingDetailClientProps {
    listing: Listing;
    author: User;
}

export default function ListingDetailClient({ listing, author }: ListingDetailClientProps) {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser && currentUser.uid === author.uid;

    return (
        <div className="bg-muted/40 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button asChild variant="ghost" className="pl-0">
                    <Link href={`/u/${author.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {author.name}'s Profile
                    </Link>
                </Button>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            {listing.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg h-64 sm:h-80 bg-muted">
                                    <Image
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        width={800}
                                        height={500}
                                        className="w-full h-full object-cover"
                                        data-ai-hint="product design"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-3xl font-bold font-headline">{listing.title}</CardTitle>
                                        <div className="flex items-center gap-4 pt-2">
                                            <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{listing.category}</Badge>
                                            <p className="font-bold text-2xl text-primary flex items-center"><DollarSign className="mr-1 h-6 w-6" />{formatCurrency(listing.price)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOwner && (
                                            <Button asChild variant="secondary">
                                                <Link href={`/listings/${listing.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        <ShareButton />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {(listing.startDate || listing.endDate) && (
                                    <div className="flex items-center pt-2 text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" /> 
                                        <span>
                                            {listing.startDate && <ClientFormattedDate date={listing.startDate as string} formatStr="PPP" />}
                                            {listing.endDate && <> - <ClientFormattedDate date={listing.endDate as string} formatStr="PPP" /></>}
                                        </span>
                                    </div>
                                )}
                                <h3 className="font-semibold text-lg mb-2 mt-4">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild size="lg" className="w-full">
                                    <Link href={`/u/${author.username}#contact`}>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {listing.listingType === 'rental' ? 'Rent Now' : 'Buy Now'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About the Seller</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center text-center">
                                <Link href={`/u/${author.username}`} className="block">
                                  <Avatar className="h-20 w-20 mb-2">
                                    <AvatarImage src={author.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{author.avatarFallback}</AvatarFallback>
                                  </Avatar>
                                </Link>
                                <Link href={`/u/${author.username}`} className="font-semibold hover:underline">{author.name}</Link>
                                <p className="text-sm text-muted-foreground">@{author.handle}</p>
                                <Button asChild className="mt-4 w-full">
                                    <Link href={`/u/${author.username}#contact`}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Contact Seller
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
