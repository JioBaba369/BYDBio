
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Printer, Save } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import QRCode from "qrcode.react";
import { currentUser } from "@/lib/mock-data";
import ShareButton from "@/components/share-button";
import { useParams } from "next/navigation";
import { useRef, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import type { User } from "@/lib/users";

// Specific card preview component to isolate the printable/savable area
const BusinessCardPreview = forwardRef<HTMLDivElement, { user: User, vCardData: string }>(({ user, vCardData }, ref) => {
  const { name, avatarUrl, avatarFallback, businessCard } = user;
  const { title, company } = businessCard;

  return (
    <div
      id="business-card"
      ref={ref}
      className="relative w-[337.5px] h-[212.5px] bg-card text-card-foreground rounded-2xl shadow-xl border overflow-hidden flex flex-col font-sans"
    >
      {/* Lanyard Hole */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3 w-6 rounded-full bg-background ring-1 ring-inset ring-foreground/20 z-20"></div>
      
      {/* Header section */}
      <div className="relative h-[35%] w-full bg-muted flex-shrink-0">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <Avatar className="w-24 h-24 border-4 border-card shadow-md">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling"/>
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Body Section */}
      <div className="flex-grow flex flex-col justify-between items-center text-center p-4 pt-14">
        <div>
          <h1 className="font-headline text-xl font-bold">{name}</h1>
          <p className="text-primary font-medium text-sm">{title}</p>
          <p className="text-muted-foreground text-xs">{company}</p>
        </div>

        <div className="flex justify-center">
            {vCardData ? (
              <QRCode value={vCardData} size={70} bgColor="transparent" fgColor="hsl(var(--foreground))" level="Q" />
            ) : (
              <div className="w-[70px] h-[70px] bg-gray-200 animate-pulse rounded-md" />
            )}
        </div>
      </div>
    </div>
  );
});
BusinessCardPreview.displayName = 'BusinessCardPreview';


export default function BusinessCardPage() {
  const params = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const username = typeof params.username === 'string' ? params.username : '';
  // In a real app, you would fetch data based on params.username
  const user = username === currentUser.username ? currentUser : null;
  
  if (!user) {
    // A real app would have a proper 404 page.
    return <div>User not found.</div>
  }

  const { name, businessCard } = user;
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

  const handleSaveAsImage = () => {
    if (cardRef.current === null) {
      return
    }

    toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${name.split(' ').join('_')}_card.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handlePrint = () => {
    window.print();
  }

  return (
    <>
    <style jsx global>{`
      @media print {
        body {
          background-color: white !important;
        }
        .no-print {
          display: none !important;
        }
        #printable-area {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #business-card {
          width: 3.375in;
          height: 2.125in;
          box-shadow: none;
          border-width: 1px;
          border-color: #e5e7eb;
        }
      }
    `}</style>
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 space-y-6">
      <div id="printable-area">
        <BusinessCardPreview ref={cardRef} user={user} vCardData={vCardData} />
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-2 no-print">
        <ShareButton />
        <Button onClick={handleSaveAsImage} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Save as Image
        </Button>
        <Button onClick={handleSaveToContacts} variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Contact
        </Button>
        <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
        </Button>
      </div>

      <div className="mt-6 text-center no-print">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              Powered by <Logo className="text-lg text-foreground" />
          </Link>
      </div>
    </div>
    </>
  );
}
