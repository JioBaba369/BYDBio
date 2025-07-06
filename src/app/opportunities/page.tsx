
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, PlusCircle, Eye, Users, DollarSign, Clock, ExternalLink, List, LayoutGrid } from "lucide-react"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { type JobWithAuthor, getAllJobs } from "@/lib/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const JobPageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
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
            ))}
        </div>
    </div>
);

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setIsLoading(true);
    getAllJobs()
      .then(setJobs)
      .finally(() => setIsLoading(false));
  }, []);

  if (authLoading || isLoading) {
    return <JobPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Jobs</h1>
          <p className="text-muted-foreground">Discover curated jobs to boost your career.</p>
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
              <Link href="/opportunities/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Job
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {jobs.length > 0 ? (
        view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col">
              {job.imageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office workspace" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
                  <CardDescription className="pt-2">
                      <Link href={`/u/${job.author.username}`} className="flex items-center gap-2 hover:underline">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={job.author.avatarUrl} data-ai-hint="person portrait" />
                              <AvatarFallback>{job.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">by {job.author.name}</span>
                      </Link>
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" /> {job.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                </div>
                  {job.remuneration && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" /> {formatCurrency(job.remuneration)}
                  </div>
                )}
                {job.closingDate && (
                  <div className="flex items-center pt-2 text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" /> 
                      <span>
                          Closes: <ClientFormattedDate date={job.closingDate as Date} />
                      </span>
                  </div>
                )}
              </CardContent>
              <Separator/>
              <CardFooter className="flex-col items-start gap-4 pt-4">
                  <div className="flex justify-between w-full">
                      <div className="flex items-center text-sm font-medium">
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          <span>{job.views?.toLocaleString() ?? 0} views</span>
                      </div>
                      <div className="flex items-center text-sm font-medium">
                          <Users className="mr-2 h-4 w-4 text-primary" />
                          <span>{job.applicants?.toLocaleString() ?? 0} applicants</span>
                      </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/o/${job.id}`}>
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
                  <TableHead>Job</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Stats</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link href={`/o/${job.id}`} className="font-semibold hover:underline">{job.title}</Link>
                            <div className="text-xs text-muted-foreground">{job.company}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="destructive">{job.type}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">{job.location}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views?.toLocaleString() ?? 0}</div>
                          <div className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applicants?.toLocaleString() ?? 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                              <Link href={`/o/${job.id}`}>View Details</Link>
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
              <CardTitle>No Jobs Yet</CardTitle>
              <CardDescription>No one has posted a job yet. Be the first!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-10">
              <Briefcase className="h-16 w-16 text-muted-foreground" />
          </CardContent>
          {user && (
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/opportunities/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
