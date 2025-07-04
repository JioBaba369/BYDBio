'use client';

import type { Offer, User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, Calendar, Gift, MessageSquare, Edit } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/components/auth-provider';


interface OfferDetailClientProps {
    offer: Offer;
    author: User;
}

export default function OfferDetailClient({ offer, author }: OfferDetailClientProps) {
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
                            {offer.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg h-64 sm:h-80 bg-muted">
                                    <Image
                                        src={offer.imageUrl}
                                        alt={offer.title}
                                        width={800}
                                        height={500}
                                        className="w-full h-full object-cover"
                                        data-ai-hint="special offer"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Badge variant="secondary" className="w-fit"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                                        <CardTitle className="text-3xl font-bold font-headline pt-2">{offer.title}</CardTitle>
                                        <CardDescription className="text-base pt-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" /> 
                                            <span>
                                                Starts: <ClientFormattedDate date={offer.startDate as string} formatStr="PPP" />
                                                {offer.endDate && <>, Ends: <ClientFormattedDate date={offer.endDate as string} formatStr="PPP" /></>}
                                            </span>
                                        </div>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOwner && (
                                            <Button asChild variant="secondary">
                                                <Link href={`/offers/${offer.id}/edit`}>
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
                                <h3 className="font-semibold text-lg mb-2">About this offer</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
                            </CardContent>
                             <CardFooter>
                                <Button size="lg" className="w-full">
                                    <Gift className="mr-2 h-5 w-5" />
                                    Claim Offer
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About the Provider</CardTitle>
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
                                        Contact
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
