'use server';
/**
 * @fileOverview An AI agent that fetches public holidays for a given country.
 *
 * - getHolidays - A function that returns a list of public holidays.
 * - GetHolidaysInput - The input type for the getHolidays function.
 * - GetHolidaysOutput - The return type for the getHolidays function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetHolidaysInputSchema = z.object({
  country: z.string().describe('The country for which to fetch holidays, e.g., "Australia".'),
  year: z.number().describe('The year for which to fetch holidays, e.g., 2024.'),
});
export type GetHolidaysInput = z.infer<typeof GetHolidaysInputSchema>;

const GetHolidaysOutputSchema = z.object({
  holidays: z
    .array(
      z.object({
        name: z.string().describe('The name of the public holiday.'),
        date: z
          .string()
          .describe('The date of the holiday in YYYY-MM-DD format.'),
      })
    )
    .describe('A list of public holidays for the specified country and year.'),
});
export type GetHolidaysOutput = z.infer<typeof GetHolidaysOutputSchema>;

export async function getHolidays(
  input: GetHolidaysInput
): Promise<GetHolidaysOutput> {
  if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is not set. Please get a key from Google AI Studio and add it to your project's .env file to use AI features."
    );
  }
  return getHolidaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getHolidaysPrompt',
  input: {schema: GetHolidaysInputSchema},
  output: {schema: GetHolidaysOutputSchema},
  prompt: `You are a helpful assistant that provides public holiday information.
  
  Please provide a list of all official public holidays for {{{country}}} for the year {{{year}}}.
  
  Ensure the dates are accurate and in YYYY-MM-DD format. Include all national and major state/territory holidays.
  `,
});

const getHolidaysFlow = ai.defineFlow(
  {
    name: 'getHolidaysFlow',
    inputSchema: GetHolidaysInputSchema,
    outputSchema: GetHolidaysOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
