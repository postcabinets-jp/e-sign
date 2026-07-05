'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createTemplateSchema,
  updateTemplateSchema,
  archiveTemplateSchema,
} from '@/lib/validations'

export async function createTemplate(formData: FormData) {
  const parsed = createTemplateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    source_file_url: formData.get('source_file_url'),
    fields: formData.get('fields') || undefined,
    signer_roles: formData.get('signer_roles') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: 'Organization not found' }
  }

  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      organization_id: membership.organization_id,
      created_by: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      source_file_url: parsed.data.source_file_url,
      fields: parsed.data.fields ? JSON.parse(parsed.data.fields) : [],
      signer_roles: parsed.data.signer_roles ? JSON.parse(parsed.data.signer_roles) : [],
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates')
  redirect(`/dashboard/templates/${template.id}/edit`)
}

export async function updateTemplate(templateId: string, updates: {
  name?: string
  description?: string
  fields?: unknown[]
  signerRoles?: unknown[]
  isPublic?: boolean
}) {
  const parsed = updateTemplateSchema.safeParse({ templateId, updates })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('templates')
    .update({
      name: parsed.data.updates.name,
      description: parsed.data.updates.description,
      fields: parsed.data.updates.fields,
      signer_roles: parsed.data.updates.signerRoles,
      is_public: parsed.data.updates.isPublic,
    })
    .eq('id', parsed.data.templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/templates/${parsed.data.templateId}/edit`)
  revalidatePath('/dashboard/templates')

  return { success: true }
}

export async function archiveTemplate(templateId: string) {
  const parsed = archiveTemplateSchema.safeParse({ templateId })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('templates')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', parsed.data.templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true }
}
