import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EnvelopeStatusBadge } from '@/components/envelopes/status-badge'
import { EnvelopeActions } from '@/components/envelopes/envelope-actions'
import { AuditTrail } from '@/components/envelopes/audit-trail'
import { SignerList } from '@/components/envelopes/signer-list'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function EnvelopeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: envelope } = await supabase
    .from('envelopes')
    .select(`
      *,
      signers (*)
    `)
    .eq('id', id)
    .single()

  if (!envelope) notFound()

  const { data: auditEvents } = await supabase
    .from('audit_events')
    .select('*')
    .eq('envelope_id', id)
    .order('created_at', { ascending: true })

  const signers = envelope.signers ?? []
  const signedCount = signers.filter((s: { status: string }) => s.status === 'signed').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/envelopes">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 mb-1">{envelope.title}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span>作成: {format(new Date(envelope.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}</span>
              {envelope.expires_at && (
                <span>期限: {format(new Date(envelope.expires_at), 'yyyy年M月d日', { locale: ja })}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <EnvelopeStatusBadge status={envelope.status} />
            <EnvelopeActions
              envelopeId={id}
              status={envelope.status}
              completedFileUrl={envelope.completed_file_url}
            />
          </div>
        </div>

        {envelope.void_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            無効理由: {envelope.void_reason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Signers */}
          <SignerList
            envelopeId={id}
            signers={signers}
            status={envelope.status}
            signedCount={signedCount}
          />

          {/* Audit Trail */}
          <AuditTrail events={auditEvents ?? []} />
        </div>

        {/* Document sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-100 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">文書</h3>
            <div className="aspect-[3/4] bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center mb-3">
              <p className="text-xs text-zinc-400">PDF プレビュー</p>
            </div>
            <div className="space-y-2">
              <a href={envelope.source_file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  元文書を開く
                </Button>
              </a>
              {envelope.completed_file_url && (
                <a href={envelope.completed_file_url} download>
                  <Button size="sm" className="w-full gap-1.5 text-xs">
                    <Download className="w-3 h-3" />
                    署名済みPDFをDL
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
