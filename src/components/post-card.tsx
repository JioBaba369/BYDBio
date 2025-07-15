
'use client';

import type { PostWithAuthor, EmbeddedPostInfoWithAuthor } from '@/lib/posts';
import { useAuth } from '@/components/auth-provider';
import { Card, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Heart, Share2, Repeat, Quote as QuoteIcon, MessageCircle, Loader2, Users, Globe, Lock } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import React, { useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { handleToggleLike, handleRepost, handleDeletePost } from '@/app/actions/posts';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';


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
    onQuote: (post: PostWithAuthor) => void;
    onDeleted: (postId: string) => void;
}

export function PostCard({ item, onQuote, onDeleted }: PostCardProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const isOwner = user?.uid === item.author.uid;
    const isRepost = !!item.repostedPost;
    
    // State for optimistic UI updates
    const [isLiked, setIsLiked] = useState(item.isLiked || false);
    const [likeCount, setLikeCount] = useState(item.likes || 0);

    const [isLikePending, startLikeTransition] = useTransition();
    const [isRepostPending, startRepostTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isLoading = isLikePending || isRepostPending || isDeletePending;


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
    
    const PrivacyIcon = () => {
        let IconComponent = Globe;
        let tooltipText = "Visible to everyone";
        if (item.privacy === 'followers') {
            IconComponent = Users;
            tooltipText = "Visible to followers only";
        } else if (item.privacy === 'me') {
            IconComponent = Lock;
            tooltipText = "Visible to you only";
        }
        return (
            <TooltipProvider><Tooltip><TooltipTrigger><IconComponent className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent><p>{tooltipText}</p></TooltipContent></Tooltip></TooltipProvider>
        );
    }

    const onLikeClick = async () => {
        if (!user || isLikePending) return;
        
        startLikeTransition(async () => {
            const wasLiked = isLiked;
            setIsLiked(!wasLiked);
            setLikeCount(prev => prev + (wasLiked ? -1 : 1));

            try {
                await handleToggleLike(item.id, user.uid, pathname);
            } catch (error) {
                setIsLiked(wasLiked);
                setLikeCount(prev => prev + (wasLiked ? 1 : -1));
                toast({ title: 'Failed to update like', variant: 'destructive'});
            }
        });
    }

    const onRepostClick = async () => {
        if (!user || isRepostPending) return;
        
        startRepostTransition(async () => {
            try {
                await handleRepost(item.originalPostId || item.id, user.uid, pathname);
                toast({ title: "Post Reposted" });
            } catch (error: any) {
                toast({ title: "Failed to repost", description: error.message, variant: 'destructive' });
            }
        });
    }

    const onDeleteClick = async () => {
        if (!isOwner || isDeletePending) return;
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await handleDeletePost(item.id, pathname);
                toast({ title: "Post Deleted" });
                onDeleted(item.id);
            } catch (error: any) {
                toast({ title: "Failed to delete post", description: error.message, variant: 'destructive' });
            }
            setIsDeleteDialogOpen(false);
        });
    }

    return (
        <>
            <DeleteConfirmationDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                isLoading={isDeletePending}
                itemName="post"
                confirmationText="DELETE"
            />
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
                                <PrivacyIcon />
                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={onDeleteClick} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete Post</DropdownMenuItem>
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
                            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={onLikeClick} disabled={isLoading || !user}>
                                {isLikePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />}
                                <span className="text-xs">{likeCount}</span>
                            </Button>
                            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground" disabled>
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{item.comments || 0}</span>
                            </Button>
                            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" onClick={onRepostClick} disabled={isLoading || !user}>
                                {isRepostPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
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
        </>
    );
}
