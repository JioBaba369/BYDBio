
'use client';

import type { User } from '@/lib/users';
import type { Listing } from '@/lib/listings';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, DollarSign, Calendar, Edit, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency } from '@/lib/utils';
import { AuthorCard } from '@/components/author-card';
import { FollowButton } from '@/components/follow-button';


interface ListingDetailClientProps {
    listing: Listing;
    author: User;
}

export default function ListingDetailClient({ listing, author }: ListingDetailClientProps) {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser && currentUser.uid === author.uid;
    const isFollowing = currentUser?.subscriptions?.listings?.includes(listing.id) || false;
    
    return (
        <div className="bg-dot min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button asChild variant="ghost" className="pl-0">
                    <Link href={`/u/${author.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to {author.name}'s Profile
                    </Link>
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            {listing.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                                    <Image
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        width={800}
                                        height={500}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-3xl font-bold font-headline">{listing.title}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 pt-2">
                                            <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{listing.category}</Badge>
                                            {listing.subCategory && <Badge variant="outline">{listing.subCategory}</Badge>}
                                            <p className="font-bold text-2xl text-primary flex items-center"><DollarSign className="mr-1 h-6 w-6" />{formatCurrency(listing.price)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOwner && (
                                            <Button asChild variant="outline">
                                                <Link href={`/listings/${listing.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        <ShareButton variant="outline" />
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
                                <div className="flex w-full items-center gap-2">
                                    <Button asChild size="lg" className="w-full">
                                        <Link href={`/u/${author.username}`}>
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            View Seller's Profile
                                        </Link>
                                    </Button>
                                     {!isOwner && currentUser && (
                                        <FollowButton
                                            contentId={listing.id}
                                            contentType="listings"
                                            authorId={author.uid}
                                            entityTitle={listing.title}
                                            initialIsFollowing={isFollowing}
                                            initialFollowerCount={listing.followerCount || 0}
                                        />
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <AuthorCard author={author} isOwner={isOwner} authorTypeLabel="Seller" />
                    </div>
                </div>
            </div>
        </div>
    );
}
