
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Building, Briefcase, Rocket, Users, Sparkles, Search, Nfc, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientYear } from "./client-year";

export function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      title: "Creators & Influencers",
      description: "Monetize your passion. Share your content, sell products, and manage your community from one link.",
    },
    {
      icon: Briefcase,
      title: "Freelancers & Consultants",
      description: "Showcase your expertise. Build a dynamic portfolio, list your services, and attract new clients.",
    },
    {
      icon: Rocket,
      title: "Entrepreneurs",
      description: "Launch your vision. Create a sleek promo page for your business, post jobs, and build your brand.",
    },
    {
      icon: Users,
      title: "Community Organizers",
      description: "Engage your audience. Host events, manage RSVPs, and keep your community connected and informed.",
    },
    {
      icon: Building,
      title: "Small Businesses",
      description: "Streamline business communication. Build promo pages, manage listings, and engage directly with customers.",
    },
    {
      icon: Search,
      title: "Job Seekers",
      description: "Land your next role. Follow companies, discover opportunities, and showcase your professional brand online.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
            <Button asChild variant="link">
              <Link href="/whats-new">What's New</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">The Essential Toolkit for Your Digital Identity</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              One link for your bio, business, and brand. Create a beautiful profile, share your work, and connect with your audience—all in one place.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Visual Showcase */}
        <section className="container mx-auto px-4 sm:px-6">
           <div className="relative rounded-xl border bg-card p-2 shadow-2xl overflow-hidden max-w-5xl mx-auto">
             <Image 
                src="https://placehold.co/1200x600.png"
                width={1200}
                height={600}
                alt="BYD.Bio Profile Example"
                className="rounded-md"
                data-ai-hint="digital profile"
             />
           </div>
        </section>

        {/* Who it's for Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">A Platform for Growth</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                A powerful toolkit for a new generation of digital professionals and businesses.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BYDTAG Section */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center bg-muted/40 p-8 sm:p-12 rounded-2xl">
                    <div className="text-center md:text-left">
                        <Badge>New</Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold mt-2">Introducing the BYDTAG</h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            The smartest business card on the planet. Your BYDTAG is an NFC-enabled card that links directly to your digital business card. Just one tap is all it takes to share your contact info, social links, and more.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/bydtag">Learn More</Link>
                        </Button>
                    </div>
                    <div className="relative aspect-[4/3] max-w-sm mx-auto">
                        <Image 
                            src="https://placehold.co/600x400.png"
                            fill
                            alt="A hand holding a BYDTAG to a phone"
                            className="object-contain"
                            data-ai-hint="nfc payment"
                        />
                    </div>
                </div>
            </div>
        </section>
        
        {/* Final CTA */}
        <section className="text-center py-20 sm:py-24 bg-muted/40">
           <div className="container mx-auto px-4 sm:px-6">
             <h2 className="text-3xl sm:text-4xl font-bold">Ready to Build Your Dream Bio?</h2>
             <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/auth/sign-up">Start for Free</Link>
                </Button>
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
