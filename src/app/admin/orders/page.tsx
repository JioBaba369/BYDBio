
import { getAllOrders } from '@/lib/orders';
import { auth as adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import AdminOrdersClient from './client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This function acts as a server-side guard for the admin page.
async function checkAdminAuth() {
    const sessionCookie = cookies().get('session')?.value || '';
    if (!sessionCookie) {
        return { isAdmin: false, error: 'Not authenticated' };
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        if (decodedClaims.email === 'admin@byd.bio') {
            return { isAdmin: true };
        }
        return { isAdmin: false, error: 'Access denied' };
    } catch (error) {
        return { isAdmin: false, error: 'Invalid session' };
    }
}

export default async function AdminOrdersPage() {
    const authResult = await checkAdminAuth();

    if (!authResult.isAdmin) {
        return (
            <div className="flex items-center justify-center p-4">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="mt-4">Access Denied</CardTitle>
                        <CardDescription>
                            You do not have permission to view this page. This area is for administrators only.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/">Return to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const orders = await getAllOrders();
    return <AdminOrdersClient initialOrders={orders} />;
}
