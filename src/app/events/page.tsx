import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"

const events = [
  { title: "Design Systems Conference 2024", date: "October 15-17, 2024", location: "Online" },
  { title: "Web3 & The Creator Economy", date: "November 5, 2024", location: "San Francisco, CA" },
];

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Events</h1>
        <p className="text-muted-foreground">Discover curated events to expand your network and knowledge.</p>
      </div>
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
    </div>
  );
}
