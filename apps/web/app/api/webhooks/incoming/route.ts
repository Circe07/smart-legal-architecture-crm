import { NextResponse } from "next/server";
import { inngest } from "@archi-legal/core/inngest";
import crypto from "crypto";

// Clave secreta configurada en el Dashboard de Meta App
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "simulate_secret_for_local_dev";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "archi_legal_secure_token_123";

// Función obligatoria para que Meta (WhatsApp) verifique que este endpoint nos pertenece (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("[Webhook] WhatsApp Webhook Verified securely!");
    // Respondemos con el challenge exacto en texto plano para verificar (200 OK)
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Función principal para recibir mensajes (POST) con validación criptográfica
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // 1. VALIDACIÓN DE SEGURIDAD (Prevención de Spoofing)
    if (!signature) {
      console.warn("⚠️ [Security] Rechazado: Petición POST sin firma criptográfica.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calcula el hash SHA-256 esperado con nuestro App Secret
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", WHATSAPP_APP_SECRET)
      .update(rawBody)
      .digest("hex")}`;

    // Si las firmas no coinciden, es un ataque o un error de configuración
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error("🚫 [Security] Rechazado: La firma criptográfica de Meta NO coincide.");
      return NextResponse.json({ error: "Forbidden: Signature doesn't match" }, { status: 403 });
    }

    // 2. PROCESAMIENTO DEL PAYLOAD
    const payload = JSON.parse(rawBody);

    // Aseguramos que sea un evento de WhatsApp con mensajes
    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            const message = change.value.messages[0];
            const sender = change.value.contacts[0].wa_id;

            console.log(`🔒 [Webhook] Mensaje verificado de WhatsApp de ${sender}:`, message.text?.body);

            // Despachamos el trabajo asíncrono a Inngest
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
    }

    // Meta siempre requiere un 200 OK en menos de 20s para no desactivar el webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("🔥 [Webhook] Error crítico procesando entrada:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
