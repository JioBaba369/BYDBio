
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, CreditCard, Lock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { placeOrder } from '@/app/actions/order';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

const orderFormSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  address1: z.string().min(5, 'A valid address is required.'),
  address2: z.string().optional(),
  city: z.string().min(2, 'A valid city is required.'),
  state: z.string().min(2, 'A valid state/province is required.'),
  zip: z.string().min(4, 'A valid postal/ZIP code is required.'),
  country: z.string().min(2, 'A valid country is required.'),
  cardName: z.string().min(3, 'Name on card is required.'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Please enter a valid 16-digit card number.'),
  expDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please use MM/YY format.'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVC.'),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function BydTagOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { country: 'US', fullName: user?.name || '' },
  });

  const onSubmit = async (data: OrderFormValues) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to place an order.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    
    try {
        const result = await placeOrder(data);
        if (result.success) {
            toast({
                title: 'Order Placed!',
                description: 'Your BYD BioTAG is on its way. Thank you for your purchase!',
            });
            setIsOrderComplete(true);
        } else {
            toast({ title: 'Order Failed', description: result.error, variant: 'destructive' });
        }
    } catch (e) {
        toast({ title: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };

  if (isOrderComplete) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4">Order Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your BYD BioTAG will be shipped soon. You will receive a confirmation email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-4">
        <Link href="/bydtag/design">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Design
        </Link>
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold font-headline">Complete Your Order</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="address1" render={({ field }) => ( <FormItem> <FormLabel>Address Line 1</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="address2" render={({ field }) => ( <FormItem> <FormLabel>Address Line 2 (Optional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="state" render={({ field }) => ( <FormItem> <FormLabel>State / Province</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="zip" render={({ field }) => ( <FormItem> <FormLabel>ZIP / Postal Code</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  </div>
                  <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="US">United States</SelectItem> <SelectItem value="CA">Canada</SelectItem> <SelectItem value="GB">United Kingdom</SelectItem> <SelectItem value="AU">Australia</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>All transactions are secure and encrypted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cardName" render={({ field }) => ( <FormItem> <FormLabel>Name on Card</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="cardNumber" render={({ field }) => ( <FormItem> <FormLabel>Card Number</FormLabel> <div className="relative"> <FormControl><Input type="tel" placeholder="0000 0000 0000 0000" {...field} /></FormControl> <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> </div> <FormMessage /> </FormItem> )}/>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expDate" render={({ field }) => ( <FormItem> <FormLabel>Expiration (MM/YY)</FormLabel> <FormControl><Input placeholder="MM/YY" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="cvc" render={({ field }) => ( <FormItem> <FormLabel>CVC</FormLabel> <FormControl><Input placeholder="123" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  </div>
                </CardContent>
              </Card>
              <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {isProcessing ? 'Processing...' : 'Place Order Securely'}
              </Button>
            </form>
          </Form>
        </div>
        <div className="lg:col-span-1 lg:sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <Image src="https://placehold.co/100x100.png" alt="BYD BioTAG" fill className="object-cover" data-ai-hint="product design"/>
                  </div>
                  <div>
                    <p className="font-semibold">BYD BioTAG</p>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                  </div>
                </div>
                <p className="font-semibold">$29.99</p>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>$29.99</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>$29.99</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
