
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from '@/lib/users';
import type { PostWithAuthor, Post } from '@/lib/posts';
import type { Listing } from '@/lib/listings';
import type { Offer } from '@/lib/offers';
import type { Job } from '@/lib/jobs';
import type { Event } from '@/lib/events';
import type { PromoPage } from "@/lib/promo-pages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, UserCheck, UserPlus, QrCode, Edit, Loader2 } from "lucide-react";
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
import { ContactUserForm } from "@/components/contact-user-form";
import { ContentFeedCard } from "@/components/feed/content-feed-card";
import { PromoPageFeedItem } from "@/components/feed/promo-page-feed-item";
import { ListingFeedItem } from "@/components/feed/listing-feed-item";
import { JobFeedItem } from "@/components/feed/job-feed-item";
import { EventFeedItem } from "@/components/feed/event-feed-item";
import { OfferFeedItem } from "@/components/feed/offer-feed-item";


interface UserProfilePageProps {
  userProfileData: User;
  content: {
    posts: PostWithAuthor[];
    listings: (Omit<Listing, 'createdAt' | 'startDate' | 'endDate'> & { createdAt: string, startDate?: string | null, endDate?: string | null })[];
    jobs: (Omit<Job, 'postingDate' | 'createdAt' | 'startDate' | 'endDate'> & { postingDate: string, createdAt: string, startDate?: string | null, endDate?: string | null })[];
    events: (Omit<Event, 'startDate' | 'endDate' | 'createdAt'> & { startDate: string, endDate?: string | null, createdAt: string })[];
    offers: (Omit<Offer, 'startDate' | 'endDate' | 'createdAt'> & { startDate: string, endDate?: string | null, createdAt: string })[];
    promoPages: (Omit<PromoPage, 'createdAt'> & { createdAt: string })[];
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
    if (currentUser.uid === userProfileData.uid) return;

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
        const newPostData = await repostPost(postId, currentUser.uid);
        if (isOwner) {
            setLocalPosts(prev => [{ ...newPostData, isLiked: false }, ...prev]);
        }
        toast({ title: "Reposted!", description: "It will appear on your feed." });
    } catch (error: any) {
        toast({ title: "Failed to repost", description: error.message, variant: 'destructive' });
    } finally {
        setLoadingAction(null);
    }
  }

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
  const { listings, jobs, events, offers, promoPages } = content;
  const isOwner = currentUser?.uid === userProfileData.uid;
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : '';

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
      ...localPosts.map(item => ({ ...item, type: 'post' as const, date: item.createdAt })),
      ...promoPages.map(item => ({ ...item, type: 'promoPage' as const, date: item.createdAt })),
      ...listings.map(item => ({ ...item, type: 'listing' as const, date: item.createdAt })),
      ...jobs.map(item => ({ ...item, type: 'job' as const, date: item.postingDate })),
      ...events.map(item => ({ ...item, type: 'event' as const, date: item.startDate })),
      ...offers.map(item => ({ ...item, type: 'offer' as const, date: item.startDate })),
    ];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [localPosts, promoPages, listings, jobs, events, offers]);
  
  const hasContent = allContent.length > 0;

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
        <Card className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-blue-500/5 to-teal-400/5 opacity-50 z-0"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling" />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="mt-2 text-muted-foreground font-body">{bio}</p>
             <div className="mt-4 flex items-center justify-center gap-2">
                <ShareButton url={canonicalUrl} />
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

          <div className="relative z-10 mt-8 flex flex-col space-y-4">
            {links.map((link, index) => {
                const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                return (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full group">
                    <div className="w-full h-14 text-lg font-semibold flex items-center p-4 rounded-lg bg-background/70 shadow-sm border hover:bg-background transition-all hover:scale-[1.02] hover:shadow-lg ease-out duration-200">
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="flex-1 text-center">{link.title}</span>
                      <ExternalLink className="h-5 w-5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                )
            })}
          </div>
        </Card>
        
        {hasContent && (
            <Card id="content" className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl border-primary/10">
                <CardHeader>
                    <CardTitle>Content Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allContent.map(item => {
                        const uniqueKey = `${item.type}-${item.id}`;
                        if (item.type === 'post') {
                            const postItem = item as (PostWithAuthor & { isLiked: boolean });
                            return (
                                <PostCard
                                    key={uniqueKey}
                                    item={postItem}
                                    onLike={handleLike}
                                    onDelete={openDeleteDialog}
                                    onRepost={handleRepost}
                                    onQuote={handleQuote}
                                    isLoading={loadingAction?.postId === item.id}
                                    loadingAction={loadingAction?.postId === item.id ? loadingAction.action : null}
                                />
                            );
                        }

                        const componentMap = {
                            promoPage: { title: "Created a new promo page", component: <PromoPageFeedItem item={item as PromoPage} /> },
                            listing: { title: "Added a new listing", component: <ListingFeedItem item={item as Listing} /> },
                            job: { title: "Posted a new job", component: <JobFeedItem item={item as Job} /> },
                            event: { title: "Created a new event", component: <EventFeedItem item={item as Event} /> },
                            offer: { title: "Posted a new offer", component: <OfferFeedItem item={item as Offer} /> },
                        };
                        
                        const content = componentMap[item.type as keyof typeof componentMap];
                        
                        if (!content) return null;
                        
                        return (
                            <ContentFeedCard key={uniqueKey} title={content.title} date={item.date}>
                                {content.component}
                            </ContentFeedCard>
                        );
                    })}
                </CardContent>
            </Card>
        )}

        {!isOwner && (
            <Card className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl border-primary/10">
                <CardHeader>
                    <CardTitle>Contact {name.split(' ')[0]}</CardTitle>
                    <CardDescription>Send a message directly to {name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactUserForm recipientUsername={username} />
                </CardContent>
            </Card>
        )}

        <Card className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 text-center">
            <div className="flex flex-col items-center gap-2">
                <a href={`/u/${username}/card`} className="text-sm text-primary hover:underline font-semibold">View Digital Business Card</a>
                <a href={`/u/${username}/links`} className="text-sm text-primary hover:underline font-semibold">View Links Page</a>
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
