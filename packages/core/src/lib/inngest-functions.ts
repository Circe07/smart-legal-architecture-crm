import { inngest } from "./inngest";
import { prisma } from "@archi-legal/db";
import { runTriageAgent } from "../agents/triage-agent";
import { sendWhatsAppMessage } from "./whatsapp-client";
import { emitPlatformEvent } from "./event-emitter";

export const processIncomingMessage = inngest.createFunction(
  { id: "process-incoming-message" },
  { event: "app/message.received" },
  async ({ event, step }) => {
    const { payload, source } = event.data;
    const messageBody = payload.text || payload.body || "No content";
    const sender = payload.from || payload.sender || "";
    // Payload may contain document data downloaded from Webhook
    const documentBase64 = payload.documentBase64;
    const documentMime = payload.documentMime || "application/pdf";

    let extractedDocData: any = null;

    // 0. Extract Document (Multimodal Gemini 3.1 Pro)
    if (documentBase64) {
      extractedDocData = await step.run("extract-document-data", async () => {
        const { runDocumentExtractionAgent } = require("../agents/document-agent");
        console.log(`[Inngest] 📄 Processing attached document with Gemini 3.1 Pro...`);
        return runDocumentExtractionAgent(documentMime, documentBase64);
      });
    }

    // 1. Persist the message in the "database"
    const savedMessage = await step.run("save-message-to-db", async () => {
      const dbEntry = {
        body: messageBody + (extractedDocData ? `\n[Documento Adjunto analizado: ${extractedDocData.summary}]` : ""),
        direction: "INBOUND",
        author: "CLIENT",
        fromNumber: sender,
        channel: source === "whatsapp" ? "WHATSAPP" : "EMAIL",
        firmId: "demo-firm",
        metadataJson: extractedDocData ? { document: extractedDocData } : undefined
      };
      
      return prisma.message.create({ data: dbEntry });
    });

    // 2. Fetch Conversational Memory
    const historyContext = await step.run("fetch-conversation-history", async () => {
      const pastMessages = await prisma.message.findMany({
        where: { fromNumber: sender },
        orderBy: { createdAt: "desc" },
      });
      // Tomamos los últimos 5 para no saturar el prompt y los ordenamos cronológicamente
      return pastMessages.slice(0, 5).reverse().map((m: any) => `${m.author}: ${m.body}`).join("\n");
    });

    // 3. AI Triage & RAG
    const triageResult = await step.run("ai-triage-and-rag", async () => {
      return runTriageAgent(messageBody, historyContext);
    });

    // 4. Persist Triage Result in metadata
    await step.run("update-message-metadata", async () => {
      console.log(`[Inngest] Triage Result for ${savedMessage.id}:`, triageResult);
    });

    // 4. Decision: Auto-Reply or Human Escalation
    if (triageResult.requiresHumanAction || !triageResult.autoReplyPossible) {
      await step.run("human-escalation-response", async () => {
        const escalationMsg = "Hemos recibido tu consulta principal. Dado el carácter de la misma, estamos derivando revisar tu expediente a detalle con un profesional de Archi-Legal. Te contactaremos a la brevedad posible.";
        console.log(`[Inngest] 🛡️ Escalating case. Sending automatic reply to client...`);
        if (source === "whatsapp" && sender) {
          await sendWhatsAppMessage(sender, escalationMsg);
        }

        // Emitimos la alerta en Tiemo Real para el Dashboard
        emitPlatformEvent("case.escalated", {
          messageId: savedMessage.id,
          triage: triageResult,
          sender,
          channel: source
        });

        return { status: "escalated", triage: triageResult };
      });
    } else {
      await step.run("send-auto-reply", async () => {
        console.log(`[Inngest] 🤖 Auto-replying based on RAG: ${triageResult.suggestedReply}`);
        if (source === "whatsapp" && sender && triageResult.suggestedReply) {
          await sendWhatsAppMessage(sender, triageResult.suggestedReply);
        }
        return { status: "replied", answer: triageResult.suggestedReply };
      });
    }

    return { success: true, triage: triageResult };
  }
);
