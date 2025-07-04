
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    // In a real app, notifications would be fetched from a database.
    // For this prototype, we'll show an empty state.
    const notifications: any[] = [];
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        // This would be an API call in a real app.
    };

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
                       <ul>
                           {/* List notifications here */}
                       </ul>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Bell className="h-12 w-12" />
                            <h3 className="text-lg font-semibold text-foreground">You're all caught up!</h3>
                            <p>New notifications will appear here.</p>
                            <p className="text-xs max-w-md">
                                Note: A full notification system requires backend functionality (like Cloud Functions) to create notifications when events like new followers or post likes occur. This is not yet implemented.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
