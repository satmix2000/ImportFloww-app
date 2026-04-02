'use server';
/**
 * @fileOverview An AI assistant that suggests Harmonized System (HS/NCM) codes, tariff rates,
 * statistical fees, and VAT for the Argentine market based on a product description,
 * using information compatible with the VUCE (Ventanilla Única de Comercio Exterior) system.
 *
 * - suggestHsCode - A function that handles the HS code and tariff suggestion process.
 * - HsCodeSuggestionInput - The input type for the suggestHsCode function.
 * - HsCodeSuggestionOutput - The return type for the suggestHsCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HsCodeSuggestionInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A detailed description of the product for which to suggest HS/NCM codes.'),
});
export type HsCodeSuggestionInput = z.infer<typeof HsCodeSuggestionInputSchema>;

const HsCodeSuggestionOutputSchema = z.array(
  z.object({
    hsCode: z.string().describe('The suggested NCM (Nomenclatura Común del MERCOSUR) code.'),
    tariffCategory: z.string().describe('The corresponding tariff category description from VUCE/Aduana.'),
    suggestedTariffRate: z.number().describe('Estimated Argentine import duty (DIE - Derecho de Importación Extrazona) as a percentage (0-100).'),
    suggestedStatisticalFee: z.number().describe('Estimated Statistical Fee (Tasa de Estadística) as a percentage (usually 3% or 0%).'),
    suggestedVatRate: z.number().describe('Estimated VAT rate (IVA) as a percentage (standard 21% or reduced 10.5%).'),
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
  prompt: `You are an expert in international trade and the Argentine customs system (VUCE / AFIP / Aduana).

Your task is to analyze the product description and suggest the most relevant NCM (Nomenclatura Común del MERCOSUR) codes.

CRITICAL RULES FOR ARGENTINE TAXES (NCM):
1. **Standard Rates**: By default, use **VAT (IVA): 21%** and **Statistical Fee: 3%**.
2. **Microprocessors (Exemption)**: ONLY for microprocessors and integrated circuits (e.g., NCM 8542.31.20), the rates are:
   - DIE (Import Duty): 0%
   - Statistical Fee: 0%
   - VAT (IVA): 10.5%
3. **Other Electronics**: Most other electronic products (phones, cameras, lamps, cables, etc.) carry the **Standard Rates** (21% VAT and 3% Statistical Fee) unless they are strictly microprocessors.
4. **General Goods**: Use standard rates for most common imports.

Provide suggestions with:
1. The 8-digit NCM code (e.g., 1234.56.78).
2. The tariff category description.
3. The DIE (Arancel) percentage.
4. The Statistical Fee (3% standard, 0% for microprocessors).
5. The VAT rate (21% standard, 10.5% for microprocessors).

Product Description: {{{productDescription}}}
`,
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
