'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Wand } from 'lucide-react';
import { suggestBios, type BioSuggestInput } from '@/ai/flows/bio-suggester-flow';
import { useAuth } from '../auth-provider';

const bioGeneratorSchema = z.object({
  keywords: z.string().min(10, "Please provide at least 10 characters of input.").max(500, "Input is too long."),
});
type BioGeneratorFormValues = z.infer<typeof bioGeneratorSchema>;

interface AIBioGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBio: (bio: string) => void;
}

export function AIBioGenerator({ open, onOpenChange, onSelectBio }: AIBioGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BioGeneratorFormValues>({
    resolver: zodResolver(bioGeneratorSchema),
    defaultValues: { keywords: "" },
  });

  const onSubmit = async (data: BioGeneratorFormValues) => {
    if (!user) return;
    setIsLoading(true);
    setSuggestions([]);

    const input: BioSuggestInput = {
      keywords: data.keywords,
      name: user.name,
    };

    try {
      const result = await suggestBios(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      toast({
        title: "Error Generating Suggestions",
        description: "The AI could not generate suggestions at this time. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    onSelectBio(suggestion);
    onOpenChange(false);
    form.reset();
    setSuggestions([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Bio Assistant</DialogTitle>
          <DialogDescription>
            Enter a few keywords, skills, or bullet points about yourself, and let AI craft a professional bio for you.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords / Bullet Points</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="e.g.&#10;- Senior Product Designer at Acme Inc.&#10;- Passionate about user-centric design&#10;- 10+ years of experience in SaaS&#10;- Specialize in creating intuitive mobile apps"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
                {isLoading ? "Generating..." : "Generate Suggestions"}
              </Button>
            </form>
          </Form>

          {suggestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Here are some suggestions:</h3>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 rounded-md border bg-muted/50 flex items-center justify-between gap-4">
                            <p className="text-sm">{suggestion}</p>
                            <Button size="sm" onClick={() => handleSelectSuggestion(suggestion)}>Use this</Button>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
