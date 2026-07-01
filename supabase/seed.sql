-- Seed data for e-sign development environment
-- NOTE: Auth users must be created via Supabase Auth UI or API
-- This seed assumes the following test users exist:
--   - tanaka@techcorp.jp (org owner)
--   - suzuki@techcorp.jp (org admin)
--   - yamamoto@techcorp.jp (org member)

-- For local dev, create test users first with:
-- supabase auth signup --email tanaka@techcorp.jp --password Password123!

-- ============================================================
-- DEMO ORGANIZATION
-- ============================================================
DO $$
DECLARE
  org_id UUID := '11111111-1111-1111-1111-111111111111';
  user_tanaka_id UUID;
  user_suzuki_id UUID;
  user_yamamoto_id UUID;
  template_nda_id UUID := '22222222-2222-2222-2222-222222222221';
  template_employ_id UUID := '22222222-2222-2222-2222-222222222222';
  envelope_nda_id UUID := '33333333-3333-3333-3333-333333333331';
  envelope_employ_id UUID := '33333333-3333-3333-3333-333333333332';
  envelope_saas_id UUID := '33333333-3333-3333-3333-333333333333';
  signer_1_id UUID := '44444444-4444-4444-4444-444444444441';
  signer_2_id UUID := '44444444-4444-4444-4444-444444444442';
  signer_3_id UUID := '44444444-4444-4444-4444-444444444443';
BEGIN
  -- Get user IDs from auth
  SELECT id INTO user_tanaka_id FROM auth.users WHERE email = 'tanaka@techcorp.jp' LIMIT 1;
  SELECT id INTO user_suzuki_id FROM auth.users WHERE email = 'suzuki@techcorp.jp' LIMIT 1;
  SELECT id INTO user_yamamoto_id FROM auth.users WHERE email = 'yamamoto@techcorp.jp' LIMIT 1;

  -- Skip if users don't exist (fresh install)
  IF user_tanaka_id IS NULL THEN
    RAISE NOTICE 'Demo users not found. Run: supabase auth signup for test users first.';
    RETURN;
  END IF;

  -- Organization
  INSERT INTO organizations (id, name, slug, plan, settings)
  VALUES (
    org_id,
    '株式会社テックコープ',
    'techcorp',
    'pro',
    '{"email_branding": true, "custom_logo": false}'
  ) ON CONFLICT (id) DO NOTHING;

  -- Members
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES
    (org_id, user_tanaka_id, 'owner', now() - INTERVAL '90 days'),
    (org_id, user_suzuki_id, 'admin', now() - INTERVAL '60 days'),
    (org_id, user_yamamoto_id, 'member', now() - INTERVAL '30 days')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- Update profiles
  INSERT INTO profiles (id, full_name)
  VALUES
    (user_tanaka_id, '田中 健一'),
    (user_suzuki_id, '鈴木 美咲'),
    (user_yamamoto_id, '山本 拓也')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- ============================================================
  -- TEMPLATES
  -- ============================================================
  INSERT INTO templates (id, organization_id, created_by, name, description, source_file_url, fields, signer_roles)
  VALUES (
    template_nda_id,
    org_id,
    user_tanaka_id,
    '秘密保持契約書（NDA）',
    'サービス提供時の標準NDAテンプレート。甲乙2者間の秘密情報の取り扱いを規定。',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    '[
      {"id": "field_sig_a", "type": "signature", "label": "甲の署名", "page": 1, "x": 120, "y": 680, "width": 200, "height": 60, "role": "party_a", "required": true},
      {"id": "field_date_a", "type": "date", "label": "締結日（甲）", "page": 1, "x": 340, "y": 680, "width": 120, "height": 30, "role": "party_a", "required": true},
      {"id": "field_sig_b", "type": "signature", "label": "乙の署名", "page": 1, "x": 120, "y": 780, "width": 200, "height": 60, "role": "party_b", "required": true},
      {"id": "field_date_b", "type": "date", "label": "締結日（乙）", "page": 1, "x": 340, "y": 780, "width": 120, "height": 30, "role": "party_b", "required": true}
    ]',
    '[
      {"id": "party_a", "name": "甲（依頼者）", "order": 0},
      {"id": "party_b", "name": "乙（相手方）", "order": 1}
    ]'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO templates (id, organization_id, created_by, name, description, source_file_url, fields, signer_roles)
  VALUES (
    template_employ_id,
    org_id,
    user_suzuki_id,
    '雇用契約書',
    '正社員・契約社員向けの標準雇用契約書テンプレート。給与・勤務条件・就業場所を含む。',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    '[
      {"id": "field_emp_name", "type": "text", "label": "従業員氏名", "page": 1, "x": 200, "y": 300, "width": 200, "height": 30, "role": "employee", "required": true},
      {"id": "field_start_date", "type": "date", "label": "雇用開始日", "page": 1, "x": 200, "y": 350, "width": 120, "height": 30, "role": "employee", "required": true},
      {"id": "field_emp_sig", "type": "signature", "label": "従業員署名", "page": 3, "x": 120, "y": 720, "width": 200, "height": 60, "role": "employee", "required": true},
      {"id": "field_company_sig", "type": "signature", "label": "会社代表署名", "page": 3, "x": 350, "y": 720, "width": 200, "height": 60, "role": "company", "required": true}
    ]',
    '[
      {"id": "company", "name": "会社代表者", "order": 0},
      {"id": "employee", "name": "従業員", "order": 1}
    ]'
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- ENVELOPES (with various statuses for dashboard demo)
  -- ============================================================

  -- Completed NDA
  INSERT INTO envelopes (id, organization_id, template_id, created_by, title, status, source_file_url, completed_file_url, completed_at, created_at, updated_at)
  VALUES (
    envelope_nda_id,
    org_id,
    template_nda_id,
    user_tanaka_id,
    '株式会社フューチャーテック様 NDA 2026年6月',
    'completed',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    now() - INTERVAL '2 days',
    now() - INTERVAL '7 days',
    now() - INTERVAL '2 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- Partially signed employment contract
  INSERT INTO envelopes (id, organization_id, template_id, created_by, title, status, source_file_url, expires_at, created_at, updated_at)
  VALUES (
    envelope_employ_id,
    org_id,
    template_employ_id,
    user_suzuki_id,
    '雇用契約書 — 新田 陽平（2026年7月入社）',
    'partial',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    now() + INTERVAL '14 days',
    now() - INTERVAL '3 days',
    now() - INTERVAL '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  -- Draft SaaS agreement
  INSERT INTO envelopes (id, organization_id, created_by, title, status, source_file_url, created_at, updated_at)
  VALUES (
    envelope_saas_id,
    org_id,
    user_yamamoto_id,
    'SaaSサービス利用規約同意書 — 株式会社グリーンソリューションズ',
    'draft',
    'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- SIGNERS
  -- ============================================================

  -- NDA signers (completed)
  INSERT INTO signers (id, envelope_id, name, email, role, order_index, status, signed_at, viewed_at, created_at, updated_at)
  VALUES
    (signer_1_id, envelope_nda_id, '田中 健一', 'tanaka@techcorp.jp', '甲（依頼者）', 0, 'signed',
      now() - INTERVAL '5 days', now() - INTERVAL '6 days', now() - INTERVAL '7 days', now() - INTERVAL '5 days'),
    (signer_2_id, envelope_nda_id, '佐藤 誠', 'sato@futuretch.co.jp', '乙（相手方）', 1, 'signed',
      now() - INTERVAL '2 days', now() - INTERVAL '3 days', now() - INTERVAL '7 days', now() - INTERVAL '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- Employment contract signers (partial)
  INSERT INTO signers (id, envelope_id, name, email, role, order_index, status, signed_at, created_at, updated_at)
  VALUES
    (signer_3_id, envelope_employ_id, '鈴木 美咲', 'suzuki@techcorp.jp', '会社代表者', 0, 'signed',
      now() - INTERVAL '2 days', now() - INTERVAL '3 days', now() - INTERVAL '2 days'),
    (gen_random_uuid(), envelope_employ_id, '新田 陽平', 'nitta.yohei@gmail.com', '従業員', 1, 'sent',
      NULL, now() - INTERVAL '3 days', now() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- AUDIT EVENTS
  -- ============================================================
  INSERT INTO audit_events (envelope_id, signer_id, event_type, actor_user_id, actor_email, created_at)
  VALUES
    (envelope_nda_id, NULL, 'envelope_created', user_tanaka_id, 'tanaka@techcorp.jp', now() - INTERVAL '7 days'),
    (envelope_nda_id, NULL, 'envelope_sent', user_tanaka_id, 'tanaka@techcorp.jp', now() - INTERVAL '7 days'),
    (envelope_nda_id, signer_1_id, 'signer_email_sent', NULL, 'tanaka@techcorp.jp', now() - INTERVAL '7 days'),
    (envelope_nda_id, signer_1_id, 'signer_viewed', NULL, 'tanaka@techcorp.jp', now() - INTERVAL '6 days'),
    (envelope_nda_id, signer_1_id, 'signer_signed', NULL, 'tanaka@techcorp.jp', now() - INTERVAL '5 days'),
    (envelope_nda_id, signer_2_id, 'signer_email_sent', NULL, 'sato@futuretch.co.jp', now() - INTERVAL '5 days'),
    (envelope_nda_id, signer_2_id, 'signer_viewed', NULL, 'sato@futuretch.co.jp', now() - INTERVAL '3 days'),
    (envelope_nda_id, signer_2_id, 'signer_signed', NULL, 'sato@futuretch.co.jp', now() - INTERVAL '2 days'),
    (envelope_nda_id, NULL, 'envelope_completed', NULL, NULL, now() - INTERVAL '2 days'),
    (envelope_employ_id, NULL, 'envelope_created', user_suzuki_id, 'suzuki@techcorp.jp', now() - INTERVAL '3 days'),
    (envelope_employ_id, NULL, 'envelope_sent', user_suzuki_id, 'suzuki@techcorp.jp', now() - INTERVAL '3 days'),
    (envelope_employ_id, signer_3_id, 'signer_signed', NULL, 'suzuki@techcorp.jp', now() - INTERVAL '2 days'),
    (envelope_employ_id, NULL, 'reminder_sent', NULL, 'nitta.yohei@gmail.com', now() - INTERVAL '1 day');

  RAISE NOTICE 'Seed data inserted successfully for org: 株式会社テックコープ';
END $$;
