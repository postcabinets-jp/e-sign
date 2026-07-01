import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  FileSignature,
  Globe,
  Infinity,
  Lock,
  Server,
  Users,
  Webhook,
  Zap,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base font-semibold text-zinc-900">e-sign</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/postcabinets-jp/e-sign"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors px-3 py-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm h-8">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm h-8">無料で始める</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          オープンソース · MITライセンス
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 tracking-tight mb-6 leading-[1.1]">
          DocuSignの<br />
          <span className="text-zinc-400">エンベロープ上限</span>
          <br />に飽き飽きしていませんか？
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          e-signは<strong className="text-zinc-700">エンベロープ無制限</strong>・自己ホスト可能な電子署名SaaSです。
          DocuSign Standard（$25/user·月）の替わりに、無制限で使えるOSSを。
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register">
            <Button size="lg" className="text-base px-6">
              無料で始める
            </Button>
          </Link>
          <a
            href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/e-sign"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="text-base px-6 gap-2">
              <svg className="w-4 h-4" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              Vercelにデプロイ
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          クレジットカード不要 · 無制限エンベロープ · 1コマンドでセルフホスト
        </p>
      </section>

      {/* Comparison */}
      <section className="bg-zinc-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-10">DocuSignとの比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">機能</th>
                  <th className="text-center py-3 px-4 font-bold text-zinc-900">e-sign</th>
                  <th className="text-center py-3 px-4 font-medium text-zinc-400">DocuSign Standard</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['月額料金', '無料（self-host）', '$25/user/月'],
                  ['エンベロープ', '無制限', '100通/年（超過 $3〜8/通）'],
                  ['テンプレート', '無制限', '5つまで'],
                  ['API・Webhook', 'フル公開', '有料プランのみ'],
                  ['自己ホスト', '✅ Docker対応', '❌'],
                  ['オープンソース', '✅ MIT', '❌'],
                  ['自動更新トラップ', '✅ 月次キャンセル自由', '⚠️ 年次更新・値上げあり'],
                ].map(([feature, esign, docusign]) => (
                  <tr key={feature} className="border-b border-zinc-100">
                    <td className="py-3 px-4 text-zinc-700">{feature}</td>
                    <td className="py-3 px-4 text-center font-medium text-zinc-900 bg-green-50/50">{esign}</td>
                    <td className="py-3 px-4 text-center text-zinc-400">{docusign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-zinc-900 text-center mb-3">主な機能</h2>
        <p className="text-zinc-500 text-center mb-12">DocuSign Business Proの全機能をOSSで</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Infinity,
              title: 'エンベロープ無制限',
              description: '送信数上限・超過課金なし。月100通の上限管理から解放されます。',
              highlight: true,
            },
            {
              icon: FileSignature,
              title: 'PDFフォームビルダー',
              description: 'ドラッグ&ドロップで署名・テキスト・日付・チェックボックスなど8種のフィールドを配置。',
            },
            {
              icon: Users,
              title: '複数署名者ワークフロー',
              description: '順次・並列どちらの署名フローも設定可能。役割ベースのフィールド割り当て。',
            },
            {
              icon: Lock,
              title: '完全な監査証跡',
              description: '署名者のIP・タイムスタンプ・PDFハッシュを記録。ESIGN/UETA/eIDAS準拠。',
            },
            {
              icon: Webhook,
              title: 'API & Webhook',
              description: '全エンドポイント公開のREST API。署名完了・辞退などのイベントをWebhookで通知。',
            },
            {
              icon: Server,
              title: 'セルフホスト対応',
              description: 'docker compose up 1コマンドで起動。データを自社サーバーで管理できます。',
            },
            {
              icon: Globe,
              title: '埋め込み署名',
              description: 'iframeやReact SDKで自社プロダクトに署名フローを組み込み可能。',
            },
            {
              icon: Zap,
              title: '再利用テンプレート',
              description: 'NDA・雇用契約書などの定型文書をテンプレート化してチーム内で共有。',
            },
            {
              icon: CheckCircle2,
              title: 'モバイル最適化',
              description: 'スマートフォンでの指書き署名・フォーム入力に完全対応。',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`rounded-xl p-6 border ${feature.highlight ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 bg-white'}`}
            >
              <feature.icon className={`w-6 h-6 mb-4 ${feature.highlight ? 'text-zinc-300' : 'text-zinc-700'}`} />
              <h3 className={`text-base font-semibold mb-2 ${feature.highlight ? 'text-white' : 'text-zinc-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${feature.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Deploy Your Own */}
      <section className="bg-zinc-900 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">自分のサーバーで動かす</h2>
          <p className="text-zinc-400 mb-8">
            DockerとSupabaseがあれば、あなたのインフラでe-signを完全に自己ホストできます。
          </p>

          <div className="bg-zinc-800 rounded-xl p-5 text-left mb-8 font-mono text-sm">
            <div className="text-zinc-500 mb-2"># Docker Composeで起動</div>
            <div className="text-green-400">$ git clone https://github.com/postcabinets-jp/e-sign</div>
            <div className="text-green-400">$ cd e-sign && cp .env.example .env</div>
            <div className="text-green-400">$ docker compose up</div>
            <div className="text-zinc-500 mt-2"># → http://localhost:3000</div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/e-sign&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20connection%20credentials"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://vercel.com/button"
                alt="Deploy with Vercel"
                className="h-9"
              />
            </a>
            <a
              href="https://github.com/postcabinets-jp/e-sign"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              ソースコードを見る
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">DocuSignの請求書を最後にする</h2>
        <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
          エンベロープ無制限。過剰課金なし。自動更新トラップなし。
          法務・HR・営業チームに最適な電子署名を、今すぐ無料で。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="px-8">無料で始める</Button>
          </Link>
          <a href="https://github.com/postcabinets-jp/e-sign" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="px-8">GitHubを見る</Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-900 rounded flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span>e-sign — Built by <a href="https://postcabinets.co.jp" className="hover:text-zinc-600">POST CABINETS</a></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/postcabinets-jp/e-sign" className="hover:text-zinc-600">GitHub</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
