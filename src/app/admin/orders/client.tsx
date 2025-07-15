
'use client';

import { useState } from 'react';
import type { Order } from '@/lib/orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

type SortKey = keyof Order;

const useSortableData = (items: Order[], initialSortKey: SortKey) => {
    const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const sortedItems = [...items].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortKey === key && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortKey(key);
        setSortDirection(direction);
    };

    return { items: sortedItems, requestSort, sortKey, sortDirection };
};


export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
    const { items: sortedOrders, requestSort, sortKey, sortDirection } = useSortableData(initialOrders, 'createdAt');

    const SortableHeader = ({ tkey, label }: { tkey: SortKey, label: string }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(tkey)}>
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">Order Management</h1>
                <p className="text-muted-foreground">View and manage all customer orders.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Orders ({sortedOrders.length})</CardTitle>
                    <CardDescription>A list of all submitted orders for the BYD BioTAG.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader tkey="createdAt" label="Order Date" />
                                <TableHead>Customer</TableHead>
                                <TableHead>Shipping Address</TableHead>
                                <SortableHeader tkey="status" label="Status" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedOrders.length > 0 ? (
                                sortedOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <ClientFormattedDate date={order.createdAt} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.fullName}</div>
                                        <div className="text-sm text-muted-foreground">{order.userId}</div>
                                    </TableCell>
                                    <TableCell>
                                        {order.address1}, {order.address2 && `${order.address2}, `}{order.city}, {order.state} {order.zip}, {order.country}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'processing' ? 'warning' : 'default'}>{order.status}</Badge>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
