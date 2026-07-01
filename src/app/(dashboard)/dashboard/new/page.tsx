'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createEnvelope } from '@/app/actions/envelopes'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewEnvelopePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.type !== 'application/pdf') {
      setError('PDFファイルのみアップロードできます')
      return
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError('ファイルサイズは50MB以下にしてください')
      return
    }
    setFile(selected)
    setError(null)
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) {
        setError(`アップロード失敗: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path)

      const formData = new FormData()
      formData.set('title', title)
      formData.set('source_file_url', urlData.publicUrl)

      await createEnvelope(formData)
    } catch (err) {
      setError('エラーが発生しました。再試行してください。')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            戻る
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">新規エンベロープ</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PDF Upload */}
        <div className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">1. PDFファイルをアップロード</h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? 'border-zinc-300 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-zinc-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-900">{file.name}</p>
                  <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-700 mb-1">クリックしてPDFをアップロード</p>
                <p className="text-xs text-zinc-400">PDF形式、最大50MB</p>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">2. エンベロープのタイトル</h2>
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 株式会社〇〇様 秘密保持契約書 2026年7月"
              required
              className="mt-1"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/dashboard">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
          <Button
            type="submit"
            disabled={!file || !title || uploading}
            className="gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? '作成中...' : '作成して続ける'}
          </Button>
        </div>
      </form>
    </div>
  )
}
