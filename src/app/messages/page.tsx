'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getMessagesForUser, markMessageAsRead, type Message } from '@/lib/messages';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const MessageSkeleton = () => (
    <div className="p-4 space-y-3 border-b">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-20" />
        </div>
    </div>
)

export default function MessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getMessagesForUser(user.uid)
                .then(setMessages)
                .catch(() => toast({ title: "Error", description: "Could not load messages.", variant: "destructive" }))
                .finally(() => setIsLoading(false));
        }
    }, [user, toast]);

    const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
        if (isRead) return; // Don't do anything if already read

        // Optimistic update
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
        
        try {
            await markMessageAsRead(messageId);
        } catch (error) {
            console.error("Failed to mark message as read:", error);
            // Revert on error
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: false } : m));
            toast({ title: "Error", description: "Failed to update message status.", variant: "destructive" });
        }
    };
    
    if (authLoading || (isLoading && !messages.length)) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </div>
                <Card>
                    <CardContent className="p-0">
                        <MessageSkeleton />
                        <MessageSkeleton />
                        <MessageSkeleton />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Inbox</h1>
                <p className="text-muted-foreground">Messages from your public profile contact form.</p>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    {messages.length > 0 ? (
                         <Accordion type="multiple" className="w-full">
                            {messages.map((message) => (
                                <AccordionItem key={message.id} value={message.id} className={cn(!message.read && "bg-primary/5")}>
                                    <AccordionTrigger 
                                        onClick={() => handleMarkAsRead(message.id, message.read)}
                                        className="p-4 text-left hover:no-underline"
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <Avatar className={cn("h-10 w-10", !message.read && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background")}>
                                                <AvatarFallback>{message.senderName?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="font-semibold">{message.senderName}</p>
                                                    <p className="text-xs text-muted-foreground"><ClientFormattedDate date={message.createdAt} relative/></p>
                                                </div>
                                                <p className="text-sm text-muted-foreground text-left">{message.senderEmail}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="p-4 bg-background rounded-lg border ml-14">
                                           <p className="whitespace-pre-wrap">{message.message}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                         </Accordion>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Inbox className="h-12 w-12" />
                            <h3 className="font-semibold text-foreground">Your inbox is empty</h3>
                            <p>When someone contacts you through your profile, their message will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
