'use client';

import { useState, useEffect } from 'react';
import { type Business, type User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, MapPin, ArrowLeft, Edit, UserPlus, UserCheck, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import ShareButton from '@/components/share-button';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/connections';

interface BusinessPageClientProps {
    business: Business;
    author: User;
}

export default function BusinessPageClient({ business, author }: BusinessPageClientProps) {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const isOwner = currentUser && currentUser.uid === author.uid;
    
    const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(author.uid) || false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(currentUser?.following?.includes(author.uid) || false);
    }, [currentUser, author.uid]);
    
    const handleFollowToggle = async () => {
        if (!currentUser) {
            toast({ title: "Please sign in to follow users.", variant: "destructive" });
            return;
        }
        if (currentUser.uid === author.uid) return;

        setIsFollowLoading(true);
        const currentlyFollowing = isFollowing;

        try {
            if (currentlyFollowing) {
                await unfollowUser(currentUser.uid, author.uid);
                toast({ title: `Unfollowed ${author.name}` });
            } else {
                await followUser(currentUser.uid, author.uid);
                toast({ title: `You are now following ${author.name}` });
            }
            setIsFollowing(!currentlyFollowing);
        } catch (error) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsFollowLoading(false);
        }
    };


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
                            {business.imageUrl && (
                                 <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                                    <Image 
                                        src={business.imageUrl} 
                                        alt={business.name} 
                                        width={1200} 
                                        height={400} 
                                        className="w-full h-full object-cover"
                                        data-ai-hint="office storefront"
                                    />
                                </div>
                            )}
                            <CardContent className="p-6">
                                 <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16">
                                    {business.logoUrl && (
                                        <Image
                                            src={business.logoUrl}
                                            alt={`${business.name} logo`}
                                            width={120}
                                            height={120}
                                            className="rounded-full border-4 border-background bg-background shrink-0"
                                            data-ai-hint="logo"
                                        />
                                    )}
                                    <div className="pt-16 flex-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-3xl font-bold font-headline">{business.name}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                {isOwner && (
                                                    <Button asChild variant="secondary">
                                                        <Link href={`/businesses/${business.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                                <ShareButton />
                                            </div>
                                        </div>
                                        <CardDescription className="text-base pt-2">{business.description}</CardDescription>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg">Contact Information</h3>
                                    <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground">
                                        {business.address && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                                <span>{business.address}</span>
                                            </div>
                                        )}
                                        {business.email && (
                                            <a href={`mailto:${business.email}`} className="flex items-center gap-3 hover:text-primary">
                                                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{business.email}</span>
                                            </a>
                                        )}
                                        {business.phone && (
                                            <a href={`tel:${business.phone}`} className="flex items-center gap-3 hover:text-primary">
                                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{business.phone}</span>
                                            </a>
                                        )}
                                        {business.website && (
                                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary">
                                                <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span>{business.website.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About the Owner</CardTitle>
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
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button asChild className="w-full">
                                    <Link href={`/u/${author.username}#contact`}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Contact Owner
                                    </Link>
                                </Button>
                                {currentUser && !isOwner && (
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleFollowToggle}
                                        disabled={isFollowLoading}
                                    >
                                        {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}