import { notFound } from 'next/navigation'
import { getSignerByToken, markSignerViewed } from '@/app/actions/signing'
import { SigningInterface } from '@/components/signing/signing-interface'

export default async function SigningPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const signer = await getSignerByToken(token)

  if (!signer) {
    notFound()
  }

  // Token expiry check
  if (new Date(signer.token_expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-100 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">リンクの有効期限が切れています</h2>
          <p className="text-sm text-zinc-500">署名リンクの有効期限が切れました。送信者に新しいリンクを発行してもらってください。</p>
        </div>
      </div>
    )
  }

  if (signer.status === 'signed') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-100 p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">署名済みです</h2>
          <p className="text-sm text-zinc-500">このドキュメントは既に署名されています。</p>
        </div>
      </div>
    )
  }

  const envelope = signer.envelopes as {
    id: string
    title: string
    status: string
    source_file_url: string
    expires_at: string | null
  } | null

  if (!envelope || ['voided', 'expired', 'declined'].includes(envelope.status)) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-100 p-8 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">このドキュメントは無効です</h2>
          <p className="text-sm text-zinc-500">このエンベロープは無効化されているか、期限切れです。</p>
        </div>
      </div>
    )
  }

  // Mark as viewed
  await markSignerViewed(token)

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-900">e-sign</span>
        </div>
        <p className="text-sm text-zinc-500 hidden sm:block">
          {signer.name} 様 — 署名をお願いします
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-zinc-900">{envelope.title}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {signer.name} ({signer.email}) — 署名が必要です
          </p>
        </div>

        <SigningInterface
          token={token}
          signer={signer}
          envelope={envelope}
        />
      </div>
    </div>
  )
}
