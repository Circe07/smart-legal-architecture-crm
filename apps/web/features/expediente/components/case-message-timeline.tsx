"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createProfessionalReplyAction } from "@/app/expediente/actions/messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TimelineMessage } from "@archi-legal/domain/messaging";

type TimelineMessageUI = TimelineMessage & {
  optimistic?: boolean;
};

type CaseMessageTimelineProps = {
  caseId: string;
  clientId: string;
  conversationId: string;
  clientNumber: string;
  initialMessages: TimelineMessage[];
};

export function CaseMessageTimeline(props: CaseMessageTimelineProps) {
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    props.initialMessages as TimelineMessageUI[],
    (state: TimelineMessageUI[], newBody: string): TimelineMessageUI[] => [
      ...state,
      {
        id: `optimistic-${crypto.randomUUID()}`,
        body: newBody,
        createdAt: new Date().toISOString(),
        direction: "OUTBOUND",
        author: "PROFESSIONAL",
        optimistic: true,
      },
    ],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = reply.trim();
    if (!body) return;

    addOptimisticMessage(body);
    setReply("");

    startTransition(async () => {
      await createProfessionalReplyAction({
        caseId: props.caseId,
        clientId: props.clientId,
        conversationId: props.conversationId,
        toNumber: props.clientNumber,
        body,
      });
    });
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Timeline de Mensajes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border/50 bg-muted/20 p-3">
          {optimisticMessages.map((message) => {
            const isOutbound = message.direction === "OUTBOUND";
            return (
              <div key={message.id} className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    isOutbound
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border/50",
                    message.optimistic && "opacity-70",
                  )}
                >
                  <p>{message.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Responder al cliente..."
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !reply.trim()} className="gap-2">
            <Send className="size-4" />
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
