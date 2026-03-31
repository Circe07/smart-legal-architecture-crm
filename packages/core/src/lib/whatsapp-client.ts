const META_GRAPH_VERSION = "v19.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "simulate_phone_id";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "simulate_access_token";

export async function sendWhatsAppMessage(to: string, messageBody: string) {
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to, // El formato debe ser internacional E.164 (ej: 34600112233)
    type: "text",
    text: { preview_url: false, body: messageBody },
  };

  if (process.env.NODE_ENV === "development" && WHATSAPP_ACCESS_TOKEN.includes("simulate")) {
    console.log(`\n💬 [Mock WhatsApp Outbound] Enviando a ${to}:`);
    console.log(`"${messageBody}"\n`);
    return { status: "mocked", message_id: "wamid.mock." + Date.now() };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error de la API de Meta:", data);
      throw new Error("Meta API request failed");
    }

    console.log(`✅ Mensaje enviado a ${to} (ID: ${data.messages[0].id})`);
    return data;
  } catch (error) {
    console.error("🔥 Error crítico enviando respuesta por WhatsApp:", error);
    throw error;
  }
}
