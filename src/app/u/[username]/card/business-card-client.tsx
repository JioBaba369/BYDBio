
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Mail, Phone, Globe, MapPin, Linkedin, Building, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import ShareButton from "@/components/share-button";
import type { User } from "@/lib/users";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { generateVCard } from "@/lib/vcard";

export default function BusinessCardClient({ user }: { user: User }) {
  const { toast } = useToast();
  
  const { name, username, avatarUrl, avatarFallback, businessCard } = user;
  const { 
    title = '', 
    company = '', 
    phone = '', 
    email = '', 
    website = '',
    linkedin = '',
    location = '' 
  } = businessCard || {};

  const vCardData = generateVCard(user);

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
    <div className="bg-dot min-h-screen py-8 px-4 antialiased">
      <div className="w-full max-w-sm mx-auto space-y-4">
        <Button asChild variant="ghost" className="pl-0">
            <Link href={`/u/${username}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to {name}'s Profile
            </Link>
        </Button>
        <Card className="shadow-xl rounded-2xl w-full border-2 border-primary/10 overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary via-secondary to-accent" />
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col items-center text-center -mt-16">
              <Avatar className="h-28 w-28 border-4 border-background bg-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <h1 className="font-headline text-3xl font-bold mt-4">{name}</h1>
              <p className="text-primary">{title}</p>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5"><Building className="h-3.5 w-3.5"/>{company}</p>
              
              <div className="flex flex-col items-center mt-6">
                <div className="bg-white p-4 rounded-lg border shadow-inner">
                    <QRCode value={vCardData} size={180} bgColor="#ffffff" fgColor="#000000" level="Q" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Scan to save my contact details</p>
              </div>

              <div className="flex gap-4 mt-6 w-full">
                <Button onClick={handleSaveToContacts} className="w-full font-bold">
                    <Save className="mr-2 h-4 w-4" />
                    Save Contact
                </Button>
                <ShareButton className="w-full" variant="outline" />
              </div>

              <div className="space-y-4 text-sm w-full pt-6 border-t mt-6 text-left">
                  {phone && <a href={`tel:${phone}`} className="flex items-center gap-4 text-foreground hover:text-primary"><Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{phone}</span></a>}
                  {email && <a href={`mailto:${email}`} className="flex items-center gap-4 text-foreground hover:text-primary"><Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{email}</span></a>}
                  {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-primary"><Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>{website.replace(/^https?:\/\//, '')}</span></a>}
                  {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-foreground hover:text-primary"><Linkedin className="h-5 w-5 text-muted-foreground flex-shrink-0" /><span>LinkedIn Profile</span></a>}
                  {location && <div className="flex items-start gap-4 text-foreground"><MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" /><span>{location}</span></div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
