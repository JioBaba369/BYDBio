
'use server';

import { z } from 'zod';
import { getAuth } from "firebase-admin/auth";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { auth as clientAuth } from '@/lib/firebase';

const OrderFormSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  address1: z.string().min(5, 'A valid address is required.'),
  address2: z.string().optional(),
  city: z.string().min(2, 'A valid city is required.'),
  state: z.string().min(2, 'A valid state/province is required.'),
  zip: z.string().min(4, 'A valid postal/ZIP code is required.'),
  country: z.string().min(2, 'A valid country is required.'),
});

export type OrderState = {
  success: boolean;
  error?: string;
};

export async function placeOrder(
  data: z.infer<typeof OrderFormSchema>
): Promise<OrderState> {

  const validatedFields = OrderFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid shipping information.',
    };
  }
  
  const currentUser = clientAuth.currentUser;
  if (!currentUser) {
      return { success: false, error: 'You must be logged in to place an order.' };
  }

  try {
    const ordersRef = collection(db, 'orders');
    await addDoc(ordersRef, {
      userId: currentUser.uid,
      ...validatedFields.data,
      status: 'processing',
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
