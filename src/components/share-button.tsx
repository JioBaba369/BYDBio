
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';

export default function ShareButton() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client to get the full URL
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'The URL has been copied to your clipboard.',
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    });
  };

  if (!url) {
    // Don't render the button until the URL is available on the client to avoid hydration mismatch
    return null;
  }

  return (
    <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <QrCode className="mr-2 h-4 w-4" />
              <span>Show QR Code</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 gap-4">
          <QRCode value={url} size={256} bgColor="#ffffff" fgColor="#000000" level="Q" />
          <p className="text-sm text-muted-foreground text-center break-all">{url}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
