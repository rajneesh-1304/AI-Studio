import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/prisma";
import { CREDIT_COST_PER_GENERATION } from "@/lib/constant";
import type { Message, FileData } from "@/types/workspace";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
];

const MAX_RETRIES_PER_MODEL = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

function sseEvent(type: string, payload: unknown): string {
  return `data: ${JSON.stringify({ type, ...(payload as object) })}\n\n`;
}

function cleanAndParseJson<T>(raw: string): T {
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  text = text.replace(/[\x00-\x1F\x7F]/g, (ch) => {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    return "";
  });

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    const sanitized = text.replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(sanitized) as T;
    } catch {
      throw err;
    }
  }
}


function extractThoughtLabel(text: string): string | null {
  const boldMatch = text.match(/\*\*([^*]{4,60})\*\*/);
  if (boldMatch) return boldMatch[1].trim();

  const sentence = text.split(/[.\n]/)[0].trim();
  if (sentence.length >= 8 && sentence.length <= 80) return sentence;

  return null;
}

async function validateDependencies(
  deps: Record<string, string>
): Promise<Record<string, string>> {
  const valid: Record<string, string> = {};
  await Promise.all(
    Object.entries(deps).map(async ([pkg, version]) => {
      try {
        const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
          signal: AbortSignal.timeout(1500),
        });
        if (res.ok) valid[pkg] = version;
      } catch {
      }
    })
  );
  return valid;
}

function trimHistory(messages: Message[]): Message[] {
  if (messages.length <= 10) return messages;
  return [messages[0], ...messages.slice(-8)];
}

const SYSTEM_PROMPT = `You are an expert React developer. Your job is to generate complete, working React applications based on user prompts.

RULES:
1. Always respond with a valid JSON object — no markdown fences, no extra text.
2. The JSON must match this exact shape:
{
  "assistantMessage": "<brief explanation of what you built/changed>",
  "title": "<short 2-4 word title for the app, e.g. 'Todo List App'>",
  "files": {
    "/App.js": { "code": "<full file content>" },
    "/components/SomeComponent.js": { "code": "<full file content>" }
  },
  "dependencies": {
    "some-package": "latest"
  }
}
3. Use React (functional components + hooks). Do NOT use TypeScript in generated files.
4. Use Tailwind CSS for all styling. Do not use CSS modules or inline styles unless absolutely necessary.
5. The entry point must always be /App.js and must export a default component.
6. All imports must reference files you include in "files" or packages in "dependencies".
7. Do not include react, react-dom, or tailwindcss in "dependencies" — they are always available.
8. When modifying existing code, include ALL files (both changed and unchanged) in "files".
9. Keep code clean, readable, and production-quality.
10. If the user attaches an image, use it as a design reference and match the layout/style as closely as possible.`;

function buildContents(messages: Message[], fileData: FileData | null) {
  const trimmed = trimHistory(messages);

  return trimmed.map((msg, idx) => {
    const role = msg.role === "assistant" ? "model" : "user";

    if (msg.role === "user") {
      const parts: object[] = [];

      let text = msg.content;

      if (msg.imageUrl) {
        text = `[The user has attached an image. Use this URL directly in the generated app where relevant (as img src, background-image, etc.): ${msg.imageUrl}]\n\n${text}`;
      }

      const isLast = idx === trimmed.length - 1;
      if (isLast && fileData) {
        text +=
          "\n\nCurrent project files for context:\n" +
          JSON.stringify(fileData, null, 2);
      }

      parts.push({ text });
      return { role, parts };
    }

    return { role, parts: [{ text: msg.content }] };
  });
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { workspaceId, userId, messages, fileData } = body as {
    workspaceId: string | null;
    userId: string;
    messages: Message[];
    fileData: FileData | null;
  };

  if (!messages?.length) {
    return Response.json({ message: "No messages provided" }, { status: 400 });
  }


  const user = await db.user.findUnique({
    where: { id: userId, clerkId },
    select: { id: true, credits: true },
  });

  if (!user)
    return Response.json({ message: "User not found" }, { status: 404 });
  if (user.credits < CREDIT_COST_PER_GENERATION) {
    return Response.json({ message: "Insufficient credits" }, { status: 402 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isStreamClosed = false;

      const enqueue = (chunk: string) => {
        if (isStreamClosed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          isStreamClosed = true;
        }
      };

      const closeStream = () => {
        if (isStreamClosed) return;
        isStreamClosed = true;
        try {
          controller.close();
        } catch {}
      };

      try {
        const contents = buildContents(messages, fileData);

        let accumulated = "";
        let generationSucceeded = false;
        let lastError: unknown = null;

        const friendlyStatuses = [
          "Analyzing your request…",
          "Preparing components…",
          "Structuring the application…",
          "Building the interface…",
          "Assembling code modules…",
        ];
        let statusIdx = 0;

        for (const model of CANDIDATE_MODELS) {
          if (isStreamClosed || generationSucceeded) break;

          for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
            if (isStreamClosed) break;

            try {
              accumulated = "";
              let lastEmitTime = 0;
              let hasEmittedCodeStatus = false;

              const supportsThinking = !model.includes("lite");
              const config: Record<string, unknown> = {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.7,
                responseMimeType: "application/json",
              };
              if (supportsThinking) {
                config.thinkingConfig = { includeThoughts: true };
              }

              const geminiStream = await ai.models.generateContentStream({
                model,
                contents,
                config,
              });

              for await (const chunk of geminiStream) {
                if (isStreamClosed) break;

                const parts = chunk.candidates?.[0]?.content?.parts ?? [];

                for (const part of parts) {
                  if (!part.text) continue;

                  if (part.thought) {
                    const now = Date.now();
                    if (now - lastEmitTime > 600) {
                      const label = extractThoughtLabel(part.text);
                      if (label) {
                        enqueue(sseEvent("status", { message: label }));
                        lastEmitTime = now;
                      }
                    }
                  } else {
                    if (!hasEmittedCodeStatus) {
                      hasEmittedCodeStatus = true;
                      enqueue(
                        sseEvent("status", {
                          message: "Generating application code…",
                        })
                      );
                      lastEmitTime = Date.now();
                    } else {
                      const now = Date.now();
                      if (now - lastEmitTime > 8000) {
                        enqueue(`: keep-alive\n\n`);
                        lastEmitTime = now;
                      }
                    }
                    accumulated += part.text;
                  }
                }
              }

              if (accumulated.trim().length > 0) {
                generationSucceeded = true;
                break;
              }
            } catch (modelErr: unknown) {
              const errMsg =
                modelErr instanceof Error ? modelErr.message : String(modelErr);
              const isRetryable =
                errMsg.includes("503") ||
                errMsg.includes("UNAVAILABLE") ||
                errMsg.includes("high demand") ||
                errMsg.includes("429") ||
                errMsg.includes("RESOURCE_EXHAUSTED") ||
                errMsg.includes("overloaded") ||
                errMsg.includes("404") ||
                errMsg.includes("NOT_FOUND");

              console.warn(
                `[gen-ai-code] Model ${model} attempt ${attempt + 1} failed (retryable=${isRetryable}):`,
                errMsg.slice(0, 200)
              );
              lastError = modelErr;

              if (isRetryable && attempt < MAX_RETRIES_PER_MODEL - 1) {
                const delay =
                  INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt) +
                  Math.random() * 1000;
                const friendly =
                  friendlyStatuses[statusIdx % friendlyStatuses.length];
                statusIdx++;
                enqueue(sseEvent("status", { message: friendly }));
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }

              break;
            }
          }
        }

        if (!generationSucceeded) {
          throw (
            lastError ??
            new Error("AI service is currently unavailable. Please try again.")
          );
        }

        if (isStreamClosed) return;

        let parsed: {
          assistantMessage: string;
          title?: string;
          files: Record<string, { code: string }>;
          dependencies: Record<string, string>;
        };

        try {
          parsed = cleanAndParseJson(accumulated);
        } catch (parseErr) {
          console.error("[gen-ai-code] Failed to parse JSON:", parseErr);
          console.error("[gen-ai-code] Raw accumulated preview:", accumulated.slice(0, 500));
          enqueue(
            sseEvent("error", {
              message: "AI returned invalid JSON. Please try again.",
            })
          );
          closeStream();
          return;
        }

        const {
          assistantMessage,
          title: aiTitle,
          files,
          dependencies,
        } = parsed;

        if (!files || typeof files !== "object") {
          enqueue(
            sseEvent("error", {
              message: "AI response missing files. Please try again.",
            })
          );
          closeStream();
          return;
        }

        enqueue(sseEvent("status", { message: "Validating packages…" }));
        const validatedDeps = await validateDependencies(dependencies ?? {});
        const newFileData: FileData = {
          files,
          dependencies: validatedDeps,
          title: aiTitle,
        };

        enqueue(sseEvent("status", { message: "Saving…" }));

        const lastUserMessage = messages[messages.length - 1];
        const updatedMessages: Message[] = [
          ...messages,
          { role: "assistant", content: assistantMessage },
        ];

        const [workspace] = await db.$transaction([
          workspaceId
            ? db.workspace.update({
                where: { id: workspaceId, userId },
                data: {
                  messages: updatedMessages as never,
                  fileData: newFileData as never,
                },
              })
            : db.workspace.create({
                data: {
                  userId,
                  title: aiTitle ?? lastUserMessage.content.slice(0, 80),
                  messages: updatedMessages as never,
                  fileData: newFileData as never,
                },
              }),
          db.user.update({
            where: { id: userId },
            data: { credits: { decrement: CREDIT_COST_PER_GENERATION } },
          }),
        ]);

        const updatedUser = await db.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        enqueue(
          sseEvent("done", {
            workspaceId: workspace.id,
            assistantMessage,
            fileData: newFileData,
            creditsRemaining:
              updatedUser?.credits ?? user.credits - CREDIT_COST_PER_GENERATION,
          })
        );
      } catch (err: unknown) {
        console.error("[gen-ai-code] stream error:", err);
        const errObj = err as { status?: number; message?: string };
        const rawMessage = typeof errObj?.message === "string" ? errObj.message : "";
        let userMessage = "Something went wrong. Please try again.";

        if (
          rawMessage.includes("quota") ||
          rawMessage.includes("RESOURCE_EXHAUSTED") ||
          rawMessage.includes("exceeded")
        ) {
          const retryMatch = rawMessage.match(/retry in (\d+h)?(\d+m)?/i);
          const retryInfo = retryMatch ? ` (resets in ~${retryMatch[0].replace("retry in ", "")})` : "";
          userMessage = `API quota exceeded on Free Tier${retryInfo}. Please enable billing at aistudio.google.com or wait for the quota to reset.`;
        } else if (
          errObj?.status === 503 ||
          rawMessage.includes("503") ||
          rawMessage.includes("high demand") ||
          rawMessage.includes("UNAVAILABLE")
        ) {
          userMessage = "AI service is temporarily unavailable. Please try again in a few moments.";
        } else if (
          errObj?.status === 429 ||
          rawMessage.includes("429")
        ) {
          userMessage = "Too many requests. Please wait a moment and try again.";
        } else if (
          rawMessage.includes("404") ||
          rawMessage.includes("NOT_FOUND")
        ) {
          userMessage = "AI model not available. Please check your API key configuration.";
        }

        enqueue(
          sseEvent("error", {
            message: userMessage,
          })
        );
      } finally {
        closeStream();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const maxDuration = 300;
