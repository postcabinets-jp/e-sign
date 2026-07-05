'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createEnvelopeSchema,
  sendEnvelopeSchema,
  voidEnvelopeSchema,
  addSignerSchema,
  removeSignerSchema,
} from '@/lib/validations'

export async function createEnvelope(formData: FormData) {
  const parsed = createEnvelopeSchema.safeParse({
    title: formData.get('title'),
    source_file_url: formData.get('source_file_url'),
    template_id: formData.get('template_id') || null,
    expires_at: formData.get('expires_at') || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
      title: parsed.data.title,
      source_file_url: parsed.data.source_file_url,
      template_id: parsed.data.template_id ?? null,
      expires_at: parsed.data.expires_at ?? null,
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
  const parsed = sendEnvelopeSchema.safeParse({ envelopeId })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Validate envelope exists and belongs to user's org
  const { data: envelope } = await supabase
    .from('envelopes')
    .select('*, signers(*)')
    .eq('id', parsed.data.envelopeId)
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
    .eq('id', parsed.data.envelopeId)

  if (error) {
    return { error: error.message }
  }

  // Update first-in-order signers to 'sent' status
  const firstOrderIndex = Math.min(...envelope.signers.map((s: { order_index: number }) => s.order_index))
  await supabase
    .from('signers')
    .update({ status: 'sent' })
    .eq('envelope_id', parsed.data.envelopeId)
    .eq('order_index', firstOrderIndex)

  await supabase.from('audit_events').insert({
    envelope_id: parsed.data.envelopeId,
    event_type: 'envelope_sent',
    actor_user_id: user.id,
    actor_email: user.email,
  })

  revalidatePath(`/dashboard/envelopes/${parsed.data.envelopeId}`)
  revalidatePath('/dashboard')

  return { success: true }
}

export async function voidEnvelope(envelopeId: string, reason: string) {
  const parsed = voidEnvelopeSchema.safeParse({ envelopeId, reason })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('envelopes')
    .update({
      status: 'voided',
      voided_at: new Date().toISOString(),
      void_reason: parsed.data.reason,
    })
    .eq('id', parsed.data.envelopeId)

  if (error) {
    return { error: error.message }
  }

  await supabase.from('audit_events').insert({
    envelope_id: parsed.data.envelopeId,
    event_type: 'envelope_voided',
    actor_user_id: user.id,
    actor_email: user.email,
    metadata: { reason: parsed.data.reason },
  })

  revalidatePath(`/dashboard/envelopes/${parsed.data.envelopeId}`)
  revalidatePath('/dashboard')

  return { success: true }
}

export async function addSigner(envelopeId: string, signerData: {
  name: string
  email: string
  role?: string
  orderIndex: number
}) {
  const parsed = addSignerSchema.safeParse({ envelopeId, signerData })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: signer, error } = await supabase
    .from('signers')
    .insert({
      envelope_id: parsed.data.envelopeId,
      name: parsed.data.signerData.name,
      email: parsed.data.signerData.email,
      role: parsed.data.signerData.role,
      order_index: parsed.data.signerData.orderIndex,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/envelopes/${parsed.data.envelopeId}`)
  return { signer }
}

export async function removeSigner(signerId: string, envelopeId: string) {
  const parsed = removeSignerSchema.safeParse({ signerId, envelopeId })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('signers')
    .delete()
    .eq('id', parsed.data.signerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/envelopes/${parsed.data.envelopeId}`)
  return { success: true }
}
