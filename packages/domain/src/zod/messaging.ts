import { z } from "zod";

export const createProfessionalReplySchema = z.object({
  caseId: z.string().min(1),
  clientId: z.string().min(1),
  conversationId: z.string().min(1),
  toNumber: z.string().min(6).max(32),
  body: z.string().trim().min(1).max(4000),
});

export const incomingWhatsAppMessageSchema = z.object({
  firmId: z.string().min(1),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  conversationId: z.string().optional(),
  externalMessageId: z.string().optional(),
  fromNumber: z.string().min(6).max(32),
  toNumber: z.string().min(6).max(32),
  body: z.string().trim().min(1).max(4000),
  language: z.string().min(2).max(8).optional(),
});

export type CreateProfessionalReplyInputSchema = z.infer<typeof createProfessionalReplySchema>;
export type IncomingWhatsAppMessageInputSchema = z.infer<typeof incomingWhatsAppMessageSchema>;
