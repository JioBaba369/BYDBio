
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { linkIcons } from "@/lib/link-icons";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/lib/users";


export default function LinksClientPage({ user }: { user: User }) {
  const { name, username, handle, avatarUrl, avatarFallback, bio, links } = user;

  return (
    <div className="bg-dot min-h-screen antialiased">
      <div className="container mx-auto max-w-md p-4 sm:p-8">
        <div className="absolute top-4 left-4">
            <Button asChild variant="ghost" size="sm">
                <Link href={`/u/${username}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    Back to {name}'s Profile
                </Link>
            </Button>
        </div>

        <div className="flex flex-col items-center text-center pt-16">
            <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary/20 ring-offset-4 ring-offset-background">
                <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <h1 className="font-headline text-3xl font-bold">{name}</h1>
                <ShareButton size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">@{handle}</p>
            <p className="text-foreground/90 mt-4 max-w-prose">{bio}</p>
        </div>
        
        {links && links.length > 0 && (
             <div className="flex flex-col gap-4 mt-8">
                {links.map((link, index) => {
                    const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                    return (
                        <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group flex h-16 w-full items-center gap-4 rounded-lg bg-primary px-4 text-lg font-semibold text-primary-foreground shadow-sm transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-primary/90"
                        >
                            {Icon && <Icon className="h-6 w-6 flex-shrink-0" />}
                            <span className="flex-1 text-center truncate">{link.title}</span>
                            <ExternalLink className="h-5 w-5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
                        </a>
                    )
                })}
            </div>
        )}

        <Separator className="my-12" />

        <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
      </div>
    </div>
  );
}
