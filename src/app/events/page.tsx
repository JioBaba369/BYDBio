
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"
import { currentUser } from "@/lib/mock-data";

export default function EventsPage() {
  const { events } = currentUser;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Events</h1>
        <p className="text-muted-foreground">Discover curated events to expand your network and knowledge.</p>
      </div>
      {events.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            There are no events currently scheduled. Check back later!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
