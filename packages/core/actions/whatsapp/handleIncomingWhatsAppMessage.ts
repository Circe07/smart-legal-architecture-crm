"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/server/cache-tags";
import { incomingWhatsAppMessageSchema, type IncomingWhatsAppMessageInput } from "@/actions/whatsapp/schemas";

type AIProvider = "openai" | "gemini";

type KnowledgeChunkResult = {
  id: string;
  content: string;
  score: number;
  sourceTitle: string;
};

type AIResponseEnvelope = {
  reply: string;
  confidence: number;
  actionRequired: boolean;
  actionReason: string | null;
  missingDocuments: string[];
};

type HandleIncomingWhatsAppMessageResult = {
  inboundMessageId: string;
  outboundDraftMessageId: string;
  reply: string;
  actionRequired: boolean;
  actionReason: string | null;
  missingDocuments: string[];
  ragSources: string[];
};

const MAX_BODY_LENGTH = 4000;
const TOP_K = 5;

export async function handleIncomingWhatsAppMessageAction(
  rawInput: unknown,
): Promise<HandleIncomingWhatsAppMessageResult> {
  const input = validateInput(rawInput);

  const inboundMessage = await prisma.message.create({
    data: {
      firmId: input.firmId,
      clientId: input.clientId,
      caseId: input.caseId,
      conversationId: input.conversationId,
      externalMessageId: input.externalMessageId,
      channel: "WHATSAPP",
      direction: "INBOUND",
      author: "CLIENT",
      fromNumber: input.fromNumber,
      toNumber: input.toNumber,
      body: input.body,
      language: input.language,
      sentiment: "UNKNOWN",
      metadata: {
        aiTriage: {
          status: "PENDING",
          actionRequired: false,
          createdAt: new Date().toISOString(),
        },
      },
    },
    select: { id: true },
  });

  const ragContext = await retrieveKnowledgeContext({
    firmId: input.firmId,
    userQuestion: input.body,
    topK: TOP_K,
  });

  const aiEnvelope = await generateSafeAIResponse({
    question: input.body,
    ragContext,
    provider: resolveProvider(),
  });

  await prisma.message.update({
    where: { id: inboundMessage.id },
    data: {
      aiSummary: aiEnvelope.reply,
      metadata: {
        aiTriage: {
          status: aiEnvelope.actionRequired ? "ACTION_REQUIRED" : "RESOLVED",
          actionRequired: aiEnvelope.actionRequired,
          actionReason: aiEnvelope.actionReason,
          missingDocuments: aiEnvelope.missingDocuments,
          confidence: aiEnvelope.confidence,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  });

  const outboundDraft = await prisma.message.create({
    data: {
      firmId: input.firmId,
      clientId: input.clientId,
      caseId: input.caseId,
      conversationId: input.conversationId,
      channel: "WHATSAPP",
      direction: "OUTBOUND",
      author: "AI",
      fromNumber: input.toNumber,
      toNumber: input.fromNumber,
      body: aiEnvelope.reply,
      sentiment: "UNKNOWN",
      metadata: {
        sourceMessageId: inboundMessage.id,
        ragSources: ragContext.map((chunk) => chunk.sourceTitle),
        status: aiEnvelope.actionRequired ? "HUMAN_REVIEW_REQUIRED" : "READY_TO_SEND",
      },
    },
    select: { id: true },
  });

  revalidateTag(cacheTags.dashboardAlerts(input.firmId));
  if (input.caseId) {
    revalidateTag(cacheTags.caseTimeline(input.firmId, input.caseId));
    revalidateTag(cacheTags.caseTimeline(input.firmId, "latest"));
  }

  return {
    inboundMessageId: inboundMessage.id,
    outboundDraftMessageId: outboundDraft.id,
    reply: aiEnvelope.reply,
    actionRequired: aiEnvelope.actionRequired,
    actionReason: aiEnvelope.actionReason,
    missingDocuments: aiEnvelope.missingDocuments,
    ragSources: unique(ragContext.map((chunk) => chunk.sourceTitle)),
  };
}

function validateInput(rawInput: unknown): IncomingWhatsAppMessageInput {
  const parsed = incomingWhatsAppMessageSchema.parse(rawInput);
  if (parsed.body.length > MAX_BODY_LENGTH) {
    throw new Error(`body exceeds max length (${MAX_BODY_LENGTH}).`);
  }
  return { ...parsed, language: parsed.language?.trim() || "es" };
}

async function retrieveKnowledgeContext(params: {
  firmId: string;
  userQuestion: string;
  topK: number;
}): Promise<KnowledgeChunkResult[]> {
  const q = params.userQuestion.toLowerCase();
  const terms = q
    .split(/\s+/)
    .map((s) => s.replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter((s) => s.length > 3)
    .slice(0, 8);

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      firmId: params.firmId,
      knowledgeBase: {
        status: "READY",
      },
      OR: terms.length
        ? terms.map((term) => ({
            content: { contains: term, mode: "insensitive" as const },
          }))
        : undefined,
    },
    include: {
      knowledgeBase: {
        select: { title: true },
      },
    },
    take: Math.max(params.topK * 3, 12),
  });

  const scored = chunks
    .map((chunk) => {
      const lc = chunk.content.toLowerCase();
      const score = terms.reduce((acc, t) => (lc.includes(t) ? acc + 1 : acc), 0);
      return {
        id: chunk.id,
        content: chunk.content,
        score,
        sourceTitle: chunk.knowledgeBase.title,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, params.topK);

  return scored;
}

async function generateSafeAIResponse(params: {
  question: string;
  ragContext: KnowledgeChunkResult[];
  provider: AIProvider;
}): Promise<AIResponseEnvelope> {
  const contextText = params.ragContext.length
    ? params.ragContext
        .map((c, i) => `[SOURCE_${i + 1}] ${c.sourceTitle}\n${c.content}`)
        .join("\n\n")
    : "NO_CONTEXT";

  const systemPrompt = [
    "Eres ARCHI-LEGAL AI. Responde con precision para un CRM de abogados y arquitectos.",
    "Reglas anti-alucinacion (obligatorias):",
    "1) No inventes leyes, fechas, articulos, requisitos ni documentos.",
    "2) Usa solo el contexto recuperado. Si no hay evidencia suficiente, dilo explicitamente.",
    "3) Si la solicitud requiere analisis juridico/tecnico complejo, marca actionRequired=true.",
    "4) Si faltan documentos, enumera missingDocuments y marca actionRequired=true.",
    "5) Devuelve SOLO JSON valido con el esquema solicitado.",
  ].join("\n");

  const userPrompt = [
    `Pregunta del cliente: ${params.question}`,
    "",
    "Contexto RAG disponible:",
    contextText,
    "",
    "Responde en JSON con este schema exacto:",
    '{ "reply": string, "confidence": number, "actionRequired": boolean, "actionReason": string | null, "missingDocuments": string[] }',
  ].join("\n");

  const raw = await callLLM({
    provider: params.provider,
    systemPrompt,
    userPrompt,
  });

  const parsed = safeParseAIEnvelope(raw);
  if (parsed) {
    return parsed;
  }

  return {
    reply:
      "Para darte una respuesta precisa y segura necesito revisión profesional. En breve un especialista del despacho continuará contigo.",
    confidence: 0,
    actionRequired: true,
    actionReason: "No se pudo parsear una salida confiable del modelo.",
    missingDocuments: [],
  };
}

async function callLLM(params: {
  provider: AIProvider;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  if (params.provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `${params.systemPrompt}\n\n${params.userPrompt}` }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }
  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

function safeParseAIEnvelope(raw: string): AIResponseEnvelope | null {
  try {
    const normalized = raw.trim();
    const parsed: unknown = JSON.parse(normalized);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const p = parsed as Record<string, unknown>;
    const reply = typeof p.reply === "string" ? p.reply.trim() : "";
    const confidence = typeof p.confidence === "number" ? p.confidence : 0;
    const actionRequired = Boolean(p.actionRequired);
    const actionReason = typeof p.actionReason === "string" ? p.actionReason : null;
    const missingDocuments = Array.isArray(p.missingDocuments)
      ? p.missingDocuments.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [];

    if (!reply) {
      return null;
    }

    return {
      reply,
      confidence: Math.max(0, Math.min(1, confidence)),
      actionRequired,
      actionReason,
      missingDocuments,
    };
  } catch {
    return null;
  }
}

function resolveProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  return provider === "gemini" ? "gemini" : "openai";
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
