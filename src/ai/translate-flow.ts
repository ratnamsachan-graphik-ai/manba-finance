
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateCalleeNameInputSchema = z.string().describe('The name to be translated.');
type TranslateCalleeNameInput = z.infer<typeof TranslateCalleeNameInputSchema>;

const TranslateCalleeNameOutputSchema = z.object({
  translatedName: z.string().describe('The translated name of the callee in Hindi.'),
});
type TranslateCalleeNameOutput = z.infer<typeof TranslateCalleeNameOutputSchema>;


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
  async (name: TranslateCalleeNameInput): Promise<TranslateCalleeNameOutput> => {
    const { output } = await translationPrompt(name);
    return output!;
  }
);
