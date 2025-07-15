

'use client';

import { useState, useMemo, useCallback, useTransition } from "react";
import type { User, PostWithAuthor, UserProfilePayload } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Edit, Loader2, Link as LinkIcon, Rss, Info, MessageSquare, Briefcase, QrCode, Mail, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { PostCard } from "@/components/post-card";
import { useRouter, usePathname } from "next/navigation";
import { getPostsByUser } from "@/lib/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicContentCard } from "@/components/public-content-card";
import { generateVCard } from "@/lib/vcard";
import { BookingDialog } from "@/components/booking-dialog";
import { ContactForm } from "@/components/contact-form";
import { AboutTab } from "@/components/profile/about-tab";
import Image from "next/image";
import { usePostActions } from "@/hooks/use-post-actions";
import { toggleFollowAction } from "@/app/actions/follow";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

interface UserProfilePageProps {
  userProfileData: UserProfilePayload;
}

export default function UserProfileClientPage({ userProfileData }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { isOwner, user, isFollowedByCurrentUser } = userProfileData;
  const [isFollowPending, startFollowTransition] = useTransition();
  
  const [posts, setPosts] = useState<PostWithAuthor[]>(userProfileData.posts || []);
  const [postsLoading, setPostsLoading] = useState(false);

  const vCardData = useMemo(() => {
    if (!user) return '';
    return generateVCard(user);
  }, [user]);

  const handleFollowToggle = () => {
    if (!currentUser) {
      router.push('/auth/sign-in');
      return;
    }
    if (isOwner) return;

    startFollowTransition(() => {
        const formData = new FormData();
        formData.append('currentUserId', currentUser.uid);
        formData.append('targetUserId', user.uid);
        formData.append('isFollowing', String(isFollowedByCurrentUser));
        formData.append('path', pathname);
        toggleFollowAction(formData);
    });
  };
  
  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
        const fetchedPosts = await getPostsByUser(user.uid, currentUser?.uid);
        setPosts(fetchedPosts);
    } catch (error) {
        // toast({ title: "Error loading posts", variant: "destructive" });
    } finally {
        setPostsLoading(false);
    }
  }, [user.uid, currentUser?.uid]);
  
  const {
    handleLike,
    handleDelete,
    handleRepost,
    handleQuote,
    loadingAction,
    dialogProps
  } = usePostActions({
    posts,
    setPosts,
    currentUser,
    onAfterAction: loadPosts,
  });


  const canViewPrivateContent = isOwner || isFollowedByCurrentUser;

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
      <DeleteConfirmationDialog {...dialogProps} />
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 shadow-none -m-4 sm:-m-6 rounded-none">
            <div className="relative h-40 sm:h-48 md:h-56 bg-muted">
                <Image 
                    src={user.bannerUrl || 'https://placehold.co/1200x400.png'} 
                    alt={`${user.name}'s banner`}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract background"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
            </div>
            <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20">
                    <div className="flex gap-4 items-end flex-1 min-w-0">
                        <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-background bg-background shadow-md shrink-0">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div className="sm:pb-2 min-w-0 flex-1">
                             <h1 className="text-xl sm:text-2xl font-bold font-headline truncate">{user.name}</h1>
                             <p className="text-muted-foreground text-sm truncate">@{user.username}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
                        {isOwner ? (
                            <Button asChild><Link href="/profile"><Edit className="mr-2 h-4 w-4" />Edit Profile</Link></Button>
                        ) : (
                            <Button onClick={handleFollowToggle} disabled={isFollowPending}>
                                {isFollowPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {isFollowedByCurrentUser ? 'Following' : 'Follow'}
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
                 <div className="flex items-center gap-4 mt-4 text-sm">
                    <p><span className="font-bold">{(user.followerCount || 0).toLocaleString()}</span> Followers</p>
                    <p><span className="font-bold">{(user.following?.length || 0).toLocaleString()}</span> Following</p>
                    <p><span className="font-bold">{user.postCount || 0}</span> Posts</p>
                </div>
            </CardContent>
        </Card>
        
        <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
                <AboutTab user={user} otherContent={userProfileData.otherContent} />
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
                            onDelete={() => handleDelete(item)}
                            onRepost={handleRepost}
                            onQuote={handleQuote}
                            isLoading={loadingAction?.postId === item.id}
                            loadingAction={loadingAction && loadingAction.postId === item.id ? loadingAction.action : undefined}
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
