
'use client';

import { useState } from 'react';
import { generateBio } from '@/ai/flows/generate-bio';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BioGeneratorProps {
  onSelectBio: (bio: string) => void;
}

export default function BioGenerator({ onSelectBio }: BioGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
        toast({
            title: "Topic is empty",
            description: "Please provide some keywords about yourself.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const result = await generateBio({ topic, tone });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        toast({
            title: "No suggestions found",
            description: "The AI couldn't generate any bios. Please try refining your topic.",
        });
      }
    } catch (error) {
      console.error('Error generating bio:', error);
      toast({
        title: "Error",
        description: "Failed to generate bio. Please try again.",
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
            <span>AI Bio Generator</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Stuck on what to write? Let AI help you craft the perfect bio.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio-topic">Keywords about you</Label>
                <Input 
                    id="bio-topic"
                    placeholder="e.g., 'Product Designer who loves dogs'"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bio-tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="bio-tone">
                        <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Witty">Witty</SelectItem>
                        <SelectItem value="Inspirational">Inspirational</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button type="button" onClick={handleGenerate} disabled={loading} size="sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate Suggestions
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          {suggestions.map((bio, index) => (
            <div key={index} className="p-3 flex items-center justify-between gap-4 rounded-md bg-background border text-sm">
                <p className="flex-1">{bio}</p>
                <Button size="sm" variant="outline" onClick={() => onSelectBio(bio)}>Use</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
