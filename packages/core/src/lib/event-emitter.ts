import { EventEmitter } from "events";

// Patrón Singleton para mantener un Event Emitter global en Next.js
// Esto es crucial para que Server-Sent Events (SSE) funcione correctamente
// sin depender de Redis u otro SaaS externo.

class GlobalEmitter extends EventEmitter {}

const globalForEmitter = global as unknown as {
  sseEmitter: GlobalEmitter | undefined;
};

export const sseEmitter = globalForEmitter.sseEmitter ?? new GlobalEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEmitter.sseEmitter = sseEmitter;
}

export function emitPlatformEvent(eventName: string, data: any) {
  sseEmitter.emit(eventName, data);
}
