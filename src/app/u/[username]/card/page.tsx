
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import { allUsers } from "@/lib/users";
import ShareButton from "@/components/share-button";
import { useParams } from "next/navigation";
import type { User } from "@/lib/users";

export default function BusinessCardPage() {
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

  // Fallback to empty strings if businessCard or its properties are missing
  const { name, avatarUrl, avatarFallback, businessCard } = user;
  const { 
    title = '', 
    company = '', 
    phone = '', 
    email = '', 
    website = '', 
    location = '' 
  } = businessCard || {};

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${company}
TITLE:${title}
TEL;TYPE=WORK,VOICE:${phone}
EMAIL:${email}
URL:${website}
ADR;TYPE=WORK:;;${location}
END:VCARD`;

  const handleSaveToContacts = () => {
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.split(' ').join('_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 space-y-6">
      <div className="w-full max-w-sm bg-background p-6 rounded-xl shadow-lg border">
        <div className="text-center space-y-2">
            <Avatar className="w-20 h-20 mx-auto">
                <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="font-headline text-xl font-bold">{name}</h1>
                {title && <p className="text-primary font-medium text-sm">{title}</p>}
                {company && <p className="text-muted-foreground text-sm">{company}</p>}
            </div>
        </div>
        <div className="flex justify-center p-4 mt-4">
            <div className="bg-white p-4 rounded-lg">
                <QRCode value={vCardData} size={200} bgColor="#ffffff" fgColor="#000000" level="Q" />
            </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Scan to save contact</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ShareButton />
        {businessCard && (
            <Button onClick={handleSaveToContacts} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save Contact
            </Button>
        )}
      </div>

      <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              Powered by <Logo className="text-lg text-foreground" />
          </Link>
      </div>
    </div>
  );
}
