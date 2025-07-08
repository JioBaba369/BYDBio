import {genkit} from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // You may need to specify the API version for certain features
      // apiVersion: 'v1beta',
    }),
  ],
});
