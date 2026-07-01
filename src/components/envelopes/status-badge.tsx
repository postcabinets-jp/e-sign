import { cn } from '@/lib/utils'

type EnvelopeStatus = 'draft' | 'sent' | 'partial' | 'completed' | 'declined' | 'voided' | 'expired'

const statusConfig: Record<EnvelopeStatus, { label: string; className: string }> = {
  draft: { label: '下書き', className: 'bg-zinc-100 text-zinc-500' },
  sent: { label: '送信済み', className: 'bg-amber-100 text-amber-700' },
  partial: { label: '署名中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', className: 'bg-green-100 text-green-700' },
  declined: { label: '辞退', className: 'bg-red-100 text-red-700' },
  voided: { label: '無効', className: 'bg-zinc-100 text-zinc-400' },
  expired: { label: '期限切れ', className: 'bg-orange-100 text-orange-700' },
}

export function EnvelopeStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as EnvelopeStatus] ?? statusConfig.draft

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium shrink-0',
      config.className
    )}>
      {config.label}
    </span>
  )
}
