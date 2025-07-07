
'use client';

import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";

export const CouponDisplay = ({ code }: { code: string }) => {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied to clipboard!',
      description: `Coupon code "${code}" has been copied.`,
    });
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">Coupon Code</h3>
      <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg bg-muted/50">
        <p className="flex-1 text-lg font-mono font-semibold tracking-widest text-primary">{code}</p>
        <Button onClick={handleCopy} variant="secondary">
          <Copy className="mr-2 h-4 w-4" />
          Copy Code
        </Button>
      </div>
    </div>
  );
};
