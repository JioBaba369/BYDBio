
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
import { ExternalLink, UserCheck, UserPlus, QrCode, Edit, Loader2, Rss, Info, MessageSquare, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { linkIcons } from "@/lib/link-icons";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getPrivatePostsByUser, toggleLikePost, deletePost, repostPost } from '@/lib/posts';
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
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

  const isOwner = currentUser?.uid === userProfileData.uid;
  const canViewPrivateContent = useMemo(() => isOwner || isFollowing, [isOwner, isFollowing]);
  
  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
  }, [currentUser, userProfileData.uid]);
  
  useEffect(() => {
    const fetchPrivatePosts = async () => {
      if (canViewPrivateContent) {
        const privatePosts = await getPrivatePostsByUser(userProfileData.uid);
        
        setLocalPosts(currentPublicPosts => {
            const allPosts = [...currentPublicPosts];
            const existingPostIds = new Set(allPosts.map(p => p.id));
            
            privatePosts.forEach(privatePost => {
                if (!existingPostIds.has(privatePost.id)) {
                    allPosts.push({
                        ...privatePost,
                        isLiked: currentUser ? privatePost.likedBy.includes(currentUser.uid) : false,
                    });
                }
            });

            allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return allPosts;
        });
      }
    };
    fetchPrivatePosts();
  }, [canViewPrivateContent, userProfileData.uid, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
        toast({ title: "Please sign in to follow users.", variant: "destructive" });
        router.push('/auth/sign-in');
        return;
    }
    if (isOwner) return;

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
    const updatedPost = { ...originalPost, isLiked: !originalPost.isLiked, likes: originalPost.likes + (originalPost.isLiked ? -1 : 1) };
    const newPosts = [...originalPosts];
    newPosts[postIndex] = updatedPost;
    setLocalPosts(newPosts);

    try {
        await toggleLikePost(postId, currentUser.uid);
    } catch (error) {
        toast({ title: "Something went wrong", variant: "destructive" });
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
    setLocalPosts(prev => prev.filter(p => p.id !== postToDelete.id));

    try {
      await deletePost(postToDelete.id);
      toast({ title: "Post deleted" });
    } catch (error) {
      toast({ title: "Failed to delete post", variant: "destructive" });
      setLocalPosts(originalPosts);
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
        const postToStore = {
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl,
            author: { uid: post.author.uid, name: post.author.name, username: post.author.username, avatarUrl: post.author.avatarUrl },
        };
        sessionStorage.setItem('postToQuote', JSON.stringify(postToStore));
        router.push('/feed');
    } catch (error) {
        console.error("Could not set up post for quoting:", error);
        toast({ title: "Could not quote post", variant: "destructive" });
    }
  };

  const { name, username, avatarUrl, avatarFallback, bio, links } = userProfileData;
  
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
        confirmationText="DELETE"
    />
    <div className="flex justify-center bg-dot py-8 px-4">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <Card className="bg-card p-6 sm:p-8 shadow-xl rounded-2xl border relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background z-0"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="text-muted-foreground">@{username}</p>
            <p className="mt-4 text-foreground/90 max-w-prose text-sm">{bio || "This user hasn't written a bio yet."}</p>
            
            <div className="mt-6 w-full space-y-4">
                <div className="flex w-full flex-col sm:flex-row gap-4">
                    {isOwner ? (
                        <Button asChild className="flex-1 font-bold">
                            <Link href="/profile">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    ) : (
                        <Button 
                            className="flex-1 font-bold" 
                            onClick={handleFollowToggle}
                            disabled={isFollowLoading}
                        >
                            {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    )}
                     <Button asChild variant="secondary" className="flex-1 font-bold">
                        <Link href={`/u/${username}/card`}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Digital Card
                        </Link>
                    </Button>
                    <ShareButton className="flex-1 font-bold" />
                </div>
                <div className="flex w-full gap-4">
                    <div className="flex-1 text-center p-3 rounded-lg bg-muted/50 border">
                        <p className="font-bold text-lg text-foreground">{followerCount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground tracking-wide">Followers</p>
                    </div>
                    <div className="flex-1 text-center p-3 rounded-lg bg-muted/50 border">
                        <p className="font-bold text-lg text-foreground">{(userProfileData.following?.length || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground tracking-wide">Following</p>
                    </div>
                    <div className="flex-1 text-center p-3 rounded-lg bg-muted/50 border">
                        <p className="font-bold text-lg text-foreground">{(userProfileData.postCount || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground tracking-wide">Posts</p>
                    </div>
                </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4"/>Feed</TabsTrigger>
                <TabsTrigger value="creations"><Package className="mr-2 h-4 w-4"/>Creations</TabsTrigger>
                <TabsTrigger value="contact"><MessageSquare className="mr-2 h-4 w-4" />Contact</TabsTrigger>
            </TabsList>
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
            <TabsContent value="creations" className="mt-6">
                 {allOtherContent.length > 0 ? (
                    <div className="space-y-6">
                        {allOtherContent.map(item => {
                            const uniqueKey = `${item.type}-${item.id}`;
                            const componentMap = {
                                promoPage: <PromoPageFeedItem item={item as PromoPage} />,
                                listing: <ListingFeedItem item={item as Listing} />,
                                job: <JobFeedItem item={item as Job} />,
                                event: <EventFeedItem item={item as Event} />,
                                offer: <OfferFeedItem item={item as Offer} />,
                            };
                            const content = componentMap[item.type as keyof typeof componentMap];
                            if (!content) return null;
                            return <div key={uniqueKey}>{content}</div>
                        })}
                    </div>
                ) : (
                     <Card className="text-center text-muted-foreground p-10">
                        This user hasn't created any public content yet.
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="contact" className="mt-6">
              {!isOwner ? (
                  <ContactForm recipientId={userProfileData.uid} />
              ) : (
                  <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                          This is a preview of the contact form that visitors will see on your profile.
                      </CardContent>
                  </Card>
              )}
            </TabsContent>
        </Tabs>
        
        <div className="text-center mt-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                Powered by <Logo className="text-lg text-foreground" />
            </Link>
        </div>
      </div>
    </div>
    </>
  );
}
