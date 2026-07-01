import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, Key, CreditCard, Building2 } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const org = membership?.organizations

  const settingsLinks = [
    { href: '/dashboard/settings/members', icon: Users, label: 'メンバー管理', description: 'チームメンバーの招待・権限管理' },
    { href: '/dashboard/settings/api', icon: Key, label: 'API・Webhook', description: 'APIキーの発行とWebhook設定' },
    { href: '/dashboard/settings/billing', icon: CreditCard, label: 'プラン・請求', description: '現在のプランと請求情報の確認' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Organization Settings */}
      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900">組織設定</h3>
          {org && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {org.plan === 'free' ? 'フリー' : org.plan === 'pro' ? 'Pro' : 'Enterprise'}
            </Badge>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <Label>組織名</Label>
            <Input defaultValue={org?.name ?? ''} className="mt-1" readOnly />
          </div>
          <div>
            <Label>スラッグ (URL)</Label>
            <Input defaultValue={org?.slug ?? ''} className="mt-1" readOnly />
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-5">プロフィール</h3>
        <div className="space-y-4">
          <div>
            <Label>氏名</Label>
            <Input defaultValue={profile?.full_name ?? ''} className="mt-1" />
          </div>
          <div>
            <Label>メールアドレス</Label>
            <Input defaultValue={user.email ?? ''} className="mt-1" readOnly />
          </div>
          <Button size="sm">保存</Button>
        </div>
      </div>

      {/* Setting Links */}
      <div className="grid grid-cols-1 gap-3">
        {settingsLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-zinc-100 p-5 flex items-center gap-4 hover:bg-zinc-50 transition-colors group"
          >
            <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{item.label}</p>
              <p className="text-xs text-zinc-400">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
