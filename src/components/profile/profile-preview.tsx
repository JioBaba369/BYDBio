
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import QRCode from 'qrcode.react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Nfc } from 'lucide-react';
import { generateVCard } from '@/lib/vcard';
import { useAuth } from '../auth-provider';
import { Button } from '../ui/button';
import type { ProfileFormValues } from '@/lib/schemas/profile';

export function ProfilePreview() {
  const { user } = useAuth();
  const { watch } = useFormContext<ProfileFormValues>();

  const watchedValues = watch();

  const vCardData = useMemo(() => {
    if (!user) return '';
    const tempUser = {
      ...user,
      name: watchedValues.name || user.name,
      businessCard: watchedValues.businessCard,
    };
    return generateVCard(tempUser as any);
  }, [user, watchedValues]);

  return (
    <div className="md:sticky top-20 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-[280px] bg-muted/30 p-6 rounded-xl shadow-lg border mx-auto">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-2">
                <AvatarImage src={watchedValues.avatarUrl || user?.avatarUrl} />
                <AvatarFallback>{user?.avatarFallback}</AvatarFallback>
              </Avatar>
              <p className="font-headline font-semibold text-lg">{watchedValues.name || 'Your Name'}</p>
              <p className="text-primary text-sm">{watchedValues.businessCard?.title || 'Your Title'}</p>
              <p className="text-muted-foreground text-xs flex items-center justify-center gap-1.5 mt-1">
                <Building className="h-3.5 w-3.5" />
                {watchedValues.businessCard?.company || 'Your Company'}
              </p>
            </div>
            <div className="flex justify-center mt-4">
              {vCardData ? (
                <QRCode value={vCardData} size={150} bgColor="transparent" fgColor="hsl(var(--foreground))" level="Q" />
              ) : (
                <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse mx-auto rounded-md" />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Scan to save contact</p>
          </div>
        </CardContent>
      </Card>
      <Card className="max-w-[280px] mx-auto text-center border-primary/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center justify-center gap-2">
            <Nfc className="h-5 w-5 text-primary" /> Get Your BYD BioTAG
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">Bridge the physical and digital worlds. Share with a single tap.</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/bydtag">Learn More</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
