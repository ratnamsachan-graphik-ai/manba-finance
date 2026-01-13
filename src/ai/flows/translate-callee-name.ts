'use server';

/**
 * @fileOverview Translates the callee name to Hindi using Genkit and an LLM.
 *
 * This file exports:
 *   - `translateCalleeName`: An async function that takes a callee name and returns its Hindi translation.
 *   - `TranslateCalleeNameInput`: The input type for the `translateCalleeName` function (a string).
 *   - `TranslateCalleeNameOutput`: The output type for the `translateCalleeName` function (a string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateCalleeNameInputSchema = z.string().describe('The name of the callee to translate to Hindi.');
export type TranslateCalleeNameInput = z.infer<typeof TranslateCalleeNameInputSchema>;

const TranslateCalleeNameOutputSchema = z.string().describe('The translated name of the callee in Hindi.');
export type TranslateCalleeNameOutput = z.infer<typeof TranslateCalleeNameOutputSchema>;

export async function translateCalleeName(input: TranslateCalleeNameInput): Promise<TranslateCalleeNameOutput> {
  return translateCalleeNameFlow(input);
}

const translateCalleeNamePrompt = ai.definePrompt({
  name: 'translateCalleeNamePrompt',
  input: {schema: TranslateCalleeNameInputSchema},
  output: {schema: TranslateCalleeNameOutputSchema},
  prompt: `Translate the following name to Hindi: {{{input}}}`,
});

const translateCalleeNameFlow = ai.defineFlow(
  {
    name: 'translateCalleeNameFlow',
    inputSchema: TranslateCalleeNameInputSchema,
    outputSchema: TranslateCalleeNameOutputSchema,
  },
  async input => {
    const {text} = await translateCalleeNamePrompt(input);
    return text!;
  }
);
