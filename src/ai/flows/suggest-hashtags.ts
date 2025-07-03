// 'use server';
/**
 * @fileOverview An AI agent that suggests relevant hashtags for user profiles, status updates, and listings.
 *
 * - suggestHashtags - A function that suggests hashtags based on the provided content.
 * - SuggestHashtagsInput - The input type for the suggestHashtags function.
 * - SuggestHashtagsOutput - The return type for the suggestHashtags function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHashtagsInputSchema = z.object({
  content: z
    .string()
    .describe(
      'The content for which hashtags are to be suggested. This could be a profile description, a status update, or a listing description.'
    ),
});
export type SuggestHashtagsInput = z.infer<typeof SuggestHashtagsInputSchema>;

const SuggestHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe(
      'An array of relevant hashtags to maximize the visibility of the content.'
    ),
});
export type SuggestHashtagsOutput = z.infer<typeof SuggestHashtagsOutputSchema>;

export async function suggestHashtags(
  input: SuggestHashtagsInput
): Promise<SuggestHashtagsOutput> {
  return suggestHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHashtagsPrompt',
  input: {schema: SuggestHashtagsInputSchema},
  output: {schema: SuggestHashtagsOutputSchema},
  prompt: `You are an expert in social media marketing. Your goal is to suggest relevant hashtags for the given content to increase its visibility and reach a wider audience.

  Content: {{{content}}}

  Please provide an array of hashtags that are relevant to the content. The hashtags should be no more than 32 characters long.
  `,
});

const suggestHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
