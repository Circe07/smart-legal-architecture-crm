"use client"

import { Briefcase, Sparkles, UserPlus, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardMetric } from "@/features/dashboard/components/types"

// Mini sparkline component
function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <svg className="h-8 w-16" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={cn(
          trend === "up" ? "text-primary" : "text-destructive"
        )}
      />
    </svg>
  )
}

const iconByKey = {
  briefcase: Briefcase,
  sparkles: Sparkles,
  userPlus: UserPlus,
} as const;

type MetricCardsProps = {
  metrics: DashboardMetric[];
};

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", metric.iconBg)}>
              {(() => {
                const Icon = iconByKey[metric.iconKey]
                return <Icon className={cn("size-5", metric.iconColor)} />
              })()}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">{metric.title}</span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-card-foreground">{metric.value}</span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      metric.trend === "up" ? "text-primary" : "text-destructive"
                    )}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {metric.change}
                  </span>
                </div>
                {metric.showSparkline && (
                  <Sparkline data={metric.sparklineData} trend={metric.trend} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
