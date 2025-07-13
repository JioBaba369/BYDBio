
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import type { User, PostWithAuthor, UserProfilePayload } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Edit, Loader2, Link as LinkIcon, Rss, Info, MessageSquare, Briefcase, QrCode, Mail, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { PostCard } from "@/components/post-card";
import { useRouter } from "next/navigation";
import { getPostsByUser, deletePost, toggleLikePost, repostPost } from "@/lib/posts";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicContentCard } from "@/components/public-content-card";
import { generateVCard } from "@/lib/vcard";
import { BookingDialog } from "@/components/booking-dialog";
import { ContactForm } from "@/components/contact-form";
import { AboutTab } from "@/components/profile/about-tab";

interface UserProfilePageProps {
  userProfileData: UserProfilePayload;
}

export default function UserProfileClientPage({ userProfileData }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const { isOwner, user } = userProfileData;
  
  const [isFollowing, setIsFollowing] = useState(userProfileData.isFollowedByCurrentUser);
  const [followerCount, setFollowerCount] = useState(user.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  const { toast } = useToast();

  const vCardData = useMemo(() => {
    if (!user) return '';
    return generateVCard(user);
  }, [user]);


  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(user.uid));
    }
  }, [currentUser, user.uid]);

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
            await unfollowUser(currentUser.uid, user.uid);
            toast({ title: `Unfollowed ${user.name}` });
        } else {
            await followUser(currentUser.uid, user.uid);
            toast({ title: `You are now following ${user.name}` });
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
    if (!currentUser || loadingAction) return;
    setLoadingAction({ postId, action: 'like' });

    const originalPosts = [...posts];
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: (p.likes || 0) + (isLiked ? 1 : -1),
          };
        }
        return p;
      })
    );

    try {
        await toggleLikePost(postId, currentUser.uid);
    } catch (error) {
        toast({ title: "Something went wrong", variant: "destructive" });
        setPosts(originalPosts);
    } finally {
        setLoadingAction(null);
    }
  };

  const handleRepost = async (postId: string) => {
    if (!currentUser || loadingAction) return;
    setLoadingAction({ postId, action: 'repost' });
    try {
      await repostPost(postId, user.uid);
      toast({ title: "Reposted!" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to repost", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuote = (post: any) => {
    sessionStorage.setItem('postToQuote', JSON.stringify(post));
    router.push('/feed');
  };

  const openDeleteDialog = (post: any) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete || !currentUser) return;
    setIsDeleting(true);
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(item => item.id !== postToDelete.id));

    try {
        await deletePost(postToDelete.id);
        toast({ title: "Post Deleted" });
    } catch (error) {
        toast({ title: "Failed to delete post", variant: "destructive" });
        setPosts(originalPosts);
    } finally {
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
        setIsDeleting(false);
    }
  };

  const canViewPrivateContent = isOwner || isFollowing;

  const visiblePosts = useMemo(() => {
    return posts.filter(post => {
        if (post.privacy === 'public') return true;
        if (post.privacy === 'followers') return canViewPrivateContent;
        if (post.privacy === 'me') return isOwner;
        return false;
    });
  }, [posts, canViewPrivateContent, isOwner]);

  const loadPosts = useCallback(async () => {
    if (posts.length > 0 || postsLoading) return; // Don't refetch if already loaded
    setPostsLoading(true);
    try {
        const fetchedPosts = await getPostsByUser(user.uid, currentUser?.uid);
        setPosts(fetchedPosts.map(p => ({
            ...p,
            isLiked: currentUser ? (p.likedBy || []).includes(currentUser.uid) : false,
        })));
    } catch (error) {
        toast({ title: "Error loading posts", variant: "destructive" });
    } finally {
        setPostsLoading(false);
    }
  }, [posts.length, postsLoading, user.uid, currentUser?.uid, toast]);

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
      <div className="space-y-6">
        <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-primary via-secondary to-accent" />
            <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
                    <Avatar className="w-32 h-32 border-4 border-background bg-background shadow-md shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col sm:flex-row justify-between flex-1 w-full gap-4">
                        <div className="pt-16 sm:pt-0 sm:pb-2">
                             <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                             <p className="text-muted-foreground">@{user.username}</p>
                             <div className="flex items-center gap-4 mt-2 text-sm">
                                <p><span className="font-bold">{followerCount.toLocaleString()}</span> Followers</p>
                                <p><span className="font-bold">{user.following.length.toLocaleString()}</span> Following</p>
                                <p><span className="font-bold">{user.postCount || 0}</span> Posts</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-2 shrink-0 w-full sm:w-auto">
                            {isOwner ? (
                                <Button asChild><Link href="/profile"><Edit className="mr-2 h-4 w-4" />Edit Profile</Link></Button>
                            ) : (
                                <Button onClick={handleFollowToggle} disabled={isFollowLoading}>
                                    {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                            )}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Mail className="mr-2 h-4 w-4"/>Contact</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <ContactForm recipientId={user.uid} />
                                </DialogContent>
                            </Dialog>
                            {user.bookingSettings?.acceptingAppointments && (
                                <BookingDialog user={user} />
                            )}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon"><QrCode className="h-4 w-4"/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Scan to Save Contact</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center p-4 gap-4">
                                        {vCardData ? <QRCode value={vCardData} size={256} level="Q" fgColor="#000000" bgColor="#ffffff" /> : <p>Loading QR Code...</p>}
                                        <p className="text-sm text-muted-foreground text-center break-all">Scan this code to add {user.name} to your contacts.</p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Tabs defaultValue="about" className="w-full" onValueChange={(value) => {
            if (value === 'posts') {
                loadPosts();
            }
        }}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
                <AboutTab user={user} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
                {userProfileData.otherContent && userProfileData.otherContent.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userProfileData.otherContent.map(item => (
                            <PublicContentCard key={item.id} item={{...item, author: user}} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <Briefcase className="h-10 w-10 mx-auto" />
                            <h3 className="mt-4 font-semibold">No Content Yet</h3>
                            <p>This user hasn't created any public content yet.</p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
                {postsLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : visiblePosts.length > 0 ? (
                    <div className="space-y-6">
                    {visiblePosts.map(item => (
                        <PostCard
                            key={`${item.id}-${item.author.uid}`}
                            item={item}
                            onLike={handleLike}
                            onDelete={openDeleteDialog}
                            onRepost={handleRepost}
                            onQuote={handleQuote}
                            isLoading={loadingAction?.postId === item.id}
                            loadingAction={loadingAction && loadingAction.postId === item.id ? loadingAction.action : null}
                        />
                    ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <Rss className="h-10 w-10 mx-auto" />
                            <h3 className="mt-4 font-semibold">No Posts Yet</h3>
                            <p>This user hasn't posted anything yet.</p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
