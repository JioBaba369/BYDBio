
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, File, Activity, CreditCard, Users, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WireframePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Feature Title</h1>
                    <p className="text-muted-foreground">A brief description of this new feature page.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Item
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metric 1</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metric 2</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metric 3</CardTitle>
                         <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold">+12,234</div>
                       <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Metric 4</CardTitle>
                         <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Chart Placeholder</CardTitle>
                        <CardDescription>This is where a chart or graph would go.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="w-full h-80 bg-muted/50 rounded-lg flex items-center justify-center">
                            <p className="text-muted-foreground">[Chart Area]</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A feed or list of recent items.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-1 flex-1">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-3 w-1/2" />
                           </div>
                        </div>
                         <div className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-1 flex-1">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-3 w-1/2" />
                           </div>
                        </div>
                         <div className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-1 flex-1">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-3 w-1/2" />
                           </div>
                        </div>
                         <div className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-1 flex-1">
                               <Skeleton className="h-4 w-3/4" />
                               <Skeleton className="h-3 w-1/2" />
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Data Table</CardTitle>
                        <CardDescription>A placeholder for displaying tabular data.</CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">Filter</span>
                        </Button>
                         <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">Export</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="font-medium">USR-00{i + 1}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">Placeholder Name {i + 1}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            user{i+1}@example.com
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                    <TableCell className="text-right">${(Math.random() * 200).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
