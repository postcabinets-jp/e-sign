'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const sourceFileUrl = formData.get('source_file_url') as string
  const fieldsJson = formData.get('fields') as string
  const signerRolesJson = formData.get('signer_roles') as string

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
      name,
      description,
      source_file_url: sourceFileUrl,
      fields: fieldsJson ? JSON.parse(fieldsJson) : [],
      signer_roles: signerRolesJson ? JSON.parse(signerRolesJson) : [],
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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('templates')
    .update({
      name: updates.name,
      description: updates.description,
      fields: updates.fields,
      signer_roles: updates.signerRoles,
      is_public: updates.isPublic,
    })
    .eq('id', templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/templates/${templateId}/edit`)
  revalidatePath('/dashboard/templates')

  return { success: true }
}

export async function archiveTemplate(templateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('templates')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true }
}
