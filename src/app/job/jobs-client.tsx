
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, PlusCircle, Eye, Users, DollarSign, ExternalLink, List, LayoutGrid, Bell, Building2 } from "lucide-react"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { type JobWithAuthor } from "@/lib/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { ClientFormattedCurrency } from "@/components/client-formatted-currency";
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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

export default function JobsClient({ initialJobs }: { initialJobs: JobWithAuthor[] }) {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobWithAuthor[]>(initialJobs);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  if (authLoading) {
    return <JobPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Jobs</h1>
          <p className="text-muted-foreground">Discover curated career opportunities from the community.</p>
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
              <Link href="/job/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Job
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {jobs.length > 0 ? (
        view === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
              {job.imageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <Link href={`/job/${job.id}`}>
                    <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" />
                  </Link>
                </div>
              )}
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                    <Badge variant="destructive">{job.type}</Badge>
                    <div className="text-xs text-muted-foreground"><ClientFormattedDate date={job.postingDate as string} relative /></div>
                </div>
                <CardTitle className="text-lg pt-1"><Link href={`/job/${job.id}`} className="hover:underline">{job.title}</Link></CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-sm"><Building2 className="h-4 w-4" />{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 flex-grow">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" /> {job.location}
                </div>
                {job.remuneration && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" /> <ClientFormattedCurrency value={job.remuneration} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-3 p-4 border-t">
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{job.views?.toLocaleString() ?? 0} Views</div>
                      <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{job.applicants?.toLocaleString() ?? 0} Applicants</div>
                      <div className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{job.followerCount?.toLocaleString() ?? 0} Following</div>
                  </div>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/job/${job.id}`}>
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
                          <Link href={`/job/${job.id}`} className="font-semibold hover:underline">{job.title}</Link>
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
                              <Link href={`/job/${job.id}`}>View Details</Link>
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
              <CardDescription>No one has posted an opportunity yet. Be the first!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-10">
              <Briefcase className="h-16 w-16 text-muted-foreground" />
          </CardContent>
          {user && (
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/job/create">
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
