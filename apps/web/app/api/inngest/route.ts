import { serve } from "inngest/next";
import { inngest } from "@archi-legal/core/inngest";
import { processIncomingMessage } from "@archi-legal/core/inngest-functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processIncomingMessage,
  ],
});
