
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { UserRound, Link as LinkIcon, LayoutGrid, Wallet } from "lucide-react";

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter">The One Link for Everything You Are</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Create a beautiful profile that showcases your work, content, and links—all in one place. Your professional hub for the creator economy.
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
           <div className="relative rounded-xl border-8 border-foreground/10 bg-background/50 p-2 shadow-2xl overflow-hidden max-w-5xl mx-auto">
             <Image 
                src="https://placehold.co/1200x675.png" 
                width={1200}
                height={675}
                alt="BYD.Bio Profile Example"
                className="rounded-md"
                data-ai-hint="website interface"
             />
           </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-headline font-bold">A Toolkit for Digital Professionals</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Everything you need to build your brand, share your content, and connect with your audience.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6">
                <UserRound className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold font-headline">Unified Profile</h3>
                <p className="text-muted-foreground mt-2 text-sm">Bring together your bio, social links, and digital card into one stunning page.</p>
              </Card>
              <Card className="text-center p-6">
                <LinkIcon className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold font-headline">Link-in-Bio</h3>
                <p className="text-muted-foreground mt-2 text-sm">The only link you'll ever need. Perfect for social media, email signatures, and more.</p>
              </Card>
              <Card className="text-center p-6">
                <LayoutGrid className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold font-headline">Content Hub</h3>
                <p className="text-muted-foreground mt-2 text-sm">Showcase your products, services, events, and job opportunities directly on your profile.</p>
              </Card>
              <Card className="text-center p-6">
                <Wallet className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold font-headline">Monetize Your Brand</h3>
                <p className="text-muted-foreground mt-2 text-sm">From digital goods to special offers, create new revenue streams with ease.</p>
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
