import { NextResponse } from "next/server";
import { sseEmitter } from "@archi-legal/core/event-emitter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  // Create a TransformStream to send data to the client
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Emit a connected event
  writer.write(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

  // Listener for escalations
  const onEscalation = (data: any) => {
    console.log("[SSE] Enviando notificación en tiempo real al CRM:", data);
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: "escalation", data })}\n\n`));
  };

  sseEmitter.on("case.escalated", onEscalation);

  // Handle client disconnects to prevent memory leaks
  request.signal.addEventListener("abort", () => {
    sseEmitter.off("case.escalated", onEscalation);
    writer.close();
  });

  // Return the stream with SSE headers ensuring secure transmission
  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Bypass Nginx buffering if deployed
      // Strict Security Headers
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    },
  });
}
