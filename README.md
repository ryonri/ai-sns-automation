# AI集客オートメーション

コンセプトを1行入れるだけで、**Note記事・メルマガ・X投稿・Threads投稿**を OpenAI API で生成するツール一式です。

この特典は、完成済みの公開サービスURLを提供するものではありません。利用環境の準備、APIキーの取得、起動作業は利用者側の環境に依存します。個別の設定確認、起動代行、環境構築サポートは対象外です。

- BYOK (Bring Your Own Key): OpenAI APIキーは**ブラウザのlocalStorageにのみ保存**、サーバーには保存されません
- Firebase認証・メール認証・購入者メール照合は使いません
- `/login` `/auth` `/register` などにアクセスしてもトップページへ戻します
- カードクリックで全文モーダル → ワンクリックコピー
- Next.js 16 App Router / AI SDK v6 / Tailwind v4

## 利用前の確認

このツールには、購入者メールによるログイン認証はありません。

起動後、画面右上の「APIキー」から OpenAI API キーを登録してください。
キーは [OpenAI Platform](https://platform.openai.com/api-keys) で取得できます。

## 起動できない場合

「このメールアドレスは登録されていません」「管理者に問い合わせてください」といった表示が出る場合は、このツールではなく、古いURL、別ツール、または古い配布物を開いている可能性があります。

この特典は、配布フォルダ内の最新版を利用してください。公開URLやメール認証で利用する形式ではありません。

## 開発環境で起動する場合

```bash
npm install
npm run dev
```

表示されたローカルURLを開き、画面右上の「APIキー」から自分のOpenAI APIキーを保存します。

## GitHub にプッシュ

```bash
cd ai-sns-automation
git init
git add .
git commit -m "init: AI集客オートメーション"
gh repo create ai-sns-automation --public --source=. --remote=origin --push
```

`gh` を使わない場合は GitHub で空リポジトリを作成 → `git remote add origin <URL>` → `git push -u origin main`。

## Vercel にデプロイ

### 方法A: ダッシュボードから

1. [vercel.com/new](https://vercel.com/new) で自分のGitHubリポジトリを選択
2. Framework は自動検出 (Next.js)
3. 環境変数は**設定不要** (BYOKモードのため)
4. Deploy

### 方法B: CLI から

```bash
npm i -g vercel@latest
vercel
vercel --prod
```

### 任意: サーバー側フォールバックキー

自分の環境だけで共有キーを使いたい場合のみ、Vercel の Environment Variables に `OPENAI_API_KEY` を設定してください。
ユーザー個別のキー(BYOK)が優先されます。

## 構成

```text
app/
  layout.tsx             # ルートレイアウト
  page.tsx               # メインUI (Client)
  globals.css            # Tailwind v4 + ガラスモーフィズム
  api/generate/route.ts  # OpenAI呼び出し (Node runtime)
components/
  ApiKeyDialog.tsx       # APIキー保存ダイアログ
  ResultCard.tsx         # 結果カード
  ResultModal.tsx        # 全文モーダル
  SourceLock.tsx         # 右クリック・主要ショートカット抑制
lib/
  prompts.ts             # コンテンツ用プロンプト
```

## ライセンス

Private (マツケン社長プロジェクト)
