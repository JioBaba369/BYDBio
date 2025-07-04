
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Share2, Send, X, Users } from "lucide-react"
import Image from "next/image"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"
import ImageCropper from "@/components/image-cropper"
import { getFeedPosts, createPost, toggleLikePost, Post } from "@/lib/posts"
import { type User } from "@/lib/users"
import { Skeleton } from "@/components/ui/skeleton"
import { uploadImage } from "@/lib/storage"
import { ClientFormattedDate } from "@/components/client-formatted-date"

type FeedItem = Omit<Post, 'createdAt'> & { createdAt: string; author: User; isLiked: boolean; };

const PostCardSkeleton = () => (
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
);

const PostCard = ({ item, handleLike }: { item: FeedItem, handleLike: (postId: string) => void }) => (
    <Card key={item.id}>
        <CardHeader className="p-4">
        <div className="flex items-center justify-between">
            <Link href={`/u/${item.author.handle}`} className="flex items-center gap-3 hover:underline">
            <Avatar>
                <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait"/>
                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{item.author.name}</p>
                <p className="text-sm text-muted-foreground">@{item.author.handle} · <ClientFormattedDate date={item.createdAt} relative /></p>
            </div>
            </Link>
            <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            </Button>
        </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{item.content}</p>
        {item.imageUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border">
            <Image src={item.imageUrl} alt="Post image" width={600} height={400} className="object-cover" data-ai-hint="office workspace"/>
            </div>
        )}
        </CardContent>
        <CardFooter className="flex justify-between p-4 border-t">
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => handleLike(item.id)}>
            <Heart className={cn("h-5 w-5", item.isLiked && "fill-red-500 text-red-500")} />
            <span>{item.likes}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{item.comments}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
            <Share2 className="h-5 w-5" />
            <span>Share</span>
        </Button>
        </CardFooter>
    </Card>
);

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeed = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const postsWithAuthors = await getFeedPosts(user.following);
        setFeedItems(postsWithAuthors.map(post => ({
            ...post,
            isLiked: post.likedBy.includes(user.uid),
        })));
    } catch (error) {
        console.error("Error fetching feed:", error);
        toast({ title: "Failed to load feed", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchFeed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    if (!user) return;
    if (!postContent.trim() && !croppedImageUrl) {
      toast({ title: "Cannot post empty update", variant: "destructive" });
      return;
    }

    try {
        let imageUrlToPost: string | null = null;
        if (croppedImageUrl) {
            imageUrlToPost = await uploadImage(croppedImageUrl, `posts/${user.uid}/${Date.now()}`);
        }
        await createPost(user.uid, { content: postContent, imageUrl: imageUrlToPost });
        setPostContent('');
        setCroppedImageUrl(null);
        toast({ title: "Update Posted!" });
        await fetchFeed(); // Refresh feed after posting
    } catch(error) {
        console.error("Error posting update:", error);
        toast({ title: "Failed to post update", variant: "destructive" });
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
        // Optimistic update
        setFeedItems(prevItems =>
            prevItems.map(item => {
                if (item.id === postId) {
                const isLiked = !item.isLiked;
                const likes = isLiked ? item.likes + 1 : item.likes - 1;
                return { ...item, isLiked, likes };
                }
                return item;
            })
        );
        await toggleLikePost(postId, user.uid);
    } catch (error) {
        console.error("Error liking post:", error);
        toast({ title: "Something went wrong", variant: "destructive" });
        // Revert optimistic update on error
        fetchFeed();
    }
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
            <Button onClick={handlePost} disabled={!postContent.trim() && !croppedImageUrl}>
              <Send className="mr-2 h-4 w-4"/>Post Update
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6 mt-6">
            {isLoading ? (
                <PostCardSkeleton />
            ) : feedItems.length > 0 ? (
                feedItems.map(item => (
                    <PostCard key={item.id} item={item} handleLike={handleLike} />
                ))
            ) : (
              <Card>
                  <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                    <Users className="h-12 w-12" />
                    <h3 className="font-semibold text-foreground">Your Feed is Empty</h3>
                    <p>Follow other users to see their status updates here.</p>
                    <Button asChild><Link href="/connections?tab=suggestions">Find People to Follow</Link></Button>
                  </CardContent>
              </Card>
            )}
        </div>
      </div>
    </>
  )
}
