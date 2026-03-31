"use client"

import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  Lock,
  Scale,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const mainNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "#",
    active: true,
  },
  {
    title: "Clients",
    icon: Users,
    href: "#",
    badge: "0",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "#",
    badge: "0",
  },
  {
    title: "WhatsApp",
    icon: MessageSquare,
    href: "#",
    status: "setup",
  },
]

const aiNavItems = [
  {
    title: "AI Insights",
    icon: Sparkles,
    href: "#",
    locked: true,
    comingSoon: true,
  },
]

const settingsNavItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "#",
  },
  {
    title: "Help & Support",
    icon: HelpCircle,
    href: "#",
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald text-white">
            <Scale className="size-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Archi-Legal
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              AI Workspace
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.title}
                  >
                    <a href={item.href} className="relative">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground text-[10px] px-1.5 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {item.status === "setup" && (
                        <Badge className="ml-auto bg-emerald/20 text-emerald text-[10px] px-1.5 py-0 border-0">
                          Setup
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.locked ? "Complete setup to unlock" : item.title}
                    className={item.locked ? "opacity-60 cursor-not-allowed" : ""}
                  >
                    <a
                      href={item.locked ? "#" : item.href}
                      onClick={(e) => item.locked && e.preventDefault()}
                      className="relative"
                    >
                      {item.locked ? (
                        <Lock className="size-4" />
                      ) : (
                        <item.icon className="size-4" />
                      )}
                      <span>{item.title}</span>
                      {item.comingSoon && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-[10px] px-1.5 py-0 border-sidebar-border text-sidebar-foreground/60"
                        >
                          Locked
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          {settingsNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
