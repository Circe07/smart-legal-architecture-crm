export const cacheTags = {
  dashboardAlerts: (firmId: string) => `dashboard-alerts:${firmId}`,
  caseTimeline: (firmId: string, caseId: string) => `case-timeline:${firmId}:${caseId}`,
};
