'use server';
/**
 * @fileOverview An AI flow to generate professional bio suggestions.
 *
 * - suggestBios - A function that generates bio suggestions based on keywords.
 * - BioSuggestInput - The input type for the suggestBios function.
 * - BioSuggestOutput - The return type for the suggestBios function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BioSuggestInputSchema = z.object({
  keywords: z.string().describe('A list of keywords, skills, or bullet points describing the user.'),
  name: z.string().describe("The user's full name."),
});
export type BioSuggestInput = z.infer<typeof BioSuggestInputSchema>;

const BioSuggestOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3-5 professional bio suggestions, each under 160 characters.'),
});
export type BioSuggestOutput = z.infer<typeof BioSuggestOutputSchema>;


export async function suggestBios(input: BioSuggestInput): Promise<BioSuggestOutput> {
  return bioSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bioSuggesterPrompt',
  input: {schema: BioSuggestInputSchema},
  output: {schema: BioSuggestOutputSchema},
  prompt: `You are an expert brand strategist and professional copywriter specializing in crafting compelling, first-person bios for online profiles. Your task is to write 3 to 5 distinct and professional bios for a user named {{{name}}}.

Each bio MUST be 160 characters or less.
Each bio MUST be written in the first person (e.g., "I am a...").

Use the following keywords and bullet points as the core inspiration for the bios. Transform these points into creative, engaging, and professional narratives that capture the user's essence.

Inspiration Points:
{{{keywords}}}

Generate a diverse range of suggestions. For example, one could be direct and professional, another more creative and mission-driven, and a third focused on a key achievement.`,
});


const bioSuggesterFlow = ai.defineFlow(
  {
    name: 'bioSuggesterFlow',
    inputSchema: BioSuggestInputSchema,
    outputSchema: BioSuggestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
