'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTemplate } from '@/app/actions/templates'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewTemplatePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
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
    setFile(selected)
    setError(null)
    if (!name) setName(selected.name.replace(/\.pdf$/i, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !name) return
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const fileName = `templates/${user.id}/${Date.now()}-${file.name}`
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
      formData.set('name', name)
      formData.set('description', description)
      formData.set('source_file_url', urlData.publicUrl)
      formData.set('fields', '[]')
      formData.set('signer_roles', '[]')

      await createTemplate(formData)
    } catch {
      setError('エラーが発生しました')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/templates">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            戻る
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">新規テンプレート</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">PDFをアップロード</h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
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

        <div className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">テンプレート情報</h2>
          <div>
            <Label>テンプレート名</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 秘密保持契約書（NDA）" required className="mt-1" />
          </div>
          <div>
            <Label>説明（任意）</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="このテンプレートの用途を簡単に記入" rows={2} className="mt-1" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/templates"><Button type="button" variant="outline">キャンセル</Button></Link>
          <Button type="submit" disabled={!file || !name || uploading} className="gap-2">
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? '作成中...' : 'テンプレートを作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
