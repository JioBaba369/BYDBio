
'use client';

import type { PostWithAuthor, EmbeddedPostInfoWithAuthor } from '@/lib/posts';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Heart, Share2, Repeat, Quote as QuoteIcon, MessageCircle, Loader2, Users, Globe } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EmbeddedPostView } from './feed/embedded-post-view';

type FeedItem = PostWithAuthor & { isLiked?: boolean; };

interface PostCardProps {
    item: FeedItem;
    onLike: (postId: string) => void;
    onDelete: (post: FeedItem) => void;
    onRepost: (postId: string) => void;
    onQuote: (post: FeedItem) => void;
    isLoading?: boolean;
    loadingAction?: 'like' | 'repost' | 'quote' | null;
}

export function PostCard({ item, onLike, onDelete, onRepost, onQuote, isLoading = false, loadingAction = null }: PostCardProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const isOwner = user?.uid === item.author.uid;
    const isRepost = !!item.repostedPost;

    const handleShare = async () => {
        // Since posts don't have their own pages, we link to the author's profile.
        const shareUrl = `${window.location.origin}/u/${item.author.username}`;
        const shareTitle = `Post by ${item.author.name}`;
        
        // Use reposted content for share text if it exists
        const mainContent = item.repostedPost?.content || item.quotedPost?.content || item.content;
        const shareText = mainContent.substring(0, 100) + (mainContent.length > 100 ? '...' : '');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                // This error is thrown if the user cancels the share. We can safely ignore it.
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Link to author's profile copied!",
                description: "A link to this user's profile has been copied to your clipboard.",
            });
        }
    };

    return (
        <Card>
            {isRepost && (
                <div className="px-4 pt-3 pb-0 text-sm text-muted-foreground font-semibold flex items-center gap-2">
                    <Repeat className="h-4 w-4"/>
                    <Link href={`/u/${item.author.username}`} className="hover:underline">
                        {user?.uid === item.author.uid ? "You" : item.author.name} reposted
                    </Link>
                </div>
            )}
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <Link href={`/u/${item.author.username}`} className="flex items-center gap-3 hover:underline">
                        <Avatar>
                            <AvatarImage src={item.author.avatarUrl} />
                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{item.author.name}</p>
                            <p className="text-sm text-muted-foreground">
                                @{item.author.username} · <ClientFormattedDate date={item.createdAt} relative />
                                {item.postNumber > 0 && <span> · Post #{item.postNumber}</span>}
                            </p>
                        </div>
                    </Link>
                     <div className="flex items-center gap-2">
                        {isOwner && item.privacy === 'followers' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Visible to followers only</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {isOwner && item.privacy === 'public' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Visible to everyone</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {/* Render content only if it's NOT a pure repost. A quote post has content. */}
                {!isRepost && item.content && (
                    <p className="whitespace-pre-wrap">{item.content}</p>
                )}

                {/* Render the quoted post if it exists (for quote-posts) */}
                {item.quotedPost && item.quotedPost.author && <EmbeddedPostView post={item.quotedPost} />}

                {/* Render the reposted post if it exists (for reposts) */}
                {item.repostedPost && item.repostedPost.author && <EmbeddedPostView post={item.repostedPost} />}

                {/* Render the image if it's NOT a repost and has an image */}
                {!isRepost && item.imageUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden border">
                        <Image src={item.imageUrl} alt="Post image" width={600} height={400} className="object-cover" />
                    </div>
                )}

                {!isRepost && item.category && (
                    <div className="mt-4">
                        <Badge variant="outline">{item.category}</Badge>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-start p-4 border-t gap-1">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => onLike(item.id)} disabled={isLoading || !user}>
                    {isLoading && loadingAction === 'like' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={cn("h-5 w-5", item.isLiked && "fill-red-500 text-red-500")} />}
                    <span>{item.likes || 0}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground" disabled>
                    <MessageCircle className="h-5 w-5" />
                    <span>{item.comments || 0}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" onClick={() => onRepost(isRepost ? item.repostedPost!.id : item.id)} disabled={isLoading || !user}>
                    {isLoading && loadingAction === 'repost' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Repeat className="h-5 w-5" />}
                    <span>{item.repostCount || 0}</span>
                </Button>
                 <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-blue-500" onClick={() => onQuote(item)} disabled={isLoading || !user}>
                    <QuoteIcon className="h-5 w-5" />
                    <span>Quote</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground ml-auto" onClick={handleShare} disabled={isLoading}>
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
