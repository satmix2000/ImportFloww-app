'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HsCodeSuggestionInputSchema = z.object({
  productDescription: z
    .string()
    .describe('Descripción detallada del producto para sugerir códigos NCM.'),
});
export type HsCodeSuggestionInput = z.infer<typeof HsCodeSuggestionInputSchema>;

const HsCodeSuggestionOutputSchema = z.array(
  z.object({
    hsCode: z.string().describe('Código NCM sugerido (8 dígitos).'),
    tariffCategory: z.string().describe('Descripción de la categoría arancelaria según VUCE/Aduana.'),
    reasoning: z.string().describe('Explicación técnica de por qué se eligió este código y este tratamiento arancelario.'),
    suggestedTariffRate: z.number().describe('Derecho de Importación Extrazona (DIE) en porcentaje.'),
    suggestedStatisticalFee: z.number().describe('Tasa de Estadística (usualmente 3% o 0%).'),
    suggestedVatRate: z.number().describe('Alícuota de IVA (21% o 10.5%).'),
  })
);
export type HsCodeSuggestionOutput = z.infer<typeof HsCodeSuggestionOutputSchema>;

export async function suggestHsCode(
  input: HsCodeSuggestionInput
): Promise<HsCodeSuggestionOutput> {
  return hsCodeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hsCodeSuggestionPrompt',
  input: { schema: HsCodeSuggestionInputSchema },
  output: { schema: HsCodeSuggestionOutputSchema },
  prompt: `Eres un experto senior en Clasificación Arancelaria y normativa de Aduana Argentina (VUCE, AFIP). 
Tu objetivo es ayudar a un importador a determinar el tratamiento impositivo de sus productos.

INSTRUCCIONES DE CLASIFICACIÓN:
1. Analiza técnicamente la descripción del producto: {{{productDescription}}}.
2. Identifica la posición NCM (Nomenclatura Común del MERCOSUR) de 8 dígitos más precisa.
3. Determina los tributos vigentes en Argentina:
   - DIE (Derecho de Importación Extrazona): Según posición arancelaria.
   - Tasa de Estadística: 3% general (0% para bienes de capital o excepciones específicas como microprocesadores).
   - IVA: 21% general (10.5% si el producto está alcanzado por reducción de alícuota según planilla anexa).
4. **IMPORTANTE**: En el campo "reasoning", explica brevemente la regla general de interpretación o la nota de sección que justifica tu elección.

Si el producto es complejo, ofrece hasta 2 opciones posibles de NCM si hay ambigüedad técnica.`,
});

const hsCodeSuggestionFlow = ai.defineFlow(
  {
    name: 'hsCodeSuggestionFlow',
    inputSchema: HsCodeSuggestionInputSchema,
    outputSchema: HsCodeSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
