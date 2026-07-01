'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function getSignerByToken(token: string) {
  const supabase = await createAdminClient()

  const { data: signer } = await supabase
    .from('signers')
    .select(`
      *,
      envelopes (
        id, title, status, source_file_url, expires_at,
        signing_fields (*)
      )
    `)
    .eq('signing_token', token)
    .single()

  return signer
}

export async function markSignerViewed(token: string) {
  const supabase = await createAdminClient()
  const headersList = await headers()

  const { data: signer } = await supabase
    .from('signers')
    .select('id, envelope_id, status, viewed_at')
    .eq('signing_token', token)
    .single()

  if (!signer || signer.viewed_at) return

  await supabase
    .from('signers')
    .update({
      status: 'viewed',
      viewed_at: new Date().toISOString(),
      ip_address: headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip'),
      user_agent: headersList.get('user-agent'),
    })
    .eq('signing_token', token)

  await supabase.from('audit_events').insert({
    envelope_id: signer.envelope_id,
    signer_id: signer.id,
    event_type: 'signer_viewed',
    ip_address: headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip'),
    user_agent: headersList.get('user-agent'),
  })
}

export async function submitSignature(formData: FormData) {
  const supabase = await createAdminClient()
  const headersList = await headers()

  const token = formData.get('token') as string
  const signatureData = formData.get('signature_data') as string

  const { data: signer } = await supabase
    .from('signers')
    .select('id, envelope_id, status, token_expires_at')
    .eq('signing_token', token)
    .single()

  if (!signer) {
    return { error: '署名リンクが無効です' }
  }

  if (signer.status === 'signed') {
    return { error: '既に署名済みです' }
  }

  if (signer.status === 'declined') {
    return { error: 'この文書は辞退済みです' }
  }

  if (new Date(signer.token_expires_at) < new Date()) {
    return { error: '署名リンクの有効期限が切れています' }
  }

  const ipAddress = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  // Save signature image to storage
  let signatureUrl: string | null = null
  if (signatureData) {
    const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '')
    const binaryData = Buffer.from(base64Data, 'base64')
    const fileName = `signatures/${signer.id}/signature-${Date.now()}.png`

    const { data: uploadData } = await supabase.storage
      .from('signatures')
      .upload(fileName, binaryData, { contentType: 'image/png', upsert: true })

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName)
      signatureUrl = urlData.publicUrl
    }
  }

  // Update signer fields
  await supabase
    .from('signing_fields')
    .update({
      value: signatureData,
      file_url: signatureUrl,
      filled_at: new Date().toISOString(),
    })
    .eq('signer_id', signer.id)
    .eq('field_type', 'signature')

  // Mark signer as signed
  await supabase
    .from('signers')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .eq('id', signer.id)

  await supabase.from('audit_events').insert({
    envelope_id: signer.envelope_id,
    signer_id: signer.id,
    event_type: 'signer_signed',
    ip_address: ipAddress,
    user_agent: userAgent,
  })

  // Check if all signers have signed
  const { data: allSigners } = await supabase
    .from('signers')
    .select('status, order_index')
    .eq('envelope_id', signer.envelope_id)

  if (allSigners) {
    const unsigned = allSigners.filter(s => s.status !== 'signed' && s.status !== 'declined')

    if (unsigned.length === 0) {
      // All signed — mark envelope complete
      await supabase
        .from('envelopes')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', signer.envelope_id)

      await supabase.from('audit_events').insert({
        envelope_id: signer.envelope_id,
        event_type: 'envelope_completed',
      })
    } else {
      // Activate next order group
      await supabase
        .from('envelopes')
        .update({ status: 'partial' })
        .eq('id', signer.envelope_id)

      const currentSignerObj = allSigners.find((s) => s.status === 'signed')
      if (currentSignerObj) {
        const nextOrderIndex = Math.min(
          ...unsigned.map((s) => s.order_index)
        )
        await supabase
          .from('signers')
          .update({ status: 'sent' })
          .eq('envelope_id', signer.envelope_id)
          .eq('order_index', nextOrderIndex)
      }
    }
  }

  revalidatePath(`/sign/${token}`)
  return { success: true }
}

export async function declineSigning(token: string, reason: string) {
  const supabase = await createAdminClient()
  const headersList = await headers()

  const { data: signer } = await supabase
    .from('signers')
    .select('id, envelope_id')
    .eq('signing_token', token)
    .single()

  if (!signer) {
    return { error: 'Invalid token' }
  }

  await supabase
    .from('signers')
    .update({
      status: 'declined',
      declined_at: new Date().toISOString(),
      decline_reason: reason,
    })
    .eq('signing_token', token)

  await supabase
    .from('envelopes')
    .update({ status: 'declined' })
    .eq('id', signer.envelope_id)

  await supabase.from('audit_events').insert({
    envelope_id: signer.envelope_id,
    signer_id: signer.id,
    event_type: 'signer_declined',
    ip_address: headersList.get('x-forwarded-for'),
    user_agent: headersList.get('user-agent'),
    metadata: { reason },
  })

  revalidatePath(`/sign/${token}`)
  return { success: true }
}
