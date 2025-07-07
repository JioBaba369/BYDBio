'use client';

import { useState } from 'react';
import { generateContent, type GenerateContentInput } from '@/ai/flows/generate-content-flow';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ContentGeneratorProps {
  onGenerate: (content: string) => void;
  contentType: GenerateContentInput['contentType'];
  fieldLabel?: string;
}

export function ContentGenerator({ onGenerate, contentType, fieldLabel = 'Description' }: ContentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
        toast({
            title: "Topic is empty",
            description: "Please provide some keywords about your item.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);
    try {
      const result = await generateContent({ topic, contentType });
      if (result.suggestion) {
        onGenerate(result.suggestion);
        toast({
            title: `${fieldLabel} Generated!`,
            description: `The AI has written a new ${fieldLabel.toLowerCase()} for you.`,
        })
      } else {
        toast({
            title: "No suggestion found",
            description: "The AI couldn't generate content. Please try refining your topic.",
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${fieldLabel.toLowerCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <span>AI Content Writer</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Let AI help you write a compelling {fieldLabel.toLowerCase()}.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="content-topic">Keywords / Topic</Label>
            <Textarea
                id="content-topic"
                placeholder={`e.g., "A workshop for designers about UI/UX principles on mobile"`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
            />
        </div>
        <Button type="button" onClick={handleGenerate} disabled={loading} size="sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate {fieldLabel}
        </Button>
      </div>
    </div>
  );
}
