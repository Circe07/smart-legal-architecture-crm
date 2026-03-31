import { prisma } from "@archi-legal/db";
import { unstable_cache } from "next/cache";
import type { AIAlert, DashboardMetric, PipelineClient, QuickAction } from "@/features/dashboard/components/types";
import { cacheTags } from "@archi-legal/core/cache-tags";

function relativeTimeLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export async function getAIAlertsForFirm(firmId: string): Promise<AIAlert[]> {
  const getMessages = unstable_cache(
    async () =>
      prisma.message.findMany({
        where: {
          firmId,
          OR: [
            { metadataJson: { path: ["aiTriage", "actionRequired"], equals: true } },
            { sentiment: "NEGATIVE" },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    [`dashboard-alerts-${firmId}`],
    { tags: [cacheTags.dashboardAlerts(firmId)], revalidate: 30 },
  );

  const messages = await getMessages();

  return messages.map((m) => ({
    id: m.id,
    type: m.sentiment === "NEGATIVE" ? "critical" : "action",
    title: m.sentiment === "NEGATIVE" ? "Frustración detectada" : "Acción requerida",
    description: m.body,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    timeLabel: relativeTimeLabel(m.createdAt),
  }));
}

export function getDashboardMetrics(): DashboardMetric[] {
  return [
    {
      title: "Total Active Cases",
      value: "127",
      change: "+12%",
      trend: "up",
      iconKey: "briefcase",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      sparklineData: [85, 92, 88, 105, 98, 115, 127],
      showSparkline: true,
    },
    {
      title: "Pending AI Tasks",
      value: "34",
      change: "-8%",
      trend: "down",
      iconKey: "sparkles",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      sparklineData: [45, 42, 38, 40, 36, 35, 34],
    },
    {
      title: "New Leads",
      value: "56",
      change: "+23%",
      trend: "up",
      iconKey: "userPlus",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      sparklineData: [32, 38, 35, 42, 48, 51, 56],
      showSparkline: true,
    },
  ];
}

export function getPipelineClients(): PipelineClient[] {
  return [
    {
      id: 1,
      name: "Morrison & Associates",
      project: "Corporate Merger Review",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face",
      initials: "MA",
      status: "Onboarding",
      aiSummary: "Contract review completed. Awaiting client signature on retainer agreement.",
      lastAiInsight: "Awaiting signed contract",
      priority: 5,
      channel: "email",
    },
    {
      id: 2,
      name: "Apex Architecture Ltd",
      project: "Building Permit Documentation",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      initials: "AA",
      status: "In Review",
      aiSummary: "Building permit documentation under legal review. AI flagged potential zoning issues.",
      lastAiInsight: "Potential zoning conflict detected",
      priority: 4,
      channel: "whatsapp",
    },
  ];
}

export function getQuickActions(): QuickAction[] {
  return [
    {
      id: "wa-import",
      iconKey: "whatsapp",
      label: "Auto-Import WhatsApp",
      description: "Sync messages",
      primary: true,
    },
    {
      id: "ai-scan",
      iconKey: "scanLine",
      label: "New Case via AI Scan",
      description: "Upload documents",
    },
    {
      id: "bulk-import",
      iconKey: "fileUp",
      label: "Bulk Import",
      description: "CSV or Excel",
    },
  ];
}
