import { inngest } from "./inngest";
import { prisma } from "@archi-legal/db";
import { runTriageAgent } from "../agents/triage-agent";

export const processIncomingMessage = inngest.createFunction(
  { id: "process-incoming-message", event: "app/message.received" },
  async ({ event, step }: { event: any; step: any }) => {
    const { payload, source } = event.data;
    const messageBody = payload.text || payload.body || "No content";

    // 1. Persist the message in the "database"
    const savedMessage = await step.run("save-message-to-db", async () => {
      return prisma.message.create({
        data: {
          body: messageBody,
          direction: "INBOUND",
          author: "CLIENT",
          fromNumber: payload.from || payload.sender,
          channel: source === "whatsapp" ? "WHATSAPP" : "EMAIL",
          firmId: "demo-firm",
        },
      });
    });

    // 2. AI Triage & RAG
    const triageResult = await step.run("ai-triage-and-rag", async () => {
      return runTriageAgent(messageBody);
    });

    // 3. Persist Triage Result in metadata
    await step.run("update-message-metadata", async () => {
      console.log(`[Inngest] Triage Result for ${savedMessage.id}:`, triageResult);
    });

    // 4. Decision: Auto-Reply or Human Escalation
    if (triageResult.requiresHumanAction || !triageResult.autoReplyPossible) {
      await step.run("human-escalation-response", async () => {
        console.log(`[Inngest] 🛡️ Escalating case. Sending automatic reply to client...`);
        return { status: "escalated", triage: triageResult };
      });
    } else {
      await step.run("send-auto-reply", async () => {
        console.log(`[Inngest] 🤖 Auto-replying based on RAG: ${triageResult.suggestedReply}`);
        return { status: "replied", answer: triageResult.suggestedReply };
      });
    }

    return { success: true, triage: triageResult };
  }
);
