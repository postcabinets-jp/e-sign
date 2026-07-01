'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEnvelope(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const sourceFileUrl = formData.get('source_file_url') as string
  const templateId = formData.get('template_id') as string | null
  const expiresAt = formData.get('expires_at') as string | null

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: 'Organization not found' }
  }

  const { data: envelope, error } = await supabase
    .from('envelopes')
    .insert({
      organization_id: membership.organization_id,
      created_by: user.id,
      title,
      source_file_url: sourceFileUrl,
      template_id: templateId || null,
      expires_at: expiresAt || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Log audit event
  await supabase.from('audit_events').insert({
    envelope_id: envelope.id,
    event_type: 'envelope_created',
    actor_user_id: user.id,
    actor_email: user.email,
  })

  revalidatePath('/dashboard')
  redirect(`/dashboard/envelopes/${envelope.id}`)
}

export async function sendEnvelope(envelopeId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Validate envelope exists and belongs to user's org
  const { data: envelope } = await supabase
    .from('envelopes')
    .select('*, signers(*)')
    .eq('id', envelopeId)
    .single()

  if (!envelope) {
    return { error: 'Envelope not found' }
  }

  if (envelope.status !== 'draft') {
    return { error: 'Envelope is not in draft status' }
  }

  if (!envelope.signers || envelope.signers.length === 0) {
    return { error: 'Add at least one signer before sending' }
  }

  const { error } = await supabase
    .from('envelopes')
    .update({ status: 'sent' })
    .eq('id', envelopeId)

  if (error) {
    return { error: error.message }
  }

  // Update first-in-order signers to 'sent' status
  const firstOrderIndex = Math.min(...envelope.signers.map((s: { order_index: number }) => s.order_index))
  await supabase
    .from('signers')
    .update({ status: 'sent' })
    .eq('envelope_id', envelopeId)
    .eq('order_index', firstOrderIndex)

  await supabase.from('audit_events').insert({
    envelope_id: envelopeId,
    event_type: 'envelope_sent',
    actor_user_id: user.id,
    actor_email: user.email,
  })

  revalidatePath(`/dashboard/envelopes/${envelopeId}`)
  revalidatePath('/dashboard')

  return { success: true }
}

export async function voidEnvelope(envelopeId: string, reason: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('envelopes')
    .update({
      status: 'voided',
      voided_at: new Date().toISOString(),
      void_reason: reason,
    })
    .eq('id', envelopeId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('audit_events').insert({
    envelope_id: envelopeId,
    event_type: 'envelope_voided',
    actor_user_id: user.id,
    actor_email: user.email,
    metadata: { reason },
  })

  revalidatePath(`/dashboard/envelopes/${envelopeId}`)
  revalidatePath('/dashboard')

  return { success: true }
}

export async function addSigner(envelopeId: string, signerData: {
  name: string
  email: string
  role?: string
  orderIndex: number
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: signer, error } = await supabase
    .from('signers')
    .insert({
      envelope_id: envelopeId,
      name: signerData.name,
      email: signerData.email,
      role: signerData.role,
      order_index: signerData.orderIndex,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/envelopes/${envelopeId}`)
  return { signer }
}

export async function removeSigner(signerId: string, envelopeId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('signers')
    .delete()
    .eq('id', signerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/envelopes/${envelopeId}`)
  return { success: true }
}
