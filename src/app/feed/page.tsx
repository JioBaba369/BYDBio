
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Send, X, Users, Compass, Loader2, Globe, Lock } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageCropper from "@/components/image-cropper"
import { uploadImage } from "@/lib/storage"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { PostCard } from "@/components/post-card";
import Image from "next/image";
import type { PostWithAuthor, Post } from "@/lib/posts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPost, toggleLikePost, deletePost, repostPost, getFeedPosts, getDiscoveryPosts } from "@/lib/posts";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { QuotedPostPreview } from "@/components/quoted-post-preview";


export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'followers' | 'me'>('public');
  
  const [followingPosts, setFollowingPosts] = useState<PostWithAuthor[]>([]);
  const [discoveryPosts, setDiscoveryPosts] = useState<PostWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState('following');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToQuote, setPostToQuote] = useState<any | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  const fetchFollowingFeed = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const items = await getFeedPosts(user.uid, user.following);
        setFollowingPosts(items);
    } catch (error) {
        console.error("Feed fetch error:", error);
        toast({ title: "Failed to load your feed", description: "There was an issue fetching posts from people you follow.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);
  
  const fetchDiscoveryFeed = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const items = await getDiscoveryPosts(user.uid, user.following);
        setDiscoveryPosts(items);
    } catch (error) {
        console.error("Discovery fetch error:", error);
        toast({ title: "Failed to load discovery feed", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user?.uid) {
        fetchFollowingFeed();
    }
  }, [user?.uid, fetchFollowingFeed]);

  useEffect(() => {
    if (activeTab === 'discovery' && discoveryPosts.length === 0 && !isLoading) {
        fetchDiscoveryFeed();
    }
  }, [activeTab, discoveryPosts.length, fetchDiscoveryFeed, isLoading]);

  useEffect(() => {
    const storedPostJson = sessionStorage.getItem('postToQuote');
    if (storedPostJson) {
        try {
            const post = JSON.parse(storedPostJson);
            setPostToQuote(post as any);
            sessionStorage.removeItem('postToQuote');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.getElementById('new-post')?.focus();
        } catch (error) {
            sessionStorage.removeItem('postToQuote');
        }
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (url: string) => {
    setCroppedImageUrl(url);
    setIsCropperOpen(false);
  }

  const handleRemoveImage = () => {
    setCroppedImageUrl(null);
  }

  const handlePost = async () => {
    if (!user || isPosting) return;
    if (!postContent.trim() && !croppedImageUrl && !postToQuote) {
      toast({ title: "Cannot post empty update", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
        let imageUrlToPost: string | null = null;
        if (croppedImageUrl) {
            imageUrlToPost = await uploadImage(croppedImageUrl, `posts/${user.uid}/${Date.now()}`);
        }

        let quotedPostData: any | undefined = undefined;
        if (postToQuote) {
            quotedPostData = {
                id: postToQuote.id,
                content: postToQuote.content,
                imageUrl: postToQuote.imageUrl,
                authorId: postToQuote.author.uid,
            };
        }

        await createPost(user.uid, { content: postContent, imageUrl: imageUrlToPost, quotedPost: quotedPostData, privacy: postPrivacy, category: postCategory });
        
        await fetchFollowingFeed();
        
        setPostContent('');
        setCroppedImageUrl(null);
        setPostToQuote(null);
        setPostCategory('');
        setPostPrivacy('public');
        toast({ title: "Update Posted!" });
    } catch(error) {
        toast({ title: "Failed to post update", variant: "destructive" });
        await fetchFollowingFeed();
    } finally {
        setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user || loadingAction) return;
    
    setLoadingAction({ postId, action: 'like' });

    const updater = (feed: PostWithAuthor[]) => {
        return feed.map(p => {
            if (p.id === postId) {
                const isLiked = !p.isLiked;
                return {
                    ...p,
                    isLiked,
                    likes: (p.likes || 0) + (isLiked ? 1 : -1),
                };
            }
            return p;
        });
    };

    const originalFollowing = [...followingPosts];
    const originalDiscovery = [...discoveryPosts];

    setFollowingPosts(prevPosts => updater(prevPosts));
    setDiscoveryPosts(prevPosts => updater(prevPosts));

    try {
        await toggleLikePost(postId, user.uid);
    } catch (error) {
        toast({ title: "Something went wrong", variant: "destructive" });
        setFollowingPosts(originalFollowing);
        setDiscoveryPosts(originalDiscovery);
    } finally {
        setLoadingAction(null);
    }
  };
  
  const handleRepost = async (postId: string) => {
    if (!user || loadingAction) return;
    setLoadingAction({ postId, action: 'repost' });
    try {
      await repostPost(postId, user.uid);
      toast({ title: "Reposted!" });
      await fetchFollowingFeed();
    } catch (error: any) {
      toast({ title: error.message || "Failed to repost", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleQuote = (post: any) => {
    setPostToQuote(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('new-post')?.focus();
  };

  const openDeleteDialog = (post: any) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete || !user) return;
    setIsDeleting(true);

    const idToDelete = postToDelete.id;

    const originalFollowing = [...followingPosts];
    const originalDiscovery = [...discoveryPosts];

    // Correctly filter out the deleted post, whether it's an original or a repost
    setFollowingPosts(prev => prev.filter(item => item.id !== idToDelete));
    setDiscoveryPosts(prev => prev.filter(item => item.id !== idToDelete));
    
    try {
        await deletePost(idToDelete);
        toast({ title: "Post Deleted" });
    } catch (error) {
        toast({ title: "Failed to delete post", variant: "destructive" });
        setFollowingPosts(originalFollowing);
        setDiscoveryPosts(originalDiscovery);
    } finally {
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
        setIsDeleting(false);
    }
  };

  
  if (authLoading) {
      return (
         <div className="max-w-2xl mx-auto space-y-6">
            <FeedSkeleton />
        </div>
      );
  }

  if (!user) return null;
  
  const renderFeedContent = (posts: PostWithAuthor[], emptyState: React.ReactNode) => {
      if (isLoading) return <FeedSkeleton />;
      if (!isLoading && posts.length === 0) return emptyState;
      if (posts.length > 0) {
        return (
             <div className="space-y-6">
                {posts.map(item => (
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
        )
      }
      return null;
  }

  return (
    <>
      <ImageCropper imageSrc={imageToCrop} open={isCropperOpen} onOpenChange={setIsCropperOpen} onCropComplete={handleCropComplete} aspectRatio={16 / 9} isRound={false}/>
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="post"
        confirmationText="DELETE"
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Status Feed</h1>
        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <Avatar><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.avatarFallback}</AvatarFallback></Avatar>
              <div className="w-full space-y-2">
                <Textarea id="new-post" placeholder="What's on your mind?" className="w-full text-base border-0 focus-visible:ring-0 ring-offset-0 p-0 min-h-[60px]" value={postContent} onChange={(e) => setPostContent(e.target.value)}/>
                 {postToQuote && <QuotedPostPreview post={postToQuote} onRemove={() => setPostToQuote(null)} />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
             {croppedImageUrl && (
              <div className="relative">
                <Image src={croppedImageUrl} alt="Preview" width={500} height={281} className="rounded-lg border object-cover w-full" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={onFileChange}/>
                <Input 
                    placeholder="Category (optional)" 
                    className="h-9 text-xs" 
                    value={postCategory} 
                    onChange={(e) => setPostCategory(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={postPrivacy} onValueChange={(value: 'public' | 'followers' | 'me') => setPostPrivacy(value)}>
                    <SelectTrigger className="w-auto h-9 text-xs sm:text-sm"><SelectValue placeholder="Privacy" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="public"><div className="flex items-center gap-2"><Globe className="h-4 w-4" /><span>Public</span></div></SelectItem>
                        <SelectItem value="followers"><div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Followers only</span></div></SelectItem>
                        <SelectItem value="me"><div className="flex items-center gap-2"><Lock className="h-4 w-4" /><span>Me only</span></div></SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handlePost} disabled={(!postContent.trim() && !croppedImageUrl && !postToQuote) || isPosting}>
                    {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                    {isPosting ? "Posting..." : "Post"}
                </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="discovery">Discovery</TabsTrigger>
            </TabsList>
            <TabsContent value="following" className="pt-6">
                {renderFeedContent(followingPosts, (
                     <Card>
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Compass className="h-12 w-12" />
                            <h3 className="font-semibold text-foreground">Your Feed is Empty</h3>
                            <p>Follow other users to see their status updates here.</p>
                            <Button asChild><Link href="/connections?tab=suggestions">Find People to Follow</Link></Button>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>
            <TabsContent value="discovery" className="pt-6">
                {renderFeedContent(discoveryPosts, (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Compass className="h-12 w-12" />
                            <h3 className="font-semibold text-foreground">Nothing to discover yet</h3>
                            <p>As more people join and post, you'll see interesting public updates here.</p>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

    