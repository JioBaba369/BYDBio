
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { currentUser } from "@/lib/mock-data";
import Image from "next/image";

export default function ListingsPage() {
  const { listings } = currentUser;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Product & Service Listings</h1>
        <p className="text-muted-foreground">Manage your products, services, and digital goods.</p>
      </div>
      {listings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
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
                <Button>Edit Listing</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            You haven't created any listings yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
