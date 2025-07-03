
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for a specific user
const userOffers = [
  { title: "Portfolio Review Session", description: "Book a 1-on-1 portfolio review session with me.", category: "Service" },
  { title: "UI Kit 20% Off", description: "Get my latest UI kit with a 20% discount.", category: "Digital Product" },
];

export default function UserOffersPage({ params }: { params: { username: string } }) {
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
        <h1 className="text-3xl font-bold font-headline">Offers from {userName}</h1>
        <p className="text-muted-foreground">Exclusive deals and services.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {userOffers.map((offer, index) => (
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
    </div>
  );
}
