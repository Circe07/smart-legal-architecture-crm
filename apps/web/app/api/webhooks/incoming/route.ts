import { NextResponse } from "next/server";
import { inngest } from "@archi-legal/core/inngest";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const source = request.headers.get("x-source") || "unknown";

    console.log(`[Webhook] Received message from ${source}:`, payload);

    // Send event to Inngest for async processing
    await inngest.send({
      name: "app/message.received",
      data: {
        payload,
        source,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing incoming webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
