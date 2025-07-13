
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { getNotificationsForUser, type Notification, markSingleNotificationAsRead } from '@/lib/notifications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Inbox as InboxIcon } from 'lucide-react';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const InboxSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-9 w-20" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);


export default function InboxPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Notification | null>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getNotificationsForUser(user.uid)
                .then(allNotifications => {
                    const contactMessages = allNotifications.filter(n => n.type === 'contact_form_submission');
                    setMessages(contactMessages);
                })
                .catch(err => {
                    console.error("Failed to fetch messages:", err);
                    toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, toast]);
    
    const handleRowClick = (message: Notification) => {
        const originalMessages = [...messages];
        setSelectedMessage(message);
        if (!message.read) {
            // Optimistic update
            setMessages(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m));
            // Mark as read in the backend
            markSingleNotificationAsRead(message.id).catch(err => {
                console.error("Failed to mark as read:", err)
                setMessages(originalMessages); // Revert on error
                toast({ title: "Error", description: "Could not update message status.", variant: "destructive" });
            });
        }
    }

    if (authLoading || isLoading) {
        return <InboxSkeleton />;
    }
    
    if (!user) return null;

    return (
        <>
            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Message from {selectedMessage?.senderName}</DialogTitle>
                         <DialogDescription>
                            <span className="font-medium">From:</span> {selectedMessage?.senderEmail} <br />
                            <span className="font-medium">Received:</span> <ClientFormattedDate date={selectedMessage?.createdAt as any} relative />
                        </DialogDescription>
                    </DialogHeader>
                     <Separator />
                    <div className="pt-2">
                        <p className="whitespace-pre-wrap text-sm">{selectedMessage?.messageBody}</p>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Contact Inbox</h1>
                    <p className="text-muted-foreground">Messages submitted through your public profile's contact form.</p>
                </div>
                
                <Card>
                    <CardHeader>
                       <CardTitle>Received Messages ({messages.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {messages.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px] pl-6">Sender</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead className="w-[150px] hidden md:table-cell">Received</TableHead>
                                        <TableHead className="w-[100px] text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.map(msg => (
                                        <TableRow key={msg.id} onClick={() => handleRowClick(msg)} className={cn("cursor-pointer", !msg.read && "bg-primary/5 font-semibold")}>
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{msg.senderName?.charAt(0) ?? 'A'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p>{msg.senderName}</p>
                                                        <p className={cn("text-xs text-muted-foreground", !msg.read && "text-foreground/80")}>{msg.senderEmail}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="line-clamp-2">{msg.messageBody}</p>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <ClientFormattedDate date={msg.createdAt} relative />
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="outline" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <InboxIcon className="h-12 w-12" />
                                <h3 className="text-lg font-semibold text-foreground">Your inbox is empty</h3>
                                <p>When someone contacts you via your profile, their message will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
