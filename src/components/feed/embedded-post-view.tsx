
import type { EmbeddedPostInfoWithAuthor } from '@/lib/posts';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const EmbeddedPostView = ({ post }: { post: EmbeddedPostInfoWithAuthor }) => (
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
                    <Image src={post.imageUrl} alt="Embedded post image" layout="fill" className="object-cover" />
                </div>
            )}
        </Link>
    </div>
);
