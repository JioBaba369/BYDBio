
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Nfc, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BydTagPage() {
  const features = [
    "Durable, waterproof PVC material",
    "Embedded NFC chip for instant sharing",
    "Dynamic QR code backup",
    "No app needed for recipients",
    "Update your details anytime, instantly",
    "Eco-friendly alternative to paper cards",
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      title: "Freelance Designer",
      quote: "The BYDTAG is a game-changer for networking events. It's so sleek and people are always impressed when I just tap my tag on their phone.",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "man smiling",
    },
    {
      name: "Samantha Lee",
      title: "Realtor",
      quote: "I've saved so much on printing business cards. Plus, I can update my listings on my profile and my tag instantly links to the new info. Genius!",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "woman smiling",
    },
    {
        name: "David Chen",
        title: "Tech Entrepreneur",
        quote: "As a startup founder, making a memorable first impression is key. The BYDTAG does just that. It's modern, efficient, and reflects our brand perfectly.",
        avatar: "https://placehold.co/100x100.png",
        aiHint: "man portrait",
    }
  ];

  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground text-center py-20 sm:py-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <Badge variant="secondary" className="mb-4 text-sm">Introducing BYDTAG</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">The Last Business Card You’ll Ever Need.</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Tap into the future of networking. Share your digital business card, profile, and links with a single tap.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <a href="#order">Order Your BYDTAG Today <ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-48 -right-32">
             <Image 
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="BYDTAG Product"
                className="rounded-full opacity-20"
                data-ai-hint="nfc tag"
             />
          </div>
           <div className="absolute -top-48 -left-32">
             <Image 
                src="https://placehold.co/600x600.png"
                width={600}
                height={600}
                alt="BYDTAG Product"
                className="rounded-full opacity-20"
                data-ai-hint="nfc card"
             />
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative aspect-square max-w-md mx-auto">
                   <Image 
                        src="https://placehold.co/600x600.png"
                        fill
                        alt="A hand holding a BYDTAG to a phone"
                        className="object-contain"
                        data-ai-hint="nfc payment"
                   />
                </div>
                <div>
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Tap. Connect. Done.</h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                        BYDTAG uses NFC technology to instantly share your BYD.Bio profile. Just tap your tag on any compatible smartphone to open your digital world.
                    </p>
                    <ul className="mt-8 space-y-4">
                        {features.map((feature, index) => (
                             <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold">{feature}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 sm:py-24 bg-muted/40">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Loved by Professionals</h2>
                    <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                        Hear what our users are saying about their BYDTAG experience.
                    </p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-background shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.aiHint} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 text-yellow-500 mb-4">
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
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
                        alt="BYDTAG Product Shot"
                        className="object-contain"
                        data-ai-hint="nfc credit card"
                   />
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Get Your BYDTAG</h2>
                    <p className="text-4xl font-bold text-primary mt-2">$29.99</p>
                    <p className="text-muted-foreground mt-2">One-time purchase. No subscriptions. Ever.</p>
                    <p className="mt-4 text-muted-foreground">
                        Connect your BYDTAG to your profile and start sharing your brand with the world. Shipping is on us.
                    </p>
                    <Button size="lg" className="w-full md:w-auto mt-6">Order Now</Button>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 py-6 text-center text-muted-foreground text-sm">
         <p>&copy; {new Date().getFullYear()} BYD.Bio. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
