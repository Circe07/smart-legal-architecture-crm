import { AlertTriangle, RefreshCw, CheckCircle2, Clock, Gavel } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AIAlert, AlertType } from "@/features/dashboard/components/types"

const alertConfig: Record<AlertType, { 
  icon: typeof AlertTriangle
  iconClass: string
  barClass: string
  bgClass: string
}> = {
  critical: {
    icon: Gavel,
    iconClass: "text-red-500",
    barClass: "bg-red-500",
    bgClass: "bg-red-500/5",
  },
  action: {
    icon: Clock,
    iconClass: "text-amber-500",
    barClass: "bg-amber-500",
    bgClass: "bg-amber-500/5",
  },
  update: {
    icon: RefreshCw,
    iconClass: "text-blue-500",
    barClass: "bg-blue-500",
    bgClass: "",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-primary",
    barClass: "bg-primary",
    bgClass: "",
  },
}

type AIAlertFeedProps = {
  alerts: AIAlert[];
};

export function AIAlertFeed({ alerts }: AIAlertFeedProps) {
  return (
    <Card className="h-fit w-72 shrink-0 border-border/50 shadow-sm">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          AI Alert Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-3 pb-3 pt-1">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={cn(
                "relative flex gap-2.5 rounded-md py-2 pl-3 pr-2 transition-colors hover:bg-muted/50",
                config.bgClass
              )}
            >
              {/* Priority Color Bar */}
              <div className={cn(
                "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full",
                config.barClass
              )} />
              
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                <Icon className={cn("size-3.5", config.iconClass)} />
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="text-xs font-medium text-card-foreground truncate">
                    {alert.title}
                  </h4>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{alert.timeLabel}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {alert.description}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
