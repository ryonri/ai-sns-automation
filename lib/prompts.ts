export type ContentType = "note" | "melmaga" | "x" | "threads";

export const CONTENT_LABEL: Record<ContentType, string> = {
  note: "Note投稿",
  melmaga: "メルマガ",
  x: "X（Twitter）",
  threads: "Threads",
};

export const CONTENT_TYPES: ContentType[] = ["note", "melmaga", "x", "threads"];

const SYSTEM_BASE = `あなたは日本市場に精通した一流のコピーライター兼SNSマーケターです。
読者がスクロールを止め、最後まで読み、行動したくなる文章を作ります。
- 平易で具体的な日本語
- 抽象論より、数字・固有名詞・体験談で語る
- 出力は指定されたJSONスキーマに厳密に従う`;

export function buildPrompt(type: ContentType, concept: string) {
  switch (type) {
    case "note":
      return {
        system: SYSTEM_BASE,
        user: `次のコンセプトで、note(ノート)向けの体験談・気づき系の長文記事を1本書いてください。
コンセプト: 「${concept}」

要件:
- タイトルは【】を1箇所だけ使い、続きが気になる引きをつくる
- 本文は約1200〜1800字
- 構成: 導入(共感) → なぜ今このテーマか → 具体エピソード(箇条書き含む) → 学び・行動提案 → CTA(他の記事への誘導)
- 一人称、読者に寄り添うトーン、Markdown

JSON: { "title": "<記事タイトル>", "content": "<Markdown本文>" }`,
      };

    case "melmaga":
      return {
        system: SYSTEM_BASE,
        user: `次のコンセプトで、ステップメール1通(問題提起→共感→解決示唆→CTA)を書いてください。
コンセプト: 「${concept}」

要件:
- 件名は【】を1箇所＋数字や"損している"等の損失回避フックを入れる
- 本文は約700〜1100字
- 一人称、語りかけ口調、改行多めで読みやすく
- 末尾にCTAリンクのプレースホルダ(▼ 詳細はこちら / [リンクURL])

JSON: { "title": "<件名>", "content": "<本文>" }`,
      };

    case "x":
      return {
        system: SYSTEM_BASE,
        user: `次のコンセプトで、X(旧Twitter)の単発投稿を1本書いてください。
コンセプト: 「${concept}」

要件:
- 全角140字以内（厳守）。改行・記号も1字としてカウントすること
- 1行目に強いフック(数字・断言・逆説のいずれか)
- 改行を活かして視認性を上げる
- 末尾にハッシュタグを2〜3個（半角#、関連性の高いものだけ）
- 絵文字は最大1〜2個まで

JSON: { "title": "<投稿の要約を一文で>", "content": "<X投稿本文(140字以内)>" }`,
      };

    case "threads":
      return {
        system: SYSTEM_BASE,
        user: `次のコンセプトで、Threadsの単発投稿を1本書いてください。
コンセプト: 「${concept}」

要件:
- 全角500字以内（厳守）
- 1行目で強くフックし、続きを読みたくさせる
- 段落ごとに空行を入れて呼吸させる
- 体験談 or 具体例を最低1つ
- 締めに気づき or 問いかけ
- ハッシュタグは末尾に最大2個（任意）

JSON: { "title": "<投稿の要約を一文で>", "content": "<Threads投稿本文(500字以内)>" }`,
      };
  }
}
