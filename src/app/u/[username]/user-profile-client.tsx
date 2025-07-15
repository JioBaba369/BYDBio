

'use client';

import { useState, useMemo, useEffect } from "react";
import type { PostWithAuthor, UserProfilePayload } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Link as LinkIcon, QrCode, Mail, Users, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { PostCard } from "@/components/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateVCard } from "@/lib/vcard";
import { BookingDialog } from "@/components/booking-dialog";
import { ContactForm } from "@/components/contact-form";
import { AboutTab } from "@/components/profile/about-tab";
import Image from "next/image";
import { FollowButton } from "@/components/follow-button";
import { useRouter } from "next/navigation";

interface UserProfilePageProps {
  userProfileData: UserProfilePayload;
}

export default function UserProfileClientPage({ userProfileData }: UserProfilePageProps) {
  const { user: currentUser } = useAuth();
  const { isOwner, user, isFollowedByCurrentUser } = userProfileData;
  const router = useRouter();

  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  useEffect(() => {
    setPosts(userProfileData.posts || []);
  }, [userProfileData.posts]);

  const handleQuote = (post: PostWithAuthor) => {
    sessionStorage.setItem('postToQuote', JSON.stringify(post));
    router.push('/feed');
  };
  
  const onPostDeleted = (deletedPostId: string) => {
    setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };
  
  const vCardData = useMemo(() => {
    if (!user) return '';
    return generateVCard(user);
  }, [user]);

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
                            <FollowButton
                                targetUserId={user.uid}
                                initialIsFollowing={isFollowedByCurrentUser}
                                initialFollowerCount={user.followerCount}
                            />
                        )}
                        <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Mail className="mr-2 h-4 w-4"/>Contact</Button>
                            </DialogTrigger>
                            <DialogContent>
                                {isContactFormOpen && <ContactForm recipientId={user.uid} />}
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
        
        <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="mt-6">
                <AboutTab userProfileData={userProfileData} contentOnly={true} />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
                 {visiblePosts.length > 0 ? (
                    <div className="space-y-6">
                    {visiblePosts.map(item => (
                        <PostCard
                            key={`${item.id}-${item.author.uid}`}
                            item={item}
                            onQuote={handleQuote}
                            onDeleted={onPostDeleted}
                        />
                    ))}
                    </div>
                ) : (
                    <AboutTab userProfileData={userProfileData} noContentMode="posts" />
                )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
                <AboutTab userProfileData={userProfileData} />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
