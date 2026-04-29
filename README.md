# AI集客オートメーション

コンセプトを1行入れるだけで、**Note記事・メルマガ・ブログ記事**を Gemini で並列生成するツールです。
[mob-online.com/tool/ai-auto](https://mob-online.com/tool/ai-auto/) のUIを参考にしつつ、実機能を実装しました。

- BYOK (Bring Your Own Key): Gemini APIキーは**ブラウザのlocalStorageにのみ保存**、サーバーには保存されません
- 3種コンテンツを `Promise.all` で並列生成
- カードクリックで全文モーダル → ワンクリックコピー
- Next.js 16 App Router / AI SDK v6 / Tailwind v4

## ローカル起動

```bash
npm install
npm run dev
# http://localhost:3000
```

起動後、画面右上の「APIキー」から Gemini API キーを登録してください。
キーは [Google AI Studio](https://aistudio.google.com/apikey) で取得できます（無料枠あり）。

## GitHub にプッシュ

```bash
cd /Users/ryonri/Desktop/ai-sns-automation
git init
git add .
git commit -m "init: AI集客オートメーション"
gh repo create ai-sns-automation --public --source=. --remote=origin --push
```

`gh` を使わない場合は GitHub で空リポジトリを作成 → `git remote add origin <URL>` → `git push -u origin main`。

## Vercel にデプロイ

### 方法A: ダッシュボードから (最速)
1. [vercel.com/new](https://vercel.com/new) でGitHubリポジトリを選択
2. Framework は自動検出 (Next.js)
3. 環境変数は**設定不要** (BYOKモードのため)
4. Deploy

### 方法B: CLI から
```bash
npm i -g vercel@latest
vercel        # preview
vercel --prod # production
```

### 任意: サーバー側フォールバックキー
全ユーザーで共有のキーを使いたい場合のみ、Vercel の Environment Variables に
`GOOGLE_GENERATIVE_AI_API_KEY` を設定してください。
ユーザー個別のキー(BYOK)が優先されます。

## 構成

```
app/
  layout.tsx          # ルートレイアウト
  page.tsx            # メインUI (Client)
  globals.css         # Tailwind v4 + ガラスモーフィズム
  api/generate/route.ts  # Gemini呼び出し (Node runtime)
components/
  ApiKeyDialog.tsx    # APIキー保存ダイアログ
  ResultCard.tsx      # 結果カード
  ResultModal.tsx     # 全文モーダル
lib/
  prompts.ts          # 3種コンテンツ用プロンプト
```

## ライセンス

Private (マツケン社長プロジェクト)
