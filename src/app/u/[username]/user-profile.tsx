
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from '@/lib/users';
import type { Post } from '@/lib/posts';
import type { Listing } from '@/lib/listings';
import type { Offer } from '@/lib/offers';
import type { Job } from '@/lib/jobs';
import type { Event } from '@/lib/events';
import { type Business } from "@/lib/businesses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Briefcase, Calendar, Tag, MapPin, Heart, MessageCircle, DollarSign, Building2, Tags, ExternalLink, Globe, UserCheck, UserPlus, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { linkIcons } from "@/lib/link-icons";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { useRouter } from "next/navigation";
import QRCode from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { formatCurrency } from "@/lib/utils";


interface UserProfilePageProps {
  userProfileData: User;
  content: {
    posts: (Omit<Post, 'createdAt'> & { createdAt: string })[];
    listings: (Omit<Listing, 'createdAt' | 'startDate' | 'endDate'> & { createdAt: string, startDate?: string | null, endDate?: string | null })[];
    jobs: (Omit<Job, 'postingDate' | 'createdAt' | 'startDate' | 'endDate'> & { postingDate: string, createdAt: string, startDate?: string | null, endDate?: string | null })[];
    events: (Omit<Event, 'startDate' | 'endDate' | 'createdAt'> & { startDate: string, endDate?: string | null, createdAt: string })[];
    offers: (Omit<Offer, 'startDate' | 'endDate' | 'createdAt'> & { startDate: string, endDate?: string | null, createdAt: string })[];
    businesses: (Omit<Business, 'createdAt'> & { createdAt: string })[];
  }
}

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;


export default function UserProfilePage({ userProfileData, content }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(userProfileData.uid) || false);
  const [followerCount, setFollowerCount] = useState(userProfileData.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
  }, [currentUser, userProfileData.uid]);
  
  const { toast } = useToast();
  
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const handleContactSubmit = async (data: ContactFormValues) => {
    try {
      console.log(data);
      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      contactForm.reset();
    } catch (error) {
       console.error("Contact form submission error:", error);
       toast({ title: "Error Sending Message", variant: "destructive" });
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to follow users.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (currentUser.uid === userProfileData.uid) return;

    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;

    setIsFollowing(!currentlyFollowing);
    setFollowerCount(prev => prev + (!currentlyFollowing ? 1 : -1));

    try {
        if (currentlyFollowing) {
            await unfollowUser(currentUser.uid, userProfileData.uid);
            toast({ title: `Unfollowed ${userProfileData.name}` });
        } else {
            await followUser(currentUser.uid, userProfileData.uid);
            toast({ title: `You are now following ${userProfileData.name}` });
        }
    } catch (error) {
        setIsFollowing(currentlyFollowing);
        setFollowerCount(prev => prev + (currentlyFollowing ? 1 : -1));
        toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
        setIsFollowLoading(false);
    }
  };


  const { name, username, avatarUrl, avatarFallback, bio, links, businessCard } = userProfileData;
  const { posts, listings, jobs, events, offers, businesses } = content;

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${businessCard?.company || ''}
TITLE:${businessCard?.title || ''}
TEL;TYPE=WORK,VOICE:${businessCard?.phone || ''}
EMAIL:${businessCard?.email || ''}
URL:${businessCard?.website || ''}
X-SOCIALPROFILE;type=linkedin:${businessCard?.linkedin || ''}
ADR;TYPE=WORK:;;${businessCard?.location || ''}
END:VCARD`;
  
  const allContent = useMemo(() => {
    const combined = [
      ...posts.map(item => ({ ...item, type: 'post', date: item.createdAt })),
      ...businesses.map(item => ({ ...item, type: 'business', date: item.createdAt })),
      ...listings.map(item => ({ ...item, type: 'listing', date: item.createdAt })),
      ...jobs.map(item => ({ ...item, type: 'job', date: item.createdAt })),
      ...events.map(item => ({ ...item, type: 'event', date: item.createdAt })),
      ...offers.map(item => ({ ...item, type: 'offer', date: item.createdAt })),
    ];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [posts, businesses, listings, jobs, events, offers]);
  
  const hasContent = allContent.length > 0;

  return (
    <div className="flex justify-center bg-muted/40 py-8 px-4">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <Card className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
              <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling" />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="mt-2 text-muted-foreground font-body">{bio}</p>
             <div className="mt-4 flex items-center justify-center gap-2">
                <ShareButton />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Scan to save contact</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-4 gap-4">
                            <QRCode value={vCardData} size={256} bgColor="#ffffff" fgColor="#000000" level="Q" />
                            <p className="text-sm text-muted-foreground text-center">Scan this code with your phone's camera to save {name}'s contact details.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="mt-6 flex w-full items-center gap-4">
              <Button 
                className="flex-1 font-bold" 
                onClick={handleFollowToggle}
                disabled={isFollowLoading || currentUser?.uid === userProfileData.uid}
              >
                {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <div className="text-center p-2 rounded-md bg-muted/50 w-28">
                <p className="font-bold text-lg text-foreground">{followerCount}</p>
                <p className="text-xs text-muted-foreground tracking-wide">Followers</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            {links.map((link, index) => {
                const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                return (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full group">
                    <div className="w-full h-14 text-lg font-semibold flex items-center p-4 rounded-lg bg-secondary hover:scale-[1.02] transition-transform duration-200 ease-out">
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="flex-1 text-center">{link.title}</span>
                      <ExternalLink className="h-5 w-5 text-secondary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                )
            })}
          </div>
        </Card>
        
        {hasContent && (
            <Card id="content" className="bg-background/80 backdrop-blur-sm shadow-2xl rounded-2xl border-primary/10">
                <CardHeader>
                    <CardTitle>Content Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allContent.map(item => {
                        switch(item.type) {
                            case 'post': return (
                                <Card key={item.id} className="shadow-none border">
                                    <CardContent className="p-4">
                                        <p className="whitespace-pre-wrap text-sm">{item.content}</p>
                                        {item.imageUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border">
                                            <Image src={item.imageUrl} alt="Post image" width={600} height={400} className="object-cover" data-ai-hint="office workspace"/>
                                        </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-start items-center gap-4 px-4 pb-4 pt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1"><Heart className="h-4 w-4" /><span>{item.likes}</span></div>
                                        <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /><span>{item.comments}</span></div>
                                        <ClientFormattedDate date={item.createdAt} relative className="ml-auto text-xs" />
                                    </CardFooter>
                                </Card>
                            );
                            case 'business': return (
                                <Card key={item.id} className="shadow-none border">
                                    <CardHeader><CardTitle className="text-base">Created a new business page</CardTitle></CardHeader>
                                    <CardContent>
                                        <Link href={`/b/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
                                            <div className="flex gap-4">
                                                {item.logoUrl && <Image src={item.logoUrl} alt={item.name} width={56} height={56} className="rounded-lg object-cover" data-ai-hint="logo"/>}
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2"><ClientFormattedDate date={item.createdAt} relative /></CardFooter>
                                </Card>
                            );
                            case 'listing': return (
                                <Card key={item.id} className="shadow-none border">
                                     <CardHeader><CardTitle className="text-base">Added a new listing</CardTitle></CardHeader>
                                     <CardContent>
                                         <Link href={`/l/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
                                            <div className="flex gap-4 items-center">
                                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} width={120} height={80} className="rounded-lg object-cover" data-ai-hint="product design"/>}
                                                <div className="flex-1">
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-primary font-bold">{formatCurrency(item.price)}</p>
                                                    <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                                                </div>
                                            </div>
                                        </Link>
                                     </CardContent>
                                     <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2"><ClientFormattedDate date={item.createdAt} relative /></CardFooter>
                                </Card>
                            );
                            case 'job': return (
                                <Card key={item.id} className="shadow-none border">
                                    <CardHeader><CardTitle className="text-base">Posted a new opportunity</CardTitle></CardHeader>
                                     <CardContent>
                                        <Link href={`/o/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4"/> {item.company}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
                                            <Badge variant="destructive" className="mt-2">{item.type}</Badge>
                                        </Link>
                                     </CardContent>
                                     <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2"><ClientFormattedDate date={item.createdAt} relative /></CardFooter>
                                </Card>
                            );
                            case 'event': return (
                                <Card key={item.id} className="shadow-none border">
                                    <CardHeader><CardTitle className="text-base">Created a new event</CardTitle></CardHeader>
                                     <CardContent>
                                        <Link href={`/events/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
                                            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} width={600} height={200} className="rounded-lg object-cover w-full aspect-video mb-2" data-ai-hint="event poster"/>}
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4"/> <ClientFormattedDate date={item.startDate} formatStr="PPP p"/></p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {item.location}</p>
                                        </Link>
                                     </CardContent>
                                     <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2"><ClientFormattedDate date={item.createdAt} relative /></CardFooter>
                                </Card>
                            );
                            case 'offer': return (
                                 <Card key={item.id} className="shadow-none border">
                                    <CardHeader><CardTitle className="text-base">Posted a new offer</CardTitle></CardHeader>
                                     <CardContent>
                                        <Link href={`/offer/${item.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border -m-4">
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                            <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                                        </Link>
                                     </CardContent>
                                     <CardFooter className="text-xs text-muted-foreground px-4 pb-4 pt-2"><ClientFormattedDate date={item.createdAt} relative /></CardFooter>
                                </Card>
                            );
                            default: return null;
                        }
                    })}
                </CardContent>
            </Card>
        )}

        <Card id="contact" className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
          <div className="text-center">
            <h2 className="text-xl font-bold font-headline mb-4">Contact Me</h2>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4 text-left">
                  <FormField control={contactForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel className="text-muted-foreground">Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} className="bg-background/80" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={contactForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="text-muted-foreground">Email</FormLabel><FormControl><Input type="email" placeholder="Your Email" {...field} className="bg-background/80" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={contactForm.control} name="message" render={({ field }) => (
                    <FormItem><FormLabel className="text-muted-foreground">Message</FormLabel><FormControl><Textarea placeholder="Your message..." rows={4} {...field} className="bg-background/80" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full font-bold" disabled={contactForm.formState.isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {contactForm.formState.isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
              </form>
            </Form>
          </div>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 text-center">
            <div className="flex flex-col items-center gap-2">
                <a href={`/u/${username}/card`} className="text-sm text-primary hover:underline font-semibold">View Digital Business Card</a>
                <a href={`/u/${username}/links`} className="text-sm text-primary hover:underline font-semibold">View Links Page</a>
            </div>
            <Separator className="my-8" />
            <div>
                <Logo className="justify-center text-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Build Your Dream Bio. Your professional hub for profiles, links, and opportunities.</p>
                <Button asChild className="mt-4 font-bold"><Link href="/">Get Started Free</Link></Button>
            </div>
        </Card>
      </div>
    </div>
  );
}
