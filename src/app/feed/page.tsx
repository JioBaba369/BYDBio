
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Send, X, Users, Compass, Loader2 } from "lucide-react"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageCropper from "@/components/image-cropper"
import { getFeedPosts, createPost, toggleLikePost, deletePost, getDiscoveryPosts, type PostWithAuthor, repostPost, type EmbeddedPostInfo } from "@/lib/posts"
import { Skeleton } from "@/components/ui/skeleton"
import { uploadImage } from "@/lib/storage"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card";
import Image from "next/image";

type FeedItem = PostWithAuthor & { isLiked: boolean; };

const PostCardSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-4 border-t">
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-4 border-t">
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
    </div>
);

const QuotedPostPreview = ({ post, onRemove }: { post: FeedItem, onRemove: () => void }) => (
    <div className="mt-2 p-3 border rounded-lg relative">
        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={onRemove}>
            <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5">
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{post.author.name}</span>
            <span>@{post.author.username}</span>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap line-clamp-3">{post.content}</p>
    </div>
);


export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [postContent, setPostContent] = useState('');
  const [followingFeed, setFollowingFeed] = useState<FeedItem[]>([]);
  const [discoveryFeed, setDiscoveryFeed] = useState<FeedItem[]>([]);
  
  const [isFollowingLoading, setIsFollowingLoading] = useState(true);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<FeedItem | null>(null);
  const [postToQuote, setPostToQuote] = useState<FeedItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  const fetchFeeds = useCallback(async (refreshFollowing: boolean, refreshDiscovery: boolean) => {
    if (!user) return;

    if (refreshFollowing) {
        setIsFollowingLoading(true);
        try {
            const posts = await getFeedPosts([...user.following, user.uid]);
            setFollowingFeed(posts.map(post => ({
                ...post,
                isLiked: post.likedBy.includes(user.uid),
            })));
        } catch (error) {
            console.error("Error fetching following feed:", error);
            toast({ title: "Failed to load your feed", variant: "destructive" });
        } finally {
            setIsFollowingLoading(false);
        }
    }

    if (refreshDiscovery) {
        setIsDiscoveryLoading(true);
        try {
            const posts = await getDiscoveryPosts(user.uid, user.following);
            setDiscoveryFeed(posts.map(post => ({
                ...post,
                isLiked: post.likedBy.includes(user.uid),
            })));
        } catch (error) {
            console.error("Error fetching discovery feed:", error);
            toast({ title: "Failed to load discovery feed", variant: "destructive" });
        } finally {
            setIsDiscoveryLoading(false);
        }
    }
  }, [user, toast]);

  useEffect(() => {
    if (user?.uid) {
        fetchFeeds(true, true);
    }
  }, [user?.uid, fetchFeeds]);

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

        let quotedPostData: EmbeddedPostInfo | undefined = undefined;
        if (postToQuote) {
            quotedPostData = {
                id: postToQuote.id,
                content: postToQuote.content,
                imageUrl: postToQuote.imageUrl,
                authorId: postToQuote.author.uid,
            };
        }

        await createPost(user.uid, { content: postContent, imageUrl: imageUrlToPost, quotedPost: quotedPostData });
        
        setPostContent('');
        setCroppedImageUrl(null);
        setPostToQuote(null);
        toast({ title: "Update Posted!" });
        await fetchFeeds(true, false); // Refresh following feed only
    } catch(error) {
        console.error("Error posting update:", error);
        toast({ title: "Failed to post update", variant: "destructive" });
    } finally {
        setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user || loadingAction) return;
    
    setLoadingAction({ postId, action: 'like' });

    // A helper function to perform the optimistic update on a feed
    const optimisticUpdate = (setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>) => {
        setFeed(prevFeed => {
            const newFeed = [...prevFeed];
            const postIndex = newFeed.findIndex(p => p.id === postId);
            if (postIndex === -1) return prevFeed;

            const originalPost = newFeed[postIndex];
            const updatedPost = {
                ...originalPost,
                isLiked: !originalPost.isLiked,
                likes: originalPost.likes + (originalPost.isLiked ? -1 : 1),
            };
            newFeed[postIndex] = updatedPost;
            return newFeed;
        });
    };

    // Store the original state of both feeds
    const originalFollowingFeed = [...followingFeed];
    const originalDiscoveryFeed = [...discoveryFeed];
    
    // Perform optimistic updates
    optimisticUpdate(setFollowingFeed);
    optimisticUpdate(setDiscoveryFeed);

    try {
        await toggleLikePost(postId, user.uid);
    } catch (error) {
        console.error("Error liking post:", error);
        toast({ title: "Something went wrong", variant: "destructive" });
        // Revert on error
        setFollowingFeed(originalFollowingFeed);
        setDiscoveryFeed(originalDiscoveryFeed);
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
      await fetchFeeds(true, false); // Refresh following feed only
    } catch (error: any) {
      console.error("Error reposting:", error);
      toast({ title: error.message || "Failed to repost", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleQuote = (post: FeedItem) => {
    setPostToQuote(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const textarea = document.getElementById('new-post');
    if (textarea) textarea.focus();
  };

  const openDeleteDialog = (post: FeedItem) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete || !user) return;

    setFollowingFeed(prev => prev.filter(item => item.id !== postToDelete.id));
    setDiscoveryFeed(prev => prev.filter(item => item.id !== postToDelete.id));
    
    try {
        await deletePost(postToDelete.id);
        toast({ title: "Post Deleted" });
    } catch (error) {
        console.error("Error deleting post:", error);
        toast({ title: "Failed to delete post", variant: "destructive" });
        await fetchFeeds(true, true); // Revert on error
    } finally {
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
    }
  };
  
  const FeedList = ({ isLoading, items, emptyState }: { isLoading: boolean, items: FeedItem[], emptyState: React.ReactNode }) => {
    if (isLoading) {
        return <PostCardSkeleton />;
    }
    if (items.length > 0) {
        return <div className="space-y-6">{items.map(item => <PostCard 
            key={item.id} 
            item={item} 
            onLike={handleLike} 
            onDelete={openDeleteDialog} 
            onRepost={handleRepost} 
            onQuote={handleQuote} 
            isLoading={loadingAction?.postId === item.id}
            loadingAction={loadingAction?.postId === item.id ? loadingAction.action : null}
            />)}
        </div>;
    }
    return <>{emptyState}</>;
  };
  
  if (authLoading) {
      return (
         <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-40 rounded-lg" />
            <PostCardSkeleton />
        </div>
      );
  }

  if (!user) return null;

  return (
    <>
      <ImageCropper
        imageSrc={imageToCrop}
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9}
        isRound={false}
      />
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemName="post"
        itemDescription="This will permanently delete the post. This action cannot be undone."
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Status Feed</h1>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={user.avatarUrl} data-ai-hint="woman smiling"/>
                <AvatarFallback>{user.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Textarea
                  id="new-post"
                  placeholder="What's on your mind?"
                  className="w-full text-base border-0 focus-visible:ring-0 ring-offset-0 p-0"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                 {postToQuote && <QuotedPostPreview post={postToQuote} onRemove={() => setPostToQuote(null)} />}
                 {croppedImageUrl && (
                  <div className="relative">
                    <Image src={croppedImageUrl} alt="Preview" width={500} height={281} className="rounded-lg border object-cover w-full" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                 <HashtagSuggester content={postContent} onSelectHashtag={(tag) => {
                    setPostContent(prev => prev ? `${prev.trim()} ${tag}`: tag);
                  }} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 border-t">
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={onFileChange}
            />
            <Button onClick={handlePost} disabled={(!postContent.trim() && !croppedImageUrl && !postToQuote) || isPosting}>
              {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
              {isPosting ? "Posting..." : "Post Update"}
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="discovery">Discovery</TabsTrigger>
            </TabsList>
            <TabsContent value="following" className="mt-6">
                <FeedList 
                    isLoading={isFollowingLoading} 
                    items={followingFeed}
                    emptyState={
                        <Card>
                            <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <Users className="h-12 w-12" />
                                <h3 className="font-semibold text-foreground">Your Feed is Empty</h3>
                                <p>Follow other users to see their status updates here.</p>
                                <Button asChild><Link href="/connections?tab=suggestions">Find People to Follow</Link></Button>
                            </CardContent>
                        </Card>
                    }
                />
            </TabsContent>
            <TabsContent value="discovery" className="mt-6">
                 <FeedList 
                    isLoading={isDiscoveryLoading} 
                    items={discoveryFeed}
                    emptyState={
                         <Card>
                            <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <Compass className="h-12 w-12" />
                                <h3 className="font-semibold text-foreground">Nothing to Discover</h3>
                                <p>Check back later for new posts from the community.</p>
                            </CardContent>
                        </Card>
                    }
                />
            </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
