'use client';

import { useState, useEffect } from 'react';
import type { Job, User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Calendar, MapPin, Edit, DollarSign, Clock, ExternalLink, UserPlus, UserCheck, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/connections';


interface OpportunityDetailClientProps {
    job: Job;
    author: User;
}

export default function OpportunityDetailClient({ job, author }: OpportunityDetailClientProps) {
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
                            {job.imageUrl && (
                                <div className="overflow-hidden rounded-t-lg h-52 sm:h-64 bg-muted">
                                    <Image
                                        src={job.imageUrl}
                                        alt={job.title}
                                        width={1200}
                                        height={400}
                                        className="w-full h-full object-cover"
                                        data-ai-hint="office workspace"
                                    />
                                </div>
                            )}
                            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div>
                                    <Badge variant="destructive" className="mb-2">{job.type}</Badge>
                                    <CardTitle className="text-3xl font-bold font-headline">{job.title}</CardTitle>
                                    <CardDescription className="text-lg pt-1 flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        {job.company}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    {isOwner && (
                                        <Button asChild variant="outline">
                                            <Link href={`/opportunities/${job.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Edit
                                            </Link>
                                        </Button>
                                    )}
                                    <ShareButton variant="outline" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">Location</p>
                                            <p className="text-muted-foreground">{job.location}</p>
                                        </div>
                                    </div>
                                    {job.remuneration && (
                                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                            <DollarSign className="h-5 w-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Salary</p>
                                                <p className="text-muted-foreground">{formatCurrency(job.remuneration)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {job.closingDate && (
                                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                            <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">Apply by</p>
                                                <p className="text-muted-foreground"><ClientFormattedDate date={job.closingDate as string} formatStr="PPP" /></p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                                </div>

                                {job.contactInfo && (
                                    <div className="mt-8">
                                        <h3 className="font-semibold text-lg mb-2">How to Apply</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{job.contactInfo}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {!isOwner && job.applicationUrl ? (
                                    <Button asChild size="lg" className="w-full">
                                        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Apply Online
                                        </a>
                                    </Button>
                                ) : !isOwner ? (
                                    <Button asChild size="lg" className="w-full">
                                        <Link href={`/u/${author.username}#contact`}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Contact to Apply
                                        </Link>
                                    </Button>
                                ) : null }
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">About the Poster</CardTitle>
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
                                <div className="mt-4 w-full space-y-2">
                                    <Button asChild className="w-full">
                                        <Link href={`/u/${author.username}#contact`}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Contact Poster
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
