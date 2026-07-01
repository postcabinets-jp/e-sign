'use client'

import { useState } from 'react'
import { sendEnvelope, voidEnvelope } from '@/app/actions/envelopes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, Send, XCircle, Download } from 'lucide-react'

interface EnvelopeActionsProps {
  envelopeId: string
  status: string
  completedFileUrl: string | null
}

export function EnvelopeActions({ envelopeId, status, completedFileUrl }: EnvelopeActionsProps) {
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    setLoading(true)
    await sendEnvelope(envelopeId)
    setLoading(false)
  }

  async function handleVoid() {
    setLoading(true)
    await voidEnvelope(envelopeId, voidReason)
    setVoidDialogOpen(false)
    setLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {status === 'draft' && (
          <Button size="sm" onClick={handleSend} disabled={loading} className="gap-1.5 h-8 text-xs">
            <Send className="w-3 h-3" />
            送信する
          </Button>
        )}
        {completedFileUrl && (
          <a href={completedFileUrl} download>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Download className="w-3 h-3" />
              ダウンロード
            </Button>
          </a>
        )}
        {['draft', 'sent', 'partial'].includes(status) && (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setVoidDialogOpen(true)}
                className="text-red-600 gap-2"
              >
                <XCircle className="w-4 h-4" />
                無効にする
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エンベロープを無効にする</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-zinc-500">
              無効にすると署名者はドキュメントにアクセスできなくなります。この操作は取り消せません。
            </p>
            <div>
              <Label htmlFor="void_reason">無効理由（任意）</Label>
              <Input
                id="void_reason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="例: 内容の修正のため"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleVoid} disabled={loading}>
              無効にする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
