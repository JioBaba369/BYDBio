
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Nfc, ArrowRight, Star, Zap, Palette, Share2, Contact } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ClientYear } from "@/components/client-year";
import { useAuth } from "@/components/auth-provider";

export default function BydTagPage() {
  const { user } = useAuth();
  const features = [
    {
      icon: Nfc,
      title: "Instant Sharing",
      description: "Embedded NFC chip for one-tap sharing to any compatible smartphone.",
    },
    {
      icon: Zap,
      title: "Dynamic Content",
      description: "Update your profile anytime, and your BYD BioTAG updates instantly.",
    },
     {
      icon: Palette,
      title: "Fully Customizable",
      description: "Design a tag that matches your brand with custom colors, logos, and layouts.",
    },
    {
      icon: Share2,
      title: "QR Code Backup",
      description: "A dynamic QR code on the back ensures compatibility with all phones.",
    },
    {
      icon: Contact,
      title: "Digital Business Card",
      description: "Links directly to your vCard, allowing others to save your contact info instantly.",
    },
    {
      icon: CheckCircle,
      title: "Durable & Waterproof",
      description: "Made from premium PVC to withstand daily wear and tear.",
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      title: "Freelance Designer",
      quote: "The BYD BioTAG is a game-changer for networking events. It's so sleek and people are always impressed when I just tap my tag on their phone.",
      avatar: "https://placehold.co/100x100.png",
    },
    {
      name: "Samantha Lee",
      title: "Realtor",
      quote: "I've saved so much on printing business cards. Plus, I can update my listings on my profile and my tag instantly links to the new info. Genius!",
      avatar: "https://placehold.co/100x100.png",
    },
    {
        name: "David Chen",
        title: "Tech Entrepreneur",
        quote: "As a startup founder, making a memorable first impression is key. The BYD BioTAG does just that. It's modern, efficient, and reflects our brand perfectly.",
        avatar: "https://placehold.co/100x100.png",
    }
  ];

  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground text-center py-20 sm:py-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <Badge variant="secondary" className="mb-4 text-sm">Introducing BYD BioTAG</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">The Smartest Business Card on the Planet.</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Bridge the physical and digital worlds. Share your professional identity with a single tap.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <Link href={user ? "/bydtag/design" : "/auth/sign-up"}>Design Your BYD BioTAG <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-48 -right-32">
             <Image 
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="BYD BioTAG Product"
                className="rounded-full opacity-20"
                data-ai-hint="abstract geometric"
             />
          </div>
           <div className="absolute -top-48 -left-32">
             <Image 
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="BYD BioTAG Product"
                className="rounded-full opacity-20"
                data-ai-hint="abstract pattern"
             />
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative aspect-[4/3] max-w-lg mx-auto">
                   <Image 
                        src="https://placehold.co/600x400.png"
                        fill
                        alt="A hand holding a BYD BioTAG to a phone"
                        className="object-contain"
                        data-ai-hint="nfc payment"
                   />
                </div>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Tap. Connect. Done.</h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                        BYD BioTAG uses NFC technology to instantly share your digital business card. Just tap your tag on any compatible smartphone to open your professional world.
                    </p>
                  </div>
                  <div className="flex gap-6">
                      <div className="text-4xl font-bold font-headline text-primary">1</div>
                      <div>
                          <h3 className="text-xl font-semibold">Design</h3>
                          <p className="text-muted-foreground mt-1">Customize your tag with your logo, colors, and layout to match your brand perfectly.</p>
                      </div>
                  </div>
                   <div className="flex gap-6">
                      <div className="text-4xl font-bold font-headline text-primary">2</div>
                      <div>
                          <h3 className="text-xl font-semibold">Link</h3>
                          <p className="text-muted-foreground mt-1">Connect your BYD BioTAG to your digital business card on your profile with a single click.</p>
                      </div>
                  </div>
                   <div className="flex gap-6">
                      <div className="text-4xl font-bold font-headline text-primary">3</div>
                      <div>
                          <h3 className="text-xl font-semibold">Share</h3>
                          <p className="text-muted-foreground mt-1">Tap your tag on someone's phone to instantly share your contact info, social links, and more.</p>
                      </div>
                  </div>
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 sm:py-24 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6">
             <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-headline font-bold">Powerful Features, Simple Package</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Everything you need to make a lasting impression.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background/50 text-center p-6 border-transparent shadow-lg hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
              </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Loved by Professionals</h2>
                    <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                        Hear what our users are saying about their BYD BioTAG experience.
                    </p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-background shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} data-ai-hint="person portrait" />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 text-yellow-500 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                                </div>
                                <blockquote className="text-muted-foreground border-l-2 pl-4 italic">
                                    "{testimonial.quote}"
                                </blockquote>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        </section>
        
        {/* Order Section */}
        <section id="order" className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-card p-8 sm:p-12 rounded-2xl shadow-xl border">
                 <div className="relative aspect-square max-w-xs mx-auto">
                   <Image 
                        src="https://placehold.co/400x400.png"
                        fill
                        alt="BYD BioTAG Product Shot"
                        className="object-contain"
                        data-ai-hint="product design"
                   />
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Get Your BYD BioTAG</h2>
                    <p className="text-4xl font-bold text-primary mt-2">$29.99</p>
                    <p className="text-muted-foreground mt-2">One-time purchase. No subscriptions. Ever.</p>
                    <p className="mt-4 text-muted-foreground">
                        Connect your BYD BioTAG to your profile and start sharing your brand with the world. Shipping is on us.
                    </p>
                    <Button asChild size="lg" className="w-full md:w-auto mt-6">
                        <Link href={user ? "/bydtag/design" : "/auth/sign-up"}>Order Now</Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 py-6 text-center text-muted-foreground text-sm">
         <p>&copy; <ClientYear /> BYD.Bio. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
