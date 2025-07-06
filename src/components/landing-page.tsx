
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Contact, Link2, Columns, HandCoins, Sparkles, Briefcase, Rocket, Users } from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Logo />
        <Button asChild variant="ghost">
          <Link href="/auth/sign-in">Sign In</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">Your All-In-One Hub for a Powerful Online Presence</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Whether you're a creator, freelancer, or entrepreneur, BYD.Bio gives you the tools to build your brand, share your work, and connect with your audience.
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
           <div className="relative rounded-xl border-8 border-foreground/5 bg-background/50 p-2 shadow-2xl overflow-hidden max-w-5xl mx-auto">
             <Image 
                src="https://placehold.co/1200x600.png" 
                width={1200}
                height={600}
                alt="BYD.Bio Profile Example"
                className="rounded-md"
                data-ai-hint="website interface"
             />
           </div>
        </section>

        {/* Who it's for Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-headline font-bold">Built For Every Ambition</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                A powerful toolkit for a new generation of digital professionals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 border-transparent shadow-lg bg-card hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-headline">Creators & Influencers</h3>
                  <p className="text-muted-foreground mt-2 text-sm">Monetize your passion. Share your content, sell products, and manage your community from one link.</p>
              </Card>
               <Card className="text-center p-6 border-transparent shadow-lg bg-card hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-headline">Freelancers & Consultants</h3>
                  <p className="text-muted-foreground mt-2 text-sm">Showcase your expertise. Build a dynamic portfolio, list your services, and attract new clients.</p>
              </Card>
              <Card className="text-center p-6 border-transparent shadow-lg bg-card hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-headline">Entrepreneurs</h3>
                  <p className="text-muted-foreground mt-2 text-sm">Launch your vision. Create a sleek promo page for your business, post jobs, and build your brand.</p>
              </Card>
              <Card className="text-center p-6 border-transparent shadow-lg bg-card hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-headline">Community Organizers</h3>
                  <p className="text-muted-foreground mt-2 text-sm">Engage your audience. Host events, manage RSVPs, and keep your community connected and informed.</p>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="text-center py-20 sm:py-24 bg-muted/40">
           <div className="container mx-auto px-4 sm:px-6">
             <h2 className="text-3xl sm:text-4xl font-headline font-bold">Ready to Build Your Dream Bio?</h2>
             <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/auth/sign-up">Start for Free</Link>
                </Button>
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
