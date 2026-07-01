'use client'

import { useState } from 'react'
import { addSigner, removeSigner } from '@/app/actions/envelopes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Clock, Mail, Trash2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Database } from '@/types/database'

type Signer = Database['public']['Tables']['signers']['Row']

const signerStatusConfig = {
  pending: { label: '未送信', icon: Clock, className: 'text-zinc-400' },
  sent: { label: '送信済み', icon: Mail, className: 'text-amber-500' },
  viewed: { label: '閲覧済み', icon: Clock, className: 'text-blue-500' },
  signed: { label: '署名済み', icon: CheckCircle2, className: 'text-green-500' },
  declined: { label: '辞退', icon: Clock, className: 'text-red-500' },
}

interface SignerListProps {
  envelopeId: string
  signers: Signer[]
  status: string
  signedCount: number
}

export function SignerList({ envelopeId, signers, status, signedCount }: SignerListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const canModify = status === 'draft'

  async function handleAdd() {
    if (!name || !email) return
    setLoading(true)
    await addSigner(envelopeId, {
      name,
      email,
      orderIndex: signers.length,
    })
    setName('')
    setEmail('')
    setShowAddForm(false)
    setLoading(false)
  }

  async function handleRemove(signerId: string) {
    await removeSigner(signerId, envelopeId)
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          署名者
          {signers.length > 0 && (
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {signedCount}/{signers.length}
            </span>
          )}
        </h3>
        {canModify && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-7 text-xs"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus className="w-3 h-3" />
            追加
          </Button>
        )}
      </div>

      {signers.length === 0 && !showAddForm && (
        <p className="text-sm text-zinc-400 text-center py-4">
          署名者が設定されていません
        </p>
      )}

      <div className="space-y-2">
        {signers.map((signer, i) => {
          const statusInfo = signerStatusConfig[signer.status] ?? signerStatusConfig.pending
          const StatusIcon = statusInfo.icon

          return (
            <div
              key={signer.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600 shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{signer.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{signer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn('flex items-center gap-1 text-xs', statusInfo.className)}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusInfo.label}</span>
                  {signer.signed_at && (
                    <span className="text-zinc-400">
                      · {formatDistanceToNow(new Date(signer.signed_at), { addSuffix: true, locale: ja })}
                    </span>
                  )}
                </div>
                {canModify && (
                  <button
                    onClick={() => handleRemove(signer.id)}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAddForm && (
        <div className="mt-3 p-3 border border-zinc-100 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">名前</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="田中 健一"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">メール</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanaka@company.jp"
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>
              キャンセル
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleAdd} disabled={loading || !name || !email}>
              追加
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
