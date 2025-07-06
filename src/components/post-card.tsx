
'use client';

import type { PostWithAuthor } from '@/lib/posts';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Heart, Share2, Repeat, Quote as QuoteIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

type FeedItem = PostWithAuthor & { isLiked: boolean; };

interface PostCardProps {
    item: FeedItem;
    onLike: (postId: string) => void;
    onDelete: (post: FeedItem) => void;
    onRepost: (postId: string) => void;
    onQuote: (post: FeedItem) => void;
}

export function PostCard({ item, onLike, onDelete, onRepost, onQuote }: PostCardProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const isOwner = user?.uid === item.author.uid;

    const handleShare = () => {
        const profileUrl = `${window.location.origin}/u/${item.author.username}`;
        navigator.clipboard.writeText(profileUrl);
        toast({
            title: "Link Copied!",
            description: "A link to this user's profile has been copied to your clipboard.",
        });
    };

    return (
        <Card>
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <Link href={`/u/${item.author.username}`} className="flex items-center gap-3 hover:underline">
                        <Avatar>
                            <AvatarImage src={item.author.avatarUrl} data-ai-hint="person portrait"/>
                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{item.author.name}</p>
                            <p className="text-sm text-muted-foreground">@{item.author.username} · <ClientFormattedDate date={item.createdAt} relative /></p>
                        </div>
                    </Link>
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
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="whitespace-pre-wrap">{item.content}</p>
                {item.imageUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden border">
                        <Image src={item.imageUrl} alt="Post image" width={600} height={400} className="object-cover" data-ai-hint="office workspace"/>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-start p-4 border-t gap-1">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => onLike(item.id)}>
                    <Heart className={cn("h-5 w-5", item.isLiked && "fill-red-500 text-red-500")} />
                    <span>{item.likes}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-green-500" onClick={() => onRepost(item.id)}>
                    <Repeat className="h-5 w-5" />
                    <span>{item.repostCount || 0}</span>
                </Button>
                 <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-blue-500" onClick={() => onQuote(item)} disabled>
                    <QuoteIcon className="h-5 w-5" />
                    <span>Quote</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground ml-auto" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
