
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { allUsers } from "@/lib/users";
import ShareButton from "@/components/share-button";
import { useParams } from "next/navigation";
import { linkIcons } from "@/lib/link-icons";

export default function BioCardPage() {
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';
  
  const user = allUsers.find(u => u.username === username);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground mt-2">The profile you're looking for doesn't exist.</p>
             <Button asChild className="mt-6">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    )
  }

  const { name, avatarUrl, avatarFallback, bio, links } = user;

  return (
    <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4 antialiased">
        <div className="absolute top-4 left-4">
            <Button asChild variant="ghost">
                <Link href={`/u/${username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to {name}'s Profile
                </Link>
            </Button>
        </div>
      <div className="w-full max-w-sm space-y-6 py-16">
        <Card className="p-8 shadow-xl">
            <CardContent className="p-0 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-primary/20">
                    <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <h1 className="font-headline text-2xl font-bold">{name}</h1>
                <p className="text-muted-foreground mt-2">{bio}</p>
                
                <div className="mt-6 flex w-full items-center justify-center">
                    <ShareButton size="lg" />
                </div>
            </CardContent>
        </Card>
        
        {links && links.length > 0 && (
             <div className="space-y-3">
                {links.map((link, index) => {
                    const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                    return (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button variant="outline" className="w-full h-14 text-base font-semibold justify-start p-4 hover:bg-primary/10 hover:border-primary">
                                {Icon && <Icon className="h-5 w-5" />}
                                <span className="flex-1 text-center">{link.title}</span>
                            </Button>
                        </a>
                    )
                })}
            </div>
        )}

        <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
    </div>
</div>
  );
}
