
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/auth-provider';
import { ArrowRight, ArrowLeft, RefreshCw, Download, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Logo } from '@/components/logo';
import ImageCropper from '@/components/image-cropper';
import { Label } from '@/components/ui/label';

// Schema for the form
const designSchema = z.object({
  cardColor: z.enum(['black', 'white', 'blue']).default('black'),
  backgroundImageUrl: z.string().optional(),
  textColor: z.enum(['light', 'dark']).default('light'),
  layout: z.enum(['vertical', 'horizontal-left', 'horizontal-right']).default('vertical'),
  logoUrl: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  company: z.string().optional(),
  showQrCode: z.boolean().default(true),
});

type DesignFormValues = z.infer<typeof designSchema>;

const TagPreview = ({ values, user, side }: { values: DesignFormValues; user: any; side: 'front' | 'back' }) => {
    // New text color logic based on form value
    const textColor = values.textColor === 'light' ? 'text-white' : 'text-gray-900';
    const subtitleColor = values.textColor === 'light' ? 'text-gray-300' : 'text-gray-500';

    // New background logic
    const cardBgClass = values.backgroundImageUrl ? '' : {
        black: 'bg-gray-900',
        white: 'bg-white',
        blue: 'bg-blue-600',
    }[values.cardColor];

    const cardStyle = values.backgroundImageUrl ? {
        backgroundImage: `url(${values.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : {};


    if (side === 'back') {
        const isDarkBack = values.cardColor === 'black' || values.cardColor === 'blue';
        const backCardBg = {
            black: 'bg-gray-900',
            white: 'bg-white',
            blue: 'bg-blue-600',
        }[values.cardColor];
        const backTextColor = isDarkBack ? 'text-white' : 'text-gray-900';
        const backSubtitleColor = isDarkBack ? 'text-gray-300' : 'text-gray-500';
        
        return (
            <div className={cn("aspect-[85.6/53.98] w-full rounded-xl flex flex-col items-center justify-between p-4 transition-colors", backCardBg)}>
                <Logo className={cn("text-lg", backTextColor)} />
                {values.showQrCode && user ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-2 rounded-lg shadow-md">
                            <QRCode
                                value={`https://byd.bio/u/${user.username}`}
                                size={90}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                renderAs="svg"
                            />
                        </div>
                        <p className={cn("text-xs font-mono", backSubtitleColor)}>{`byd.bio/u/${user.username}`}</p>
                    </div>
                ) : (
                    <div className={cn("text-center", textColor)}>
                        {/* Empty placeholder */}
                    </div>
                )}
                 <p className={cn("text-xs font-semibold", backSubtitleColor)}>Tap or Scan to Connect</p>
            </div>
        )
    }
    
    const layout = values.layout || 'vertical';

    const AvatarElement = (
        <div className="shrink-0">
            {values.logoUrl ? (
                <Image src={values.logoUrl} alt="Logo" width={80} height={80} className="h-20 w-20 rounded-full object-cover" data-ai-hint="logo" />
            ) : user ? (
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                    <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center" />
            )}
        </div>
    );

    const TextElement = ({textAlign = 'text-center'}) => (
        <div className={cn("flex-grow space-y-1", textAlign)}>
            <h3 className={cn("font-bold text-2xl truncate", textColor)}>{values.name || 'Your Name'}</h3>
            <p className={cn("text-md truncate", subtitleColor)}>{values.title || 'Your Title'}</p>
            {values.company && <p className={cn("text-sm truncate opacity-80", subtitleColor)}>{values.company}</p>}
        </div>
    );

    const mainContainerClasses = cn(
        "aspect-[85.6/53.98] w-full rounded-xl p-6 transition-colors relative",
        cardBgClass
    );

    const CardContentWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <div className={cn(mainContainerClasses, className)} style={cardStyle}>
            {values.backgroundImageUrl && <div className="absolute inset-0 bg-black/30 rounded-xl" />}
            <div className="relative z-10 w-full h-full flex items-center gap-6">
                {children}
            </div>
        </div>
    );


    if (layout === 'vertical') {
        return (
             <CardContentWrapper className="flex items-center justify-center">
                 <div className="flex flex-col items-center justify-center gap-4">
                    {AvatarElement}
                    <TextElement />
                 </div>
            </CardContentWrapper>
        );
    }
    
    if (layout === 'horizontal-left') {
        return (
             <CardContentWrapper className="justify-center">
                {AvatarElement}
                <TextElement textAlign="text-left" />
            </CardContentWrapper>
        );
    }

    if (layout === 'horizontal-right') {
        return (
            <CardContentWrapper className="justify-center">
                <TextElement textAlign="text-right" />
                {AvatarElement}
            </CardContentWrapper>
        );
    }

    return null; // Fallback
};


export default function BydTagDesignPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [side, setSide] = useState<'front' | 'back'>('front');
  const previewRef = useRef<HTMLDivElement>(null);
  const [bgImageToCrop, setBgImageToCrop] = useState<string | null>(null);
  const [isBgCropperOpen, setIsBgCropperOpen] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      cardColor: 'black',
      backgroundImageUrl: '',
      textColor: 'light',
      layout: 'vertical',
      name: '',
      title: '',
      company: '',
      logoUrl: '',
      showQrCode: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        name: user.name || '',
        title: user.businessCard?.title || '',
        company: user.businessCard?.company || '',
        logoUrl: user.avatarUrl || '',
      });
    }
  }, [user, form]);
  
  const onBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setBgImageToCrop(reader.result as string);
            setIsBgCropperOpen(true);
        });
        reader.readAsDataURL(file);
        e.target.value = '';
    }
  };

  const handleBgCropComplete = (url: string) => {
    form.setValue('backgroundImageUrl', url, { shouldDirty: true });
    setIsBgCropperOpen(false);
  };

  const watchedValues = form.watch();

  const onSubmit = (data: DesignFormValues) => {
    console.log(data);
    // In a real app, this would trigger an order flow.
    toast({
        title: "Order Placed! (Demo)",
        description: "In a real app, this would redirect you to a checkout page.",
    });
  };

  const handleDownloadCardImage = () => {
    if (!previewRef.current) {
      toast({
        title: 'Error Downloading',
        description: 'Could not find the card preview element.',
        variant: 'destructive',
      });
      return;
    }

    toast({
        title: 'Generating Image...',
        description: 'Please wait a moment.',
    });

    html2canvas(previewRef.current, { 
      backgroundColor: null, // Makes background transparent for the capture
      useCORS: true,
      scale: 3 // Increase resolution for better quality
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
            saveAs(blob, `bydtag-${side}-design.png`);
        } else {
            toast({
                title: 'Download Failed',
                description: 'Could not create image blob.',
                variant: 'destructive',
            });
        }
      }, 'image/png');
    }).catch(err => {
        console.error("Error generating card image:", err);
        toast({
            title: 'Download Failed',
            description: 'An unexpected error occurred while generating the image.',
            variant: 'destructive',
        });
    });
  };

  const colorOptions = [
    { value: 'black', className: 'bg-gray-900' },
    { value: 'white', className: 'bg-white border' },
    { value: 'blue', className: 'bg-blue-600' },
  ];

  return (
    <>
      <ImageCropper
        imageSrc={bgImageToCrop}
        open={isBgCropperOpen}
        onOpenChange={setIsBgCropperOpen}
        onCropComplete={handleBgCropComplete}
        aspectRatio={85.6 / 53.98}
        isRound={false}
      />
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
                              <div ref={previewRef}>
                                  <TagPreview values={watchedValues} user={user} side={side} />
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                  <Button type="button" variant="outline" className="w-full" onClick={() => setSide(s => s === 'front' ? 'back' : 'front')}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Flip Card
                                  </Button>
                                  <Button type="button" variant="outline" className="w-full" onClick={handleDownloadCardImage}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Card
                                  </Button>
                              </div>
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
                                      <FormLabel>Solid Color Background</FormLabel>
                                      <FormControl>
                                          <RadioGroup
                                              onValueChange={(value) => {
                                                  field.onChange(value);
                                                  form.setValue('backgroundImageUrl', ''); // Clear background image
                                                  form.setValue('textColor', (value === 'white' ? 'dark' : 'light'));
                                              }}
                                              defaultValue={field.value}
                                              className="flex gap-4"
                                          >
                                              {colorOptions.map(opt => (
                                                  <FormItem key={opt.value}>
                                                      <FormControl>
                                                          <RadioGroupItem value={opt.value} className="sr-only" />
                                                      </FormControl>
                                                      <FormLabel>
                                                          <div className={cn("h-10 w-10 rounded-full cursor-pointer ring-2 ring-transparent ring-offset-2 ring-offset-background", opt.className, field.value === opt.value && !watchedValues.backgroundImageUrl && 'ring-primary')} />
                                                      </FormLabel>
                                                  </FormItem>
                                              ))}
                                          </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                              />
                               <div>
                                  <Label>Custom Background</Label>
                                  <Button type="button" variant="outline" className="w-full mt-2" onClick={() => bgFileInputRef.current?.click()}>
                                      <Upload className="mr-2 h-4 w-4" /> Upload Background Image
                                  </Button>
                                  <input type="file" ref={bgFileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={onBgFileChange} />
                              </div>
                               <FormField
                                  control={form.control}
                                  name="textColor"
                                  render={({ field }) => (
                                      <FormItem className="space-y-3">
                                      <FormLabel>Text Color</FormLabel>
                                      <FormControl>
                                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-x-6">
                                              <FormItem className="flex items-center space-x-2 space-y-0">
                                                  <FormControl><RadioGroupItem value="light" /></FormControl>
                                                  <Label className="font-normal">Light</Label>
                                              </FormItem>
                                              <FormItem className="flex items-center space-x-2 space-y-0">
                                                  <FormControl><RadioGroupItem value="dark" /></FormControl>
                                                  <Label className="font-normal">Dark</Label>
                                              </FormItem>
                                          </RadioGroup>
                                      </FormControl>
                                      <FormDescription>Choose light text for dark cards/images, and dark text for light ones.</FormDescription>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                                />
                              <FormField
                                  control={form.control}
                                  name="layout"
                                  render={({ field }) => (
                                      <FormItem>
                                      <FormLabel>Card Layout</FormLabel>
                                      <FormControl>
                                          <RadioGroup
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              className="grid grid-cols-3 gap-2"
                                          >
                                              <FormItem>
                                                  <FormControl><RadioGroupItem value="vertical" className="sr-only" /></FormControl>
                                                  <FormLabel className={cn("flex font-normal items-center justify-center rounded-md border p-4 cursor-pointer hover:bg-accent", field.value === 'vertical' && 'border-primary ring-2 ring-primary')}>Vertical</FormLabel>
                                              </FormItem>
                                              <FormItem>
                                                  <FormControl><RadioGroupItem value="horizontal-left" className="sr-only" /></FormControl>
                                                  <FormLabel className={cn("flex font-normal items-center justify-center rounded-md border p-4 cursor-pointer hover:bg-accent", field.value === 'horizontal-left' && 'border-primary ring-2 ring-primary')}>H (Left)</FormLabel>
                                              </FormItem>
                                              <FormItem>
                                                  <FormControl><RadioGroupItem value="horizontal-right" className="sr-only" /></FormControl>
                                                  <FormLabel className={cn("flex font-normal items-center justify-center rounded-md border p-4 cursor-pointer hover:bg-accent", field.value === 'horizontal-right' && 'border-primary ring-2 ring-primary')}>H (Right)</FormLabel>
                                              </FormItem>
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
                                      <FormLabel>Title on Card (Optional)</FormLabel>
                                      <FormControl><Input placeholder="CEO" {...field} /></FormControl>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="company"
                                  render={({ field }) => (
                                      <FormItem>
                                      <FormLabel>Company on Card (Optional)</FormLabel>
                                      <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
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
                                          <FormDescription>A QR code backup ensures compatibility with older phones.</FormDescription>
                                      </div>
                                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
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
    </>
  );
}
