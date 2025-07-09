import {googleAI} from '@genkit-ai/googleai';
import {genkitEval} from '@genkit-ai/evaluator';

export default {
  plugins: [
    googleAI(),
    genkitEval(),
  ],
};
