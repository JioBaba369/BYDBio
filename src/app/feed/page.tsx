
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Image as ImageIcon, MessageCircle, MoreHorizontal, Share2 } from "lucide-react"
import Image from "next/image"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useState } from "react";
import { currentUser } from "@/lib/mock-data";

const feedItems = [
  {
    id: 1,
    author: {
      name: "Jane Doe",
      avatarUrl: "https://placehold.co/100x100.png",
      handle: "janedoe"
    },
    content: "Excited to share a sneak peek of the new dashboard design I've been working on. Focusing on a cleaner layout and more intuitive data visualizations. #uidesign #productdesign #dashboard",
    imageUrl: "https://placehold.co/600x400.png",
    timestamp: "2h ago",
    likes: 128,
    comments: 12,
  },
  {
    id: 2,
    author: {
      name: "John Smith",
      avatarUrl: "https://placehold.co/100x100.png",
      handle: "johnsmith"
    },
    content: "Just published a new article on 'The Future of Remote Collaboration'. Would love to hear your thoughts! Link in my bio. #remotework #futureofwork #collaboration",
    imageUrl: null,
    timestamp: "5h ago",
    likes: 72,
    comments: 5,
  }
];

export default function FeedPage() {
  const [postContent, setPostContent] = useState('');

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
                  setPostContent(prev => prev + ` ${tag}`);
                }} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 border-t">
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button>Post Update</Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {feedItems.map(item => (
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
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-5 w-5" />
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
      </div>
    </div>
  )
}
