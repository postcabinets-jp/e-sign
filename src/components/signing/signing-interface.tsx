'use client'

import { useState, useRef, useEffect } from 'react'
import { submitSignature, declineSigning } from '@/app/actions/signing'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Pen, RotateCcw, XCircle } from 'lucide-react'

interface SigningInterfaceProps {
  token: string
  signer: {
    id: string
    name: string
    email: string
    status: string
  }
  envelope: {
    id: string
    title: string
    source_file_url: string
  }
}

export function SigningInterface({ token, signer, envelope }: SigningInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setDrawing(true)
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasSignature(true)
  }

  function stopDrawing() {
    setDrawing(false)
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  async function handleSubmit() {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    setSubmitting(true)
    setError(null)

    const signatureData = canvas.toDataURL('image/png')
    const formData = new FormData()
    formData.set('token', token)
    formData.set('signature_data', signatureData)

    const result = await submitSignature(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    setSubmitted(true)
  }

  async function handleDecline() {
    setSubmitting(true)
    const result = await declineSigning(token, declineReason)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    setDeclineDialogOpen(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">署名が完了しました</h2>
        <p className="text-sm text-zinc-500">
          署名が記録されました。完了後に送信者から確認のメールが届きます。
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Document Preview */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">文書の確認</h3>
        <div className="aspect-[3/4] bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center">
          <iframe
            src={`${envelope.source_file_url}#toolbar=0`}
            className="w-full h-full rounded-lg"
            title="Document to sign"
          />
        </div>
      </div>

      {/* Signature Canvas */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">署名</h3>
        <p className="text-xs text-zinc-400 mb-4">以下の枠内にサインしてください</p>

        <div className="border-2 border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 mb-3">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={clearSignature}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            クリア
          </button>
          {!hasSignature && (
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              <Pen className="w-3 h-3" />
              マウスまたは指でサイン
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={!hasSignature || submitting}
            className="w-full"
          >
            {submitting ? '送信中...' : '署名して送信'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDeclineDialogOpen(true)}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-sm"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            署名を辞退する
          </Button>
        </div>
      </div>

      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>署名を辞退する</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-zinc-500">辞退の理由を入力してください（任意）。送信者に通知されます。</p>
            <div>
              <Label>辞退理由</Label>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="例: 内容の確認が必要なため"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDecline} disabled={submitting}>
              辞退する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
