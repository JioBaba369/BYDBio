'use server';
/**
 * @fileOverview An AI flow to generate professional hashtag suggestions for a user's profile.
 *
 * - suggestHashtags - A function that generates hashtag suggestions based on user profile data.
 * - HashtagSuggestInput - The input type for the suggestHashtags function.
 * - HashtagSuggestOutput - The return type for the suggestHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HashtagSuggestInputSchema = z.object({
  name: z.string().describe("The user's full name."),
  bio: z.string().describe("The user's professional bio."),
  title: z.string().optional().describe("The user's job title."),
  company: z.string().optional().describe("The user's company."),
  keywords: z.string().optional().describe("Any additional keywords or skills the user has provided."),
});
export type HashtagSuggestInput = z.infer<typeof HashtagSuggestInputSchema>;

const HashtagSuggestOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('An array of 5-10 relevant, professional hashtags, each starting with a # and using camelCase for multiple words (e.g., #DigitalMarketing).'),
});
export type HashtagSuggestOutput = z.infer<typeof HashtagSuggestOutputSchema>;


export async function suggestHashtags(input: HashtagSuggestInput): Promise<HashtagSuggestOutput> {
  return hashtagSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hashtagSuggesterPrompt',
  input: {schema: HashtagSuggestInputSchema},
  output: {schema: HashtagSuggestOutputSchema},
  prompt: `You are a personal branding expert and social media strategist. Your task is to generate 5 to 10 highly relevant and professional hashtags for a user's online profile.

These hashtags should increase their visibility and help them connect with the right audience. The hashtags should be based on their bio, job title, company, and any other keywords provided.

- Hashtags MUST start with a '#'.
- For multi-word hashtags, use camelCase (e.g., #SoftwareEngineer, #ProductDesign).
- Do not include generic or spammy hashtags. Focus on professional industries, skills, and interests.

**User Information:**
- **Name:** {{{name}}}
- **Bio:** {{{bio}}}
- **Job Title:** {{{title}}}
- **Company:** {{{company}}}
- **Other Keywords:** {{{keywords}}}

Based on this information, generate the hashtags.`,
});


const hashtagSuggesterFlow = ai.defineFlow(
  {
    name: 'hashtagSuggesterFlow',
    inputSchema: HashtagSuggestInputSchema,
    outputSchema: HashtagSuggestOutputSchema,
  },
  async (input: HashtagSuggestInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
