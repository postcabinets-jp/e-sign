import { z } from 'zod'

// ─── Shared primitives ───────────────────────────────────────
const email = z.email('有効なメールアドレスを入力してください')
const uuid = z.uuid('無効なIDです')

/**
 * Signing token — DB generated, always a UUID.
 */
const signingToken = z.uuid('無効な署名トークンです')

/**
 * Password — minimum 8 chars.
 * Supabase handles strength enforcement; we just guard against blanks / trivially short input.
 */
const password = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(128)

/**
 * Base64 data-URL for a signature image (PNG/JPEG/WebP).
 * Max ~4 MB raw base64 (~5.3 MB encoded). This is a legal document — we must
 * verify the shape before touching storage.
 */
const signatureDataUrl = z
  .string()
  .min(1, '署名データが空です')
  .max(6_000_000, '署名データが大きすぎます')
  .regex(
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/,
    '署名データの形式が不正です',
  )

// ─── Auth ─────────────────────────────────────────────────────

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const signUpSchema = z.object({
  email,
  password,
  full_name: z
    .string()
    .min(1, '氏名を入力してください')
    .max(200, '氏名が長すぎます'),
  org_name: z
    .string()
    .min(1, '組織名を入力してください')
    .max(200, '組織名が長すぎます'),
})

export const resetPasswordSchema = z.object({
  email,
})

// ─── Envelopes ────────────────────────────────────────────────

export const createEnvelopeSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(500, 'タイトルが長すぎます'),
  source_file_url: z.url('無効なファイルURLです'),
  template_id: z.uuid().nullable().optional(),
  expires_at: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
})

export const sendEnvelopeSchema = z.object({
  envelopeId: uuid,
})

export const voidEnvelopeSchema = z.object({
  envelopeId: uuid,
  reason: z
    .string()
    .min(1, '無効化理由を入力してください')
    .max(2000, '理由が長すぎます'),
})

export const addSignerSchema = z.object({
  envelopeId: uuid,
  signerData: z.object({
    name: z
      .string()
      .min(1, '署名者名を入力してください')
      .max(200, '署名者名が長すぎます'),
    email,
    role: z.string().max(100).optional(),
    orderIndex: z
      .number()
      .int('順序は整数で指定してください')
      .min(0, '順序は0以上で指定してください'),
  }),
})

export const removeSignerSchema = z.object({
  signerId: uuid,
  envelopeId: uuid,
})

// ─── Signing ──────────────────────────────────────────────────

export const getSignerByTokenSchema = z.object({
  token: signingToken,
})

export const markSignerViewedSchema = z.object({
  token: signingToken,
})

export const submitSignatureSchema = z.object({
  token: signingToken,
  signature_data: signatureDataUrl,
})

export const declineSigningSchema = z.object({
  token: signingToken,
  reason: z
    .string()
    .min(1, '辞退理由を入力してください')
    .max(2000, '辞退理由が長すぎます'),
})

// ─── Templates ────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'テンプレート名を入力してください')
    .max(300, 'テンプレート名が長すぎます'),
  description: z.string().max(2000).nullable().optional(),
  source_file_url: z.url('無効なファイルURLです'),
  fields: z.string().optional(),      // JSON string — parsed after validation
  signer_roles: z.string().optional(), // JSON string — parsed after validation
})

export const updateTemplateSchema = z.object({
  templateId: uuid,
  updates: z.object({
    name: z.string().min(1).max(300).optional(),
    description: z.string().max(2000).nullable().optional(),
    fields: z.array(z.unknown()).optional(),
    signerRoles: z.array(z.unknown()).optional(),
    isPublic: z.boolean().optional(),
  }),
})

export const archiveTemplateSchema = z.object({
  templateId: uuid,
})
