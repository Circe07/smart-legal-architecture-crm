"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  Briefcase,
  Sparkles,
  Settings,
  Scale,
} from "lucide-react"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Users, label: "Clients", id: "clients" },
  { icon: Briefcase, label: "Active Cases", id: "cases" },
  { icon: Sparkles, label: "AI Insights", id: "insights" },
  { icon: Settings, label: "Settings", id: "settings" },
]

export function DashboardSidebar() {
  const [activeItem, setActiveItem] = useState("home")

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <Scale className="size-5 text-primary-foreground" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-4">
          {navItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-lg transition-all duration-200",
                    activeItem === item.id
                      ? "bg-primary/15 text-primary shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "size-5 transition-all",
                    activeItem === item.id && "drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                  )} />
                  {activeItem === item.id && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                  <span className="sr-only">{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* AI Efficiency Rating */}
        <div className="flex flex-col items-center gap-2 border-t border-sidebar-border p-4">
          <div className="relative size-10">
            <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-sidebar-accent"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="87, 100"
                className="text-primary drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-sidebar-foreground">
              87%
            </span>
          </div>
          <span className="text-[10px] text-sidebar-foreground/60">AI Score</span>
        </div>
      </aside>
    </TooltipProvider>
  )
}
