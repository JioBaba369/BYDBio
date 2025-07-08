import {defineConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkitEval} from 'genkit/eval';

export default defineConfig({
  plugins: [
    googleAI(),
    genkitEval(),
  ],
});
