
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
import type { PostWithAuthor } from "@/lib/posts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPost, toggleLikePost, deletePost, repostPost, getFeedPosts, getDiscoveryPosts } from "@/lib/posts";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { QuotedPostPreview } from "@/components/quoted-post-preview";

// --- Helper Components ---
// This component is well-designed and reusable. Keeping it as is.
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

// --- Main Component ---
export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // --- State Management for Post Creation ---
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'followers' | 'me'>('public');
  const [isPosting, setIsPosting] = useState(false);

  // --- State Management for Feeds ---
  const [followingPosts, setFollowingPosts] = useState<PostWithAuthor[]>([]);
  const [discoveryPosts, setDiscoveryPosts] = useState<PostWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState('following');
  const [isLoadingFeed, setIsLoadingFeed] = useState(true); // Indicates if feeds are initially loading

  // --- State Management for Image Upload ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Management for Deletion ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- State Management for Quoting/Actions ---
  const [postToQuote, setPostToQuote] = useState<PostWithAuthor | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ postId: string; action: 'like' | 'repost' } | null>(null);

  // --- Data Fetching Callbacks ---

  /**
   * Fetches posts for a specific feed type (following or discovery).
   * @param type - The type of feed to fetch ('following' or 'discovery').
   */
  const fetchFeed = useCallback(async (type: 'following' | 'discovery') => {
    // Only fetch if user is defined
    if (!user) {
      setIsLoadingFeed(false); // Ensure loading state is turned off if no user
      return;
    }

    setIsLoadingFeed(true); // Set loading true before fetch
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
      setIsLoadingFeed(false); // Set loading false after fetch (success or failure)
    }
  }, [user, toast]); // Dependencies: user (for uid and following array), toast

  // --- Effects ---

  // Effect to fetch the 'following' feed initially when the user object becomes available.
  useEffect(() => {
    if (user?.uid) {
      fetchFeed('following');
    }
  }, [user?.uid, fetchFeed]); // Dependency on user.uid ensures this runs once user is loaded

  // Effect to fetch the 'discovery' feed only when its tab is active and it hasn't been loaded yet.
  useEffect(() => {
    if (activeTab === 'discovery' && discoveryPosts.length === 0 && !isLoadingFeed) {
      fetchFeed('discovery');
    }
  }, [activeTab, discoveryPosts.length, fetchFeed, isLoadingFeed]);

  // Effect to handle quoting a post from session storage (e.g., after navigating from a post detail page).
  useEffect(() => {
    const storedPostJson = sessionStorage.getItem('postToQuote');
    if (storedPostJson) {
      try {
        const post = JSON.parse(storedPostJson) as PostWithAuthor;
        setPostToQuote(post);
        sessionStorage.removeItem('postToQuote');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for new post input
        document.getElementById('new-post')?.focus(); // Focus on the textarea
      } catch (error) {
        console.error("Failed to parse quoted post from session storage:", error);
        sessionStorage.removeItem('postToQuote'); // Clear invalid data
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- Event Handlers ---

  /**
   * Handles file selection for image upload, preparing it for cropping.
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Clear input value so the same file can be selected again
    }
  }, []);

  /**
   * Called when the image cropping is complete, setting the URL of the cropped image.
   */
  const handleCropComplete = useCallback((url: string) => {
    setCroppedImageUrl(url);
    setIsCropperOpen(false);
  }, []);

  /**
   * Removes the currently selected image for the new post.
   */
  const handleRemoveImage = useCallback(() => {
    setCroppedImageUrl(null);
  }, []);

  /**
   * Handles the submission of a new post.
   */
  const handlePost = useCallback(async () => {
    // Prevent posting if user is not logged in or a post is already in progress
    if (!user || isPosting) return;

    // Validate if there's any content to post
    if (!postContent.trim() && !croppedImageUrl && !postToQuote) {
      toast({ title: "Cannot post empty update", description: "Please add some text, an image, or a quoted post.", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      let imageUrlToPost: string | null = null;
      if (croppedImageUrl) {
        // Upload image if available
        imageUrlToPost = await uploadImage(croppedImageUrl, `posts/${user.uid}/${Date.now()}`);
      }

      let quotedPostData: { id: string; content: string; imageUrl: string | null; authorId: string; } | undefined = undefined;
      if (postToQuote) {
        // Prepare quoted post data
        quotedPostData = {
          id: postToQuote.id,
          content: postToQuote.content,
          imageUrl: postToQuote.imageUrl,
          authorId: postToQuote.author.uid,
        };
      }

      // Create the new post in the database
      await createPost(user.uid, { content: postContent, imageUrl: imageUrlToPost, quotedPost: quotedPostData, privacy: postPrivacy, category: postCategory });

      // Refresh the currently active feed to show the new post immediately
      await fetchFeed(activeTab);

      // Reset form fields
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

  /**
   * Handles toggling the like status of a post.
   * @param postId - The ID of the post to like/unlike.
   */
  const handleLike = useCallback(async (postId: string) => {
    if (!user || loadingAction) return; // Prevent action if user not loaded or another action is in progress

    setLoadingAction({ postId, action: 'like' });

    // Optimistic UI update: immediately change the like status and count in the UI
    const updatePostLikes = (posts: PostWithAuthor[]) => posts.map(p => {
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

    const originalFollowing = [...followingPosts]; // Snapshot for rollback
    const originalDiscovery = [...discoveryPosts]; // Snapshot for rollback

    setFollowingPosts(updatePostLikes);
    setDiscoveryPosts(updatePostLikes);

    try {
      await toggleLikePost(postId, user.uid);
      // No toast on success for likes to avoid notification spam
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast({ title: "Something went wrong", description: "Could not update like status. Please try again.", variant: "destructive" });
      // Rollback UI on error
      setFollowingPosts(originalFollowing);
      setDiscoveryPosts(originalDiscovery);
    } finally {
      setLoadingAction(null);
    }
  }, [user, loadingAction, followingPosts, discoveryPosts, toast]); // Dependencies: user, loadingAction, current feed states, toast

  /**
   * Handles reposting a post.
   * @param postId - The ID of the post to repost.
   */
  const handleRepost = useCallback(async (postId: string) => {
    if (!user || loadingAction) return; // Prevent action if user not loaded or another action is in progress
    setLoadingAction({ postId, action: 'repost' });
    try {
      await repostPost(postId, user.uid);
      toast({ title: "Reposted!", description: "The post has been successfully reposted." });
      // Reposts can appear in both feeds, so refresh both to ensure consistency
      await Promise.all([fetchFeed('following'), fetchFeed('discovery')]);
    } catch (error: any) {
      console.error("Failed to repost:", error);
      toast({ title: error.message || "Failed to repost", description: "An error occurred while reposting. Please try again.", variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  }, [user, loadingAction, fetchFeed, toast]); // Dependencies: user, loadingAction, fetchFeed, toast

  /**
   * Sets the post to be quoted in the new post creation area.
   * @param post - The post to quote.
   */
  const handleQuote = useCallback((post: PostWithAuthor) => {
    setPostToQuote(post);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    document.getElementById('new-post')?.focus(); // Focus on the textarea
  }, []);

  /**
   * Opens the delete confirmation dialog for a specific post.
   * @param post - The post to be deleted.
   */
  const handleDeleteClick = useCallback((post: PostWithAuthor) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Confirms and performs the deletion of a post.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!postToDelete || !user) {
      toast({ title: "Error", description: "No post selected for deletion.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);

    const idToDelete = postToDelete.id;

    // Optimistic UI update: filter out the deleted post from both feeds
    setFollowingPosts(prev => prev.filter(item => item.id !== idToDelete && item.repostedPost?.id !== idToDelete));
    setDiscoveryPosts(prev => prev.filter(item => item.id !== idToDelete && item.repostedPost?.id !== idToDelete));

    try {
      await deletePost(idToDelete);
      toast({ title: "Post Deleted", description: "The post has been successfully removed." });
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({ title: "Failed to delete post", description: "An error occurred while deleting the post. Please try again.", variant: "destructive" });
      // Rollback UI on error by re-fetching both feeds
      await Promise.all([fetchFeed('following'), fetchFeed('discovery')]);
    } finally {
      setIsDeleteDialogOpen(false);
      setPostToDelete(null); // Clear selected post for deletion
      setIsDeleting(false);
    }
  }, [postToDelete, user, fetchFeed, toast]); // Dependencies: postToDelete, user, fetchFeed, toast

  // --- Render Logic ---

  /**
   * Renders the content of a feed tab (Following or Discovery).
   * Displays a skeleton while loading, an empty state message if no posts, or the list of posts.
   * @param posts - The array of posts to display.
   * @param emptyState - The React node to render when the feed is empty.
   */
  const renderFeedContent = useCallback((posts: PostWithAuthor[], emptyState: React.ReactNode) => {
    if (isLoadingFeed) return <FeedSkeleton />;
    if (posts.length === 0) return emptyState;

    return (
      <div className="space-y-6">
        {posts.map(item => (
          <PostCard
            key={item.id} // Ensure unique key for list items
            item={item}
            onLike={handleLike}
            onDelete={handleDeleteClick}
            onRepost={handleRepost}
            onQuote={handleQuote}
            isLoading={loadingAction?.postId === item.id}
            loadingAction={loadingAction && loadingAction.postId === item.id ? loadingAction.action : null}
          />
        ))}
      </div>
    );
  }, [isLoadingFeed, handleLike, handleDeleteClick, handleRepost, handleQuote, loadingAction]); // Dependencies: various handlers and loading states

  // Display skeleton while authentication is in progress
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FeedSkeleton />
      </div>
    );
  }

  // If user is not authenticated after loading, return null (or redirect)
  // This case implies user is not logged in and not in a loading state,
  // so the component shouldn't render its content.
  if (!user) return null;

  return (
    <>
      {/* Image Cropper Modal */}
      <ImageCropper
        imageSrc={imageToCrop}
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        onCropComplete={handleCropComplete}
        aspectRatio={16 / 9} // Standard aspect ratio for most images
        isRound={false}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPostToDelete(null); // Clear selected item if dialog is closed
          setIsDeleteDialogOpen(isOpen);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="post"
        confirmationText="DELETE" // Standard confirmation text
        confirmationLabel={`Are you sure you want to delete this post? This action cannot be undone.`}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Status Feed</h1>

        {/* New Post Creation Card */}
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

        {/* Feed Tabs */}
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
