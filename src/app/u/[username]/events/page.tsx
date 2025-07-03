
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for a specific user
const userEvents = [
  { title: "Design Systems Meetup", date: "December 1, 2024", location: "Online" },
  { title: "Web3 & The Creator Economy", date: "November 5, 2024", location: "San Francisco, CA" },
];

export default function UserEventsPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch the user's name based on params.username
  const userName = "Jane Doe";
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="pl-0">
          <Link href={`/u/${params.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to {userName}'s Profile
          </Link>
        </Button>
      <div>
        <h1 className="text-3xl font-bold font-headline">Events by {userName}</h1>
        <p className="text-muted-foreground">Upcoming events and workshops.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {userEvents.map((event, index) => (
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
    </div>
  );
}
