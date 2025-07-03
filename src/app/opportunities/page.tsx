import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, DollarSign, MapPin, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const jobs = [
  { title: "Senior Product Designer", company: "Acme Inc.", location: "Remote", type: "Full-time" },
  { title: "UX Researcher", company: "Innovate Co.", location: "New York, NY", type: "Contract" },
];
const events = [
  { title: "Design Systems Conference 2024", date: "October 15-17, 2024", location: "Online" },
  { title: "Web3 & The Creator Economy", date: "November 5, 2024", location: "San Francisco, CA" },
];
const offers = [
  { title: "50% off Framer Pro", description: "Get 50% off your first year of Framer Pro.", category: "Software" },
  { title: "Free Design Asset Pack", description: "Download a pack of 100+ UI icons for free.", category: "Assets" },
];

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Opportunities</h1>
        <p className="text-muted-foreground">Discover curated jobs, events, and offers to boost your career.</p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs"><Briefcase className="mr-2 h-4 w-4"/>Jobs</TabsTrigger>
          <TabsTrigger value="events"><Calendar className="mr-2 h-4 w-4"/>Events</TabsTrigger>
          <TabsTrigger value="offers"><DollarSign className="mr-2 h-4 w-4"/>Offers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs">
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
        </TabsContent>

        <TabsContent value="events">
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" /> {event.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" /> {event.location}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Learn More</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="offers">
          <div className="grid gap-6 md:grid-cols-2">
            {offers.map((offer, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{offer.title}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Claim Offer</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
