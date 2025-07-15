
'use client';

import type { User } from '@/lib/users';
import type { PromoPage } from '@/lib/promo-pages';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, MapPin, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import ShareButton from '@/components/share-button';
import { useAuth } from '@/components/auth-provider';
import { AuthorCard } from '@/components/author-card';
import { FollowButton } from '@/components/follow-button';
import { Badge } from '@/components/ui/badge';

interface PromoPageClientProps {
    promoPage: PromoPage;
    author: User;
}

export default function PromoPageClient({ promoPage, author }: PromoPageClientProps) {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser && currentUser.uid === author.uid;
    const isFollowing = currentUser?.subscriptions?.promoPages?.includes(promoPage.id) || false;
    
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
                            {promoPage.imageUrl && (
                                 <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                                    <Image 
                                        src={promoPage.imageUrl} 
                                        alt={promoPage.name} 
                                        width={1200} 
                                        height={400} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardContent className="p-6">
                                 <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16">
                                    {promoPage.logoUrl && (
                                        <Image
                                            src={promoPage.logoUrl}
                                            alt={`${promoPage.name} logo`}
                                            width={120}
                                            height={120}
                                            className="rounded-full border-4 border-background bg-background shrink-0"
                                        />
                                    )}
                                    <div className="pt-16 flex-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-3xl font-bold font-headline">{promoPage.name}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                {isOwner && (
                                                    <Button asChild variant="outline">
                                                        <Link href={`/promo/${promoPage.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                                {!isOwner && currentUser && (
                                                    <FollowButton
                                                        contentId={promoPage.id}
                                                        contentType="promoPages"
                                                        authorId={author.uid}
                                                        entityTitle={promoPage.name}
                                                        initialIsFollowing={isFollowing}
                                                    />
                                                )}
                                                <ShareButton variant="outline" />
                                            </div>
                                        </div>
                                         <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {promoPage.category && <Badge variant="secondary">{promoPage.category}</Badge>}
                                            {promoPage.subCategory && <Badge variant="outline">{promoPage.subCategory}</Badge>}
                                        </div>
                                        <CardDescription className="text-base pt-2">{promoPage.description}</CardDescription>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg">Contact Information</h3>
                                    <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground">
                                        {promoPage.address && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                                <span>{promoPage.address}</span>
                                            </div>
                                        )}
                                        {promoPage.email && (
                                            <a href={`mailto:${promoPage.email}`} className="flex items-center gap-3 hover:text-primary">
                                                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{promoPage.email}</span>
                                            </a>
                                        )}
                                        {promoPage.phone && (
                                            <a href={`tel:${promoPage.phone}`} className="flex items-center gap-3 hover:text-primary">
                                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{promoPage.phone}</span>
                                            </a>
                                        )}
                                        {promoPage.website && (
                                            <a href={promoPage.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary">
                                                <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{promoPage.website.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="md:col-span-1 space-y-6">
                        <AuthorCard author={author} isOwner={isOwner} authorTypeLabel="Owner" />
                    </div>
                </div>
            </div>
        </div>
    );
}
