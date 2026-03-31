"use client"

import { MessageSquare, BookOpen, UserPlus, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActionCard {
  id: string
  title: string
  description: string
  iconKey: "messageSquare" | "bookOpen" | "userPlus"
  buttonText: string
  buttonVariant: "default" | "outline" | "ghost"
  recommended?: boolean
}

const iconByKey = {
  messageSquare: MessageSquare,
  bookOpen: BookOpen,
  userPlus: UserPlus,
} as const;

interface ActionCardsProps {
  cards: ActionCard[]
}

export function ActionCards({ cards }: ActionCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.id}
          className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
            card.recommended && "ring-2 ring-emerald ring-offset-2"
          )}
        >
          {card.recommended && (
            <div className="absolute right-0 top-0">
              <div className="bg-emerald px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white rounded-bl-lg">
                Recommended
              </div>
            </div>
          )}
          
          <CardHeader className="pb-4">
            <div
              className={cn(
                "mb-3 flex size-12 items-center justify-center rounded-xl",
                card.recommended
                  ? "bg-emerald/10 text-emerald"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {(() => {
                const Icon = iconByKey[card.iconKey]
                return <Icon className="size-6" />
              })()}
            </div>
            <CardTitle className="text-lg text-navy">{card.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {card.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button
              variant={card.buttonVariant}
              className={cn(
                "w-full group",
                card.buttonVariant === "default" &&
                  "bg-emerald hover:bg-emerald/90 text-white",
                card.buttonVariant === "outline" &&
                  "border-navy/20 text-navy hover:bg-navy/5",
                card.buttonVariant === "ghost" &&
                  "text-muted-foreground hover:text-navy hover:bg-muted"
              )}
            >
              {card.buttonText}
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
