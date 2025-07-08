
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Briefcase, Calendar, DollarSign, PenSquare, PlusCircle, Tags, Users, UserCheck, Package, Sparkles, Megaphone, Rss } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useMemo, useState, useEffect, useCallback } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LandingPage } from "@/components/landing-page"
import { getRecentActivity, type ActivityItem } from "@/lib/dashboard"
import { ClientFormattedDate } from "@/components/client-formatted-date"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

interface ContentCounts {
  jobs: number;
  events: number;
  offers: number;
  listings: number;
  posts: number;
  promoPages: number;
}

function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.uid) return;

    setIsCountsLoading(true);
    setIsActivityLoading(true);

    // Fetch counts
    try {
      const collections = ['jobs', 'events', 'offers', 'listings', 'posts', 'promoPages'];
      const countPromises = collections.map(col => {
        const collRef = collection(db, col);
        const q = query(collRef, where("authorId", "==", user.uid));
        return getDocs(q).then(snapshot => snapshot.size);
      });
      const [jobs, events, offers, listings, posts, promoPages] = await Promise.all(countPromises);
      setCounts({ jobs, events, offers, listings, posts, promoPages });
    } catch (error) {
      console.error("Error fetching content counts:", error);
      setCounts(null);
    } finally {
      setIsCountsLoading(false);
    }

    // Fetch activity
    try {
        const recentActivity = await getRecentActivity(user.uid);
        setActivity(recentActivity);
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        setActivity([]);
    } finally {
        setIsActivityLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
        fetchDashboardData();
    }
  }, [user?.uid, fetchDashboardData]);

  const { totalContent, profileCompletion } = useMemo(() => {
    if (!user) {
      return { totalContent: 0, profileCompletion: 0 };
    }

    const total = (counts?.jobs || 0) + 
                  (counts?.events || 0) + 
                  (counts?.offers || 0) + 
                  (counts?.listings || 0) +
                  (counts?.posts || 0) +
                  (counts?.promoPages || 0);
    
    let completion = 0;
    if (user.bio) completion += 20;
    if (user.avatarUrl && !user.avatarUrl.includes('placehold.co')) completion += 20;
    if (user.links && user.links.length > 0) completion += 20;
    if (total > 0) completion += 20;
    if (user.businessCard && user.businessCard.title && user.businessCard.company) completion += 20;

    return { totalContent: total, profileCompletion: completion };
  }, [user, counts]);
  
  if (isCountsLoading || isActivityLoading) {
    return <DashboardSkeleton />;
  }
  
  if (!user) {
    return <DashboardSkeleton />;
  }
  
  const getActivityLink = (item: ActivityItem) => {
    switch (item.type) {
        case 'Listing': return `/l/${item.id}`;
        case 'Job': return `/job/${item.id}`;
        case 'Event': return `/events/${item.id}`;
        case 'Offer': return `/offer/${item.id}`;
        case 'Business Page': return `/p/${item.id}`;
        case 'Post': return `/feed`;
        default: return '/';
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's a snapshot of your professional hub.</p>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Create New Content</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/feed" className="cursor-pointer">
                    <Rss className="mr-2 h-4 w-4" />
                    <span>New Post</span>
                </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                <Link href="/promo/create" className="cursor-pointer">
                    <Megaphone className="mr-2 h-4 w-4" />
                    <span>New Business Page</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/listings/create" className="cursor-pointer">
                    <Tags className="mr-2 h-4 w-4" />
                    <span>New Listing</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/job/create" className="cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>New Job</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/events/create" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>New Event</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/offers/create" className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>New Offer</span>
                </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Followers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.followerCount}</div>
             <p className="text-xs text-muted-foreground">
              Total number of followers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Following
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.following.length}</div>
            <p className="text-xs text-muted-foreground">
              Total number of users you follow
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">
              Total active content items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
             <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{profileCompletion}%</div>
            <Progress value={profileCompletion} aria-label={`${profileCompletion}% complete`} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>
                    Your most recently created content across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Content</TableHead>
                            <TableHead className="hidden sm:table-cell">Type</TableHead>
                            <TableHead className="hidden md:table-cell">Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activity.length > 0 ? activity.map(item => (
                            <TableRow key={`${item.type}-${item.id}`}>
                                <TableCell>
                                    <div className="font-medium truncate max-w-xs">{item.title}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant="secondary">{item.type}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <ClientFormattedDate date={item.createdAt} relative />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={getActivityLink(item)}>View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No recent activity. Create some content to get started!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // This effect handles the initial authentication check.
    // The main logic for redirection is handled within the AuthProvider.
  }, [loading, user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
