import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Linkedin, Mail, Phone, MapPin, Building } from "lucide-react";
import Image from "next/image";

// Mock data
const businessCardData = {
  name: "Jane Doe",
  title: "Senior Product Designer",
  company: "Acme Inc.",
  avatarUrl: "https://placehold.co/200x200.png",
  phone: "+1 (555) 123-4567",
  email: "jane.doe@acme.com",
  website: "janedoe.design",
  linkedin: "linkedin.com/in/janedoe",
  location: "San Francisco, CA",
  qrCodeUrl: "https://placehold.co/250x250.png",
};

export default function BusinessCardPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch data based on params.username
  const { name, title, company, avatarUrl, phone, email, website, linkedin, location, qrCodeUrl } = businessCardData;
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
        <div className="bg-primary h-24" />
        <div className="flex justify-center -mt-16">
          <Avatar className="w-32 h-32 border-4 border-background rounded-full">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling"/>
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <CardContent className="text-center p-6">
          <h1 className="font-headline text-2xl font-bold">{name}</h1>
          <p className="text-primary font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{company}</p>

          <div className="mt-6 flex justify-center">
            <Image
              src={qrCodeUrl}
              width={180}
              height={180}
              alt="QR Code"
              className="rounded-lg"
              data-ai-hint="qr code"
            />
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
            <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
              <Globe className="w-4 h-4 text-primary/80" />
              <span>{website}</span>
            </a>
            <a href={`https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
              <Linkedin className="w-4 h-4 text-primary/80" />
              <span>{linkedin}</span>
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary/80" />
              <span>{location}</span>
            </div>
          </div>
          
          <Button className="mt-8 w-full font-bold"
            onClick={() => {
              const blob = new Blob([vCardData], { type: "text/vcard" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${name.split(' ').join('_')}.vcf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Save to Contacts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
