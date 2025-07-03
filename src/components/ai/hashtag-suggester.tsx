'use client';

import { useState } from 'react';
import { suggestHashtags } from '@/ai/flows/suggest-hashtags';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HashtagSuggesterProps {
  content: string;
  onSelectHashtag: (hashtag: string) => void;
}

export default function HashtagSuggester({ content, onSelectHashtag }: HashtagSuggesterProps) {
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setLoading(true);
    setHashtags([]);
    try {
      const result = await suggestHashtags({ content });
      if (result.hashtags && result.hashtags.length > 0) {
        setHashtags(result.hashtags);
      } else {
        toast({
            title: "No suggestions found",
            description: "The AI couldn't find any relevant hashtags. Try adding more content.",
        });
      }
    } catch (error) {
      console.error('Error suggesting hashtags:', error);
      toast({
        title: "Error",
        description: "Failed to suggest hashtags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <Button onClick={handleSuggest} disabled={loading} variant="outline" size="sm">
        <Wand2 className={`mr-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
        {loading ? 'Generating...' : 'Suggest Hashtags'}
      </Button>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20"
              onClick={() => onSelectHashtag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
