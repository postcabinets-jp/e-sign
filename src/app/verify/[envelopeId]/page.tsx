import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ envelopeId: string }>
}) {
  const { envelopeId } = await params
  const supabase = await createAdminClient()

  const { data: envelope } = await supabase
    .from('envelopes')
    .select(`
      id, title, status, completed_at, created_at,
      signers (id, name, email, status, signed_at, ip_address),
      audit_events (event_type, created_at, actor_email)
    `)
    .eq('id', envelopeId)
    .single()

  if (!envelope) notFound()

  const isCompleted = envelope.status === 'completed'
  const signers = envelope.signers ?? []

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-900">e-sign 署名検証</span>
          </div>
          <p className="text-xs text-zinc-400">このページはドキュメントの署名状態を公開確認するためのものです</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 ${isCompleted ? 'bg-green-50' : 'bg-zinc-50'}`}>
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
              ) : (
                <Clock className="w-8 h-8 text-amber-500 shrink-0" />
              )}
              <div>
                <h1 className="text-lg font-bold text-zinc-900">{envelope.title}</h1>
                <p className={`text-sm ${isCompleted ? 'text-green-700' : 'text-amber-700'}`}>
                  {isCompleted ? '全署名が完了・検証済みです' : '署名進行中'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Envelope Info */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">文書情報</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">エンベロープID</span>
                  <span className="font-mono text-xs text-zinc-700">{envelope.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">作成日時</span>
                  <span className="text-zinc-700">
                    {format(new Date(envelope.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                  </span>
                </div>
                {envelope.completed_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">完了日時</span>
                    <span className="text-zinc-700">
                      {format(new Date(envelope.completed_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Signers */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">署名者</h3>
              <div className="space-y-2">
                {signers.map((signer: {
                  id: string
                  name: string
                  email: string
                  status: string
                  signed_at: string | null
                  ip_address: string | null
                }) => (
                  <div key={signer.id} className="flex items-start justify-between p-3 bg-zinc-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{signer.name}</p>
                      <p className="text-xs text-zinc-400">{signer.email}</p>
                      {signer.signed_at && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          署名: {format(new Date(signer.signed_at), 'yyyy/M/d HH:mm', { locale: ja })}
                          {signer.ip_address && ` · ${signer.ip_address}`}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium shrink-0 ${
                      signer.status === 'signed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {signer.status === 'signed' ? '署名済み' : '未署名'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
