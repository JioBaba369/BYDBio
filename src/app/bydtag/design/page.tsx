
'use client';

import { useEffect, useState, useRef, forwardRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/auth-provider';
import { ArrowRight, ArrowLeft, RefreshCw, Download, Upload, Paintbrush, Text, LayoutTemplate, Settings2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Logo } from '@/components/logo';
import ImageCropper from '@/components/image-cropper';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Schema for the form
const designSchema = z.object({
  cardColor: z.enum(['black', 'white', 'blue']).default('black'),
  backgroundImageUrl: z.string().optional(),
  textColor: z.enum(['light', 'dark']).default('light'),
  layout: z.enum(['vertical', 'horizontal-left', 'horizontal-right', 'lanyard']).default('vertical'),
  logoUrl: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  company: z.string().optional(),
  showQrCode: z.boolean().default(true),
});

type DesignFormValues = z.infer<typeof designSchema>;

const TagPreview = forwardRef<HTMLDivElement, { values: DesignFormValues; user: any; side: 'front' | 'back' }>(({ values, user, side }, ref) => {
    const textColor = values.textColor === 'light' ? 'text-primary-foreground' : 'text-foreground';
    const subtitleColor = values.textColor === 'light' ? 'text-primary-foreground/80' : 'text-muted-foreground';
    const layout = values.layout || 'vertical';

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
    
    // BACK OF CARD
    if (side === 'back') {
        const backCardBg = cardBgClass || (values.textColor === 'light' ? 'bg-gray-900' : 'bg-white');
        return (
            <div ref={ref} className={cn("w-full h-full rounded-2xl flex flex-col items-center justify-between p-6 transition-colors relative", backCardBg)} style={cardStyle}>
                 {values.backgroundImageUrl && <div className="absolute inset-0 bg-black/60 rounded-2xl" />}
                 <div className="relative z-10 w-full flex flex-col items-center justify-between h-full">
                    <Logo className={cn("text-xl", textColor)} />
                    {values.showQrCode && user ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-white p-2 rounded-md shadow-md">
                                <QRCode
                                    value={`${window.location.origin}/u/${user.username}`}
                                    size={100}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    renderAs="svg"
                                />
                            </div>
                            <p className={cn("text-[10px] font-mono leading-tight", subtitleColor)}>{`byd.bio/u/${user.username}`}</p>
                        </div>
                    ) : <div />}
                    <p className={cn("text-xs font-semibold leading-tight", subtitleColor)}>Tap or Scan to Connect</p>
                </div>
            </div>
        )
    }

    // FRONT OF CARD
    const renderAvatar = (sizeClass: string, fallbackClass: string) => (
         <div className="shrink-0">
            {values.logoUrl ? (
                <Image src={values.logoUrl} alt="Logo" width={96} height={96} className={cn(sizeClass, "rounded-full object-cover")} />
            ) : user ? (
                <Avatar className={cn(sizeClass)}>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className={cn("bg-transparent", fallbackClass)}>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ) : (
                <div className={cn(sizeClass, "rounded-full bg-muted flex items-center justify-center")} />
            )}
        </div>
    );
    
    // Horizontal Card
    if (layout === 'horizontal-left' || layout === 'horizontal-right') {
        const textElement = (
            <div className={cn("flex-grow space-y-0.5", layout === 'horizontal-left' ? "text-left" : "text-right")}>
                <h3 className={cn("font-bold text-xl leading-tight", textColor)}>{values.name || 'Your Name'}</h3>
                <p className={cn("text-sm leading-tight", subtitleColor)}>{values.title || 'Your Title'}</p>
                {values.company && <p className={cn("text-xs leading-tight opacity-80", subtitleColor)}>{values.company}</p>}
            </div>
        );

        return (
             <div ref={ref} className={cn("w-full h-full rounded-2xl p-4 transition-colors relative flex", cardBgClass)} style={cardStyle}>
                {values.backgroundImageUrl && <div className="absolute inset-0 bg-black/50 rounded-2xl" />}
                <div className={cn("relative z-10 flex w-full items-center gap-4", layout === 'horizontal-right' ? 'flex-row-reverse' : '')}>
                    {renderAvatar("h-16 w-16", "text-3xl")}
                    {textElement}
                </div>
            </div>
        );
    }
    
    // Lanyard Card
    if (layout === 'lanyard') {
         return (
            <div ref={ref} className={cn("w-full h-full rounded-2xl p-6 transition-colors relative flex flex-col items-center justify-center text-center", cardBgClass)} style={cardStyle}>
                {values.backgroundImageUrl && <div className="absolute inset-0 bg-black/50 rounded-2xl" />}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full bg-white/50 border-2 border-white/80" />
                <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4">
                    {renderAvatar("h-24 w-24", "text-5xl")}
                     <div className="space-y-1">
                        <h3 className={cn("font-bold text-3xl leading-tight", textColor)}>{values.name || 'Your Name'}</h3>
                        <p className={cn("text-lg leading-tight", subtitleColor)}>{values.title || 'Your Title'}</p>
                        {values.company && <p className={cn("text-base leading-tight opacity-80", subtitleColor)}>{values.company}</p>}
                    </div>
                </div>
            </div>
        );
    }
    
    // Vertical Card (Default)
    return (
        <div ref={ref} className={cn("w-full h-full rounded-2xl p-6 transition-colors relative flex", cardBgClass)} style={cardStyle}>
            {values.backgroundImageUrl && <div className="absolute inset-0 bg-black/50 rounded-2xl" />}
            <div className="relative z-10 flex w-full flex-col items-center justify-center text-center space-y-3">
                {renderAvatar("h-24 w-24", "text-5xl")}
                <div className="space-y-1">
                    <h3 className={cn("font-bold text-2xl leading-tight", textColor)}>{values.name || 'Your Name'}</h3>
                    <p className={cn("text-base leading-tight", subtitleColor)}>{values.title || 'Your Title'}</p>
                    {values.company && <p className={cn("text-sm leading-tight opacity-80 pt-1", subtitleColor)}>{values.company}</p>}
                </div>
            </div>
        </div>
    );
});
TagPreview.displayName = 'TagPreview';


export default function BydTagDesignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  
  const frontPreviewRef = useRef<HTMLDivElement>(null);
  const backPreviewRef = useRef<HTMLDivElement>(null);

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
    if (!user) {
      toast({
        title: "Create an Account to Continue",
        description: "You need an account to save and order your design.",
      });
      router.push('/auth/sign-up');
      return;
    }
    toast({
        title: "Order Placed! (Demo)",
        description: "In a real app, this would redirect you to a checkout page.",
    });
  };

  const handleDownloadCardImage = () => {
    const targetRef = isFlipped ? backPreviewRef : frontPreviewRef;
    if (!targetRef.current) {
      toast({ title: 'Error Downloading', description: 'Could not find the card preview element.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Generating Image...', description: 'Please wait a moment.' });

    // 85.60mm @ 300 DPI = 1011px
    // The canvas scale is relative to the element's on-screen size.
    // A scale of 3 should produce a high-quality image (~1000px wide for a ~330px element)
    html2canvas(targetRef.current, { backgroundColor: null, useCORS: true, scale: 3 })
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
              saveAs(blob, `byd-biotag-${isFlipped ? 'back' : 'front'}-design.png`);
          } else {
              toast({ title: 'Download Failed', description: 'Could not create image blob.', variant: 'destructive' });
          }
        }, 'image/png');
      }).catch(err => {
        console.error("Error generating card image:", err);
        toast({ title: 'Download Failed', description: 'An unexpected error occurred.', variant: 'destructive' });
      });
  };

  const colorOptions = [
    { value: 'black', className: 'bg-gray-900' },
    { value: 'white', className: 'bg-white border' },
    { value: 'blue', className: 'bg-blue-600' },
  ];
  
  const isPortraitLayout = watchedValues.layout === 'vertical' || watchedValues.layout === 'lanyard';
  const cropperAspectRatio = watchedValues.layout === 'lanyard' || watchedValues.layout === 'vertical' ? 53.98 / 85.6 : 85.6 / 53.98;

  return (
    <>
      <ImageCropper
        imageSrc={bgImageToCrop}
        open={isBgCropperOpen}
        onOpenChange={setIsBgCropperOpen}
        onCropComplete={handleBgCropComplete}
        aspectRatio={cropperAspectRatio}
        isRound={false}
      />
      <div className="space-y-6">
          <div>
              <Button asChild variant="ghost" size="sm" className="mb-4 -ml-4">
                  <Link href="/bydtag">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to BYD BioTAG Info
                  </Link>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold font-headline">Design Your BYD BioTAG</h1>
              <p className="text-muted-foreground">Customize your physical NFC tag to match your brand.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Preview Column */}
              <div className="lg:col-span-2 space-y-4 lg:sticky top-20">
                  <div className={cn("w-full max-w-lg mx-auto", isPortraitLayout ? 'aspect-[53.98/85.60]' : 'aspect-[85.60/53.98]')}>
                    <div className="relative w-full h-full perspective-1000">
                        <div className={cn("relative w-full h-full transition-transform duration-700 preserve-3d", isFlipped && "rotate-y-180")}>
                            <div className="absolute w-full h-full backface-hidden">
                                <TagPreview ref={frontPreviewRef} values={watchedValues} user={user} side="front" />
                            </div>
                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                <TagPreview ref={backPreviewRef} values={watchedValues} user={user} side="back" />
                            </div>
                        </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 max-w-lg mx-auto">
                      <Button type="button" variant="outline" className="w-full" onClick={() => setIsFlipped(f => !f)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Flip Card
                      </Button>
                      <Button type="button" variant="outline" className="w-full" onClick={handleDownloadCardImage}>
                          <Download className="mr-2 h-4 w-4" />
                          Download {isFlipped ? 'Back' : 'Front'}
                      </Button>
                  </div>
              </div>

              {/* Form Column */}
              <div className="lg:col-span-1">
                  <FormProvider {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                         <Accordion type="multiple" defaultValue={['appearance', 'layout', 'content']} className="w-full">
                            <AccordionItem value="appearance">
                                <AccordionTrigger className="text-base font-semibold"><Paintbrush className="mr-2 h-4 w-4"/>Appearance</AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-6">
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
                                              <Upload className="mr-2 h-4 w-4" /> Upload Background
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
                                              <FormDescription>Light text for dark backgrounds, and vice-versa.</FormDescription>
                                              <FormMessage />
                                              </FormItem>
                                          )}
                                        />
                                </AccordionContent>
                            </AccordionItem>

                             <AccordionItem value="layout">
                                <AccordionTrigger className="text-base font-semibold"><LayoutTemplate className="mr-2 h-4 w-4"/>Card Layout</AccordionTrigger>
                                <AccordionContent className="pt-4">
                                     <FormField
                                            control={form.control}
                                            name="layout"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="grid grid-cols-2 gap-4"
                                                    >
                                                        <FormItem><FormControl><RadioGroupItem value="vertical" className="sr-only" /></FormControl><FormLabel className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:border-primary", field.value === 'vertical' && 'border-primary')}><div className="w-12 h-[75px] bg-muted rounded-md flex flex-col items-center justify-center p-1 gap-1"><div className="w-5 h-5 rounded-full bg-muted-foreground/50"></div><div className="w-full space-y-0.5"><div className="h-1.5 w-3/4 mx-auto bg-muted-foreground/50 rounded-full"></div><div className="h-1.5 w-1/2 mx-auto bg-muted-foreground/50 rounded-full"></div></div></div><span className="mt-2 font-semibold">Vertical</span></FormLabel></FormItem>
                                                        <FormItem><FormControl><RadioGroupItem value="horizontal-left" className="sr-only" /></FormControl><FormLabel className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:border-primary", field.value === 'horizontal-left' && 'border-primary')}><div className="w-20 h-12 bg-muted rounded-md flex items-center p-2 gap-2"><div className="w-6 h-6 rounded-full bg-muted-foreground/50 flex-shrink-0"></div><div className="w-full space-y-1"><div className="h-1.5 w-full bg-muted-foreground/50 rounded-full"></div><div className="h-1.5 w-3/4 bg-muted-foreground/50 rounded-full"></div></div></div><span className="mt-2 font-semibold">H (Left)</span></FormLabel></FormItem>
                                                        <FormItem><FormControl><RadioGroupItem value="horizontal-right" className="sr-only" /></FormControl><FormLabel className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:border-primary", field.value === 'horizontal-right' && 'border-primary')}><div className="w-20 h-12 bg-muted rounded-md flex items-center p-2 gap-2"><div className="w-full space-y-1"><div className="h-1.5 w-full bg-muted-foreground/50 rounded-full"></div><div className="h-1.5 w-3/4 ml-auto bg-muted-foreground/50 rounded-full"></div></div><div className="w-6 h-6 rounded-full bg-muted-foreground/50 flex-shrink-0"></div></div><span className="mt-2 font-semibold">H (Right)</span></FormLabel></FormItem>
                                                        <FormItem><FormControl><RadioGroupItem value="lanyard" className="sr-only" /></FormControl><FormLabel className={cn("flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:border-primary", field.value === 'lanyard' && 'border-primary')}><div className="w-20 h-12 bg-muted rounded-md flex items-center p-2 gap-2 relative"><div className="w-2 h-2 rounded-full bg-muted-foreground/50 absolute top-1 left-1/2 -translate-x-1/2"></div><div className="w-8 h-8 rounded-full bg-muted-foreground/50 flex-shrink-0"></div><div className="w-full space-y-1"><div className="h-1.5 w-full bg-muted-foreground/50 rounded-full"></div><div className="h-1.5 w-3/4 bg-muted-foreground/50 rounded-full"></div></div></div><span className="mt-2 font-semibold">Lanyard</span></FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="content">
                                <AccordionTrigger className="text-base font-semibold"><Text className="mr-2 h-4 w-4"/>Card Content</AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-6">
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
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="back">
                                <AccordionTrigger className="text-base font-semibold"><Settings2 className="mr-2 h-4 w-4"/>Back of Card</AccordionTrigger>
                                <AccordionContent className="pt-4">
                                     <FormField
                                        control={form.control}
                                        name="showQrCode"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Show QR Code</FormLabel>
                                                <FormDescription>A QR code backup ensures compatibility with older phones.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                         </Accordion>
                          <Button type="submit" size="lg" className="w-full mt-6">
                            Proceed to Order <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                      </form>
                  </FormProvider>
              </div>
          </div>
      </div>
    </>
  );
}
