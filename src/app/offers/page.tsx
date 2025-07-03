
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Calendar, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { currentUser } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";

export default function OffersPage() {
  const { offers } = currentUser;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">Offers</h1>
          <p className="text-muted-foreground">Discover curated offers and deals.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Offer
        </Button>
      </div>
      {offers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map((offer, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{offer.title}</CardTitle>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                 <div className="flex items-center pt-2 text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" /> 
                  <span>Releases: {format(parseISO(offer.releaseDate), 'PPP')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Claim Offer</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            There are no offers available right now.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
