import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-zinc-900">e-sign</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">ログイン</h1>
          <p className="text-zinc-500 mt-1">アカウントにサインインしてください</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
          <LoginForm />
          <p className="text-center text-sm text-zinc-500 mt-6">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-zinc-900 font-medium hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
