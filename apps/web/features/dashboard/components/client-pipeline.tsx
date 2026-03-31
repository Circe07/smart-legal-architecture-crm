"use client"

import { Star, MessageCircle, FileText, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PipelineClient } from "@/features/dashboard/components/types"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  Onboarding: { variant: "outline", className: "border-primary/40 bg-primary/5 text-primary" },
  "In Review": { variant: "outline", className: "border-amber-500/40 bg-amber-500/5 text-amber-600" },
  Active: { variant: "outline", className: "border-primary/40 bg-primary/5 text-primary" },
  Pending: { variant: "outline", className: "border-muted-foreground/40 bg-muted/50 text-muted-foreground" },
  Closed: { variant: "outline", className: "border-muted-foreground/30 bg-muted/30 text-muted-foreground" },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  )
}

function ClientCard({ client }: { client: PipelineClient }) {
  const status = statusConfig[client.status] || statusConfig.Pending
  
  return (
    <div className="group rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm">
      {/* Header: Avatar, Name + Channel Icon, Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Avatar className="size-10 shrink-0 border border-border/50">
            <AvatarImage src={client.avatar} alt={client.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {client.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-card-foreground truncate">{client.name}</span>
              {client.channel === "whatsapp" ? (
                <WhatsAppIcon className="size-3.5 shrink-0 text-green-500" />
              ) : (
                <Mail className="size-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">{client.project}</span>
            <span className="text-[11px] text-muted-foreground/70 truncate italic mt-0.5">
              AI: {client.lastAiInsight}
            </span>
          </div>
        </div>
        
        <Badge variant={status.variant} className={cn(status.className, "text-xs shrink-0")}>
          {client.status}
        </Badge>
      </div>
      
      {/* AI Summary */}
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {client.aiSummary}
      </p>
      
      {/* Footer: Priority + Actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Priority</span>
          <StarRating rating={client.priority} />
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-primary">
            <MessageCircle className="size-3.5" />
            <span className="sr-only">Chat with {client.name}</span>
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-primary">
            <FileText className="size-3.5" />
            <span className="sr-only">View documents for {client.name}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

type ClientPipelineProps = {
  clients: PipelineClient[];
};

export function ClientPipeline({ clients }: ClientPipelineProps) {
  return (
    <Card className="flex-1 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">Client Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
