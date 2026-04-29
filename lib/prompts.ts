export type ContentType = "note" | "melmaga" | "blog";

export const CONTENT_LABEL: Record<ContentType, string> = {
  note: "Note記事",
  melmaga: "メルマガ",
  blog: "ブログ記事",
};

const SYSTEM_BASE = `あなたは日本市場に精通した一流のコピーライター兼マーケターです。
読者がスクロールを止め、最後まで読み切り、行動したくなる文章を作ります。
- 平易で具体的な日本語
- 体言止めを多用しすぎない
- 抽象論を避け、数字・固有名詞・体験談で語る
- 出力はMarkdownで、装飾しすぎない`;

export function buildPrompt(type: ContentType, concept: string) {
  const sys = SYSTEM_BASE;
  switch (type) {
    case "note":
      return {
        system: sys,
        user: `次のコンセプトで、note(ノート)向けの体験談・気づき系記事を1本書いてください。
コンセプト: 「${concept}」

要件:
- タイトルは【】を1箇所だけ使い、続きが気になる引きをつくる
- 本文は約1200〜1800字
- 構成: 導入(共感) → なぜ今このテーマか → 具体エピソード(箇条書き含む) → 学び・行動提案 → CTA(他の記事への誘導)
- 一人称で語り、読者に寄り添うトーン

出力フォーマット(JSON):
{ "title": "<記事タイトル>", "content": "<Markdown本文>" }`,
      };
    case "blog":
      return {
        system: sys,
        user: `次のコンセプトで、SEO/検索流入向けのブログ解説記事を1本書いてください。
コンセプト: 「${concept}」

要件:
- タイトルは「○○とは？」など検索意図に答える形＋年号や"完全ガイド"等の修飾
- 本文は約1500〜2200字
- 構成: 導入 → メリット箇条書き → 実践ステップ(見出し付き) → よくある失敗 → まとめ
- H2/H3で見出し階層を明確に

出力フォーマット(JSON):
{ "title": "<記事タイトル>", "content": "<Markdown本文>" }`,
      };
    case "melmaga":
      return {
        system: sys,
        user: `次のコンセプトで、ステップメール1通(問題提起→共感→解決示唆→CTA)を書いてください。
コンセプト: 「${concept}」

要件:
- タイトルは【】を1箇所＋数字や"損している"等の損失回避フックを入れる
- 本文は約700〜1100字
- 一人称、語りかけ口調、改行多めで読みやすく
- 末尾にCTAリンクのプレースホルダ(▼ 詳細はこちら / [リンクURL])

出力フォーマット(JSON):
{ "title": "<件名>", "content": "<本文>" }`,
      };
  }
}
