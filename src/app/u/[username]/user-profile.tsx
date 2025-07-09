
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, UserCheck, UserPlus, QrCode, Edit, Loader2, Rss, Info, Package, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(userProfileData.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [localPosts, setLocalPosts] = useState<PostWithAuthor[]>([]);
  
  const { toast } = useToast();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  const isOwner = currentUser?.uid === userProfileData.uid;

  useEffect(() => {
    setIsFollowing(currentUser?.following?.includes(userProfileData.uid) || false);
    setFollowerCount(userProfileData.followerCount || 0);
  }, [currentUser, userProfileData]);

  useEffect(() => {
    setLocalPosts(content.posts.map(p => ({
        ...p,
        isLiked: currentUser ? p.likedBy.includes(currentUser.uid) : false,
    })));
  }, [content.posts, currentUser]);
  
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
        await fetchPosts();
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

  const canViewPrivateContent = useMemo(() => isOwner || isFollowing, [isOwner, isFollowing]);

  const visiblePosts = useMemo(() => {
    return localPosts.filter(post => {
        if (post.privacy === 'public') return true;
        if (post.privacy === 'followers') return canViewPrivateContent;
        if (post.privacy === 'me') return isOwner;
        return false;
    });
  }, [localPosts, canViewPrivateContent, isOwner]);

  const unifiedFeed = useMemo(() => {
    const allContent = [
      ...visiblePosts.map(item => ({ ...item, type: 'post' as const, date: item.createdAt })),
      ...content.promoPages.map(item => ({ ...item, type: 'promoPage' as const, date: item.createdAt })),
      ...content.listings.map(item => ({ ...item, type: 'listing' as const, date: item.createdAt })),
      ...content.jobs.map(item => ({ ...item, type: 'job' as const, date: item.postingDate })),
      ...content.events.map(item => ({ ...item, type: 'event' as const, date: item.startDate })),
      ...content.offers.map(item => ({ ...item, type: 'offer' as const, date: item.startDate })),
    ];
    allContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return allContent;
  }, [visiblePosts, content]);

  const componentMap = {
      post: (item: any) => (
        <PostCard
          item={item}
          onLike={handleLike}
          onDelete={openDeleteDialog}
          onRepost={handleRepost}
          onQuote={handleQuote}
          isLoading={loadingAction?.postId === item.id}
          loadingAction={loadingAction?.postId === item.id ? loadingAction.action : null}
        />
      ),
      promoPage: (item: any) => <Card><CardContent className="p-4"><PromoPageFeedItem item={item as PromoPage} /></CardContent></Card>,
      listing: (item: any) => <Card><CardContent className="p-4"><ListingFeedItem item={item as Listing} /></CardContent></Card>,
      job: (item: any) => <Card><CardContent className="p-4"><JobFeedItem item={item as Job} /></CardContent></Card>,
      event: (item: any) => <Card><CardContent className="p-4"><EventFeedItem item={item as Event} /></CardContent></Card>,
      offer: (item: any) => <Card><CardContent className="p-4"><OfferFeedItem item={item as Offer} /></CardContent></Card>,
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column (Sticky) */}
        <div className="md:col-span-1 md:sticky top-20 space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm p-6 shadow-2xl rounded-2xl border-primary/10">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
                <p className="text-muted-foreground">@{username}</p>
              
                <div className="mt-6 grid w-full grid-cols-1 items-center gap-4">
                     <div className="flex flex-col sm:flex-row gap-2">
                        {isOwner ? (
                            <Button asChild className="flex-1 font-bold">
                                <Link href="/profile">
                                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                </Link>
                            </Button>
                        ) : (
                            <Button className="flex-1 font-bold" onClick={handleFollowToggle} disabled={isFollowLoading}>
                                {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={`/u/${username}/card`}>
                                <QrCode className="mr-2 h-4 w-4" /> Digital Card
                            </Link>
                        </Button>
                    </div>
                </div>

                {bio && (
                  <>
                    <Separator className="my-6" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap text-left">{bio}</p>
                  </>
                )}
              </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4"/>Feed</TabsTrigger>
                  <TabsTrigger value="connect"><MessageSquare className="mr-2 h-4 w-4" />Connect</TabsTrigger>
              </TabsList>
              <TabsContent value="feed" className="mt-6">
                  {unifiedFeed.length > 0 ? (
                      <div className="space-y-6">
                          {unifiedFeed.map(item => {
                              const ContentComponent = componentMap[item.type as keyof typeof componentMap];
                              if (!ContentComponent) return null;
                              return <ContentComponent key={`${item.type}-${item.id}`} item={item} />;
                          })}
                      </div>
                  ) : (
                       <Card className="text-center text-muted-foreground p-10">
                          This user hasn't posted any content yet.
                      </Card>
                  )}
              </TabsContent>
              <TabsContent value="connect" className="mt-6 space-y-6">
                {links && links.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Links</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {links.map((link, index) => {
                          const Icon = linkIcons[link.icon as keyof typeof linkIcons];
                          return (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-full group">
                              <div className="w-full h-14 text-base font-semibold flex items-center p-4 rounded-lg bg-background/70 shadow-sm border hover:bg-muted transition-all hover:scale-[1.02] ease-out duration-200">
                              {Icon && <Icon className="h-5 w-5 text-primary" />}
                              <span className="flex-1 text-center text-sm">{link.title}</span>
                              <ExternalLink className="h-5 w-5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                          </a>
                          )
                      })}
                    </CardContent>
                  </Card>
                )}
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
        </div>
      </div>
    </>
  );
}
