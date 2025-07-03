
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, PlusCircle, MoreHorizontal, Edit, Archive, Trash2, Eye, Users } from "lucide-react"
import { currentUser } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/lib/users";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OpportunitiesPage() {
  const [jobs, setJobs] = useState<Job[]>(currentUser.jobs);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleArchive = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: job.status === 'active' ? 'archived' : 'active' } : job
    ));
    toast({ title: 'Opportunity status updated!' });
  };

  const handleDelete = () => {
    if (!selectedJobId) return;
    setJobs(prev => prev.filter(job => job.id !== selectedJobId));
    toast({ title: 'Opportunity deleted!' });
    setIsDeleteDialogOpen(false);
    setSelectedJobId(null);
  };
  
  const openDeleteDialog = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsDeleteDialogOpen(true);
  }

  const activeJobs = jobs.filter(j => j.status === 'active');
  const archivedJobs = jobs.filter(j => j.status === 'archived');
  
  return (
    <>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName="opportunity"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Opportunities</h1>
            <p className="text-muted-foreground">Discover curated job opportunities to boost your career.</p>
          </div>
          <Button asChild>
            <Link href="/opportunities/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Opportunity
            </Link>
          </Button>
        </div>
        
        {activeJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeJobs.map((job) => (
              <Card key={job.id} className="flex flex-col">
                {job.imageUrl && (
                  <div className="overflow-hidden rounded-t-lg">
                    <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office workspace" />
                  </div>
                )}
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/opportunities/${job.id}/edit`} className="cursor-pointer"><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(job.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(job.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" /> {job.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                  </div>
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
                      <Link href={`/o/${job.id}`}>View Details</Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <CardTitle>No Opportunities Yet</CardTitle>
                <CardDescription>Post your first opportunity to attract talent.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Briefcase className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/opportunities/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post Your First Opportunity
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        )}
        
        {archivedJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline">Archived Opportunities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {archivedJobs.map((job) => (
                <Card key={job.id} className="flex flex-col opacity-70">
                  {job.imageUrl && (
                    <div className="overflow-hidden rounded-t-lg relative">
                      <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office workspace" />
                      <Badge className="absolute top-2 right-2">Archived</Badge>
                    </div>
                  )}
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleArchive(job.id)} className="cursor-pointer"><Archive className="mr-2 h-4 w-4"/>Unarchive</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(job.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-2 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" /> {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
