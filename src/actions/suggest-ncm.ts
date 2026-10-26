'use server';

export interface NcmSuggestion {
  hsCode: string;
  tariffCategory: string;
  reasoning: string;
  suggestedTariffRate: number;
  suggestedStatisticalFee: number;
  suggestedVatRate: number;
}

export async function suggestNcmFromGemini(
  productDescription: string
): Promise<NcmSuggestion[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Eres un experto senior en Clasificación Arancelaria y normativa de Aduana Argentina (VUCE, AFIP).
Tu objetivo es ayudar a un importador a determinar el tratamiento impositivo de sus productos.

INSTRUCCIONES DE CLASIFICACIÓN:
1. Analiza técnicamente la descripción del producto: "${productDescription}".
2. Identifica la posición NCM (Nomenclatura Común del MERCOSUR) de 8 dígitos más precisa.
3. Determina los tributos vigentes en Argentina:
   - DIE (Derecho de Importación Extrazona): Según posición arancelaria.
   - Tasa de Estadística: 3% general (0% para bienes de capital o excepciones específicas).
   - IVA: 21% general (10.5% si el producto está alcanzado por reducción de alícuota).
4. En el campo "reasoning", explica brevemente la regla general de interpretación o nota de sección.

Si el producto es complejo, ofrece hasta 2 opciones posibles de NCM si hay ambigüedad técnica.

Responde EXACTAMENTE en formato JSON array, sin markdown ni explicación adicional:
[
  {
    "hsCode": "8471.30.00",
    "tariffCategory": "Máquinas automáticas...",
    "reasoning": "Regla 1 de Interpretación: Se entiende como...",
    "suggestedTariffRate": 0,
    "suggestedStatisticalFee": 3,
    "suggestedVatRate": 21
  }
]`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content from Gemini');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const suggestions = JSON.parse(jsonMatch[0]) as NcmSuggestion[];
    return suggestions;
  } catch (error) {
    console.error('suggestNcm error:', error);
    throw error;
  }
}
