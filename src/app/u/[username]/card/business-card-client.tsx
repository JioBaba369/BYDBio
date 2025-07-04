
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
import { Separator } from "@/components/ui/separator";

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
    <div className="bg-gradient-to-br from-muted/30 via-background to-background min-h-screen flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="shadow-2xl rounded-2xl border-primary/10 overflow-hidden backdrop-blur-sm bg-background/80">
          <CardContent className="p-0 grid md:grid-cols-3">
              <div className="md:col-span-2 flex flex-col p-6">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                          <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person portrait"/>
                          <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div>
                          <h1 className="font-headline text-2xl font-bold">{name}</h1>
                          <p className="text-primary">{title}</p>
                          <p className="text-muted-foreground text-sm flex items-center gap-1.5"><Building className="h-3.5 w-3.5"/>{company}</p>
                      </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm flex-grow">
                      {phone && <a href={`tel:${phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Phone className="h-4 w-4 text-primary flex-shrink-0" /><span>{phone}</span></a>}
                      {email && <a href={`mailto:${email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Mail className="h-4 w-4 text-primary flex-shrink-0" /><span>{email}</span></a>}
                      {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Globe className="h-4 w-4 text-primary flex-shrink-0" /><span>{website.replace(/^https?:\/\//, '')}</span></a>}
                      {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary"><Linkedin className="h-4 w-4 text-primary flex-shrink-0" /><span>LinkedIn Profile</span></a>}
                      {location && <div className="flex items-start gap-3 text-muted-foreground"><MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /><span>{location}</span></div>}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                      <Button onClick={handleSaveToContacts}>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Contacts
                      </Button>
                      <ShareButton />
                  </div>
              </div>
              <div className="md:col-span-1 bg-muted/50 flex flex-col items-center justify-center p-6 border-l">
                  <div className="bg-white p-3 rounded-lg border shadow-inner">
                      <QRCode value={vCardData} size={180} bgColor="#ffffff" fgColor="#000000" level="Q" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium text-center mt-3">Scan to Save Contact</p>
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
