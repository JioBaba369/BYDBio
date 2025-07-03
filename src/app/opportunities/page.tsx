import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin } from "lucide-react"
import { currentUser } from "@/lib/mock-data";

export default function JobsPage() {
  const { jobs } = currentUser;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Jobs</h1>
        <p className="text-muted-foreground">Discover curated jobs to boost your career.</p>
      </div>
      {jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
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
            No jobs posted at the moment.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
