
'use client';

import type { PostWithAuthor } from '@/lib/posts';
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

interface PostCardProps {
    item: PostWithAuthor;
    onLike: (postId: string) => void;
    onDelete: (post: PostWithAuthor) => void;
    onRepost: (postId: string) => void;
    onQuote: (post: PostWithAuthor) => void;
    isLoading?: boolean;
    loadingAction?: 'like' | 'repost' | 'quote' | null;
}

export function PostCard({ item, onLike, onDelete, onRepost, onQuote, isLoading = false, loadingAction = null }: PostCardProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const isOwner = user?.uid === item.author.uid;
    const isRepost = !!item.repostedPost;
    
    // Determine the content to display. If it's a repost, use the nested post's data.
    const displayItem = isRepost ? item.repostedPost! : item;
    const displayAuthor = isRepost ? displayItem.author : item.author;

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/u/${displayAuthor.username}`;
        const shareText = displayItem.content.substring(0, 100) + (displayItem.content.length > 100 ? '...' : '');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${displayAuthor.name}`,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {/* Ignore user cancellation */}
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Link to author's profile copied!",
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
            <div className="flex items-start gap-4 p-4">
                <Link href={`/u/${displayAuthor.username}`}>
                    <Avatar>
                        <AvatarImage src={displayAuthor.avatarUrl} />
                        <AvatarFallback>{displayAuthor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="w-full">
                    <div className="flex justify-between items-start">
                         <div className="text-sm">
                            <Link href={`/u/${displayAuthor.username}`} className="font-semibold hover:underline">{displayAuthor.name}</Link>
                            <span className="text-muted-foreground ml-2">@{displayAuthor.username}</span>
                            <span className="text-muted-foreground"> · </span>
                            <Link href={`/u/${displayAuthor.username}`} className="text-muted-foreground hover:underline">
                                <ClientFormattedDate date={item.createdAt} relative />
                            </Link>
                        </div>
                        <div className="flex items-center gap-1 -mt-2">
                             {item.privacy === 'followers' && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Users className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>Visible to followers only</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {item.privacy === 'public' && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Globe className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent><p>Visible to everyone</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreHorizontal className="h-4 w-4" />
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
                    <div className="mt-2 space-y-3">
                        {/* Render the quote's content first, if it exists */}
                        {item.content && <p className="whitespace-pre-wrap">{item.content}</p>}

                        {/* Render the quoted post, if this is a quote post */}
                        {item.quotedPost && item.quotedPost.author && <EmbeddedPostView post={item.quotedPost} />}

                        {/* If it's a pure repost, render the content of the reposted item */}
                        {isRepost && displayItem.content && <p className="whitespace-pre-wrap">{displayItem.content}</p>}
                        
                        {displayItem.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border">
                                <Image src={displayItem.imageUrl} alt="Post image" width={600} height={400} className="object-cover w-full" />
                            </div>
                        )}
                        {item.category && !isRepost && (
                            <div className="pt-2">
                                <Badge variant="outline">{item.category}</Badge>
                            </div>
                        )}
                    </div>
                     <CardFooter className="flex justify-between items-center p-0 pt-3 -ml-2">
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => onLike(item.id)} disabled={isLoading || !user}>
                            {isLoading && loadingAction === 'like' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", item.isLiked && "fill-red-500 text-red-500")} />}
                            <span className="text-xs">{item.likes || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground" disabled>
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">{item.comments || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" onClick={() => onRepost(displayItem.id)} disabled={isLoading || !user}>
                            {isLoading && loadingAction === 'repost' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
                            <span className="text-xs">{displayItem.repostCount || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-blue-500" onClick={() => onQuote(displayItem as PostWithAuthor)} disabled={isLoading || !user}>
                            <QuoteIcon className="h-4 w-4" />
                            <span className="text-xs hidden sm:inline">Quote</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground" onClick={handleShare} disabled={isLoading}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
}
