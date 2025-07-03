
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, ArrowLeft, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { currentUser } from "@/lib/mock-data";
import ShareButton from "@/components/share-button";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";


export default function UserOffersPage() {
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';
  // In a real app, you would fetch user data based on params.username
  const user = username === currentUser.username ? currentUser : null;

  if (!user) {
    // A real app would have a proper 404 page.
    return <div>User not found.</div>
  }
  
  const { name: userName, offers: userOffers } = user;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="pl-0">
        <Link href={`/u/${username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to {userName}'s Profile
        </Link>
      </Button>
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Offers from {userName}</h1>
            <p className="text-muted-foreground">Exclusive deals and services.</p>
        </div>
        <ShareButton />
      </div>
      {userOffers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {userOffers.map((offer, index) => (
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
            This user doesn't have any active offers right now.
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardContent className="p-6 text-center">
            <Logo className="mx-auto text-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Want to post your own offers?
            </p>
            <Button asChild className="mt-4 font-bold">
                <Link href="/">Create Your Profile & Get Started</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
