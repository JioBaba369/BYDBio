
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCheck, Bell, UserPlus, Heart, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { getNotificationsForUser, markNotificationsAsRead, markSingleNotificationAsRead, type NotificationWithActor } from "@/lib/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ClientFormattedDate } from "@/components/client-formatted-date";
import { useRouter } from "next/navigation";
import type { Timestamp } from "firebase/firestore";

const NotificationSkeleton = () => (
    <div className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

const NotificationItem = ({ notification, onRead }: { notification: NotificationWithActor, onRead: (id: string) => void }) => {
  const { actor } = notification;

  if (!actor) return null; // Don't render if the actor (user who performed action) is gone

  let icon, message, link;

  switch (notification.type) {
    case 'new_follower':
      icon = <UserPlus className="h-5 w-5 text-primary" />;
      message = <p><span className="font-semibold">{actor.name}</span> started following you.</p>;
      link = `/u/${actor.username}`;
      break;
    case 'new_like':
      icon = <Heart className="h-5 w-5 text-red-500" />;
      message = (
        <p>
            <span className="font-semibold">{actor.name}</span> liked your post:{" "}
            <span className="italic text-muted-foreground">"{notification.entityTitle}"</span>
        </p>
      );
      link = `/feed`; // A real app would link to the post: `/posts/${notification.entityId}`
      break;
    case 'event_rsvp':
      icon = <Calendar className="h-5 w-5 text-purple-500" />;
      message = <p><span className="font-semibold">{actor.name}</span> RSVP'd to your event: <span className="font-semibold">{notification.entityTitle}</span>.</p>;
      link = `/events/${notification.entityId}`;
      break;
    default:
      return null;
  }

  return (
    <Link href={link} onClick={() => onRead(notification.id)} className={cn(
      "block p-4 border-b last:border-b-0 transition-colors",
      !notification.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
    )}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar>
            <AvatarImage src={actor.avatarUrl} alt={actor.name} data-ai-hint="person portrait"/>
            <AvatarFallback>{actor.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
            {icon}
          </div>
        </div>
        <div className="flex-1 text-sm">
          {message}
          <p className="text-xs text-muted-foreground mt-1">
            <ClientFormattedDate date={(notification.createdAt as unknown as Timestamp).toDate()} relative />
          </p>
        </div>
      </div>
    </Link>
  );
};


export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getNotificationsForUser(user.uid)
                .then(setNotifications)
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleReadNotification = async (notificationId: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        try {
            await markSingleNotificationAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Optionally revert UI on failure and show a toast
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user || unreadCount === 0) return;

        try {
            await markNotificationsAsRead(user.uid);
            // Optimistic UI update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast({ title: "All notifications marked as read." });
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
            toast({ title: "Error", description: "Could not mark notifications as read.", variant: "destructive" });
        }
    };

    if (authLoading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
            <Card>
                <CardContent className="p-0">
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                    <NotificationSkeleton />
                </CardContent>
            </Card>
        </div>
      );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}.` : 'No new notifications.'}
                    </p>
                </div>
                <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            </div>
            <Card>
                <CardContent className="p-0 divide-y">
                    {isLoading ? (
                        <>
                           <NotificationSkeleton />
                           <NotificationSkeleton />
                           <NotificationSkeleton />
                        </>
                    ) : notifications.length > 0 ? (
                       <div>
                           {notifications.map(notification => (
                             <NotificationItem key={notification.id} notification={notification} onRead={handleReadNotification} />
                           ))}
                       </div>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Bell className="h-12 w-12" />
                            <h3 className="text-lg font-semibold text-foreground">You're all caught up!</h3>
                            <p>New notifications from followers and likes will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
