import { NextResponse } from "next/server";
import { inngest } from "@archi-legal/core/inngest";
import crypto from "crypto";
import { z } from "zod";

// --- SECURITY SCHEMAS ---
const whatsappWebhookSchema = z.object({
  object: z.literal("whatsapp_business_account"),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      field: z.string(),
      value: z.object({
        messaging_product: z.string(),
        metadata: z.any(),
        contacts: z.array(z.object({
          profile: z.object({ name: z.string() }),
          wa_id: z.string()
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          type: z.string(),
          text: z.object({ body: z.string() }).optional(),
          ref: z.any().optional(),
          context: z.any().optional(),
          errors: z.any().optional()
        })).optional()
      })
    }))
  }))
});

// Clave secreta configurada en el Dashboard de Meta App
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "simulate_secret_for_local_dev";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "archi_legal_secure_token_123";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // 1. HMAC SIGNATURE VALIDATION (Strict Protection)
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hmac = crypto.createHmac("sha256", WHATSAPP_APP_SECRET);
    const expectedSignature = `sha256=${hmac.update(rawBody).digest("hex")}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ error: "Forbidden: Signature doesn't match" }, { status: 403 });
    }

    // 2. SCHEMA VALIDATION (Input Sanitization)
    const rawJson = JSON.parse(rawBody);
    const validation = whatsappWebhookSchema.safeParse(rawJson);

    if (!validation.success) {
      console.warn("⚠️ [Security] Payload malformado o malintencionado recibido.");
      // Respondemos 200 para que Meta no reintente payloads basura infinitamente
      return NextResponse.json({ received: true, info: "malformed" });
    }

    const payload = validation.data;

    // 3. SECURE PROCESSING
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          const message = change.value.messages[0];
          const contact = change.value.contacts?.[0];
          const sender = contact?.wa_id || message.from;

          await inngest.send({
            name: "app/message.received",
            data: {
              payload: {
                from: sender,
                text: message.text?.body || "",
                messageId: message.id,
                type: message.type
              },
              source: "whatsapp",
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("🔥 [Webhook] Error crítico:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
