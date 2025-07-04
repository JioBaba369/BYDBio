'use client';

import type { Job, User } from '@/lib/users';
import Image from 'next/image';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Calendar, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ShareButton from '@/components/share-button';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/components/auth-provider';


interface OpportunityDetailClientProps {
    job: Job;
    author: User;
}

export default function OpportunityDetailClient({ job, author }: OpportunityDetailClientProps) {
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
                            {isOwner ? (
                                <Button asChild size="lg" className="flex-1 sm:flex-none">
                                    <Link href={`/opportunities/${job.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4"/>
                                        Edit
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="flex-1 sm:flex-none">Apply Now</Button>
                            )}
                            <ShareButton variant="outline" size="lg" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-muted-foreground mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                            </div>
                             {(job.startDate || job.endDate) && (
                                <div className="flex items-center pt-2">
                                    <Calendar className="mr-2 h-4 w-4" /> 
                                    <span>
                                        {job.startDate && <ClientFormattedDate date={job.startDate as string} formatStr="PPP" />}
                                        {job.endDate && <> - <ClientFormattedDate date={job.endDate as string} formatStr="PPP" /></>}
                                    </span>
                                </div>
                            )}
                        </div>

                         <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                This is a placeholder for the full job description. In a real application, this would contain detailed information about the role, responsibilities, and qualifications.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <h3 className="font-semibold text-lg mb-4">About the Poster</h3>
                             <Link href={`/u/${author.username}`} className="flex items-center gap-4 group">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={author.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{author.avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold group-hover:underline">{author.name}</p>
                                    <p className="text-sm text-muted-foreground">@{author.handle}</p>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
