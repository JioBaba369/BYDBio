
'use client';

import { useState, useEffect } from "react";
import type { User, Post, Business, Event, Job, Listing, Offer } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Briefcase, Calendar, Tag, MapPin, Heart, MessageCircle, DollarSign, Building2, Tags, ExternalLink, Globe } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { linkIcons } from "@/lib/link-icons";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


// Add isLiked to post type for this component's state
type PostWithLike = Post & { isLiked: boolean };
type UserProfileWithLikes = User & { posts: PostWithLike[] };

interface UserProfilePageProps {
  userProfileData: User;
}

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

// This component safely formats the date on the client-side to prevent hydration errors.
function ClientFormattedDate({ dateString, formatStr }: { dateString: string; formatStr: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setFormattedDate(format(parseISO(dateString), formatStr));
  }, [dateString, formatStr]);

  // Render a placeholder or nothing until the client-side formatting is complete.
  if (!formattedDate) {
    return <span>...</span>;
  }

  return <>{formattedDate}</>;
}

export default function UserProfilePage({ userProfileData }: UserProfilePageProps) {
  const [userProfile, setUserProfile] = useState<UserProfileWithLikes | null>(
    userProfileData
      ? {
          ...userProfileData,
          posts: userProfileData.posts.map((p) => ({ ...p, isLiked: false })),
        }
      : null
  );

  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['posts', 'businesses', 'listings', 'jobs', 'events', 'offers'];
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
  
  const handleLike = (postId: string) => {
    if (!userProfile) return;

    setUserProfile((prevProfile) => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        posts: prevProfile.posts.map((post) => {
          if (post.id === postId) {
            const isLiked = !post.isLiked;
            const likes = isLiked ? post.likes + 1 : post.likes - 1;
            return { ...post, isLiked, likes };
          }
          return post;
        }),
      };
    });
  };

  if (!userProfile) {
    // This case should ideally be handled by the parent server component.
    return <div>User not found.</div>
  }

  const { name, username, avatarUrl, avatarFallback, bio, links, subscribers, jobs, events, offers, listings, posts, businesses } = userProfile;
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
             <div className="mt-4">
              <ShareButton />
            </div>
            <div className="mt-6 flex w-full items-center gap-4">
              <Button className="flex-1 font-bold">Follow</Button>
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
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full h-14 text-base font-semibold justify-start p-4 hover:bg-primary/10 hover:border-primary">
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="flex-1 text-center">{link.title}</span>
                    </Button>
                  </a>
                )
            })}
          </div>
        </Card>
        
        {hasContent && (
            <Card className="bg-background/80 backdrop-blur-sm p-4 sm:p-6 shadow-2xl rounded-2xl border-primary/10">
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
                                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <Heart className={cn("h-4 w-4", post.isLiked && "fill-red-500 text-red-500")} />
                                    <span>{post.likes}</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{post.comments}</span>
                                </div>
                                <span className="ml-auto text-xs">{post.timestamp}</span>
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
                                <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="product design"/>
                                </div>
                                <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                <Badge variant="secondary"><Tags className="mr-1 h-3 w-3" /> {item.category}</Badge>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                <p className="font-bold text-lg">{item.price}</p>
                                <Button>View</Button>
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
                                </CardContent>
                                 <CardFooter>
                                    <Button className="w-full">View Details</Button>
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
                                    <Calendar className="mr-2 h-4 w-4" /> <ClientFormattedDate dateString={event.date} formatStr="PPP" />
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
                                      <span>Releases: <ClientFormattedDate dateString={offer.releaseDate} formatStr="PPP" /></span>
                                  </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Claim Offer</Button>
                                </CardFooter>
                            </Card>
                         ))}
                    </TabsContent>
                </Tabs>
            </Card>
        )}

        <Card className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
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
