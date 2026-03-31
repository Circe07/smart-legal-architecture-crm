import { generateObject } from "ai";
import { analysisModel } from "../lib/gemini";
import { z } from "zod";

const documentSchema = z.object({
  documentType: z.enum(["ID_CARD", "BLUEPRINT", "CONTRACT", "PERMIT", "OTHER"]),
  confidence: z.number().min(0).max(1),
  extractedData: z.record(z.string(), z.any()),
  summary: z.string()
});

export async function runDocumentExtractionAgent(mimeType: string, base64Data: string) {
  // Utilizing Gemini 3.1 Pro for multimodal heavy lifting
  const result = await generateObject({
    model: analysisModel as any,
    schema: documentSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Por favor, analiza este documento adjunto enviado por un cliente de nuestro despacho de arquitectura (Archi-Legal).
            Necesito que identifiques qué tipo de documento es, extraigas los datos clave (como nombres, direcciones, fechas de caducidad o números de licencia) y escribas un breve resumen.`
          },
          {
            type: "file",
            data: base64Data,
            mimeType: mimeType
          }
        ]
      }
    ]
  });

  return result.object;
}
