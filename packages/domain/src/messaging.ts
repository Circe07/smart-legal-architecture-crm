export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageAuthor = "CLIENT" | "PROFESSIONAL" | "AI" | "SYSTEM";

export type TimelineMessage = {
  id: string;
  body: string;
  createdAt: string;
  direction: MessageDirection;
  author: MessageAuthor;
};

export type CreateProfessionalReplyInput = {
  caseId: string;
  clientId: string;
  conversationId: string;
  toNumber: string;
  body: string;
};
