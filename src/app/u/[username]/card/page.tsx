
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import { currentUser } from "@/lib/mock-data";
import ShareButton from "@/components/share-button";
import { useParams } from "next/navigation";

export default function BusinessCardPage() {
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';
  // In a real app, you would fetch data based on params.username
  const user = username === currentUser.username ? currentUser : null;
  
  if (!user) {
    // A real app would have a proper 404 page.
    return <div>User not found.</div>
  }

  const { name, avatarUrl, avatarFallback, businessCard } = user;
  const { title, company, phone, email, website, linkedin, location } = businessCard;


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
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 space-y-4">
       <div className="w-full max-w-sm flex justify-end">
        <ShareButton />
      </div>
      <Card className="w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
        <div className="bg-primary h-24" />
        <div className="flex justify-center -mt-16">
          <Avatar className="w-32 h-32 border-4 border-background rounded-full">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling"/>
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
        <CardContent className="text-center p-6">
          <h1 className="font-headline text-xl sm:text-2xl font-bold">{name}</h1>
          <p className="text-primary font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{company}</p>

          <div className="mt-6 flex justify-center">
            {vCardData ? (
              <QRCode value={vCardData} size={180} bgColor="#ffffff" fgColor="#000000" level="Q" />
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-200 animate-pulse rounded-lg" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Scan to save contact</p>
          
          <div className="text-left mt-6 space-y-3 text-sm">
            <a href={`tel:${phone}`} className="flex items-center gap-3 hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary/80" />
              <span>{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-primary transition-colors">
              <Mail className="w-4 h-4 text-primary/80" />
              <span>{email}</span>
            </a>
            <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
              <Globe className="w-4 h-4 text-primary/80" />
              <span>{website.replace(/^https?:\/\//, '')}</span>
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
              <Linkedin className="w-4 h-4 text-primary/80" />
              <span>{linkedin.replace(/^https?:\/\//, '')}</span>
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary/80" />
              <span>{location}</span>
            </div>
          </div>
          
          <Button className="mt-8 w-full font-bold" onClick={handleSaveToContacts}>
            Save to Contacts
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              Powered by <Logo className="text-lg text-foreground" />
          </Link>
      </div>
    </div>
  );
}
