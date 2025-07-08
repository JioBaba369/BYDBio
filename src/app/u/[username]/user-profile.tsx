
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from '@/lib/users';
import type { PostWithAuthor } from '@/lib/posts';
import type { Listing } from '@/lib/listings';
import type { Offer } from '@/lib/offers';
import type { Job } from '@/lib/jobs';
import type { Event } from '@/lib/events';
import type { PromoPage } from "@/lib/promo-pages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, UserCheck, UserPlus, QrCode, Edit, Loader2, Rss, Info, Compass, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { linkIcons } from "@/lib/link-icons";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { useRouter } from "next/navigation";
import QRCode from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PostCard } from "@/components/post-card";
import { toggleLikePost, deletePost, repostPost } from '@/lib/posts';
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { ContentFeedCard } from "@/components/feed/content-feed-card";
import { PromoPageFeedItem } from "@/components/feed/promo-page-feed-item";
import { ListingFeedItem } from "@/components/feed/listing-feed-item";
import { JobFeedItem } from "@/components/feed/job-feed-item";
import { EventFeedItem } from "@/components/feed/event-feed-item";
import { OfferFeedItem } from "@/components/feed/offer-feed-item";
import { ContactForm } from "@/components/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface UserProfilePageProps {
  userProfileData: User;
  content: {
    posts: PostWithAuthor[];
    listings: Listing[];
    jobs: Job[];
    events: Event[];
    offers: Offer[];
    promoPages: PromoPage[];
  }
}

export default function UserProfilePage({ userProfileData, content }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(userProfileData.uid) || false);
  const [followerCount, setFollowerCount] = useState(userProfileData.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [localPosts, setLocalPosts] = useState(content.posts.map(p => ({
    ...p,
    isLiked: currentUser ? p.likedBy.includes(currentUser.uid) : false,
  })));
  
  const { toast } = useToast();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
  }, [currentUser, userProfileData.uid]);
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to follow users.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (isOwner) return;

    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;

    // Optimistic UI Update
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
        // Rollback on error
        setIsFollowing(currentlyFollowing);
        setFollowerCount(prev => prev + (currentlyFollowing ? 1 : -1));
        toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
        setIsFollowLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser || loadingAction) {
        toast({ title: "Please sign in to like posts.", variant: "destructive" });
        return;
    }

    setLoadingAction({ postId, action: 'like' });

    const originalPosts = [...localPosts];
    const postIndex = localPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
        setLoadingAction(null);
        return;
    }

    const originalPost = { ...originalPosts[postIndex] };

    // Optimistic update
    const updatedPost = {
        ...originalPost,
        isLiked: !originalPost.isLiked,
        likes: originalPost.likes + (originalPost.isLiked ? -1 : 1),
    };

    const newPosts = [...originalPosts];
    newPosts[postIndex] = updatedPost;
    setLocalPosts(newPosts);

    // API call
    try {
        await toggleLikePost(postId, currentUser.uid);
    } catch (error) {
        toast({ title: "Something went wrong", variant: "destructive" });
        // Revert on error
        setLocalPosts(originalPosts);
    } finally {
        setLoadingAction(null);
    }
  };

  const openDeleteDialog = (post: PostWithAuthor) => {
    if (currentUser?.uid !== post.author.uid) return;
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    const originalPosts = [...localPosts];
    // Optimistic delete
    setLocalPosts(prev => prev.filter(p => p.id !== postToDelete.id));

    try {
      await deletePost(postToDelete.id);
      toast({ title: "Post deleted" });
    } catch (error) {
      toast({ title: "Failed to delete post", variant: "destructive" });
      setLocalPosts(originalPosts); // Revert on failure
    } finally {
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleRepost = async (postId: string) => {
    if (!currentUser || loadingAction) {
        toast({ title: "Please sign in to repost." });
        return;
    }
    setLoadingAction({ postId, action: 'repost' });
    try {
      await repostPost(postId, currentUser.uid);
      toast({ title: "Reposted!", description: "It will now appear on your own feed." });
    } catch (error: any) {
        toast({ title: "Failed to repost", description: error.message, variant: 'destructive' });
    } finally {
        setLoadingAction(null);
    }
  };

  const handleQuote = (post: PostWithAuthor) => {
    if (!currentUser) {
        toast({ title: "Please sign in to quote posts." });
        router.push('/auth/sign-in');
        return;
    }
    try {
        // Only store the data needed to reconstruct the quoted preview.
        const postToStore = {
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl,
            author: { // Stripped down author
                uid: post.author.uid,
                name: post.author.name,
                username: post.author.username,
                avatarUrl: post.author.avatarUrl,
            },
        };

        sessionStorage.setItem('postToQuote', JSON.stringify(postToStore));
        router.push('/feed');
    } catch (error) {
        console.error("Could not set up post for quoting:", error);
        toast({ title: "Could not quote post", variant: "destructive" });
    }
  };


  const { name, username, avatarUrl, avatarFallback, bio, links, businessCard } = userProfileData;
  const isOwner = currentUser?.uid === userProfileData.uid;
  const businessCardUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${username}/card` : '';

  const canViewPrivateContent = useMemo(() => isOwner || isFollowing, [isOwner, isFollowing]);

  const visiblePosts = useMemo(() => {
    return localPosts.filter(post => {
        if (post.privacy === 'public') return true;
        if (post.privacy === 'followers') return canViewPrivateContent;
        if (post.privacy === 'me') return isOwner;
        return false;
    });
  }, [localPosts, canViewPrivateContent, isOwner]);

  const allOtherContent = useMemo(() => {
    const combined = [
      ...content.promoPages.map(item => ({ ...item, type: 'promoPage' as const, date: item.createdAt })),
      ...content.listings.map(item => ({ ...item, type: 'listing' as const, date: item.createdAt })),
      ...content.jobs.map(item => ({ ...item, type: 'job' as const, date: item.postingDate })),
      ...content.events.map(item => ({ ...item, type: 'event' as const, date: item.startDate })),
      ...content.offers.map(item => ({ ...item, type: 'offer' as const, date: item.startDate })),
    ];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [content]);
  
  const hasLinks = links.length > 0;

  return (
    <>
    <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="post"
    />
    <div className="flex justify-center bg-dot py-8 px-4">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <Card className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-blue-500/5 to-teal-400/5 opacity-50 z-0"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="text-muted-foreground">@{username}</p>
            <div className="mt-6 flex items-center justify-center gap-2">
                <ShareButton url={businessCardUrl} />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Scan to View Digital Business Card</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-4 gap-4">
                            <QRCode value={businessCardUrl} size={256} bgColor="#ffffff" fgColor="#000000" level="Q" />
                            <p className="text-sm text-muted-foreground text-center break-all">{businessCardUrl}</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
             <div className="mt-6 flex w-full flex-col sm:flex-row items-center gap-4">
              {isOwner ? (
                  <Button asChild className="flex-1 font-bold w-full sm:w-auto">
                      <Link href="/profile">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                      </Link>
                  </Button>
              ) : (
                  <Button 
                      className="flex-1 font-bold w-full sm:w-auto" 
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                  >
                      {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      {isFollowing ? 'Following' : 'Follow'}
                  </Button>
              )}
              <div className="text-center p-2 rounded-md bg-muted/50 w-full sm:w-28">
                <p className="font-bold text-lg text-foreground">{followerCount}</p>
                <p className="text-xs text-muted-foreground tracking-wide">Followers</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discover"><Compass className="mr-2 h-4 w-4"/>Discover</TabsTrigger>
                <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4"/>Feed</TabsTrigger>
                <TabsTrigger value="about"><Info className="mr-2 h-4 w-4"/>About</TabsTrigger>
            </TabsList>
            <TabsContent value="discover" className="mt-6">
                 {allOtherContent.length > 0 ? (
                    <div className="space-y-6">
                        {allOtherContent.map(item => {
                            const uniqueKey = `${item.type}-${item.id}`;
                            const componentMap = {
                                promoPage: { title: "Promo Page", component: <PromoPageFeedItem item={item as PromoPage} /> },
                                listing: { title: "Listing", component: <ListingFeedItem item={item as Listing} /> },
                                job: { title: "Job", component: <JobFeedItem item={item as Job} /> },
                                event: { title: "Event", component: <EventFeedItem item={item as Event} /> },
                                offer: { title: "Offer", component: <OfferFeedItem item={item as Offer} /> },
                            };
                            
                            const content = componentMap[item.type as keyof typeof componentMap];
                            
                            if (!content) return null;
                            
                            return (
                                <ContentFeedCard key={uniqueKey} title={content.title} date={item.date}>
                                    {content.component}
                                </ContentFeedCard>
                            );
                        })}
                    </div>
                ) : (
                     <Card className="text-center text-muted-foreground p-10">
                        This user hasn't created any content yet.
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="feed" className="mt-6">
                {visiblePosts.length > 0 ? (
                    <div className="space-y-6">
                        {visiblePosts.map(post => (
                            <PostCard
                                key={post.id}
                                item={post}
                                onLike={handleLike}
                                onDelete={openDeleteDialog}
                                onRepost={handleRepost}
                                onQuote={handleQuote}
                                isLoading={loadingAction?.postId === post.id}
                                loadingAction={loadingAction?.postId === post.id ? loadingAction.action : null}
                            />
                        ))}
                    </div>
                ) : (
                     <Card className="text-center text-muted-foreground p-10">
                        This user hasn't made any posts yet.
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="about" className="mt-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90 max-w-prose whitespace-pre-wrap">{bio || "This user hasn't written a bio yet."}</p>
                    </CardContent>
                </Card>

                {hasLinks && (
                <Card>
                    <CardHeader>
                        <CardTitle>Links</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4">
                        {links.map((link, index) => {
                            const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                            return (
                            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full group">
                                <div className="w-full h-14 text-lg font-semibold flex items-center p-4 rounded-lg bg-background/70 shadow-sm border hover:bg-muted transition-all hover:scale-[1.02] ease-out duration-200">
                                {Icon && <Icon className="h-5 w-5" />}
                                <span className="flex-1 text-center">{link.title}</span>
                                <ExternalLink className="h-5 w-5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </a>
                            )
                        })}
                    </CardContent>
                </Card>
                )}

                {!isOwner && <ContactForm recipientId={userProfileData.uid} />}
            </TabsContent>
        </Tabs>
        
        <Card className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 text-center">
            <div className="flex flex-col items-center gap-2">
                <Link href={`/u/${username}/card`} className="text-sm text-primary hover:underline font-semibold">View Digital Business Card</Link>
                <Link href={`/u/${username}/links`} className="text-sm text-primary hover:underline font-semibold">View Links Page</Link>
            </div>
            <Separator className="my-8" />
            <div>
                <Logo className="justify-center text-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Build Your Dream Bio. Your professional hub for profiles, links, and opportunities.</p>
                <Button asChild className="mt-4 font-bold"><Link href="/">Get Started for Free</Link></Button>
            </div>
        </Card>
      </div>
    </div>
    </>
  );
}
