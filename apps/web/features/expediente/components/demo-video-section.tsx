"use client"

import { Play, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DemoVideoSection() {
  return (
    <Card className="overflow-hidden border-dashed bg-muted/30">
      <div className="flex flex-col items-center justify-center gap-4 p-8 sm:flex-row sm:gap-6">
        {/* Video Thumbnail */}
        <div className="relative flex size-20 shrink-0 items-center justify-center rounded-xl bg-navy/5 sm:size-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald text-white shadow-lg transition-transform hover:scale-110">
              <Play className="size-5 ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 -top-1 size-3 rounded-full bg-emerald/20" />
          <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-navy/10" />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h3 className="font-semibold text-navy">
            Watch 1-minute Demo
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            See how Archi-Legal transforms your practice in 60 seconds
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>1:00 min</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-emerald hover:bg-emerald/10 hover:text-emerald sm:ml-auto"
        >
          Watch Now
          <Play className="ml-1 size-3" />
        </Button>
      </div>
    </Card>
  )
}
