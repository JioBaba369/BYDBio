
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Edit, Loader2, Link as LinkIcon, Rss, Info, MessageSquare, Briefcase, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { followUser, unfollowUser } from "@/lib/connections";
import { PostCard } from "@/components/post-card";
import { useRouter } from "next/navigation";
import type { PostWithAuthor, UserProfilePayload } from "@/lib/users";
import { deletePost, toggleLikePost, repostPost } from "@/lib/posts";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicContentCard } from "@/components/public-content-card";
import { AuthorCard } from "@/components/author-card";
import { linkIcons } from "@/lib/link-icons";
import { escapeVCard } from "@/lib/vcard";
import { BookingDialog } from "@/components/booking-dialog";

interface UserProfilePageProps {
  userProfileData: UserProfilePayload;
  viewerId: string | null;
}

export default function UserProfileClientPage({ userProfileData, viewerId }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const isOwner = useMemo(() => viewerId === userProfileData.user.uid, [viewerId, userProfileData.user.uid]);
  
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following.includes(userProfileData.user.uid) || false
  );
  const [followerCount, setFollowerCount] = useState(userProfileData.user.followerCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [posts, setPosts] = useState<PostWithAuthor[]>(
    userProfileData.posts.map(p => ({
      ...p,
      isLiked: viewerId ? (p.likedBy || []).includes(viewerId) : false,
    }))
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  const { toast } = useToast();

  const [vCardData, setVCardData] = useState('');

  useEffect(() => {
    if (userProfileData.user) {
      setVCardData(escapeVCard(userProfileData.user));
    }
  }, [userProfileData.user]);

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(userProfileData.user.uid));
    } else {
      setIsFollowing(false);
    }
  }, [currentUser, userProfileData.user.uid]);

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
            await unfollowUser(currentUser.uid, userProfileData.user.uid);
            toast({ title: `Unfollowed ${userProfileData.user.name}` });
        } else {
            await followUser(currentUser.uid, userProfileData.user.uid);
            toast({ title: `You are now following ${userProfileData.user.name}` });
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
      await repostPost(postId, currentUser.uid);
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
    }
  };

  const { user, content } = userProfileData;

  const canViewPrivateContent = isOwner || isFollowing;

  const visiblePosts = useMemo(() => {
    return posts.filter(post => {
        if (post.privacy === 'public') return true;
        if (post.privacy === 'followers') return canViewPrivateContent;
        if (post.privacy === 'me') return isOwner;
        return false;
    });
  }, [posts, canViewPrivateContent, isOwner]);

  return (
    <>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemName="post"
        confirmationText="DELETE"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 md:sticky top-20 space-y-6">
            <AuthorCard author={user} isOwner={isOwner} followerCount={followerCount} />
             <div className="flex items-center gap-2">
                {isOwner ? (
                    <Button asChild className="w-full"><Link href="/profile"><Edit className="mr-2 h-4 w-4" />Edit Profile</Link></Button>
                ) : (
                    <Button onClick={handleFollowToggle} disabled={isFollowLoading} className="w-full">
                        {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                )}
                
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
                            <div className="p-3 bg-primary-foreground rounded-lg">
                                {vCardData ? <QRCode value={vCardData} size={256} level="Q" fgColor="#000000" bgColor="#ffffff" /> : <p>Loading QR Code...</p>}
                            </div>
                            <p className="text-sm text-muted-foreground text-center">Scan this code to add {user.name} to your contacts.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        <div className="md:col-span-2 space-y-6">
           <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6">
                    {visiblePosts.length > 0 ? (
                        <div className="space-y-6">
                        {visiblePosts.map(item => (
                            <PostCard
                                key={item.id}
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
                <TabsContent value="content" className="mt-6">
                    {content && content.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {content.map(item => (
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
                <TabsContent value="links" className="mt-6">
                    {user.links && user.links.length > 0 ? (
                        <div className="space-y-3">
                            {user.links.map(link => {
                                const Icon = linkIcons[link.icon as keyof typeof linkIcons] || LinkIcon;
                                return (
                                <a key={link.id || link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                                    <Card className="hover:bg-accent transition-colors">
                                        <CardContent className="p-4 flex items-center justify-center font-semibold gap-3">
                                            <Icon className="h-5 w-5" />
                                            <span>{link.title}</span>
                                        </CardContent>
                                    </Card>
                                </a>
                                )
                            })}
                        </div>
                    ) : (
                         <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">
                                <LinkIcon className="h-10 w-10 mx-auto" />
                                <h3 className="mt-4 font-semibold">No Links Available</h3>
                                <p>This user hasn't added any links to their profile yet.</p>
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
