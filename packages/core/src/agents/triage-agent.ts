import { generateObject } from "ai";
import { triageModel } from "../lib/gemini";
import { z } from "zod";
import { getContextFromKnowledgeBase } from "../lib/rag-logic";

const triageSchema = z.object({
  intent: z.enum(["LEGAL_QUERY", "DOCUMENT_STATUS", "APPOINTMENT", "COMPLAINT", "GENERAL_INFO", "SPAM"]),
  urgency: z.number().min(1).max(5),
  autoReplyPossible: z.boolean(),
  suggestedReply: z.string().optional(),
  requiresHumanAction: z.boolean(),
  summary: z.string(),
  missingDocuments: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export async function runTriageAgent(messageBody: string) {
  // 1. Get context from our local RAG (Faq Knowledge Base)
  const context = await getContextFromKnowledgeBase(messageBody);

  // 2. Run Gemini 3 Flash to analyze and decide
  const result = await generateObject({
    model: triageModel as any,
    schema: triageSchema,
    system: `Eres el cerebro de triaje de Archi-Legal, un despacho de abogados especializado en arquitectura.
    Tu objetivo es analizar los mensajes entrantes de clientes y decidir si pueden ser respondidos automáticamente basándote SÓLO en el CONTEXTO proporcionado.
    
    REGLA DE ORO "ZERO-HALLUCINATION": 
    - Si el CONTEXTO no responde CLARAMENTE a todos los puntos del mensaje, pon autoReplyPossible: false y requiresHumanAction: true.
    - El nivel de confianza corporal (confidenceScore) debe ser bajo si los datos no son exactos.
    - Si detectas frustración o mala actitud, pon urgency: 5 y requiresHumanAction: true.
    - Identifica documentos que el cliente menciona pero que parecen faltar según su consulta.

    CONTEXTO DE FAQs:
    ${context || "No se ha encontrado contexto relevante en la base de datos de conocimientos."}
    `,
    prompt: messageBody,
  });

  return result.object;
}
