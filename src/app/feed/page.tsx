
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Share2 } from "lucide-react"
import Image from "next/image"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useState, useMemo } from "react";
import { currentUser } from "@/lib/mock-data";
import { allUsers as initialUsers } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
)
// A real app would sort by a real date object
.sort(() => Math.random() - 0.5); // Random sort for variety

export default function FeedPage() {
  const [postContent, setPostContent] = useState('');
  const [feedItems, setFeedItems] = useState(initialFeedItems);
  const { toast } = useToast();

  const handlePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Cannot post empty update",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      id: `post-new-${Date.now()}`,
      content: postContent,
      imageUrl: null, // For now, we don't support image uploads in new posts
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

  const usersToShow = useMemo(() => {
    const followingIds = new Set(currentUser.following);
    followingIds.add(currentUser.id); // Also show own posts
    return feedItems.filter(item => followingIds.has(item.author.id));
  }, [feedItems]);

  return (
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
               <HashtagSuggester content={postContent} onSelectHashtag={(tag) => {
                  setPostContent(prev => prev ? `${prev.trim()} ${tag}`: tag);
                }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 border-t">
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button onClick={handlePost}>Post Update</Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {usersToShow.map(item => (
          <Card key={item.id}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait"/>
                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{item.author.name}</p>
                    <p className="text-sm text-muted-foreground">@{item.author.handle} · {item.timestamp}</p>
                  </div>
                </div>
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
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground" onClick={() => handleLike(item.id)}>
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
        ))}
         {usersToShow.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Follow other users to see their updates here.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
