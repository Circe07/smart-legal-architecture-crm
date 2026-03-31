import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  AppSidebar,
  SetupStepper,
  ActionCards,
  DemoVideoSection,
  CaseMessageTimeline,
} from "@/features/expediente/components"
import { Separator } from "@/components/ui/separator"
import { getTenantContext } from "@archi-legal/core/tenant-context"
import { getCaseTimelineContextForFirm } from "@/features/expediente/server"
import { actionCards, setupSteps } from "@/features/expediente/config"

export default async function WelcomePage() {
  const tenant = await getTenantContext()
  const timeline = await getCaseTimelineContextForFirm(tenant.firmId)
  const userName = tenant.professionalName

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Getting Started</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-6 py-12">
            {/* Hero Welcome Section */}
            <section className="mb-12 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Welcome to Archi-Legal, {userName}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Let&apos;s set up your AI-powered workspace in 3 simple steps.
              </p>
            </section>

            {/* Progress Stepper */}
            <section className="mb-16">
              <SetupStepper steps={setupSteps} />
            </section>

            {/* Action Cards Grid */}
            <section className="mb-16">
              <ActionCards cards={actionCards} />
            </section>

            {/* Live Conversation Timeline */}
            <section className="mb-16">
              <CaseMessageTimeline
                caseId={timeline.caseId}
                clientId={timeline.clientId}
                conversationId={timeline.conversationId}
                clientNumber={timeline.clientNumber}
                initialMessages={timeline.messages}
              />
            </section>

            {/* Demo Video Section */}
            <section className="mb-8">
              <DemoVideoSection />
            </section>

            {/* Skip Setup Link */}
            <div className="text-center">
              <button className="text-sm text-muted-foreground underline-offset-4 hover:text-navy hover:underline transition-colors">
                Skip setup for now
              </button>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
