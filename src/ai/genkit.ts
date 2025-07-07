import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];
let model: string | undefined = undefined;

// Only add the Google AI plugin if the API key is available.
// This prevents build failures in environments where the key is not set.
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
  model = 'googleai/gemini-2.0-flash';
}

export const ai = genkit({
  plugins,
  model,
});
