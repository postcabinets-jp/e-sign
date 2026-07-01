import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TemplateEditor } from '@/components/templates/template-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function TemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (!template) notFound()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/templates">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-zinc-500">
            <ArrowLeft className="w-3.5 h-3.5" />
            テンプレート一覧
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900 truncate">{template.name}</h1>
      </div>

      <TemplateEditor template={template} />
    </div>
  )
}
