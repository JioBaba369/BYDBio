
'use client';

import type { User } from '@/lib/users';
import type { Job } from '@/lib/jobs';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, MapPin, Edit, DollarSign, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { ClientFormattedCurrency } from '@/components/client-formatted-currency';
import { useAuth } from '@/components/auth-provider';
import { AuthorCard } from '@/components/author-card';
import { FollowButton } from '@/components/follow-button';


interface JobDetailClientProps {
    job: Job;
    author: User;
}

export default function JobDetailClient({ job, author }: JobDetailClientProps) {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser && currentUser.uid === author.uid;
    const isFollowing = currentUser?.subscriptions?.jobs?.includes(job.id) || false;
    
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
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant="destructive">{job.type}</Badge>
                                        {job.category && <Badge variant="secondary">{job.category}</Badge>}
                                        {job.subCategory && <Badge variant="outline">{job.subCategory}</Badge>}
                                    </div>
                                    <CardTitle className="text-3xl font-bold font-headline">{job.title}</CardTitle>
                                    <CardDescription className="text-lg pt-1 flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        {job.company}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    {isOwner && (
                                        <Button asChild variant="outline">
                                            <Link href={`/job/${job.id}/edit`}>
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
                                                <p className="text-muted-foreground"><ClientFormattedCurrency value={job.remuneration} /></p>
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
                                <div className="flex w-full items-center gap-2">
                                    {!isOwner && job.applicationUrl && (
                                        <Button asChild size="lg" className="flex-1">
                                            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Apply Online
                                            </a>
                                        </Button>
                                    )}
                                     {!isOwner && currentUser && (
                                        <FollowButton
                                            contentId={job.id}
                                            contentType="jobs"
                                            authorId={author.uid}
                                            entityTitle={`${job.title} at ${job.company}`}
                                            initialIsFollowing={isFollowing}
                                        />
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="md:col-span-1 space-y-6">
                        <AuthorCard author={author} isOwner={isOwner} authorTypeLabel="Poster" />
                    </div>
                </div>
            </div>
        </div>
    );
}
