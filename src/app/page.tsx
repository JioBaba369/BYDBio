
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
import { BarChart, Briefcase, Calendar, DollarSign, File, LineChart, ListFilter, MessageSquare, PlusCircle, Tags } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart as BarChartComponent, AreaChart as AreaChartComponent } from "recharts"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo, useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LandingPage } from "@/components/landing-page"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const DashboardSkeleton = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-80 rounded-lg" />
        <Skeleton className="col-span-3 h-80 rounded-lg" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
)

interface ContentCounts {
  jobs: number;
  events: number;
  offers: number;
  listings: number;
  posts: number;
}

function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [isCountsLoading, setIsCountsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchCounts = async () => {
        setIsCountsLoading(true);
        try {
          const collections = ['jobs', 'events', 'offers', 'listings', 'posts'];
          const countPromises = collections.map(col => {
            const collRef = collection(db, col);
            const q = query(collRef, where("authorId", "==", user.uid));
            return getDocs(q).then(snapshot => snapshot.size);
          });
          const [jobs, events, offers, listings, posts] = await Promise.all(countPromises);
          setCounts({ jobs, events, offers, listings, posts });
        } catch (error) {
          console.error("Error fetching content counts:", error);
          setCounts(null);
        } finally {
          setIsCountsLoading(false);
        }
      };
      fetchCounts();
    }
  }, [user]);

  const { totalContent, barChartData, profileCompletion } = useMemo(() => {
    if (!user) {
      return { totalContent: 0, barChartData: [], profileCompletion: 0 };
    }

    const total = (counts?.jobs || 0) + 
                  (counts?.events || 0) + 
                  (counts?.offers || 0) + 
                  (counts?.listings || 0);

    const chart = [
      { name: 'Jobs', value: counts?.jobs || 0 },
      { name: 'Events', value: counts?.events || 0 },
      { name: 'Offers', value: counts?.offers || 0 },
      { name: 'Listings', value: counts?.listings || 0 },
      { name: 'Posts', value: counts?.posts || 0 },
      { name: 'Links', value: user.links?.length || 0 },
    ];
    
    let completion = 0;
    if (user.bio) completion += 20;
    if (user.avatarUrl && !user.avatarUrl.includes('placehold.co')) completion += 20;
    if (user.links && user.links.length > 0) completion += 20;
    if (total > 0 || (counts?.posts || 0) > 0) completion += 20;
    if (user.businessCard && user.businessCard.title && user.businessCard.company) completion += 20;

    return { totalContent: total, barChartData: chart, profileCompletion: completion };
  }, [user, counts]);
  
  if (isCountsLoading) {
    return <DashboardSkeleton />;
  }
  
  if (!user) {
    return <DashboardSkeleton />; // Or a "Please log in" message
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold">Dashboard</h1>
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
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>New Post</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/listings/create" className="cursor-pointer">
                    <Tags className="mr-2 h-4 w-4" />
                    <span>New Listing</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/opportunities/create" className="cursor-pointer">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Views
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,345</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Link Clicks
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,921</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">
              {counts?.jobs || 0} Jobs, {counts?.events || 0} Events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{profileCompletion}%</div>
            <Progress value={profileCompletion} aria-label={`${profileCompletion}% complete`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Profile Engagement</CardTitle>
            <CardDescription>
              Your profile views over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{
              desktop: { label: "Desktop", color: "hsl(var(--primary))" },
              mobile: { label: "Mobile", color: "hsl(var(--accent))" },
            }}>
              <AreaChartComponent data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area dataKey="mobile" type="natural" fill="hsl(var(--accent))" fillOpacity={0.4} stroke="hsl(var(--accent))" stackId="a" />
                <Area dataKey="desktop" type="natural" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" stackId="a" />
              </AreaChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Content Overview</CardTitle>
            <CardDescription>
              A summary of your created content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              value: { label: "Count", color: "hsl(var(--primary))" },
            }}>
              <BarChartComponent data={barChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={5} />
              </BarChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle className="font-headline">Recent Link Clicks</CardTitle>
            <CardDescription>
              A log of your most recently clicked links.
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Portfolio</DropdownMenuItem>
                <DropdownMenuItem>Social Media</DropdownMenuItem>
                <DropdownMenuItem>Website</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link Title</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Clicks</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">My Personal Website</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    https://example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">Website</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">1,204</TableCell>
                <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                <TableCell className="text-right">12.5%</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>
                  <div className="font-medium">Design Portfolio</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    https://behance.net/user
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">Portfolio</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">890</TableCell>
                <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
                <TableCell className="text-right">9.8%</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>
                  <div className="font-medium">LinkedIn Profile</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    https://linkedin.com/in/user
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary" className="bg-accent/30 text-accent-foreground/80">Social</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">2,103</TableCell>
                <TableCell className="hidden md:table-cell">2023-06-25</TableCell>
                <TableCell className="text-right">25.1%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
