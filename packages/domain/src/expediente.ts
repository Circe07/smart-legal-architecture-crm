import type { TimelineMessage } from "./messaging";

export type CaseTimelineContext = {
  caseId: string;
  clientId: string;
  conversationId: string;
  clientNumber: string;
  professionalNumber: string;
  messages: TimelineMessage[];
};
