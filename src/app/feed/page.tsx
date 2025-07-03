
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Share2, Send, X } from "lucide-react"
import Image from "next/image"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useState, useMemo, useRef } from "react";
import { currentUser } from "@/lib/mock-data";
import { allUsers as initialUsers } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageCropper from "@/components/image-cropper";

// Combine user data with their posts for the feed, adding a liked state
const initialFeedItems = initialUsers.flatMap(user =>
  user.posts.map(post => ({
    ...post,
    isLiked: false, // Initial state: no posts are liked by default
    author: {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      handle: user.handle
    }
  }))
).sort((a, b) => {
    // A simple sort to make the feed less static. "2h ago" < "1d ago".
    // This is a mock, a real app would sort by a real timestamp.
    if (a.timestamp.includes('h ago') && b.timestamp.includes('d ago')) return -1;
    if (a.timestamp.includes('d ago') && b.timestamp.includes('h ago')) return 1;
    return 0;
});


const PostCard = ({ item, handleLike }: { item: typeof initialFeedItems[0], handleLike: (postId: string) => void }) => (
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
                <p className="text-sm text-muted-foreground">@{item.author.handle} · {item.timestamp}</p>
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
  const [postContent, setPostContent] = useState('');
  const [feedItems, setFeedItems] = useState(initialFeedItems);
  const { toast } = useToast();

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePost = () => {
    if (!postContent.trim() && !croppedImageUrl) {
      toast({
        title: "Cannot post empty update",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: `post-new-${Date.now()}`,
      content: postContent,
      imageUrl: croppedImageUrl,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      comments: 0,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        handle: currentUser.handle
      }
    };

    setFeedItems(prevItems => [newPost, ...prevItems]);
    setPostContent('');
    setCroppedImageUrl(null);

    toast({
      title: "Update Posted!",
      description: "Your new status has been added to the feed.",
    });
  };

  const handleLike = (postId: string) => {
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
  };
  
  const followingFeedItems = useMemo(() => {
    const followingIds = new Set(currentUser.following);
    followingIds.add(currentUser.id); // Also show own posts
    return feedItems.filter(item => followingIds.has(item.author.id));
  }, [feedItems]);
  
  const forYouFeedItems = useMemo(() => {
    const followingIds = new Set(currentUser.following);
    // "For You" feed should not include the current user's posts or posts from users they follow.
    return feedItems.filter(item => item.author.id !== currentUser.id && !followingIds.has(item.author.id));
  }, [feedItems]);

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
                <AvatarImage src={currentUser.avatarUrl} data-ai-hint="woman smiling"/>
                <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
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

        <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="for-you">For You</TabsTrigger>
            </TabsList>
            <TabsContent value="following" className="space-y-6 mt-6">
                {followingFeedItems.length > 0 ? (
                    followingFeedItems.map(item => (
                        <PostCard key={item.id} item={item} handleLike={handleLike} />
                    ))
                ) : (
                  <Card>
                      <CardContent className="p-10 text-center text-muted-foreground">
                          Follow other users to see their updates here.
                      </CardContent>
                  </Card>
                )}
            </TabsContent>
            <TabsContent value="for-you" className="space-y-6 mt-6">
                {forYouFeedItems.length > 0 ? (
                    forYouFeedItems.map(item => (
                        <PostCard key={item.id} item={item} handleLike={handleLike} />
                    ))
                ) : (
                  <Card>
                      <CardContent className="p-10 text-center text-muted-foreground">
                          No new posts to discover right now. Check back later!
                      </CardContent>
                  </Card>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
