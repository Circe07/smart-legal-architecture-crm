"use server";

import { prisma } from "@archi-legal/db";
import { revalidateTag } from "next/cache";
import { getTenantContext } from "@archi-legal/core/tenant-context";
import { cacheTags } from "@archi-legal/core/cache-tags";
import { createProfessionalReplySchema } from "@/app/expediente/actions/schemas";

export async function createProfessionalReplyAction(rawInput: unknown) {
  const input = createProfessionalReplySchema.parse(rawInput);

  const tenant = await getTenantContext();
  const professionalNumber = tenant.professionalPhone ?? process.env.DEFAULT_PROFESSIONAL_PHONE ?? "+0000000000";

  const caseRecord = await prisma.case.findFirst({
    where: {
      id: input.caseId,
      firmId: tenant.firmId,
      clientId: input.clientId,
    },
    select: { id: true },
  });

  if (!caseRecord && !input.caseId.startsWith("demo-")) {
    throw new Error("Case not found for current firm.");
  }

  const message = await prisma.message.create({
    data: {
      firmId: tenant.firmId,
      caseId: input.caseId,
      clientId: input.clientId,
      conversationId: input.conversationId,
      channel: "WHATSAPP",
      direction: "OUTBOUND",
      author: "PROFESSIONAL",
      fromNumber: professionalNumber,
      toNumber: input.toNumber,
      body: input.body,
      sentiment: "UNKNOWN",
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: true,
      direction: true,
    },
  });

  revalidateTag(cacheTags.caseTimeline(tenant.firmId, input.caseId));
  revalidateTag(cacheTags.caseTimeline(tenant.firmId, "latest"));
  revalidateTag(cacheTags.dashboardAlerts(tenant.firmId));
  return message;
}
