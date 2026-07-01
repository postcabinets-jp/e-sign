import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Database } from '@/types/database'

type AuditEvent = Database['public']['Tables']['audit_events']['Row']

const eventLabels: Record<string, string> = {
  envelope_created: 'エンベロープを作成しました',
  envelope_sent: '署名依頼を送信しました',
  envelope_voided: 'エンベロープを無効にしました',
  envelope_completed: '全署名が完了しました',
  signer_email_sent: '署名依頼メールを送信しました',
  signer_viewed: '署名者がドキュメントを閲覧しました',
  signer_signed: '署名者が署名しました',
  signer_declined: '署名者が辞退しました',
  reminder_sent: 'リマインダーを送信しました',
  document_downloaded: 'ドキュメントをダウンロードしました',
}

const eventColors: Record<string, string> = {
  envelope_created: 'bg-zinc-400',
  envelope_sent: 'bg-amber-400',
  envelope_voided: 'bg-red-400',
  envelope_completed: 'bg-green-400',
  signer_email_sent: 'bg-blue-400',
  signer_viewed: 'bg-blue-300',
  signer_signed: 'bg-green-400',
  signer_declined: 'bg-red-400',
  reminder_sent: 'bg-amber-300',
  document_downloaded: 'bg-zinc-300',
}

export function AuditTrail({ events }: { events: AuditEvent[] }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">監査証跡</h3>

      {events.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">イベントはありません</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-zinc-100" />
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-3 relative">
                <div className={`w-[18px] h-[18px] rounded-full shrink-0 mt-0.5 ${eventColors[event.event_type] ?? 'bg-zinc-300'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-700">
                    {eventLabels[event.event_type] ?? event.event_type}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.actor_email && (
                      <span className="text-xs text-zinc-400">{event.actor_email}</span>
                    )}
                    <span className="text-xs text-zinc-300">·</span>
                    <span className="text-xs text-zinc-400">
                      {format(new Date(event.created_at), 'M月d日 HH:mm', { locale: ja })}
                    </span>
                    {event.ip_address && (
                      <>
                        <span className="text-xs text-zinc-300">·</span>
                        <span className="text-xs text-zinc-400 font-mono">{event.ip_address}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
