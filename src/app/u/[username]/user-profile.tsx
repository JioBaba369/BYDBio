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
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, UserPlus, QrCode, Edit, Loader2, Rss, Package, MessageSquare, Info, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Logo } from "@/components/logo";
import ShareButton from "@/components/share-button";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { toggleLikePost, deletePost, repostPost } from '@/lib/posts';
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { ContactForm } from "@/components/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicContentCard } from "@/components/public-content-card";
import { Separator } from "@/components/ui/separator";
import { linkIcons } from "@/lib/link-icons";

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
  
  const [isFollowing, setIsFollowing] = useState(currentUser?.following.includes(userProfileData.uid) || false);
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(userProfileData.uid));
    }
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
        likes: (originalPost.likes || 0) + (originalPost.isLiked ? -1 : 1),
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
  const isOwner = currentUser?.uid === userProfileData.uid;

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
    const authorDetails = {
        uid: userProfileData.uid,
        name: userProfileData.name,
        username: userProfileData.username,
        avatarUrl: userProfileData.avatarUrl,
        avatarFallback: userProfileData.avatarFallback
    };
    const combined = [
      ...content.promoPages.map(item => ({ ...item, author: authorDetails, type: 'promoPage' as const, date: item.createdAt })),
      ...content.listings.map(item => ({ ...item, author: authorDetails, type: 'listing' as const, date: item.createdAt })),
      ...content.jobs.map(item => ({ ...item, author: authorDetails, type: 'job' as const, date: item.postingDate })),
      ...content.events.map(item => ({ ...item, author: authorDetails, type: 'event' as const, date: item.startDate })),
      ...content.offers.map(item => ({ ...item, author: authorDetails, type: 'offer' as const, date: item.startDate })),
    ];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined;
  }, [content, userProfileData]);

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
          <CardContent className="p-0 relative z-10 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="text-muted-foreground">@{username}</p>
            
            <div className="flex w-full justify-center gap-2 sm:gap-4 mt-6 py-4 border-y border-border/20">
                <div className="text-center p-2 flex-1">
                    <p className="font-bold text-lg sm:text-xl text-foreground">{followerCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground tracking-wide">Followers</p>
                </div>
                <div className="text-center p-2 flex-1">
                    <p className="font-bold text-lg sm:text-xl text-foreground">{(userProfileData.following?.length || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground tracking-wide">Following</p>
                </div>
                <div className="text-center p-2 flex-1">
                    <p className="font-bold text-lg sm:text-xl text-foreground">{(userProfileData.postCount || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground tracking-wide">Posts</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                 <Button asChild variant="secondary" className="font-bold flex-1 sm:flex-none">
                    <Link href={`/u/${username}/card`}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Digital Card
                    </Link>
                </Button>
                <ShareButton className="font-bold flex-1 sm:flex-none" />
                {isClient && isOwner ? (
                    <Button asChild className="font-bold flex-1 sm:flex-none">
                        <Link href="/profile">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Link>
                    </Button>
                ) : (
                    <Button 
                        className="font-bold flex-1 sm:flex-none" 
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading || !isClient}
                    >
                        {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed"><Rss className="mr-2 h-4 w-4"/>Feed</TabsTrigger>
                <TabsTrigger value="showcase"><Package className="mr-2 h-4 w-4"/>Showcase</TabsTrigger>
                <TabsTrigger value="about"><Info className="mr-2 h-4 w-4" />About &amp; Links</TabsTrigger>
                <TabsTrigger value="contact"><MessageSquare className="mr-2 h-4 w-4" />Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="feed" className="mt-6">
                <div className="space-y-6">
                    {visiblePosts.length > 0 ? visiblePosts.map(post => (
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
                    )) : (
                        <Card className="text-center text-muted-foreground p-10">
                            This user hasn't made any posts yet.
                        </Card>
                    )}
                </div>
            </TabsContent>
             <TabsContent value="showcase" className="mt-6">
                <div className="grid gap-4">
                    {allOtherContent.length > 0 ? (
                        allOtherContent.map(item => <PublicContentCard key={`${item.type}-${item.id}`} item={item as any} />)
                    ) : (
                        <Card className="text-center text-muted-foreground p-10">
                            This user hasn't created any showcase content yet.
                        </Card>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">About {name.split(' ')[0]}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-2">{bio || "This user hasn't written a bio yet."}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold">Links</h3>
                     <div className="flex flex-col gap-3 mt-4">
                      {links && links.length > 0 ? (
                        links.map((link, index) => {
                          const Icon = linkIcons[link.icon as keyof typeof linkIcons] || LinkIcon;
                          return (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full group"
                            >
                              <div className="w-full h-14 text-base font-semibold flex items-center p-4 rounded-lg bg-secondary transition-all hover:bg-primary hover:text-primary-foreground ease-out duration-200 shadow-sm">
                                <Icon className="h-5 w-5" />
                                <span className="flex-1 ml-4 truncate">{link.title}</span>
                                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                              </div>
                            </a>
                          )
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">This user hasn't added any links yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="contact" className="mt-6">
              {isClient && isOwner ? (
                  <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                          This is a preview of the contact form that visitors will see on your profile.
                      </CardContent>
                  </Card>
              ) : (
                 <ContactForm recipientId={userProfileData.uid} />
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
