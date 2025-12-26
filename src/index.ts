/**
 * LLM Chat Application Template - Enhanced Streaming Version
 * 
 * 增強型版本特性：
 * - SSE (Server-Sent Events) 支援
 * - Token 計數和速度指標
 * - 更好的流處理
 * - 改進的錯誤處理
 *
 * @license MIT
 */
import { Env, ChatMessage } from "./types";

const MODEL_ID = "@hf/google/gemma-7b-it";
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

export default {
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
      if (request.method === "POST") {
        return handleChatRequest(request, env, ctx);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handles chat API requests with streaming response
 */
async function handleChatRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    const { messages = [] } = (await request.json()) as {
      messages: ChatMessage[];
    };

    // Add system prompt if not present
    if (!messages.some((msg) => msg.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    // Get streaming response from AI
    const aiResponse = await env.AI.run(
      MODEL_ID,
      {
        messages,
        max_tokens: 1024,
      },
      {
        returnRawResponse: true,
      },
    );

    // Wrap the stream with SSE format
    const sseStream = wrapStreamWithSSE(aiResponse.body);

    return new Response(sseStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    
    // Return error as SSE event
    const errorStream = new ReadableStream({
      start(controller) {
        const errorMsg = JSON.stringify({
          type: "error",
          message: "Failed to process request",
          error: error instanceof Error ? error.message : String(error),
        });
        controller.enqueue(new TextEncoder().encode(`data: ${errorMsg}\n\n`));
        controller.close();
      },
    });

    return new Response(errorStream, {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  }
}

/**
 * Wraps the AI response stream with SSE format
 * Sends chunks with metadata like token count and timestamps
 */
function wrapStreamWithSSE(
  stream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let tokenCount = 0;
      const startTime = Date.now();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Send completion event
            const completionMsg = JSON.stringify({
              type: "done",
              tokenCount,
              duration: Date.now() - startTime,
              tokensPerSecond:
                tokenCount / ((Date.now() - startTime) / 1000) || 0,
              timestamp: Date.now(),
            });
            controller.enqueue(
              new TextEncoder().encode(`data: ${completionMsg}\n\n`),
            );
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process line by line
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);
              if (data.response) {
                tokenCount++;

                // Send chunk event in SSE format
                const chunkMsg = JSON.stringify({
                  type: "chunk",
                  content: data.response,
                  tokenCount,
                  elapsedTime: Date.now() - startTime,
                  tokensPerSecond:
                    tokenCount / ((Date.now() - startTime) / 1000) || 0,
                  timestamp: Date.now(),
                });

                controller.enqueue(
                  new TextEncoder().encode(`data: ${chunkMsg}\n\n`),
                );
              }
            } catch (parseError) {
              console.error("Failed to parse AI response chunk:", parseError);
              // Continue processing other lines
            }
          }
        }
      } catch (error) {
        console.error("Stream processing error:", error);

        // Send error event
        const errorMsg = JSON.stringify({
          type: "error",
          message:
            error instanceof Error ? error.message : "Unknown stream error",
        });
        controller.enqueue(
          new TextEncoder().encode(`data: ${errorMsg}\n\n`),
        );
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
}
