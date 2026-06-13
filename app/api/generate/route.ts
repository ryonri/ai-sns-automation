import { NextRequest } from "next/server";
import { z } from "zod";
import { CONTENT_TYPES } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENAI_TEXT_MODEL = "gpt-4.1-mini";

const BodySchema = z.object({
  concept: z.string().min(1).max(4000),
});

const ResultItemSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const ResultsSchema = z.object({
  note: ResultItemSchema,
  melmaga: ResultItemSchema,
  x: ResultItemSchema,
  threads: ResultItemSchema,
});

const SYSTEM_BASE = `あなたは日本市場で結果を出し続けている一流のコピーライター兼SNSマーケターです。
読者がスクロールを止め、最後まで読み、思わず保存・シェア・行動したくなる文章を作ります。

【共通の文章原則】
- 抽象論ではなく、数字・固有名詞・体験談・具体エピソードで語る
- 平易で具体的な日本語。中学生でも読める語彙
- 一文を短く。リズムを意識し、改行で呼吸をつくる
- 「自分のことだ」と読者が感じる共感ポイントを冒頭に置く
- 絵文字とUnicode装飾を効果的に使い、視覚的に読みやすくする
- ただし絵文字の乱用は禁止。1セクションに1〜2個、意味のある場所だけ`;

function buildBatchPrompt(concept: string) {
  return `次のコンセプトで、note、メルマガ、X、Threads向けの投稿文をそれぞれ1本ずつ作成してください。

コンセプト: 「${concept}」

【note要件】
- Markdown形式
- 見出しは ## と ### で階層化
- 導入、結論、背景、具体例、行動提案、まとめ、CTA の順
- 全体で約1800〜2500字
- タイトルは20〜30字目安

【メルマガ要件】
- プレーンテキスト。Markdown記法は禁止
- 件名は【】を1箇所＋損失回避フック
- 本文冒頭は「○○さん、こんにちは。」
- 本文長は約800〜1300字
- 問題提起、共感、気づき、具体例、今日のアクション、CTA、追伸の順

【X要件】
- 全角140字以内
- 1行目に強いフック
- 2〜4行に分割
- 末尾に半角ハッシュタグを2〜3個
- 絵文字は1〜2個まで

【Threads要件】
- 全角500字以内
- 段落ごとに空行
- 1行目は強いフック
- 共感、体験談、気づき、行動提案の順
- ハッシュタグは最大2個`;
}

function createJsonSchema() {
  const item = {
    type: "object",
    additionalProperties: false,
    required: ["title", "content"],
    properties: {
      title: { type: "string" },
      content: { type: "string" },
    },
  };

  return {
    type: "object",
    additionalProperties: false,
    required: CONTENT_TYPES,
    properties: {
      note: item,
      melmaga: item,
      x: item,
      threads: item,
    },
  };
}

function extractOutputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("");
}

function friendlyOpenAiError(status: number, payload: any) {
  const type = payload?.error?.type ?? "";
  const code = payload?.error?.code ?? "";
  const detail = [type, code].filter(Boolean).join(" / ");
  const suffix = detail ? `\n\n診断情報: OpenAI ${status} / ${detail}` : `\n\n診断情報: OpenAI ${status}`;

  if (status === 401) return `OpenAI APIキーが正しくありません。APIキーを確認して再設定してください。${suffix}`;
  if (status === 429) return `OpenAI APIの利用上限または残高に達しています。OpenAIのBillingとUsage limitsを確認してください。${suffix}`;
  if (status === 403) return `このOpenAI APIキーでは現在のモデルを利用できません。Billing設定、Organization verification、Project権限を確認してください。${suffix}`;
  if (status >= 500) return `OpenAI APIが一時的に混雑しています。少し時間を置いて再実行してください。${suffix}`;
  return `${payload?.error?.message ?? "OpenAI APIへの接続に失敗しました。"}${suffix}`;
}

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

  const userKey = req.headers.get("x-openai-key")?.trim();
  const apiKey = userKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OpenAI APIキーが設定されていません。画面右上の「APIキー」から登録してください。" },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_TEXT_MODEL,
        instructions: SYSTEM_BASE,
        input: buildBatchPrompt(parsed.data.concept),
        temperature: 0.8,
        text: {
          format: {
            type: "json_schema",
            name: "sns_automation_results",
            strict: true,
            schema: createJsonSchema(),
          },
        },
      }),
    });

    const text = await upstream.text();
    let payload: any;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { error: { message: text || upstream.statusText } };
    }

    if (!upstream.ok) {
      return Response.json({ error: friendlyOpenAiError(upstream.status, payload) }, { status: upstream.status });
    }

    const output = JSON.parse(extractOutputText(payload));
    const results = ResultsSchema.parse(output);
    return Response.json({ results, provider: "openai", model: OPENAI_TEXT_MODEL });
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
