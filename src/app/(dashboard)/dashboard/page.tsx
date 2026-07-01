import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EnvelopeStatusBadge } from '@/components/envelopes/status-badge'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const { data: envelopes } = await supabase
    .from('envelopes')
    .select('*, signers(count)')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .limit(20)

  const stats = {
    total: envelopes?.length ?? 0,
    sent: envelopes?.filter(e => ['sent', 'partial'].includes(e.status)).length ?? 0,
    completed: envelopes?.filter(e => e.status === 'completed').length ?? 0,
    draft: envelopes?.filter(e => e.status === 'draft').length ?? 0,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '合計', value: stats.total, icon: FileText, color: 'text-zinc-600' },
          { label: '送信中', value: stats.sent, icon: Clock, color: 'text-amber-600' },
          { label: '完了', value: stats.completed, icon: CheckCircle2, color: 'text-green-600' },
          { label: '下書き', value: stats.draft, icon: AlertCircle, color: 'text-zinc-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-zinc-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Envelopes */}
      <div className="bg-white rounded-xl border border-zinc-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
          <h2 className="text-sm font-semibold text-zinc-900">最近のエンベロープ</h2>
          <Link href="/dashboard/new">
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <Plus className="w-3 h-3" />
              新規作成
            </Button>
          </Link>
        </div>

        {!envelopes || envelopes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-4">まだエンベロープがありません</p>
            <Link href="/dashboard/new">
              <Button size="sm" variant="outline">最初のエンベロープを作成</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {envelopes.map((envelope) => (
              <Link
                key={envelope.id}
                href={`/dashboard/envelopes/${envelope.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-zinc-700">
                      {envelope.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatDistanceToNow(new Date(envelope.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                </div>
                <EnvelopeStatusBadge status={envelope.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
