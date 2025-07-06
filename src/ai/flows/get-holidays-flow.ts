
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
import { getPublicHolidays } from '@/services/holiday-service';

const GetHolidaysInputSchema = z.object({
  query: z.string().describe('A natural language query about public holidays, e.g., "holidays in Spain this year".'),
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

// Tool Definition
const getPublicHolidaysTool = ai.defineTool(
  {
    name: 'getPublicHolidays',
    description: 'Retrieves a list of public holidays for a given country and year. Use this tool whenever a user asks for holiday information.',
    inputSchema: z.object({
      year: z.number(),
      countryCode: z.string().length(2).describe('The two-letter ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "CA").'),
    }),
    outputSchema: z.array(z.object({ name: z.string(), date: z.string() })),
  },
  async (input) => getPublicHolidays(input.year, input.countryCode)
);


export async function getHolidays(
  input: GetHolidaysInput
): Promise<GetHolidaysOutput> {
  return getHolidaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getHolidaysPrompt',
  input: {schema: GetHolidaysInputSchema},
  output: {schema: GetHolidaysOutputSchema},
  system: `You are an AI assistant that provides public holiday information.
Your task is to call the 'getPublicHolidays' tool to find the holidays based on the user's request.
- You MUST determine the correct two-letter ISO 3166-1 alpha-2 country code from the user's query to use with the tool.
- You MUST determine the correct year from the user's query. If the user does not specify a year, assume the current year is ${new Date().getFullYear()}.
- After the tool returns data, you MUST format it into the required JSON output format.
`,
  tools: [getPublicHolidaysTool],
  prompt: `{{{query}}}`,
});

const getHolidaysFlow = ai.defineFlow(
  {
    name: 'getHolidaysFlow',
    inputSchema: GetHolidaysInputSchema,
    outputSchema: GetHolidaysOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('The AI failed to generate a valid holiday list.');
    }
    return output;
  }
);
