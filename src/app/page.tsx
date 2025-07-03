
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
import { AreaChart, BarChart, File, LineChart, ListFilter, MoreHorizontal, PlusCircle } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip, Area, ResponsiveContainer, Line, Legend, BarChart as BarChartComponent, AreaChart as AreaChartComponent, LineChart as LineChartComponent } from "recharts"
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
import { currentUser } from "@/lib/mock-data"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const barChartData = [
  { name: 'Jobs', value: currentUser.jobs.length },
  { name: 'Events', value: currentUser.events.length },
  { name: 'Offers', value: currentUser.offers.length },
  { name: 'Listings', value: currentUser.listings.length },
  { name: 'Updates', value: 12 },
  { name: 'Links', value: currentUser.links.length },
];

export default function Dashboard() {
  const totalListings = currentUser.jobs.length + currentUser.events.length + currentUser.offers.length + currentUser.listings.length;
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <Link href="/profile">
          <Button>Create New</Button>
        </Link>
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
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {currentUser.jobs.length} Jobs, {currentUser.events.length} Events, {currentUser.offers.length} Offers, {currentUser.listings.length} Listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">75%</div>
            <Progress value={75} aria-label="75% complete" />
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
