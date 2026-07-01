# e-sign

**エンベロープ無制限・自己ホスト可能な電子署名SaaS**

DocuSignの代替OSSです。送信数上限なし・超過課金なし・自動更新トラップなし。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/e-sign&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20connection%20credentials&project-name=e-sign&repository-name=e-sign)

---

## なぜe-signを作ったか

DocuSign Standardは$25/user/月、エンベロープ上限100通/年（超過は$3〜8/通）。20人チームで年間$15,000超。しかも15〜20%の自動値上げつき。

e-signはこの問題を根本から解決します。**エンベロープ無制限・全プランで送信数上限なし。**

## 機能

- **PDF署名フォームビルダー** — ドラッグ&ドロップで署名・テキスト・日付・チェックボックスなど8種のフィールドを配置
- **複数署名者ワークフロー** — 順次/並列どちらも設定可能。役割ベースのフィールド割り当て
- **エンベロープ無制限** — 月/年の送信上限なし（全プラン共通）
- **再利用テンプレート** — NDA・雇用契約書などをチーム内で共有
- **完全な監査証跡** — 署名者IP・タイムスタンプ・PDFハッシュを記録。ESIGN/UETA/eIDAS準拠
- **REST API & Webhook** — 全エンドポイント公開。署名完了・辞退イベントをWebhookで通知
- **埋め込み署名** — iframeやReact SDKで自社プロダクトに統合
- **セルフホスト対応** — Docker Composeで1コマンド起動
- **モバイル最適化** — スマートフォンでの指書き署名に対応

## クイックスタート

### Vercelへデプロイ（推奨）

1. 上の「Deploy with Vercel」ボタンをクリック
2. Supabaseのプロジェクトを作成して環境変数を入力
3. `supabase/migrations/` のSQLをSupabaseのSQL Editorで実行

### セルフホスト（Docker）

```bash
git clone https://github.com/postcabinets-jp/e-sign
cd e-sign
cp .env.example .env
# .envにSupabase接続情報を記入
docker compose up
# → http://localhost:3000
```

### ローカル開発

```bash
git clone https://github.com/postcabinets-jp/e-sign
cd e-sign
npm install
cp .env.example .env.local
# .env.localにSupabase接続情報を記入
npm run dev
```

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# オプション
RESEND_API_KEY=re_your_resend_key
EMAIL_FROM=noreply@yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## データベースセットアップ

Supabaseプロジェクトを作成し、`supabase/migrations/20260701000000_initial_schema.sql` をSQL Editorで実行してください。

```bash
# Supabase CLIを使う場合
supabase db push
```

## 画面構成

| パス | 内容 |
|---|---|
| `/` | ランディングページ |
| `/login` | ログイン（メール/Google） |
| `/register` | 新規登録（組織名・プラン選択） |
| `/dashboard` | エンベロープ一覧 |
| `/dashboard/new` | 新規エンベロープ作成 |
| `/dashboard/envelopes/[id]` | エンベロープ詳細・監査証跡 |
| `/dashboard/templates` | テンプレート一覧 |
| `/dashboard/settings` | 組織設定 |
| `/sign/[token]` | 署名者向け署名画面（認証不要） |
| `/verify/[envelopeId]` | 署名検証ページ（公開） |

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router, TypeScript strict) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| データベース | Supabase (PostgreSQL + RLS) |
| ストレージ | Supabase Storage |
| 認証 | Supabase Auth (メール/Google OAuth) |
| メール | Resend (オプション) |
| デプロイ | Vercel (cloud) / Docker Compose (self-host) |

## DocuSignとの比較

| | **e-sign** | DocuSign Standard |
|---|---|---|
| 月額 | 無料（self-host）/ $9〜(cloud) | $25/user/月 |
| エンベロープ | **無制限** | 100通/年（超過$3〜8/通） |
| テンプレート | 無制限 | 5つまで |
| API・Webhook | フル公開 | 有料プランのみ |
| 自己ホスト | ✅ | ❌ |
| オープンソース | ✅ MIT | ❌ |

## ライセンス

MIT License

---

Built by [POST CABINETS](https://postcabinets.co.jp) — Webマーケティング支援
