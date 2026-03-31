import { prisma } from "@archi-legal/db";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@archi-legal/core/cache-tags";
import type { TimelineMessage } from "@archi-legal/domain/messaging";
import type { CaseTimelineContext } from "@archi-legal/domain/expediente";

export async function getCaseTimelineContextForFirm(firmId: string): Promise<CaseTimelineContext> {
  const getRecentCase = unstable_cache(
    async () =>
      prisma.case.findFirst({
        where: { firmId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          clientId: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 30,
            select: {
              id: true,
              body: true,
              createdAt: true,
              direction: true,
              author: true,
              fromNumber: true,
              toNumber: true,
              conversationId: true,
            },
          },
          client: {
            select: {
              whatsappNumber: true,
            },
          },
        },
      }),
    [`recent-case:${firmId}`],
    { tags: [cacheTags.caseTimeline(firmId, "latest")], revalidate: 30 },
  );

  const recentCase = await getRecentCase();


  const messages: TimelineMessage[] = recentCase.messages.map((m: any) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    direction: m.direction,
    author: m.author,
  }));

  const fallbackConversationId = recentCase.messages.at(-1)?.conversationId ?? `conv-${recentCase.id}`;
  const clientNumber =
    recentCase.client?.whatsappNumber ??
    recentCase.messages.find((m: any) => m.direction === "INBOUND")?.fromNumber ??
    "+5215587654321";
  const professionalNumber =
    recentCase.messages.find((m: any) => m.direction === "OUTBOUND")?.fromNumber ??
    process.env.DEFAULT_PROFESSIONAL_PHONE ??
    "+5215512345678";

  return {
    caseId: recentCase.id,
    clientId: recentCase.clientId,
    conversationId: fallbackConversationId,
    clientNumber,
    professionalNumber,
    messages,
  };
}
