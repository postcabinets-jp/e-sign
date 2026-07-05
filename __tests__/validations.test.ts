import { describe, it, expect } from 'vitest'
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  createEnvelopeSchema,
  sendEnvelopeSchema,
  voidEnvelopeSchema,
  addSignerSchema,
  removeSignerSchema,
  getSignerByTokenSchema,
  markSignerViewedSchema,
  submitSignatureSchema,
  declineSigningSchema,
  createTemplateSchema,
  updateTemplateSchema,
  archiveTemplateSchema,
} from '@/lib/validations'

// ─── Helpers ──────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const INVALID_UUID = 'not-a-uuid'
const VALID_EMAIL = 'test@example.com'
const INVALID_EMAIL = 'not-an-email'
const VALID_URL = 'https://example.com/file.pdf'
const VALID_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'

function expectSuccess(schema: { safeParse: (v: unknown) => { success: boolean } }, data: unknown) {
  const result = schema.safeParse(data)
  expect(result.success).toBe(true)
}

function expectFailure(schema: { safeParse: (v: unknown) => { success: boolean } }, data: unknown) {
  const result = schema.safeParse(data)
  expect(result.success).toBe(false)
}

// ─── signInSchema ─────────────────────────────────────────────

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    expectSuccess(signInSchema, { email: VALID_EMAIL, password: 'x' })
  })

  it('rejects missing email', () => {
    expectFailure(signInSchema, { password: 'x' })
  })

  it('rejects missing password', () => {
    expectFailure(signInSchema, { email: VALID_EMAIL })
  })

  it('rejects invalid email', () => {
    expectFailure(signInSchema, { email: INVALID_EMAIL, password: 'x' })
  })

  it('rejects empty password', () => {
    expectFailure(signInSchema, { email: VALID_EMAIL, password: '' })
  })

  it('accepts password of length 1 (sign-in only requires min 1)', () => {
    expectSuccess(signInSchema, { email: VALID_EMAIL, password: 'a' })
  })
})

// ─── signUpSchema ─────────────────────────────────────────────

describe('signUpSchema', () => {
  const valid = {
    email: VALID_EMAIL,
    password: 'secureP4ss',
    full_name: 'Taro Yamada',
    org_name: 'Acme Corp',
  }

  it('accepts valid input', () => {
    expectSuccess(signUpSchema, valid)
  })

  it('rejects password shorter than 8 chars', () => {
    expectFailure(signUpSchema, { ...valid, password: 'short' })
  })

  it('rejects password longer than 128 chars', () => {
    expectFailure(signUpSchema, { ...valid, password: 'a'.repeat(129) })
  })

  it('accepts password of exactly 8 chars', () => {
    expectSuccess(signUpSchema, { ...valid, password: '12345678' })
  })

  it('accepts password of exactly 128 chars', () => {
    expectSuccess(signUpSchema, { ...valid, password: 'a'.repeat(128) })
  })

  it('rejects empty full_name', () => {
    expectFailure(signUpSchema, { ...valid, full_name: '' })
  })

  it('rejects full_name over 200 chars', () => {
    expectFailure(signUpSchema, { ...valid, full_name: 'a'.repeat(201) })
  })

  it('accepts full_name of exactly 200 chars', () => {
    expectSuccess(signUpSchema, { ...valid, full_name: 'a'.repeat(200) })
  })

  it('rejects empty org_name', () => {
    expectFailure(signUpSchema, { ...valid, org_name: '' })
  })

  it('rejects org_name over 200 chars', () => {
    expectFailure(signUpSchema, { ...valid, org_name: 'a'.repeat(201) })
  })

  it('rejects missing email', () => {
    expectFailure(signUpSchema, { password: 'secureP4ss', full_name: 'A', org_name: 'B' })
  })

  it('rejects invalid email', () => {
    expectFailure(signUpSchema, { ...valid, email: INVALID_EMAIL })
  })
})

// ─── resetPasswordSchema ──────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expectSuccess(resetPasswordSchema, { email: VALID_EMAIL })
  })

  it('rejects missing email', () => {
    expectFailure(resetPasswordSchema, {})
  })

  it('rejects invalid email', () => {
    expectFailure(resetPasswordSchema, { email: INVALID_EMAIL })
  })
})

// ─── createEnvelopeSchema ─────────────────────────────────────

describe('createEnvelopeSchema', () => {
  const valid = {
    title: 'NDA Agreement',
    source_file_url: VALID_URL,
  }

  it('accepts valid input with required fields only', () => {
    expectSuccess(createEnvelopeSchema, valid)
  })

  it('accepts with optional template_id as uuid', () => {
    expectSuccess(createEnvelopeSchema, { ...valid, template_id: VALID_UUID })
  })

  it('accepts with template_id as null', () => {
    expectSuccess(createEnvelopeSchema, { ...valid, template_id: null })
  })

  it('accepts with expires_at as ISO datetime', () => {
    expectSuccess(createEnvelopeSchema, {
      ...valid,
      expires_at: '2026-12-31T23:59:59+09:00',
    })
  })

  it('accepts with expires_at as null', () => {
    expectSuccess(createEnvelopeSchema, { ...valid, expires_at: null })
  })

  it('rejects empty title', () => {
    expectFailure(createEnvelopeSchema, { ...valid, title: '' })
  })

  it('rejects title over 500 chars', () => {
    expectFailure(createEnvelopeSchema, { ...valid, title: 'a'.repeat(501) })
  })

  it('accepts title of exactly 500 chars', () => {
    expectSuccess(createEnvelopeSchema, { ...valid, title: 'a'.repeat(500) })
  })

  it('rejects invalid source_file_url', () => {
    expectFailure(createEnvelopeSchema, { ...valid, source_file_url: 'not-a-url' })
  })

  it('rejects missing title', () => {
    expectFailure(createEnvelopeSchema, { source_file_url: VALID_URL })
  })

  it('rejects missing source_file_url', () => {
    expectFailure(createEnvelopeSchema, { title: 'NDA' })
  })

  it('rejects invalid template_id (not uuid)', () => {
    expectFailure(createEnvelopeSchema, { ...valid, template_id: INVALID_UUID })
  })

  it('rejects invalid expires_at format', () => {
    expectFailure(createEnvelopeSchema, { ...valid, expires_at: 'next-tuesday' })
  })
})

// ─── sendEnvelopeSchema ───────────────────────────────────────

describe('sendEnvelopeSchema', () => {
  it('accepts valid uuid', () => {
    expectSuccess(sendEnvelopeSchema, { envelopeId: VALID_UUID })
  })

  it('rejects invalid uuid', () => {
    expectFailure(sendEnvelopeSchema, { envelopeId: INVALID_UUID })
  })

  it('rejects missing envelopeId', () => {
    expectFailure(sendEnvelopeSchema, {})
  })
})

// ─── voidEnvelopeSchema ───────────────────────────────────────

describe('voidEnvelopeSchema', () => {
  const valid = { envelopeId: VALID_UUID, reason: 'Sent to wrong person' }

  it('accepts valid input', () => {
    expectSuccess(voidEnvelopeSchema, valid)
  })

  it('rejects invalid envelopeId', () => {
    expectFailure(voidEnvelopeSchema, { ...valid, envelopeId: INVALID_UUID })
  })

  it('rejects empty reason', () => {
    expectFailure(voidEnvelopeSchema, { ...valid, reason: '' })
  })

  it('rejects reason over 2000 chars', () => {
    expectFailure(voidEnvelopeSchema, { ...valid, reason: 'x'.repeat(2001) })
  })

  it('accepts reason of exactly 2000 chars', () => {
    expectSuccess(voidEnvelopeSchema, { ...valid, reason: 'x'.repeat(2000) })
  })

  it('rejects missing envelopeId', () => {
    expectFailure(voidEnvelopeSchema, { reason: 'Oops' })
  })

  it('rejects missing reason', () => {
    expectFailure(voidEnvelopeSchema, { envelopeId: VALID_UUID })
  })
})

// ─── addSignerSchema ──────────────────────────────────────────

describe('addSignerSchema', () => {
  const valid = {
    envelopeId: VALID_UUID,
    signerData: {
      name: 'Hanako Sato',
      email: VALID_EMAIL,
      orderIndex: 0,
    },
  }

  it('accepts valid input without optional role', () => {
    expectSuccess(addSignerSchema, valid)
  })

  it('accepts valid input with role', () => {
    expectSuccess(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, role: 'CEO' },
    })
  })

  it('rejects invalid envelopeId', () => {
    expectFailure(addSignerSchema, { ...valid, envelopeId: INVALID_UUID })
  })

  it('rejects empty signer name', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, name: '' },
    })
  })

  it('rejects signer name over 200 chars', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, name: 'a'.repeat(201) },
    })
  })

  it('accepts signer name of exactly 200 chars', () => {
    expectSuccess(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, name: 'a'.repeat(200) },
    })
  })

  it('rejects invalid signer email', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, email: INVALID_EMAIL },
    })
  })

  it('rejects negative orderIndex', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, orderIndex: -1 },
    })
  })

  it('rejects non-integer orderIndex', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, orderIndex: 1.5 },
    })
  })

  it('accepts orderIndex of 0', () => {
    expectSuccess(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, orderIndex: 0 },
    })
  })

  it('rejects role over 100 chars', () => {
    expectFailure(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, role: 'x'.repeat(101) },
    })
  })

  it('accepts role of exactly 100 chars', () => {
    expectSuccess(addSignerSchema, {
      ...valid,
      signerData: { ...valid.signerData, role: 'x'.repeat(100) },
    })
  })

  it('rejects missing signerData', () => {
    expectFailure(addSignerSchema, { envelopeId: VALID_UUID })
  })

  it('rejects missing orderIndex in signerData', () => {
    expectFailure(addSignerSchema, {
      envelopeId: VALID_UUID,
      signerData: { name: 'Test', email: VALID_EMAIL },
    })
  })
})

// ─── removeSignerSchema ───────────────────────────────────────

describe('removeSignerSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(removeSignerSchema, {
      signerId: VALID_UUID,
      envelopeId: VALID_UUID,
    })
  })

  it('rejects invalid signerId', () => {
    expectFailure(removeSignerSchema, {
      signerId: INVALID_UUID,
      envelopeId: VALID_UUID,
    })
  })

  it('rejects invalid envelopeId', () => {
    expectFailure(removeSignerSchema, {
      signerId: VALID_UUID,
      envelopeId: INVALID_UUID,
    })
  })

  it('rejects missing signerId', () => {
    expectFailure(removeSignerSchema, { envelopeId: VALID_UUID })
  })

  it('rejects missing envelopeId', () => {
    expectFailure(removeSignerSchema, { signerId: VALID_UUID })
  })
})

// ─── getSignerByTokenSchema ──────────────────────────────────

describe('getSignerByTokenSchema', () => {
  it('accepts valid uuid token', () => {
    expectSuccess(getSignerByTokenSchema, { token: VALID_UUID })
  })

  it('rejects invalid token', () => {
    expectFailure(getSignerByTokenSchema, { token: INVALID_UUID })
  })

  it('rejects missing token', () => {
    expectFailure(getSignerByTokenSchema, {})
  })
})

// ─── markSignerViewedSchema ──────────────────────────────────

describe('markSignerViewedSchema', () => {
  it('accepts valid uuid token', () => {
    expectSuccess(markSignerViewedSchema, { token: VALID_UUID })
  })

  it('rejects invalid token', () => {
    expectFailure(markSignerViewedSchema, { token: INVALID_UUID })
  })

  it('rejects missing token', () => {
    expectFailure(markSignerViewedSchema, {})
  })
})

// ─── submitSignatureSchema ───────────────────────────────────

describe('submitSignatureSchema', () => {
  it('accepts valid PNG signature', () => {
    expectSuccess(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: VALID_SIGNATURE,
    })
  })

  it('accepts valid JPEG signature', () => {
    expectSuccess(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    })
  })

  it('accepts valid WebP signature', () => {
    expectSuccess(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'data:image/webp;base64,UklGR',
    })
  })

  it('rejects invalid token', () => {
    expectFailure(submitSignatureSchema, {
      token: INVALID_UUID,
      signature_data: VALID_SIGNATURE,
    })
  })

  it('rejects empty signature_data', () => {
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: '',
    })
  })

  it('rejects signature without data: prefix', () => {
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'image/png;base64,abc123',
    })
  })

  it('rejects signature with unsupported image type', () => {
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'data:image/gif;base64,R0lGODlh',
    })
  })

  it('rejects signature without base64 marker', () => {
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'data:image/png;abc123',
    })
  })

  it('rejects signature with invalid base64 characters', () => {
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: 'data:image/png;base64,abc!@#$%',
    })
  })

  it('rejects signature_data over 6MB', () => {
    const oversized = 'data:image/png;base64,' + 'A'.repeat(6_000_000)
    expectFailure(submitSignatureSchema, {
      token: VALID_UUID,
      signature_data: oversized,
    })
  })

  it('rejects missing signature_data', () => {
    expectFailure(submitSignatureSchema, { token: VALID_UUID })
  })

  it('rejects missing token', () => {
    expectFailure(submitSignatureSchema, { signature_data: VALID_SIGNATURE })
  })
})

// ─── declineSigningSchema ────────────────────────────────────

describe('declineSigningSchema', () => {
  const valid = { token: VALID_UUID, reason: 'Cannot sign at this time' }

  it('accepts valid input', () => {
    expectSuccess(declineSigningSchema, valid)
  })

  it('rejects invalid token', () => {
    expectFailure(declineSigningSchema, { ...valid, token: INVALID_UUID })
  })

  it('rejects empty reason', () => {
    expectFailure(declineSigningSchema, { ...valid, reason: '' })
  })

  it('rejects reason over 2000 chars', () => {
    expectFailure(declineSigningSchema, { ...valid, reason: 'x'.repeat(2001) })
  })

  it('accepts reason of exactly 2000 chars', () => {
    expectSuccess(declineSigningSchema, { ...valid, reason: 'x'.repeat(2000) })
  })

  it('rejects missing token', () => {
    expectFailure(declineSigningSchema, { reason: 'No' })
  })

  it('rejects missing reason', () => {
    expectFailure(declineSigningSchema, { token: VALID_UUID })
  })
})

// ─── createTemplateSchema ────────────────────────────────────

describe('createTemplateSchema', () => {
  const valid = {
    name: 'Employment Contract',
    source_file_url: VALID_URL,
  }

  it('accepts valid input with required fields only', () => {
    expectSuccess(createTemplateSchema, valid)
  })

  it('accepts with optional description', () => {
    expectSuccess(createTemplateSchema, { ...valid, description: 'Standard template' })
  })

  it('accepts with description as null', () => {
    expectSuccess(createTemplateSchema, { ...valid, description: null })
  })

  it('accepts with optional fields (JSON string)', () => {
    expectSuccess(createTemplateSchema, {
      ...valid,
      fields: '[{"name":"signature","type":"sig"}]',
    })
  })

  it('accepts with optional signer_roles (JSON string)', () => {
    expectSuccess(createTemplateSchema, {
      ...valid,
      signer_roles: '["signer","witness"]',
    })
  })

  it('rejects empty name', () => {
    expectFailure(createTemplateSchema, { ...valid, name: '' })
  })

  it('rejects name over 300 chars', () => {
    expectFailure(createTemplateSchema, { ...valid, name: 'a'.repeat(301) })
  })

  it('accepts name of exactly 300 chars', () => {
    expectSuccess(createTemplateSchema, { ...valid, name: 'a'.repeat(300) })
  })

  it('rejects description over 2000 chars', () => {
    expectFailure(createTemplateSchema, { ...valid, description: 'a'.repeat(2001) })
  })

  it('accepts description of exactly 2000 chars', () => {
    expectSuccess(createTemplateSchema, { ...valid, description: 'a'.repeat(2000) })
  })

  it('rejects invalid source_file_url', () => {
    expectFailure(createTemplateSchema, { ...valid, source_file_url: 'bad-url' })
  })

  it('rejects missing name', () => {
    expectFailure(createTemplateSchema, { source_file_url: VALID_URL })
  })

  it('rejects missing source_file_url', () => {
    expectFailure(createTemplateSchema, { name: 'Test' })
  })
})

// ─── updateTemplateSchema ────────────────────────────────────

describe('updateTemplateSchema', () => {
  it('accepts valid input with all updates', () => {
    expectSuccess(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: {
        name: 'Updated Name',
        description: 'New desc',
        fields: [{ name: 'sig', type: 'signature' }],
        signerRoles: ['approver'],
        isPublic: true,
      },
    })
  })

  it('accepts with empty updates object (all optional)', () => {
    expectSuccess(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: {},
    })
  })

  it('accepts with description as null', () => {
    expectSuccess(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { description: null },
    })
  })

  it('rejects invalid templateId', () => {
    expectFailure(updateTemplateSchema, {
      templateId: INVALID_UUID,
      updates: {},
    })
  })

  it('rejects name over 300 chars in updates', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { name: 'a'.repeat(301) },
    })
  })

  it('rejects empty name in updates', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { name: '' },
    })
  })

  it('rejects description over 2000 chars in updates', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { description: 'a'.repeat(2001) },
    })
  })

  it('rejects missing templateId', () => {
    expectFailure(updateTemplateSchema, { updates: {} })
  })

  it('rejects missing updates object', () => {
    expectFailure(updateTemplateSchema, { templateId: VALID_UUID })
  })

  it('rejects non-boolean isPublic', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { isPublic: 'yes' },
    })
  })

  it('rejects non-array fields', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { fields: 'not-an-array' },
    })
  })

  it('rejects non-array signerRoles', () => {
    expectFailure(updateTemplateSchema, {
      templateId: VALID_UUID,
      updates: { signerRoles: 'not-an-array' },
    })
  })
})

// ─── archiveTemplateSchema ───────────────────────────────────

describe('archiveTemplateSchema', () => {
  it('accepts valid uuid', () => {
    expectSuccess(archiveTemplateSchema, { templateId: VALID_UUID })
  })

  it('rejects invalid uuid', () => {
    expectFailure(archiveTemplateSchema, { templateId: INVALID_UUID })
  })

  it('rejects missing templateId', () => {
    expectFailure(archiveTemplateSchema, {})
  })
})
