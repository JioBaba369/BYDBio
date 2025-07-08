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
  prompt: `You are a professional brand strategist and copywriter. Your task is to write several compelling and professional bios for a user named {{{name}}}.
The bio must be 160 characters or less.
Use the following keywords and points as inspiration for the bio:
{{{keywords}}}

Generate 3 to 5 distinct bio suggestions. Ensure they are creative, professional, and capture the essence of the user's profile. Write in the first person (e.g., "I am a...").`,
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
