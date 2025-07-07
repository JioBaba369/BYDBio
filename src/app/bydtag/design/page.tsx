
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/auth-provider';
import { ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QRCode from 'qrcode.react';

// Schema for the form
const designSchema = z.object({
  cardColor: z.enum(['black', 'white', 'blue']).default('black'),
  logoUrl: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  showQrCode: z.boolean().default(true),
});

type DesignFormValues = z.infer<typeof designSchema>;

const TagPreview = ({ values, user, side }: { values: DesignFormValues; user: any; side: 'front' | 'back' }) => {
    const isDark = values.cardColor === 'black' || values.cardColor === 'blue';
    const cardBg = {
        black: 'bg-gray-900',
        white: 'bg-white',
        blue: 'bg-blue-600',
    }[values.cardColor];
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subtitleColor = isDark ? 'text-gray-300' : 'text-gray-500';

    if (side === 'back') {
        return (
            <div className={cn("aspect-[85.6/53.98] w-full rounded-xl flex flex-col items-center justify-center p-4 transition-colors", cardBg)}>
                {values.showQrCode && user ? (
                    <div className="bg-white p-2 rounded-lg">
                         <QRCode value={`https://byd.bio/u/${user.username}`} size={100} bgColor="#ffffff" fgColor="#000000" />
                    </div>
                ) : (
                    <div className={cn("text-center", textColor)}>
                        <p className="font-semibold">BYD.Bio</p>
                    </div>
                )}
                 <p className={cn("text-xs mt-2", subtitleColor)}>Tap to Connect</p>
            </div>
        )
    }

    return (
        <div className={cn("aspect-[85.6/53.98] w-full rounded-xl flex flex-col items-center justify-center p-4 transition-colors", cardBg)}>
             {values.logoUrl ? (
                <Image src={values.logoUrl} alt="Logo" width={64} height={64} className="h-16 w-16 rounded-full object-cover mb-2" data-ai-hint="logo" />
            ) : user ? (
                <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ) : null}
            <h3 className={cn("font-bold text-lg text-center", textColor)}>{values.name || 'Your Name'}</h3>
            <p className={cn("text-sm text-center", subtitleColor)}>{values.title || 'Your Title'}</p>
        </div>
    );
};


export default function BydTagDesignPage() {
  const { user } = useAuth();
  const [side, setSide] = useState<'front' | 'back'>('front');

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      cardColor: 'black',
      name: user?.name || '',
      title: user?.businessCard?.title || '',
      logoUrl: user?.avatarUrl || '',
      showQrCode: true,
    },
  });

  const watchedValues = form.watch();

  const onSubmit = (data: DesignFormValues) => {
    console.log(data);
    // In a real app, this would trigger an order flow.
    alert('Order placed! (This is a demo)');
  };

  const colorOptions = [
    { value: 'black', className: 'bg-gray-900' },
    { value: 'white', className: 'bg-white border' },
    { value: 'blue', className: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4">
                <Link href="/bydtag">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to BYDTAG Info
                </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Design Your BYDTAG</h1>
            <p className="text-muted-foreground">Customize your physical NFC tag to match your brand.</p>
        </div>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8 items-start">
                 {/* Preview Column */}
                <div className="space-y-4 md:sticky top-20">
                     <Card>
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <TagPreview values={watchedValues} user={user} side={side} />
                             <Button type="button" variant="outline" className="w-full mt-4" onClick={() => setSide(s => s === 'front' ? 'back' : 'front')}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Flip Card
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customization</CardTitle>
                            <CardDescription>Changes will be reflected in the live preview.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="cardColor"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Card Color</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4"
                                        >
                                            {colorOptions.map(opt => (
                                                <FormItem key={opt.value}>
                                                    <FormControl>
                                                        <RadioGroupItem value={opt.value} className="sr-only" />
                                                    </FormControl>
                                                    <FormLabel>
                                                        <div className={cn("h-10 w-10 rounded-full cursor-pointer ring-2 ring-transparent ring-offset-2 ring-offset-background", opt.className, field.value === opt.value && 'ring-primary')} />
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Name on Card</FormLabel>
                                    <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Title/Company on Card (Optional)</FormLabel>
                                    <FormControl><Input placeholder="CEO at Acme Inc." {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="showQrCode"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Show QR Code on Back</FormLabel>
                                        <FormDescription>
                                        A QR code backup ensures compatibility with older phones.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Button type="submit" size="lg" className="w-full">
                        Proceed to Order <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </form>
        </FormProvider>
    </div>
  );
}
