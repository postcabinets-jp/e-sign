'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { signOut } from '@/app/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface HeaderProps {
  user: User
  profile: Profile | null
  orgName?: string
}

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/dashboard/envelopes': 'エンベロープ',
  '/dashboard/new': '新規エンベロープ',
  '/dashboard/templates': 'テンプレート',
  '/dashboard/settings': '設定',
  '/dashboard/settings/members': 'メンバー管理',
  '/dashboard/settings/api': 'API・Webhook',
  '/dashboard/settings/billing': 'プラン・請求',
}

export function DashboardHeader({ user, profile }: HeaderProps) {
  const pathname = usePathname()
  const title = breadcrumbMap[pathname] ?? 'ダッシュボード'

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : user.email?.[0].toUpperCase() ?? 'U'

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-zinc-900">{title}</h1>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex items-center gap-2 rounded-lg hover:bg-zinc-50 p-1.5 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-zinc-200 text-zinc-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-zinc-700 hidden sm:block">
                {profile?.full_name ?? user.email?.split('@')[0]}
              </span>
            </button>
          } />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-zinc-500">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/dashboard/settings" className="gap-2 cursor-pointer" />}>
              <Settings className="w-4 h-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href="/dashboard/settings" className="gap-2 cursor-pointer" />}>
              <UserIcon className="w-4 h-4" />
              プロフィール
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<div className="w-full" />}>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex items-center gap-2 w-full text-red-600 text-sm">
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
