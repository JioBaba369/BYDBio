'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Mail, Phone, Globe, Linkedin } from "lucide-react";
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
    linkedin = '',
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
    <div className="bg-muted/30 dark:bg-card/20 min-h-screen flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm space-y-6">
        <Card className="rounded-3xl shadow-2xl border-primary/10 bg-card overflow-hidden relative group">
            <div className="h-28 bg-primary/80 dark:bg-primary/50" />
            <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Avatar className="w-28 h-28 border-4 border-background shadow-lg transition-transform group-hover:scale-105">
                    <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
            </div>
            <CardContent className="pt-20 pb-8 text-center px-6">
                <h1 className="font-headline text-2xl font-bold">{name}</h1>
                {title && <p className="text-primary font-medium">{title}</p>}
                {company && <p className="text-muted-foreground text-sm">{company}</p>}
                
                <div className="flex justify-center py-6">
                    <div className="bg-white p-2.5 rounded-xl border-2 border-muted">
                        <QRCode value={vCardData} size={180} bgColor="#ffffff" fgColor="#000000" level="Q" />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2 mb-6">Scan to save contact</p>

                <div className="flex justify-center items-center gap-5 flex-wrap text-muted-foreground">
                    {email && (
                        <a href={`mailto:${email}`} aria-label="Email" title="Email" className="hover:text-primary transition-colors">
                            <Mail className="h-6 w-6" />
                        </a>
                    )}
                     {phone && (
                        <a href={`tel:${phone}`} aria-label="Phone" title="Phone" className="hover:text-primary transition-colors">
                            <Phone className="h-6 w-6" />
                        </a>
                    )}
                     {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" aria-label="Website" title="Website" className="hover:text-primary transition-colors">
                            <Globe className="h-6 w-6" />
                        </a>
                    )}
                     {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="hover:text-primary transition-colors">
                            <Linkedin className="h-6 w-6" />
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={handleSaveToContacts} size="lg" className="font-bold w-full">
                <Save className="mr-2 h-5 w-5" />
                Save Contact
            </Button>
            <ShareButton size="lg" className="font-bold w-full" />
        </div>

        <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
    </div>
</div>
  );
}
