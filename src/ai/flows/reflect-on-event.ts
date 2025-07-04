'use server';
/**
 * @fileOverview An AI agent that helps users reflect on past events.
 *
 * - reflectOnEvent - A function that generates reflection prompts for an event.
 * - ReflectOnEventInput - The input type for the reflectOnEvent function.
 * - ReflectOnEventOutput - The return type for the reflectOnEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReflectOnEventInputSchema = z.object({
  eventTitle: z.string().describe('The title of the event.'),
  eventDescription: z.string().describe('The description of the event.'),
  userNotes: z
    .string()
    .optional()
    .describe('The personal notes the user took during or after the event.'),
});
export type ReflectOnEventInput = z.infer<typeof ReflectOnEventInputSchema>;

const ReflectOnEventOutputSchema = z.object({
  reflectionPrompts: z
    .array(z.string())
    .length(3)
    .describe(
      'An array of three distinct and insightful questions to prompt the user to reflect on the event.'
    ),
});
export type ReflectOnEventOutput = z.infer<typeof ReflectOnEventOutputSchema>;

export async function reflectOnEvent(
  input: ReflectOnEventInput
): Promise<ReflectOnEventOutput> {
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is not set. Please get a key from Google AI Studio and add it to your project's .env file to use AI features."
    );
  }
  return reflectOnEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reflectOnEventPrompt',
  input: {schema: ReflectOnEventInputSchema},
  output: {schema: ReflectOnEventOutputSchema},
  prompt: `You are a professional coach and reflective practice expert. Your task is to generate 3 insightful and open-ended questions to help a user reflect on a past event.

The user has provided the following information about the event:
- Event Title: {{{eventTitle}}}
- Event Description: {{{eventDescription}}}
{{#if userNotes}}
- Their Personal Notes: {{{userNotes}}}
{{else}}
- They did not provide any personal notes.
{{/if}}

Based on this information, generate three distinct reflection prompts. The prompts should encourage deep thinking about their experience, what they learned, and how they can apply it. Frame the questions to be encouraging and thought-provoking.
  `,
});

const reflectOnEventFlow = ai.defineFlow(
  {
    name: 'reflectOnEventFlow',
    inputSchema: ReflectOnEventInputSchema,
    outputSchema: ReflectOnEventOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
