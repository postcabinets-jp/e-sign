import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Key } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function ApiSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            設定
          </Button>
        </Link>
        <h2 className="text-sm font-semibold text-zinc-900">API・Webhook</h2>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-zinc-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
          <h3 className="text-sm font-semibold text-zinc-900">APIキー</h3>
          <Button size="sm" className="gap-1.5 h-7 text-xs">
            <Plus className="w-3 h-3" />
            発行
          </Button>
        </div>

        {!apiKeys || apiKeys.length === 0 ? (
          <div className="text-center py-10">
            <Key className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">APIキーがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{key.name}</p>
                  <p className="font-mono text-xs text-zinc-400">{key.key_prefix}••••••••</p>
                  <p className="text-xs text-zinc-400">
                    作成: {format(new Date(key.created_at), 'yyyy/M/d', { locale: ja })}
                    {key.last_used_at && ` · 最終使用: ${format(new Date(key.last_used_at), 'yyyy/M/d', { locale: ja })}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                  失効
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border border-zinc-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
          <h3 className="text-sm font-semibold text-zinc-900">Webhook</h3>
          <Button size="sm" className="gap-1.5 h-7 text-xs">
            <Plus className="w-3 h-3" />
            追加
          </Button>
        </div>

        {!webhooks || webhooks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-zinc-400">Webhookが設定されていません</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-mono text-sm text-zinc-900 truncate max-w-xs">{webhook.url}</p>
                  <div className="flex gap-1 mt-1">
                    {webhook.events.map((event: string) => (
                      <span key={event} className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md ${webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                  {webhook.is_active ? '有効' : '無効'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
