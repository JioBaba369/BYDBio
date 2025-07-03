
'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Linkedin, Github, Twitter, Send, Briefcase, Calendar, Tag, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Mock data
const userProfile = {
  username: "janedoe",
  name: "Jane Doe",
  avatarUrl: "https://placehold.co/200x200.png",
  bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
  subscribers: "12.5k",
  links: [
    { title: "Personal Website", url: "#", icon: <Globe className="h-5 w-5" /> },
    { title: "LinkedIn", url: "#", icon: <Linkedin className="h-5 w-5" /> },
    { title: "GitHub", url: "#", icon: <Github className="h-5 w-5" /> },
    { title: "Twitter / X", url: "#", icon: <Twitter className="h-5 w-5" /> },
  ],
  jobs: [
    { title: "Lead UI/UX Designer", company: "Innovate Co.", location: "Remote", type: "Full-time" },
  ],
  events: [
    { title: "Design Systems Meetup", date: "December 1, 2024", location: "Online" },
  ],
  offers: [
     { title: "Portfolio Review Session", description: "Book a 1-on-1 portfolio review session with me.", category: "Service" },
  ]
};

export default function LinkInBioPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch user data based on params.username
  const { name, avatarUrl, bio, links, subscribers, jobs, events, offers } = userProfile;
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
        toast({
            title: "Incomplete Form",
            description: "Please fill out all fields.",
            variant: "destructive",
        });
        return;
    }
    console.log({ name: contactName, email: contactEmail, message: contactMessage });
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };


  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
              <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling" />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="mt-2 text-muted-foreground font-body">{bio}</p>
            <div className="mt-6 flex w-full items-center gap-4">
              <Button className="flex-1 font-bold">Follow</Button>
              <div className="text-center p-2 rounded-md bg-muted/50 w-28">
                <p className="font-bold text-lg text-foreground">{subscribers}</p>
                <p className="text-xs text-muted-foreground tracking-wide">Subscribers</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full h-14 text-base font-semibold justify-start p-4 hover:bg-primary/10 hover:border-primary">
                  {link.icon}
                  <span className="flex-1 text-center">{link.title}</span>
                </Button>
              </a>
            ))}
          </div>

          <div className="mt-8 space-y-8">
            {/* Jobs Section */}
            {jobs.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-headline">Latest Jobs</h2>
                    <Button asChild variant="link" className="text-primary pr-0">
                        <Link href={`/u/${params.username}/jobs`}>View all</Link>
                    </Button>
                </div>
                <div className="grid gap-4">
                    {jobs.slice(0, 1).map((job, index) => (
                      <Card key={index} className="shadow-none">
                        <CardHeader>
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <CardDescription>{job.company}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" /> {job.location}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                                <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {events.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-headline">Upcoming Events</h2>
                    <Button asChild variant="link" className="text-primary pr-0">
                        <Link href={`/u/${params.username}/events`}>View all</Link>
                    </Button>
                </div>
                <div className="grid gap-4">
                    {events.slice(0, 1).map((event, index) => (
                        <Card key={index} className="shadow-none">
                          <CardHeader>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" /> {event.date}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" /> {event.location}
                              </div>
                          </CardContent>
                        </Card>
                    ))}
                </div>
              </div>
            )}
            
            {/* Offers Section */}
            {offers.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-headline">Active Offers</h2>
                    <Button asChild variant="link" className="text-primary pr-0">
                        <Link href={`/u/${params.username}/offers`}>View all</Link>
                    </Button>
                </div>
                <div className="grid gap-4">
                    {offers.slice(0, 1).map((offer, index) => (
                        <Card key={index} className="shadow-none">
                          <CardHeader>
                            <CardTitle className="text-lg">{offer.title}</CardTitle>
                            <CardDescription>{offer.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                          </CardContent>
                        </Card>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-center mb-4 font-headline">Contact Me</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div>
                    <Label htmlFor="contact-name" className="text-muted-foreground">Name</Label>
                    <Input id="contact-name" type="text" placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="bg-background/80" />
                </div>
                <div>
                    <Label htmlFor="contact-email" className="text-muted-foreground">Email</Label>
                    <Input id="contact-email" type="email" placeholder="Your Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="bg-background/80" />
                </div>
                <div>
                    <Label htmlFor="contact-message" className="text-muted-foreground">Message</Label>
                    <Textarea id="contact-message" placeholder="Your message..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={4} className="bg-background/80" />
                </div>
                <Button type="submit" className="w-full font-bold">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                </Button>
            </form>
          </div>

          <div className="text-center mt-8">
             <a href="/u/janedoe/card" className="text-sm text-primary hover:underline font-semibold">
                View Digital Business Card
             </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
