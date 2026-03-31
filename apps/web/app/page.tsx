import {
  DashboardSidebar,
  DashboardHeader,
  MetricCards,
  ClientPipeline,
  AIAlertFeed,
  AIActionBar,
} from "@/features/dashboard/components"
import { getAIAlertsForFirm, getDashboardMetrics, getPipelineClients, getQuickActions } from "@/features/dashboard/server"
import { getTenantContext } from "@archi-legal/core/tenant-context"

export default async function Dashboard() {
  const tenant = await getTenantContext();
  const [alerts, metrics, clients, quickActions] = await Promise.all([
    getAIAlertsForFirm(tenant.firmId).catch(() => []),
    Promise.resolve(getDashboardMetrics()),
    Promise.resolve(getPipelineClients()),
    Promise.resolve(getQuickActions()),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="ml-16 flex min-h-screen flex-col">
        {/* Header */}
        <DashboardHeader
          notificationCount={alerts.length}
          user={{
            name: tenant.professionalName,
            initials: tenant.professionalInitials,
          }}
        />

        {/* Page Content */}
        <main className="flex flex-1 gap-6 p-6">
          {/* Left Content Area */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* Metric Cards Row */}
            <MetricCards metrics={metrics} />

            {/* AI Quick Action Bar */}
            <AIActionBar quickActions={quickActions} />

            {/* Client Pipeline Table */}
            <ClientPipeline clients={clients} />
          </div>

          {/* Right Panel - AI Alert Feed */}
          <AIAlertFeed alerts={alerts} />
        </main>
      </div>
    </div>
  )
}
