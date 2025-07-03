
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import ShareButton from "@/components/share-button";
import type { User } from "@/lib/users";

export default function BusinessCardClient({ user }: { user: User }) {
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
    <div className="bg-muted/40 min-h-screen flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm space-y-6">
        <Card className="p-8 shadow-xl">
            <CardContent className="p-0 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-primary/20">
                    <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <h1 className="font-headline text-2xl font-bold">{name}</h1>
                <p className="text-primary">{title}</p>
                <p className="text-muted-foreground text-sm">{company}</p>
                
                <div className="flex justify-center my-6">
                    <div className="bg-white p-3 rounded-lg border">
                        <QRCode value={vCardData} size={200} bgColor="#ffffff" fgColor="#000000" level="Q" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleSaveToContacts} size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Save Contact
                    </Button>
                    <ShareButton size="lg" />
                </div>
            </CardContent>
        </Card>
        
        <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
    </div>
</div>
  );
}
