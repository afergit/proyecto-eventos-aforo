// src/presentation/routes/aiRoutes.ts
/**
 * AI endpoint routing.
 * Receives a generic intent payload and forwards to the root AI agent.
 */
import { Hono } from "hono";
import { handleIntent } from "../../ai/rootAgent";

export const aiRouter = new Hono();

aiRouter.post('/assistant', async (c) => {
  const payload = await c.req.json();
  const result = await handleIntent(payload);
  return c.json(result);
});
