
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Mail, Phone, Globe, MapPin, Linkedin, Building } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import ShareButton from "@/components/share-button";
import type { User } from "@/lib/users";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

export default function BusinessCardClient({ user }: { user: User }) {
  const { toast } = useToast();
  
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
X-SOCIALPROFILE;type=linkedin:${linkedin}
ADR;TYPE=WORK:;;${location}
END:VCARD`;

  const handleSaveToContacts = () => {
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const contactFileName = name.replace(/ /g, '_') || 'contact';
    saveAs(blob, `${contactFileName}.vcf`);
    toast({
        title: "Contact Saved",
        description: "The VCF file has been downloaded to your device.",
    });
  };

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm space-y-4">
        <Card className="shadow-xl rounded-2xl w-full overflow-hidden border-2 border-primary/10">
          <div className="bg-primary/10 p-8 flex flex-col items-center text-center relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-primary/20" />
            <Avatar className="relative z-10 h-28 w-28 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="relative z-10 font-headline text-3xl font-bold mt-4">{name}</h1>
            <p className="relative z-10 text-primary">{title}</p>
            <p className="relative z-10 text-muted-foreground text-sm flex items-center gap-1.5"><Building className="h-3.5 w-3.5"/>{company}</p>
          </div>
          
          <CardContent className="p-6 bg-background space-y-6">
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border shadow-inner">
                    <QRCode value={vCardData} size={180} bgColor="#ffffff" fgColor="#000000" level="Q" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Scan to save my contact details</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveToContacts} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Contact
                </Button>
                <ShareButton className="w-full" variant="outline" />
              </div>

              <div className="space-y-4 text-sm w-full pt-6 border-t">
                  {phone && <a href={`tel:${phone}`} className="flex items-center gap-4 text-foreground hover:text-primary"><Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{phone}</span></a>}
                  {email && <a href={`mailto:${email}`} className="flex items-center gap-4 text-foreground hover:text-primary"><Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{email}</span></a>}
                  {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-primary"><Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{website.replace(/^https?:\/\//, '')}</span></a>}
                  {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-primary"><Linkedin className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>LinkedIn Profile</span></a>}
                  {location && <div className="flex items-start gap-4 text-foreground"><MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" /><span>{location}</span></div>}
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
