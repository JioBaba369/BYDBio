
'use client';

import type { User } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { linkIcons } from "@/lib/link-icons";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from '@/components/logo';

export default function LinksClientPage({ user }: { user: User }) {
  const { name, username, avatarUrl, avatarFallback, bio, links } = user;

  return (
    <div className="flex justify-center bg-dot py-8 px-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">@{username}</p>
          {bio && <p className="text-foreground/90 max-w-prose mt-4 text-center text-sm">{bio}</p>}
        </div>

        <div className="flex flex-col gap-4">
          {links.length > 0 ? (
            links.map((link, index) => {
              const Icon = linkIcons[link.icon as keyof typeof linkIcons] || LinkIcon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group"
                >
                  <div className="w-full h-14 text-base font-semibold flex items-center p-4 rounded-lg bg-secondary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 ease-out duration-200 shadow-sm">
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-center truncate">{link.title}</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                </a>
              );
            })
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
              This user hasn't added any links yet.
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
      </div>
    </div>
  );
}
