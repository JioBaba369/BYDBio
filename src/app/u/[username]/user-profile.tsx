
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { linkIcons } from "@/lib/link-icons";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getPostsByUser, toggleLikePost, deletePost, repostPost } from '@/lib/posts';
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { PromoPageFeedItem } from "@/components/feed/promo-page-feed-item";
import { ListingFeedItem } from "@/components/feed/listing-feed-item";
import { JobFeedItem } from "@/components/feed/job-feed-item";
import { EventFeedItem } from "@/components/feed/event-feed-item";
import { OfferFeedItem } from "@/components/feed/offer-feed-item";
import { ContactForm } from "@/components/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentFeedCard } from "@/components/feed/content-feed-card";
import { Separator } from "@/components/ui/separator";

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

  // Sync posts when navigating between profiles
  useEffect(() => {
    setLocalPosts(content.posts.map(p => ({
        ...p,
        isLiked: currentUser ? p.likedBy.includes(currentUser.uid) : false,
    })));
  }, [content.posts, currentUser]);

  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
  }, [currentUser, userProfileData.uid]);
  
  const fetchPosts = useCallback(async () => {
    const freshPosts = await getPostsByUser(userProfileData.uid);
    setLocalPosts(freshPosts.map(p => ({
      ...p,
      isLiked: currentUser ? p.likedBy.includes(currentUser.uid) : false,
    })));
  }, [userProfileData.uid, currentUser]);

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
        // After any follow/unfollow action, refetch the posts to update visibility
        await fetchPosts();
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
      if (isOwner) {
          await fetchPosts();
      }
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
            author: { 
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


  const { name, username, avatarUrl, avatarFallback, bio, links } = userProfileData;

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
  
  const hasLinks = links && links.length > 0;

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
        <Card className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-background z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
              <p className="text-muted-foreground">@{username}</p>
              
               <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-3 items-center gap-4">
                  <div className="sm:col-span-1 text-center p-2 rounded-md bg-muted/50">
                      <p className="font-bold text-lg text-foreground">{followerCount}</p>
                      <p className="text-xs text-muted-foreground tracking-wide">Followers</p>
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
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
                      <Button asChild variant="outline" className="flex-1">
                          <Link href={`/u/${username}/card`}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Digital Card
                          </Link>
                      </Button>
                  </div>
              </div>
            </div>
            
            {(bio || hasLinks) && (
              <div className="w-full text-left mt-8">
                <Separator />
                {bio && (
                    <div className="mt-6">
                        <h3 className="font-headline font-semibold text-lg">About</h3>
                        <p className="mt-2 text-foreground/90 max-w-prose whitespace-pre-wrap">{bio}</p>
                    </div>
                )}
                {hasLinks && (
                    <div className="mt-6">
                        <h3 className="font-headline font-semibold text-lg">Links</h3>
                        <div className="flex flex-col space-y-3 mt-3">
                          {links.map((link, index) => {
                              const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                              return (
                              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full group">
                                  <div className="w-full h-14 text-base font-semibold flex items-center p-4 rounded-lg bg-background/70 shadow-sm border hover:bg-muted transition-all hover:scale-[1.02] ease-out duration-200">
                                  {Icon && <Icon className="h-5 w-5" />}
                                  <span className="flex-1 text-center">{link.title}</span>
                                  <ExternalLink className="h-5 w-5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                              </a>
                              )
                          })}
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Tabs defaultValue="creations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="creations"><Package className="mr-2 h-4 w-4"/>Creations</TabsTrigger>
                <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4"/>Feed</TabsTrigger>
                <TabsTrigger value="contact"><MessageSquare className="mr-2 h-4 w-4" />Contact</TabsTrigger>
            </TabsList>
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
                            const contentBody = componentMap[item.type as keyof typeof componentMap];
                            if (!contentBody) return null;

                            return (
                                <ContentFeedCard
                                    key={uniqueKey}
                                    author={userProfileData}
                                    date={item.date}
                                    category={item.type}
                                >
                                    {contentBody}
                                </ContentFeedCard>
                            );
                        })}
                    </div>
                ) : (
                     <Card className="text-center text-muted-foreground p-10">
                        This user hasn't created any public content yet.
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
