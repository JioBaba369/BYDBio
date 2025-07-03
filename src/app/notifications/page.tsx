
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, CheckCheck, UserPlus, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: 'new_follower' | 'like' | 'comment';
  user: {
    name: string;
    handle: string;
    avatarUrl: string;
    avatarFallback: string;
  };
  contentPreview?: string;
  timestamp: string;
  read: boolean;
};

const initialNotificationsData: Notification[] = [
  {
    id: '1',
    type: 'new_follower',
    user: { name: 'John Smith', handle: 'johnsmith', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'JS' },
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'like',
    user: { name: 'Maria Garcia', handle: 'mariag', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'MG' },
    contentPreview: "your post 'Excited to share a sneak peek...'",
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    user: { name: 'Alex Johnson', handle: 'alexj', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'AJ' },
    contentPreview: "on your post: 'Great work on this! Looks super clean.'",
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'like',
    user: { name: 'Chris Lee', handle: 'chrisl', avatarUrl: 'https://placehold.co/100x100.png', avatarFallback: 'CL' },
    contentPreview: "your business page 'Acme Inc. Design Studio'",
    timestamp: '3 days ago',
    read: true,
  },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'new_follower':
            return <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10"><UserPlus className="h-5 w-5 text-primary" /></div>;
        case 'like':
            return <div className="h-10 w-10 rounded-full flex items-center justify-center bg-accent/10"><Heart className="h-5 w-5 text-accent" /></div>;
        case 'comment':
            return <div className="h-10 w-10 rounded-full flex items-center justify-center bg-secondary"><MessageSquare className="h-5 w-5 text-secondary-foreground" /></div>;
        default:
            return <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted"><MessageSquare className="h-5 w-5 text-muted-foreground" /></div>;
    }
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotificationsData);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages.` : 'No new notifications.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings">
                            <Cog className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent className="p-0">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <li key={notification.id} className={cn("flex items-center gap-4 p-4", !notification.read && "bg-primary/5")}>
                                    <NotificationIcon type={notification.type} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm">
                                            <Link href={`/u/${notification.user.handle}`} className="font-semibold hover:underline">{notification.user.name}</Link>
                                            {notification.type === 'new_follower' && ' started following you.'}
                                            {notification.type === 'like' && ` liked ${notification.contentPreview}.`}
                                            {notification.type === 'comment' && ` commented ${notification.contentPreview}.`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            <p>You're all caught up!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
