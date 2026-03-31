export type MetricTrend = "up" | "down";

export type DashboardMetric = {
  title: string;
  value: string;
  change: string;
  trend: MetricTrend;
  iconKey: "briefcase" | "sparkles" | "userPlus";
  iconBg: string;
  iconColor: string;
  sparklineData: number[];
  showSparkline?: boolean;
};

export type PipelineStatus = "Onboarding" | "In Review" | "Active" | "Pending" | "Closed";
export type ChannelType = "whatsapp" | "email";

export type PipelineClient = {
  id: number;
  name: string;
  project: string;
  avatar?: string;
  initials: string;
  status: PipelineStatus;
  aiSummary: string;
  lastAiInsight: string;
  priority: number;
  channel: ChannelType;
};

export type QuickAction = {
  id: string;
  iconKey: "whatsapp" | "scanLine" | "fileUp";
  label: string;
  description?: string;
  primary?: boolean;
};

export type AlertType = "critical" | "action" | "update" | "success";

export type AIAlert = {
  id: string | number;
  type: AlertType;
  title: string;
  description: string;
  timeLabel: string;
  createdAt: string;
};
