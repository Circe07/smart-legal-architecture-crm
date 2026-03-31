"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  icon: React.ElementType
  completed: boolean
  active: boolean
}

interface SetupStepperProps {
  steps: Step[]
}

export function SetupStepper({ steps }: SetupStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  step.completed
                    ? "border-emerald bg-emerald text-white"
                    : step.active
                      ? "border-emerald bg-emerald/10 text-emerald"
                      : "border-border bg-muted text-muted-foreground"
                )}
              >
                {step.completed ? (
                  <Check className="size-5" />
                ) : (
                  <step.icon className="size-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  step.active || step.completed
                    ? "text-navy"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-0.5 w-16 sm:w-24 md:w-32 transition-colors",
                  step.completed ? "bg-emerald" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
