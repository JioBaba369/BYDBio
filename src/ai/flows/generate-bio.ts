'use server';
/**
 * @fileOverview An AI agent that generates profile bios.
 *
 * - generateBio - A function that suggests bios based on user input.
 * - GenerateBioInput - The input type for the generateBio function.
 * - GenerateBioOutput - The return type for the generateBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBioInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'A few words or a sentence describing the user, their profession, or their interests.'
    ),
  tone: z.enum(['Professional', 'Casual', 'Witty', 'Inspirational']).describe('The desired tone for the bio.'),
});
export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;

const GenerateBioOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .length(3)
    .describe(
      'An array of three distinct bio suggestions, each under 160 characters.'
    ),
});
export type GenerateBioOutput = z.infer<typeof GenerateBioOutputSchema>;

export async function generateBio(
  input: GenerateBioInput
): Promise<GenerateBioOutput> {
  if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is not set. Please get a key from Google AI Studio and add it to your project's .env file to use AI features."
    );
  }
  return generateBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBioPrompt',
  input: {schema: GenerateBioInputSchema},
  output: {schema: GenerateBioOutputSchema},
  prompt: `You are a professional profile writer and branding expert. Your task is to generate 3 distinct and engaging profile bios for a user.

Each bio must be under 160 characters.

The user has provided the following information:
- Topic / Keywords: {{{topic}}}
- Desired Tone: {{{tone}}}

Generate three compelling bio options based on this input.
  `,
});

const generateBioFlow = ai.defineFlow(
  {
    name: 'generateBioFlow',
    inputSchema: GenerateBioInputSchema,
    outputSchema: GenerateBioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
