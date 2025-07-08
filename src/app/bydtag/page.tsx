
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
      title: "Instant Sharing with a Tap",
      description: "Embedded with an advanced NFC chip, your BYD BioTAG allows for one-tap sharing to any compatible smartphone. No apps, no fuss—just a seamless connection.",
      image: "https://placehold.co/500x500.png",
      aiHint: "nfc payment phone"
    },
    {
      icon: Palette,
      title: "Designed by You, for Your Brand",
      description: "Our intuitive designer lets you fully customize your tag. Choose your layout, colors, and upload your own logo or background image to create a tag that's uniquely yours.",
      image: "https://placehold.co/500x500.png",
      aiHint: "graphic design tools"
    },
     {
      icon: Zap,
      title: "A Living, Breathing Business Card",
      description: "Your digital profile is dynamic. Update your contact information, add a new project, or change your bio, and your BYD BioTAG updates instantly. Always stay current.",
      image: "https://placehold.co/500x500.png",
      aiHint: "digital connection abstract"
    },
    {
      icon: Share2,
      title: "Universal Compatibility",
      description: "In addition to NFC, every tag includes a dynamic QR code on the back. This ensures you can connect with anyone, on any smartphone, anytime.",
      image: "https://placehold.co/500x500.png",
      aiHint: "qr code scan"
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      title: "Freelance Designer",
      quote: "The BYD BioTAG is a game-changer for networking events. It's so sleek and people are always impressed when I just tap my tag on their phone.",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "person portrait"
    },
    {
      name: "Samantha Lee",
      title: "Realtor",
      quote: "I've saved so much on printing business cards. Plus, I can update my listings on my profile and my tag instantly links to the new info. Genius!",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "person portrait"
    },
    {
        name: "David Chen",
        title: "Tech Entrepreneur",
        quote: "As a startup founder, making a memorable first impression is key. The BYD BioTAG does just that. It's modern, efficient, and reflects our brand perfectly.",
        avatar: "https://placehold.co/100x100.png",
        aiHint: "person portrait"
    }
  ];

  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground text-center py-20 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-dot [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-20"></div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <Badge variant="secondary" className="mb-4 text-sm">Introducing BYD BioTAG</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">The Last Business Card You'll Ever Need.</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Bridge the physical and digital worlds. Impress clients, and share your professional identity with a single tap.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <Link href={user ? "/bydtag/design" : "/auth/sign-up"}>Design Your BYD BioTAG <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Sections */}
        <section className="py-20 sm:py-24 space-y-24">
          {features.map((feature, index) => (
             <div key={index} className="container mx-auto px-4 sm:px-6">
               <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                 <div className={`space-y-4 ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-headline font-bold">{feature.title}</h2>
                    <p className="text-lg text-muted-foreground">{feature.description}</p>
                 </div>
                  <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-xl ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <Image 
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                      data-ai-hint={feature.aiHint}
                    />
                  </div>
               </div>
             </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-24 bg-muted/40">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold">Loved by Professionals</h2>
                    <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                        Hear what our users are saying about their BYD BioTAG experience.
                    </p>
                </div>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="bg-background shadow-lg h-full flex flex-col">
                                        <CardContent className="p-6 flex-grow flex flex-col">
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
                                                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                                            </div>
                                            <blockquote className="text-muted-foreground border-l-2 pl-4 italic flex-grow">
                                                "{testimonial.quote}"
                                            </blockquote>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                 </Carousel>
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
