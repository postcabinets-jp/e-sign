import Link from 'next/link'
import { CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSignerByToken } from '@/app/actions/signing'

export default async function SigningCompletePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const signer = await getSignerByToken(token)

  const envelope = signer?.envelopes as {
    completed_file_url?: string | null
    title?: string
  } | null

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center mx-auto mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-2">署名完了</h1>
          <p className="text-zinc-500 text-sm mb-6">
            全員の署名が完了しました。完了した文書をダウンロードいただけます。
          </p>

          {envelope?.completed_file_url && (
            <a href={envelope.completed_file_url} download className="block mb-3">
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                署名済みPDFをダウンロード
              </Button>
            </a>
          )}

          <p className="text-xs text-zinc-400 mt-4">
            このリンクは後でもアクセスできます。メールをご確認ください。
          </p>
        </div>
      </div>
    </div>
  )
}
