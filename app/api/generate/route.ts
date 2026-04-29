import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { buildPrompt, type ContentType } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const ResultSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const BodySchema = z.object({
  concept: z.string().min(1).max(400),
  type: z.enum(["note", "melmaga", "blog"]),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userKey = req.headers.get("x-gemini-key")?.trim();
  const apiKey = userKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Gemini APIキーが設定されていません。画面右上の「APIキー」から登録してください。" },
      { status: 401 }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const { concept, type } = parsed.data as { concept: string; type: ContentType };
  const { system, user } = buildPrompt(type, concept);

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: ResultSchema,
      system,
      prompt: user,
    });
    return Response.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
