'use server';
/**
 * @fileOverview An AI agent that helps write content descriptions.
 *
 * - generateContent - A function that suggests content based on user input.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  topic: z
    .string()
    .describe('A few words or a sentence describing the item.'),
  contentType: z.enum(['Event Description', 'Job Description', 'Listing Description', 'Offer Description']).describe('The type of content to generate.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('A well-written, engaging description for the content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(
  input: GenerateContentInput
): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `You are an expert copywriter. Your task is to generate a compelling and professional description for a user.

The user wants to create a "{{contentType}}".

The user has provided the following topic/keywords: "{{{topic}}}"

Based on this, write an engaging description. The tone should be professional but approachable. For job descriptions, structure it with sections like "About the Role", "Responsibilities", and "Qualifications". For other types, a few paragraphs will suffice.
  `,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
