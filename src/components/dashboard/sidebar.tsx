'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  FileText,
  LayoutDashboard,
  FileStack,
  Settings,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Profile = Database['public']['Tables']['profiles']['Row']
type Membership = Database['public']['Tables']['organization_members']['Row'] & {
  organizations: Database['public']['Tables']['organizations']['Row'] | null
}

interface SidebarProps {
  user: User
  profile: Profile | null
  membership: Membership | null
}

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: 'エンベロープ', href: '/dashboard/envelopes', icon: FileText },
  { name: 'テンプレート', href: '/dashboard/templates', icon: FileStack },
  { name: '設定', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar({ membership }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-zinc-100 shrink-0">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100">
        <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <span className="text-sm font-semibold text-zinc-900 block truncate">e-sign</span>
          <span className="text-xs text-zinc-400 block truncate">
            {membership?.organizations?.name ?? 'My Organization'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <Link href="/dashboard/new">
          <Button size="sm" className="w-full gap-1.5 text-sm">
            <Plus className="w-3.5 h-3.5" />
            新規エンベロープ
          </Button>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <p className="text-xs text-zinc-400 text-center">
          エンベロープ送信は<span className="font-semibold text-zinc-600">無制限</span>
        </p>
      </div>
    </aside>
  )
}
