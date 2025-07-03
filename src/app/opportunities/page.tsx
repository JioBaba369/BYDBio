
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, PlusCircle } from "lucide-react"
import { currentUser } from "@/lib/mock-data";
import Image from "next/image";

export default function OpportunitiesPage() {
  const { jobs } = currentUser;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Opportunities</h1>
          <p className="text-muted-foreground">Discover curated job opportunities to boost your career.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Opportunity
        </Button>
      </div>
      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job, index) => (
            <Card key={index} className="flex flex-col">
              {job.imageUrl && (
                <div className="overflow-hidden rounded-t-lg">
                  <Image src={job.imageUrl} alt={job.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="office workspace" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" /> {job.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No job opportunities posted at the moment.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
