
'use server';
/**
 * @fileOverview An AI flow to generate professional avatars from a user's photo.
 *
 * - generateAvatar - A function that generates avatar suggestions based on an input photo.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateAvatarInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  prompt: z.string().describe('A detailed prompt describing the desired style for the new avatar.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  suggestions: z.array(z.object({
    photoDataUri: z.string().describe("The generated avatar image as a data URI.")
  })).describe('An array of 4 generated avatar suggestions.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    // We generate 4 images in parallel for better performance.
    const promises = Array(4).fill(null).map(() => 
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: input.photoDataUri } },
          { text: input.prompt },
        ],
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      })
    );

    const results = await Promise.all(promises);

    const suggestions = results.map(result => ({
      photoDataUri: result.media!.url,
    }));

    return { suggestions };
  }
);
