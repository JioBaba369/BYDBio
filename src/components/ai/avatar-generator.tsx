
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Wand, Upload, Image as ImageIcon } from 'lucide-react';
import { generateAvatar, type GenerateAvatarInput } from '@/ai/flows/avatar-generator-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/storage';
import { useAuth } from '../auth-provider';

interface AIAvatarGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

export function AIAvatarGenerator({ open, onOpenChange, onSelectAvatar }: AIAvatarGeneratorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSourceImage(reader.result as string);
        setSuggestions([]);
        setSelectedSuggestion(null);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      toast({ title: "Please upload an image first.", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    setSelectedSuggestion(null);

    const input: GenerateAvatarInput = {
      photoDataUri: sourceImage,
      prompt: "A professional, high-quality, corporate-style headshot of the person in the photo. The background should be a simple, blurred office setting. The person should be looking at the camera.",
    };

    try {
      const result = await generateAvatar(input);
      setSuggestions(result.suggestions.map(s => s.photoDataUri));
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Avatars",
        description: "The AI could not generate suggestions at this time. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSuggestion = async (suggestion: string) => {
    if (!user) return;
    setIsLoading(true);
    toast({ title: 'Uploading new avatar...'})
    try {
      const uploadedUrl = await uploadImage(suggestion, `avatars/${user.uid}`);
      onSelectAvatar(uploadedUrl);
      onOpenChange(false);
      resetState();
    } catch (e) {
      toast({ title: 'Failed to upload avatar', variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSourceImage(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setIsLoading(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Avatar Generator</DialogTitle>
          <DialogDescription>
            Upload a selfie and let AI generate a professional headshot for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold">1. Upload Your Photo</h3>
            <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center bg-muted/40">
              {sourceImage ? (
                <Image src={sourceImage} alt="Source" width={400} height={400} className="object-contain rounded-md max-h-full" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-sm">Upload a clear, forward-facing photo for best results.</p>
                </div>
              )}
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> {sourceImage ? 'Change Photo' : 'Upload Photo'}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange}/>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">2. Generate & Select</h3>
            <Button onClick={handleGenerate} disabled={isLoading || !sourceImage}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                {isLoading ? "Generating..." : "Generate Avatars"}
            </Button>
            <div className="grid grid-cols-2 gap-4">
                {isLoading && [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-md animate-pulse" />
                ))}
                {suggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => setSelectedSuggestion(suggestion)} className="relative">
                        <Image
                            src={suggestion}
                            alt={`Suggestion ${index + 1}`}
                            width={200}
                            height={200}
                            className={cn(
                                "aspect-square object-cover rounded-md border-4 transition-all",
                                selectedSuggestion === suggestion ? "border-primary" : "border-transparent"
                            )}
                        />
                    </button>
                ))}
            </div>
            {suggestions.length > 0 && (
                <Button onClick={() => handleSelectSuggestion(selectedSuggestion!)} disabled={!selectedSuggestion || isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Use Selected Avatar
                </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
