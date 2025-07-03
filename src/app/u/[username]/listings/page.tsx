
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { currentUser } from "@/lib/mock-data";
import ShareButton from "@/components/share-button";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function UserListingsPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch user data based on params.username
  const user = params.username === currentUser.username ? currentUser : null;

  if (!user) {
    // A real app would have a proper 404 page.
    return <div>User not found.</div>
  }
  
  const { name: userName, listings: userListings } = user;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="pl-0">
        <Link href={`/u/${params.username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to {userName}'s Profile
        </Link>
      </Button>
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold font-headline">Listings from {userName}</h1>
            <p className="text-muted-foreground">Products and services available.</p>
        </div>
        <ShareButton />
      </div>
      {userListings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userListings.map((item) => (
             <Card key={item.id} className="flex flex-col">
              <div className="overflow-hidden rounded-t-lg">
                <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
              </div>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="secondary">{item.category}</Badge>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="font-bold text-lg">{item.price}</p>
                <Button>View</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            This user doesn't have any active listings right now.
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardContent className="p-6 text-center">
            <Logo className="mx-auto text-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Want to post your own listings?
            </p>
            <Button asChild className="mt-4 font-bold">
                <Link href="/">Create Your Profile & Get Started</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
