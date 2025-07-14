
'use client';

import type { PostWithAuthor, EmbeddedPostInfoWithAuthor } from '@/lib/posts';
import { useAuth } from '@/components/auth-provider';
import { Card, CardFooter } from "@/components/ui/card";
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
import React from 'react';

// A sub-component for rendering a quoted post.
const QuotedPostView = ({ post }: { post: EmbeddedPostInfoWithAuthor }) => (
    <div className="mt-2 border rounded-lg overflow-hidden transition-colors hover:bg-muted/30">
        <Link href={`/u/${post.author.username}`}>
            <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author.avatarUrl} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground hover:underline">{post.author.name}</span>
                    <span>@{post.author.username}</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.imageUrl && (
                <div className="mt-2 aspect-video relative bg-muted">
                    <Image src={post.imageUrl} alt="Quoted post image" fill className="object-cover" />
                </div>
            )}
        </Link>
    </div>
);

// A sub-component for rendering a repost.
const RepostView = ({ post }: { post: PostWithAuthor }) => {
    const displayItem = post.repostedPost!;
    const author = displayItem.author;

    if (!author) return null; // Or show a placeholder for deleted authors

    return (
        <div className="p-4 border rounded-md">
            <div className="flex items-center gap-2 text-sm">
                <Link href={`/u/${author.username}`} className="flex items-center gap-2 hover:underline">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{author.name}</span>
                    <span className="text-muted-foreground">@{author.username}</span>
                </Link>
                 <span className="text-muted-foreground">·</span>
                 <ClientFormattedDate date={displayItem.createdAt} relative />
            </div>
            {displayItem.content && <p className="mt-2 text-sm whitespace-pre-wrap">{displayItem.content}</p>}
            {displayItem.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                    <Image src={displayItem.imageUrl} alt="Post image" width={600} height={400} className="object-cover w-full" />
                </div>
            )}
        </div>
    );
};

// Main Post Card Component
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

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/u/${item.author.username}`;
        const shareText = item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '');

        if (navigator.share) {
            try { await navigator.share({ title: `Post by ${item.author.name}`, text: shareText, url: shareUrl }); } catch (error) {}
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link to author's profile copied!" });
        }
    };

    return (
        <Card>
            {isRepost && (
                <div className="px-4 pt-3 pb-0 text-sm text-muted-foreground font-semibold flex items-center gap-2">
                    <Repeat className="h-4 w-4"/>
                    <Link href={`/u/${item.author.username}`} className="hover:underline">
                        {isOwner ? "You" : item.author.name} reposted
                    </Link>
                </div>
            )}
            <div className="flex items-start gap-4 p-4">
                <Link href={`/u/${item.author.username}`}>
                    <Avatar>
                        <AvatarImage src={item.author.avatarUrl} />
                        <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="w-full">
                    <div className="flex justify-between items-start">
                        <div className="text-sm">
                            <Link href={`/u/${item.author.username}`} className="font-semibold hover:underline">{item.author.name}</Link>
                            <span className="text-muted-foreground ml-2">@{item.author.username}</span>
                            <span className="text-muted-foreground"> · </span>
                            <Link href={`/u/${item.author.username}`} className="text-muted-foreground hover:underline">
                                <ClientFormattedDate date={item.createdAt} relative />
                            </Link>
                        </div>
                        <div className="flex items-center gap-1 -mt-2">
                            {item.privacy === 'followers' && (<TooltipProvider><Tooltip><TooltipTrigger><Users className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent><p>Visible to followers only</p></TooltipContent></Tooltip></TooltipProvider>)}
                            {item.privacy === 'public' && (<TooltipProvider><Tooltip><TooltipTrigger><Globe className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent><p>Visible to everyone</p></TooltipContent></Tooltip></TooltipProvider>)}
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete Post</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 space-y-3">
                        {item.content && <p className="whitespace-pre-wrap">{item.content}</p>}
                        {item.quotedPost && <QuotedPostView post={item.quotedPost} />}
                        {item.repostedPost && <RepostView post={item} />}
                        {item.imageUrl && <div className="mt-2 rounded-lg overflow-hidden border"><Image src={item.imageUrl} alt="Post image" width={600} height={400} className="object-cover w-full" /></div>}
                        {item.category && <div className="pt-2"><Badge variant="outline">{item.category}</Badge></div>}
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
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" onClick={() => onRepost(item.repostedPost ? item.repostedPost.id : item.id)} disabled={isLoading || !user}>
                            {isLoading && loadingAction === 'repost' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
                            <span className="text-xs">{item.repostCount || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-blue-500" onClick={() => onQuote(item)} disabled={isLoading || !user}>
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

    