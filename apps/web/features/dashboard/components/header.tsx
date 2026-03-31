"use client"

import { Search, Plus, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type DashboardHeaderProps = {
  notificationCount: number;
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
};

export function DashboardHeader({ notificationCount, user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6">
      {/* Left spacer for balance */}
      <div className="w-32" />

      {/* Centered Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search clients, cases, or AI insights..."
          className="h-10 w-full bg-secondary/50 pl-10 pr-4 border-transparent focus-visible:bg-background"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>

        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {notificationCount}
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Avatar className="size-9 border-2 border-primary/20">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary">{user.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
