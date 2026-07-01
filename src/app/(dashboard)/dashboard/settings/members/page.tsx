import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const roleLabels: Record<string, string> = {
  owner: 'オーナー',
  admin: '管理者',
  member: 'メンバー',
  viewer: '閲覧のみ',
}

const roleBadgeVariants: Record<string, string> = {
  owner: 'bg-zinc-900 text-white',
  admin: 'bg-blue-100 text-blue-700',
  member: 'bg-zinc-100 text-zinc-600',
  viewer: 'bg-zinc-50 text-zinc-400',
}

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const { data: members } = await supabase
    .from('organization_members')
    .select('*, profiles(*)')
    .eq('organization_id', membership.organization_id)
    .order('invited_at', { ascending: true })

  const canInvite = ['owner', 'admin'].includes(membership.role)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
              <ArrowLeft className="w-3.5 h-3.5" />
              設定
            </Button>
          </Link>
          <h2 className="text-sm font-semibold text-zinc-900">メンバー管理</h2>
        </div>
      </div>

      {canInvite && (
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">メンバーを招待</h3>
          <div className="flex gap-2">
            <Input placeholder="email@company.com" className="flex-1" />
            <Button size="sm" className="gap-1.5 shrink-0">
              <UserPlus className="w-3.5 h-3.5" />
              招待
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-100">
        <div className="px-5 py-4 border-b border-zinc-50">
          <h3 className="text-sm font-semibold text-zinc-900">メンバー ({members?.length ?? 0})</h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {members?.map((member) => {
            const profile = member.profiles as { full_name: string | null } | null
            const initial = profile?.full_name?.[0] ?? '?'

            return (
              <div key={member.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {profile?.full_name ?? '（名前なし）'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {member.joined_at
                        ? `${format(new Date(member.joined_at), 'yyyy年M月d日', { locale: ja })}に参加`
                        : '招待中'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${roleBadgeVariants[member.role] ?? 'bg-zinc-100 text-zinc-600'}`}>
                  {roleLabels[member.role] ?? member.role}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
