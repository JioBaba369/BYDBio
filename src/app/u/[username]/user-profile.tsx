
'use client';

import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// This component safely formats the date on the client-side to prevent hydration errors.
function ClientFormattedDate({ date, formatStr }: { date: Date | string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('...');
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  useEffect(() => {
    setFormattedDate(format(dateObj, formatStr));
  }, [dateObj, formatStr]);

  return <>{formattedDate}</>;
}

export default function UserProfilePage({ userProfileData, content }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Client-side state for optimistic UI updates
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(userProfileData.uid) || false);
  const [subscribers, setSubscribers] = useState(userProfileData.subscribers || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
  }, [currentUser, userProfileData.uid]);

  useEffect(() => {
    // This effect is now just for setting the active tab from the URL hash
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['posts', 'businesses', 'listings', 'jobs', 'events', 'offers', 'contact'];
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const { toast } = useToast();
  
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleContactSubmit = async (data: ContactFormValues) => {
    try {
      // In a real app, this would be an API call
      console.log(data);
      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      contactForm.reset();
    } catch (error) {
       console.error("Contact form submission error:", error);
       toast({
        title: "Error Sending Message",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
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

    // Optimistic update
    setIsFollowing(!currentlyFollowing);
    setSubscribers(prev => prev + (!currentlyFollowing ? 1 : -1));

    try {
        if (currentlyFollowing) {
            await unfollowUser(currentUser.uid, userProfileData.uid);
            toast({ title: `Unfollowed ${userProfileData.name}` });
        } else {
            await followUser(currentUser.uid, userProfileData.uid);
            toast({ title: `You are now following ${userProfileData.name}` });
        }
    } catch (error) {
        // Revert on error
        setIsFollowing(currentlyFollowing);
        setSubscribers(prev => prev + (currentlyFollowing ? 1 : -1));
        toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
        setIsFollowLoading(false);
    }
  };


  const { name, username, avatarUrl, avatarFallback, bio, links, handle, businessCard } = userProfileData;
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
  
  const hasContent = posts.length > 0 || businesses.length > 0 || listings.length > 0 || jobs.length > 0 || events.length > 0 || offers.length > 0;

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
                <p className="font-bold text-lg text-foreground">{subscribers}</p>
                <p className="text-xs text-muted-foreground tracking-wide">Subscribers</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            {links.map((link, index) => {
                const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full group"
                  >
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
          <Card id="content" className="bg-background/80 backdrop-blur-sm p-4 sm:p-6 shadow-2xl rounded-2xl border-primary/10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto flex-wrap">
                      {posts.length > 0 && <TabsTrigger value="posts">Updates</TabsTrigger>}
                      {businesses.length > 0 && <TabsTrigger value="businesses">Businesses</TabsTrigger>}
                      {listings.length > 0 && <TabsTrigger value="listings">Listings</TabsTrigger>}
                      {jobs.length > 0 && <TabsTrigger value="jobs">Jobs</TabsTrigger>}
                      {events.length > 0 && <TabsTrigger value="events">Events</TabsTrigger>}
                      {offers.length > 0 && <TabsTrigger value="offers">Offers</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="posts" className="space-y-4 pt-4">
                      {posts.map((post) => (
                          <Card key={post.id} className="shadow-none border">
                          <CardContent className="p-4">
                              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                              {post.imageUrl && (
                              <div className="mt-4 rounded-lg overflow-hidden border">
                                  <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="object-cover" data-ai-hint="office workspace"/>
                              </div>
                              )}
                          </CardContent>
                          <CardFooter className="flex justify-start items-center gap-4 px-4 pb-4 pt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{post.comments}</span>
                              </div>
                              <span className="ml-auto text-xs">{formatDistanceToNow(parseISO(post.createdAt), { addSuffix: true })}</span>
                          </CardFooter>
                          </Card>
                      ))}
                  </TabsContent>
                   <TabsContent value="businesses" className="space-y-4 pt-4">
                      {businesses.map((item) => (
                         <Card key={item.id} className="flex flex-col shadow-none border">
                          {item.imageUrl &&
                          <div className="overflow-hidden rounded-t-lg">
                              <Image src={item.imageUrl} alt={item.name} width={600} height={300} className="w-full object-cover aspect-[2/1]" data-ai-hint="office storefront"/>
                          </div>
                          }
                          <CardHeader>
                              <CardTitle>{item.name}</CardTitle>
                              <CardDescription>{item.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-muted-foreground">
                                  {item.email && <div className="flex items-center gap-2 truncate"><Send className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.email}</span></div>}
                                  {item.website && <div className="flex items-center gap-2 truncate"><Globe className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.website}</span></div>}
                                  {item.address && <div className="flex items-center gap-2 truncate col-span-2"><MapPin className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{item.address}</span></div>}
                              </div>
                          </CardContent>
                          <Separator className="my-4" />
                          <CardFooter className="flex-col items-start gap-4">
                              <Button asChild variant="outline" className="w-full">
                                  <Link href={`/b/${item.id}`}>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      View Business Page
                                  </Link>
                              </Button>
                          </CardFooter>
                      </Card>
                      ))}
                  </TabsContent>
                  <TabsContent value="listings" className="space-y-4 pt-4">
                      {listings.map((item) => (
                          <Card key={item.id} className="flex flex-col shadow-none border">
                              <div className="overflow-hidden rounded-t-lg">
                              <Image src={item.imageUrl || ''} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                              </div>
                              <CardHeader>
                              <CardTitle>{item.title}</CardTitle>
                              <CardDescription>{item.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="flex-grow space-y-2">
                                <Badge variant="secondary"><Tags className="mr-1 h-3 w-3" /> {item.category}</Badge>
                                {(item.startDate || item.endDate) && (
                                    <div className="flex items-center pt-2 text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" /> 
                                        <span>
                                            {item.startDate && <ClientFormattedDate date={item.startDate} formatStr="PPP" />}
                                            {item.endDate && <> - <ClientFormattedDate date={item.endDate} formatStr="PPP" /></>}
                                        </span>
                                    </div>
                                )}
                              </CardContent>
                              <CardFooter className="flex justify-between items-center">
                              <p className="font-bold text-lg">{item.price}</p>
                              <Button asChild>
                                <Link href={`/l/${item.id}`}>View</Link>
                              </Button>
                              </CardFooter>
                          </Card>
                      ))}
                  </TabsContent>
                  <TabsContent value="jobs" className="space-y-4 pt-4">
                      {jobs.map((job) => (
                          <Card key={job.id} className="shadow-none border">
                              <CardHeader>
                                  <CardTitle>{job.title}</CardTitle>
                                  <CardDescription>{job.company}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                  <div className="flex items-center text-muted-foreground">
                                      <MapPin className="mr-2 h-4 w-4" /> {job.location}
                                  </div>
                                  <div className="flex items-center text-muted-foreground">
                                      <Briefcase className="mr-2 h-4 w-4" /> {job.type}
                                  </div>
                                   {(job.startDate || job.endDate) && (
                                    <div className="flex items-center pt-2 text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" /> 
                                        <span>
                                            {job.startDate && <ClientFormattedDate date={job.startDate} formatStr="PPP" />}
                                            {job.endDate && <> - <ClientFormattedDate date={job.endDate} formatStr="PPP" /></>}
                                        </span>
                                    </div>
                                )}
                              </CardContent>
                               <CardFooter>
                                  <Button asChild className="w-full">
                                    <Link href={`/o/${job.id}`}>View Details</Link>
                                  </Button>
                               </CardFooter>
                          </Card>
                      ))}
                  </TabsContent>
                  <TabsContent value="events" className="space-y-4 pt-4">
                      {events.map((event) => (
                           <Card key={event.id} className="shadow-none border">
                              <CardHeader>
                                  <CardTitle>{event.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> 
                                    <span>
                                        <ClientFormattedDate date={event.startDate} formatStr="PPP" />
                                        {event.endDate && <> - <ClientFormattedDate date={event.endDate} formatStr="PPP" /></>}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" /> {event.location}
                                  </div>
                              </CardContent>
                              <CardFooter>
                                  <Button asChild className="w-full">
                                      <Link href={`/events/${event.id}`}>Learn More</Link>
                                  </Button>
                              </CardFooter>
                          </Card>
                      ))}
                  </TabsContent>
                  <TabsContent value="offers" className="space-y-4 pt-4">
                       {offers.map((offer) => (
                          <Card key={offer.id} className="shadow-none border">
                              <CardHeader>
                              <CardTitle>{offer.title}</CardTitle>
                              <CardDescription>{offer.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Badge variant="secondary"><Tag className="mr-1 h-3 w-3" />{offer.category}</Badge>
                                <div className="flex items-center pt-4 text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> 
                                    <span>
                                        Starts: <ClientFormattedDate date={offer.startDate} formatStr="PPP" />
                                        {offer.endDate && <>, Ends: <ClientFormattedDate date={offer.endDate} formatStr="PPP" /></>}
                                    </span>
                                </div>
                              </CardContent>
                              <CardFooter>
                                  <Button asChild className="w-full">
                                    <Link href={`/offer/${offer.id}`}>Claim Offer</Link>
                                  </Button>
                              </CardFooter>
                          </Card>
                       ))}
                  </TabsContent>
              </Tabs>
          </Card>
        )}

        <Card id="contact" className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
          <div className="text-center">
            <h2 className="text-xl font-bold font-headline mb-4">Contact Me</h2>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4 text-left">
                  <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel className="text-muted-foreground">Name</FormLabel>
                          <FormControl>
                              <Input placeholder="Your Name" {...field} className="bg-background/80" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel className="text-muted-foreground">Email</FormLabel>
                          <FormControl>
                              <Input type="email" placeholder="Your Email" {...field} className="bg-background/80" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={contactForm.control}
                      name="message"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel className="text-muted-foreground">Message</FormLabel>
                          <FormControl>
                              <Textarea placeholder="Your message..." rows={4} {...field} className="bg-background/80" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
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
                <a href={`/u/${username}/card`} className="text-sm text-primary hover:underline font-semibold">
                View Digital Business Card
                </a>
                <a href={`/u/${username}/links`} className="text-sm text-primary hover:underline font-semibold">
                View Links Page
                </a>
            </div>

            <Separator className="my-8" />
            
            <div>
                <Logo className="justify-center text-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                Build Your Dream Bio. Your professional hub for profiles, links, and opportunities.
                </p>
                <Button asChild className="mt-4 font-bold">
                    <Link href="/">Get Started Free</Link>
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}
