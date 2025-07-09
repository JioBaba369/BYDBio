import {defineConfig} from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';
import {genkitEval} from '@genkit-ai/evaluator';

export default defineConfig({
  plugins: [
    googleAI(),
    genkitEval(),
  ],
});
