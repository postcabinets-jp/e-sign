import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Infinity } from 'lucide-react'

const plans = [
  {
    name: 'フリー（セルフホスト）',
    price: '無料',
    description: '自分のサーバーでホスティング',
    features: [
      'エンベロープ無制限',
      'テンプレート無制限',
      'API・Webhook',
      'Docker対応',
      'コミュニティサポート',
    ],
    id: 'free',
  },
  {
    name: 'Pro（クラウド）',
    price: '$9 / mo',
    description: 'マネージドクラウドサービス',
    features: [
      'エンベロープ無制限',
      'テンプレート無制限',
      'API・Webhook',
      'カスタムブランド',
      'メールサポート',
      'SLA 99.9%',
    ],
    id: 'pro',
  },
]

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const currentPlan = membership.organizations?.plan ?? 'free'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            設定
          </Button>
        </Link>
        <h2 className="text-sm font-semibold text-zinc-900">プラン・請求</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Infinity className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">エンベロープ送信は全プランで無制限</p>
          <p className="text-xs text-amber-600 mt-0.5">
            DocuSignのような送信数上限・超過課金は一切ありません。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 ${isCurrentPlan ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-100 bg-white'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{plan.description}</p>
                </div>
                {isCurrentPlan && (
                  <span className="text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-md">現在</span>
                )}
              </div>
              <p className="text-2xl font-bold text-zinc-900 mb-4">{plan.price}</p>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-zinc-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!isCurrentPlan && (
                <Button size="sm" variant="outline" className="w-full text-xs">
                  このプランへ変更
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
