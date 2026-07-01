import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EnvelopeStatusBadge } from '@/components/envelopes/status-badge'
import { Plus, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TabStatus = 'all' | 'draft' | 'sent' | 'partial' | 'completed' | 'voided'

export default async function EnvelopesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const statusFilter = (params.status ?? 'all') as TabStatus

  let query = supabase
    .from('envelopes')
    .select('*, signers(id, status, name, email)')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    if (statusFilter === 'sent') {
      query = query.in('status', ['sent', 'partial'])
    } else {
      query = query.eq('status', statusFilter)
    }
  }

  const { data: envelopes } = await query

  const tabs: { value: TabStatus; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'sent', label: '送信中' },
    { value: 'completed', label: '完了' },
    { value: 'draft', label: '下書き' },
    { value: 'voided', label: '無効' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">エンベロープ</h2>
        <Link href="/dashboard/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100">
        <div className="px-5 pt-4">
          <div className="flex gap-1 border-b border-zinc-100">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/dashboard/envelopes?status=${tab.value}`}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  statusFilter === tab.value
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {!envelopes || envelopes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-4">エンベロープがありません</p>
            <Link href="/dashboard/new">
              <Button size="sm" variant="outline">新規エンベロープを作成</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {envelopes.map((envelope) => {
              const signers = envelope.signers ?? []
              const signedCount = signers.filter((s: { status: string }) => s.status === 'signed').length

              return (
                <Link
                  key={envelope.id}
                  href={`/dashboard/envelopes/${envelope.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {envelope.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-zinc-400">
                          {formatDistanceToNow(new Date(envelope.created_at), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                        {signers.length > 0 && (
                          <span className="text-xs text-zinc-400">
                            署名者 {signedCount}/{signers.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <EnvelopeStatusBadge status={envelope.status} />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
