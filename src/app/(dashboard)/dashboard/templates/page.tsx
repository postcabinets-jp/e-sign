import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, FileStack, Edit, Archive } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/login')

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">テンプレート</h2>
        <Link href="/dashboard/templates/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100">
        {!templates || templates.length === 0 ? (
          <div className="text-center py-16">
            <FileStack className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-4">テンプレートがありません</p>
            <Link href="/dashboard/templates/new">
              <Button size="sm" variant="outline">最初のテンプレートを作成</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileStack className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{template.name}</p>
                    <p className="text-xs text-zinc-400">
                      {template.description
                        ? template.description.slice(0, 60) + (template.description.length > 60 ? '...' : '')
                        : format(new Date(template.created_at), 'yyyy年M月d日', { locale: ja })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/dashboard/templates/${template.id}/edit`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                      <Edit className="w-3 h-3" />
                      編集
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
