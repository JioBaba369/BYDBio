'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Send, X, Users, Compass, Loader2, Globe, Lock } from "lucide-react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageCropper from "@/components/image-cropper"
import { uploadImage } from "@/lib/storage"
import { PostCard } from "@/components/post-card";
import Image from "next/image";
import type { PostWithAuthor } from "@/lib/posts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPost, getFeedPosts, getDiscoveryPosts } from "@/lib/posts";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { usePostActions } from "@/hooks/use-post-actions";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";


const EmptyFeedState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonHref
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}) => (
  <Card>
    <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
      <Icon className="h-12 w-12" />
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p>{description}</p>
      {buttonText && buttonHref && (
        <Button asChild><Link href={buttonHref}>{buttonText}</Link></Button>
      )}
    </CardContent>
  </Card>
);

const QuotedPostPreview = ({ post, onRemove }: { post: any, onRemove: () => void }) => (
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
  const [postCategory, setPostCategory] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'followers' | 'me'>('public');
  const [isPosting, setIsPosting] = useState(false);

  const [followingPosts, setFollowingPosts] = useState<PostWithAuthor[]>([]);
  const [discoveryPosts, setDiscoveryPosts] = useState<PostWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState('following');
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postToQuote, setPostToQuote] = useState<PostWithAuthor | null>(null);

  const fetchFeed = useCallback(async (type: 'following' | 'discovery') => {
    if (!user) {
      setIsLoadingFeed(false);
      return;
    }

    setIsLoadingFeed(true);
    try {
      let items: PostWithAuthor[];
      if (type === 'following') {
        items = await getFeedPosts(user.uid, user.following);
        setFollowingPosts(items);
      } else {
        items = await getDiscoveryPosts(user.uid, user.following);
        setDiscoveryPosts(items);
      }
    } catch (error) {
      console.error(`Error fetching ${type} feed:`, error);
      toast({
        title: `Failed to load ${type} feed`,
        description: `There was an issue fetching posts for ${type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingFeed(false);
    }
  }, [user, toast]);
  
  const combinedPosts = useMemo(() => {
    return activeTab === 'following' ? followingPosts : discoveryPosts;
  }, [activeTab, followingPosts, discoveryPosts]);

  const {
    handleLike,
    handleDelete,
    handleRepost,
    handleQuote,
    loadingAction,
    dialogProps
  } = usePostActions({
    posts: combinedPosts,
    setPosts: activeTab === 'following' ? setFollowingPosts : setDiscoveryPosts,
    currentUser: user,
    onAfterAction: () => fetchFeed(activeTab as 'following' | 'discovery'),
    onQuoteAction: (post) => {
        setPostToQuote(post);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('new-post')?.focus();
    }
  });


  useEffect(() => {
    if (user?.uid) {
      fetchFeed('following');
    }
  }, [user?.uid, fetchFeed]);

  useEffect(() => {
    if (activeTab === 'discovery' && discoveryPosts.length === 0 && !isLoadingFeed) {
      fetchFeed('discovery');
    }
  }, [activeTab, discoveryPosts.length, fetchFeed, isLoadingFeed]);

  useEffect(() => {
    const storedPostJson = sessionStorage.getItem('postToQuote');
    if (storedPostJson) {
      try {
        const post = JSON.parse(storedPostJson) as PostWithAuthor;
        setPostToQuote(post);
        sessionStorage.removeItem('postToQuote');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('new-post')?.focus();
      } catch (error) {
        console.error("Failed to parse quoted post from session storage:", error);
        sessionStorage.removeItem('postToQuote');
      }
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleCropComplete = useCallback((url: string) => {
    setCroppedImageUrl(url);
    setIsCropperOpen(false);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setCroppedImageUrl(null);
  }, []);

  const handlePost = useCallback(async () => {
    if (!user || isPosting) return;

    if (!postContent.trim() && !croppedImageUrl && !postToQuote) {
      toast({ title: "Cannot post empty update", description: "Please add some text, an image, or a quoted post.", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      let imageUrlToPost: string | null = null;
      if (croppedImageUrl) {
        imageUrlToPost = await uploadImage(croppedImageUrl, `posts/${user.uid}/${Date.now()}`);
      }

      let quotedPostData: { id: string; content: string; imageUrl: string | null; authorId: string; } | undefined = undefined;
      if (postToQuote) {
        quotedPostData = {
          id: postToQuote.id,
          content: postToQuote.content,
          imageUrl: postToQuote.imageUrl,
          authorId: postToQuote.author.uid,
        };
      }
      
      await createPost(user.uid, { content: postContent, imageUrl: imageUrlToPost, quotedPost: quotedPostData, privacy: postPrivacy, category: postCategory });
      await fetchFeed(activeTab as 'following' | 'discovery');

      setPostContent('');
      setCroppedImageUrl(null);
      setPostToQuote(null);
      setPostCategory('');
      setPostPrivacy('public');
      toast({ title: "Update Posted!", description: "Your post has been successfully published." });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "Failed to post update", description: "An error occurred while publishing your update. Please try again.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  }, [user, isPosting, postContent, croppedImageUrl, postToQuote, postPrivacy, postCategory, fetchFeed, activeTab, toast]);
  
  const renderFeedContent = useCallback((posts: PostWithAuthor[], emptyState: React.ReactNode) => {
    if (isLoadingFeed) return <FeedSkeleton />;
    if (posts.length === 0) return emptyState;

    return (
      <div className="space-y-6">
        {posts.map(item => (
          <PostCard
            key={item.id}
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
    );
  }, [isLoadingFeed, handleLike, handleDelete, handleRepost, handleQuote, loadingAction]);

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FeedSkeleton />
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
      <DeleteConfirmationDialog {...dialogProps} />
      
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Status Feed</h1>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Textarea
                  id="new-post"
                  placeholder="What's on your mind?"
                  className="w-full text-base border-0 focus-visible:ring-0 ring-offset-0 p-0 min-h-[60px]"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                {postToQuote && <QuotedPostPreview post={postToQuote} onRemove={() => setPostToQuote(null)} />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {croppedImageUrl && (
              <div className="relative">
                <Image src={croppedImageUrl} alt="Preview" width={500} height={281} className="rounded-lg border object-cover w-full" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleRemoveImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
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
                {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
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
              <EmptyFeedState
                icon={Compass}
                title="Your Feed is Empty"
                description="Follow other users to see their status updates here."
                buttonText="Find People to Follow"
                buttonHref="/connections?tab=suggestions"
              />
            ))}
          </TabsContent>
          <TabsContent value="discovery" className="pt-6">
            {renderFeedContent(discoveryPosts, (
              <EmptyFeedState
                icon={Compass}
                title="Nothing to discover yet"
                description="As more people join and post, you'll see interesting public updates here."
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
