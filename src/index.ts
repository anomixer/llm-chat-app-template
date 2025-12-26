/**
 * LLM Chat Application Template - Fixed Streaming Version
 * 
 * 改進型版本特性：
 * - 修復 Cloudflare Workers AI streaming 問題
 * - 正確設置 stream: true 參數
 * - 直接回傳原始流而非 SSE 包裝
 * - Token 計數通過前端解析
 *
 * @license MIT
 */
import { Env, ChatMessage } from "./types";

// Model ID for Workers AI model
// https://developers.cloudflare.com/workers-ai/models/
const MODEL_ID = "@hf/google/gemma-7b-it";

// Default system prompt
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

export default {
  /**
   * Main request handler for the Worker
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle static assets (frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // API Routes
    if (url.pathname === "/api/chat") {
      // Handle POST requests for chat
      if (request.method === "POST") {
        return handleChatRequest(request, env);
      }

      // Method not allowed for other request types
      return new Response("Method not allowed", { status: 405 });
    }

    // Handle 404 for unmatched routes
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handles chat API requests with streaming
 */
async function handleChatRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    // Parse JSON request body
    const { messages = [] } = (await request.json()) as {
      messages: ChatMessage[];
    };

    // Add system prompt if not present
    if (!messages.some((msg) => msg.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    // Run AI model with streaming enabled
    const response = await env.AI.run(
      MODEL_ID,
      {
        messages,
        max_tokens: 1024,
        stream: true, // CRITICAL: Enable streaming
      },
    );

    // Return the streaming response directly
    // Workers AI returns a ReadableStream in JSON Lines format
    return new Response(response as ReadableStream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        "connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
