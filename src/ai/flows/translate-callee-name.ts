
'use server';
/**
 * @fileOverview A flow for translating a name into Hindi.
 *
 * - translateCalleeName - A function that handles the name translation.
 * - TranslateCalleeNameInput - The input type for the function.
 * - TranslateCalleeNameOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

export const TranslateCalleeNameInputSchema = z.string().describe('The name to be translated.');
export type TranslateCalleeNameInput = z.infer<typeof TranslateCalleeNameInputSchema>;

export const TranslateCalleeNameOutputSchema = z.object({
  translatedName: z.string().describe('The translated name of the callee in Hindi.'),
});
export type TranslateCalleeNameOutput = z.infer<typeof TranslateCalleeNameOutputSchema>;


const translationPrompt = ai.definePrompt({
    name: 'translateCalleeNamePrompt',
    input: { schema: TranslateCalleeNameInputSchema },
    output: { schema: TranslateCalleeNameOutputSchema },
    prompt: `Translate the following name into Hindi: {{{input}}}. Provide only the translated name.`,
    model: 'googleai/gemini-2.5-flash',
});


export const translateCalleeNameFlow = ai.defineFlow(
  {
    name: 'translateCalleeNameFlow',
    inputSchema: TranslateCalleeNameInputSchema,
    outputSchema: TranslateCalleeNameOutputSchema,
  },
  async (name) => {
    const { output } = await translationPrompt(name);
    return output!;
  }
);


export async function translateCalleeName(input: TranslateCalleeNameInput): Promise<TranslateCalleeNameOutput> {
    return translateCalleeNameFlow(input);
}
