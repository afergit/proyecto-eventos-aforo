// src/ai/rootAgent.ts
/**
 * Root AI agent that routes intents to specific sub‑agents.
 * Currently supports a simple mock for demonstration and a placeholder
 * for future Google Vertex AI integration.
 */
import { handleVertexIntent } from "./googleVertexService";

export type IntentPayload = {
  intent: string;
  parameters?: Record<string, any>;
};

/**
 * Main entry point for the AI endpoint.
 * Returns a response object that can be sent back to the HTTP client.
 */
export async function handleIntent(payload: IntentPayload) {
  const { intent, parameters } = payload;

  switch (intent) {
    case "list_events":
      // Mock response – in a real system this would query the domain.
      return { events: ["Concierto A", "Charla B", "Feria C"] };

    case "assistant":
      // Forward to Google Vertex AI (placeholder implementation).
      return await handleVertexIntent(parameters ?? {});

    default:
      return { error: "Intent no soportado" };
  }
}
