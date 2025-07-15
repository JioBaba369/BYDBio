
'use server';

import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin'; // Use admin SDK for backend operations
import { serializeDocument } from './firestore-utils';

export type Order = {
    id: string;
    userId: string;
    fullName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string; // ISO String
};

// This function is intended for admin use only.
export async function getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => {
        return serializeDocument<Order>(doc);
    }).filter((order): order is Order => order !== null);
    
    return orders;
}
