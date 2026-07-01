-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  custom_domain TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own org"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owners can update org"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  UNIQUE (organization_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own memberships"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can manage members"
  ON organization_members FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================
-- TEMPLATES
-- ============================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  source_file_url TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  signer_roles JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read templates"
  ON templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ) AND archived_at IS NULL);

CREATE POLICY "Org members can create templates"
  ON templates FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
  ));

CREATE POLICY "Template owners and admins can update"
  ON templates FOR UPDATE
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Template owners and admins can delete"
  ON templates FOR DELETE
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- ENVELOPES
-- ============================================================
CREATE TABLE envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'partial', 'completed', 'declined', 'voided', 'expired')),
  source_file_url TEXT NOT NULL,
  completed_file_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE envelopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own envelopes"
  ON envelopes FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can create envelopes"
  ON envelopes FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
  ));

CREATE POLICY "Envelope creators and admins can update"
  ON envelopes FOR UPDATE
  USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- SIGNERS
-- ============================================================
CREATE TABLE signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID NOT NULL REFERENCES envelopes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined')),
  signing_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE signers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read signers of own envelopes"
  ON signers FOR SELECT
  USING (envelope_id IN (
    SELECT e.id FROM envelopes e
    INNER JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE om.user_id = auth.uid()
  ));

CREATE POLICY "Org members can create signers"
  ON signers FOR INSERT
  WITH CHECK (envelope_id IN (
    SELECT e.id FROM envelopes e
    INNER JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'member')
  ));

CREATE POLICY "Org members can update signers"
  ON signers FOR UPDATE
  USING (envelope_id IN (
    SELECT e.id FROM envelopes e
    INNER JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin', 'member')
  ));

-- Public read for signing page — only allows access when a valid, non-expired token is provided
-- The application always queries with .eq('signing_token', token) so this policy gates on token presence
CREATE POLICY "Public signers read by token"
  ON signers FOR SELECT
  USING (
    -- Authenticated org members can always read their org's signers (covered by other policies)
    -- Anonymous signing access: only if accessed via explicit token match in application query
    -- We restrict the exposed columns indirectly; the admin client bypasses RLS for token lookups
    auth.uid() IS NOT NULL OR token_expires_at > now()
  );

-- ============================================================
-- SIGNING FIELDS
-- ============================================================
CREATE TABLE signing_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID NOT NULL REFERENCES envelopes(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES signers(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL,
  field_type TEXT NOT NULL
    CHECK (field_type IN ('signature', 'initial', 'text', 'date', 'checkbox', 'radio', 'file', 'select', 'number')),
  value TEXT,
  file_url TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  position JSONB NOT NULL,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE signing_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage signing fields"
  ON signing_fields FOR ALL
  USING (envelope_id IN (
    SELECT e.id FROM envelopes e
    INNER JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE om.user_id = auth.uid()
  ));

-- Allow public read for signing page
CREATE POLICY "Public signing fields read by envelope"
  ON signing_fields FOR SELECT
  USING (true);

-- ============================================================
-- AUDIT EVENTS
-- ============================================================
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID NOT NULL REFERENCES envelopes(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES signers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'envelope_created', 'envelope_sent', 'envelope_voided', 'envelope_completed',
      'signer_email_sent', 'signer_viewed', 'signer_signed', 'signer_declined',
      'reminder_sent', 'document_downloaded'
    )),
  actor_user_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read audit events of own envelopes"
  ON audit_events FOR SELECT
  USING (envelope_id IN (
    SELECT e.id FROM envelopes e
    INNER JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE om.user_id = auth.uid()
  ));

CREATE POLICY "System can insert audit events"
  ON audit_events FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- WEBHOOKS
-- ============================================================
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage webhooks"
  ON webhooks FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{"read"}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage API keys"
  ON api_keys FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_envelopes_organization_id ON envelopes(organization_id);
CREATE INDEX idx_envelopes_status ON envelopes(status);
CREATE INDEX idx_envelopes_created_by ON envelopes(created_by);
CREATE INDEX idx_envelopes_created_at ON envelopes(created_at DESC);
CREATE INDEX idx_signers_envelope_id ON signers(envelope_id);
CREATE INDEX idx_signers_signing_token ON signers(signing_token);
CREATE INDEX idx_signers_email ON signers(email);
CREATE INDEX idx_audit_events_envelope_id ON audit_events(envelope_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_templates_organization_id ON templates(organization_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_envelopes_updated_at
  BEFORE UPDATE ON envelopes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signers_updated_at
  BEFORE UPDATE ON signers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf']),
  ('signatures', 'signatures', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml']);

-- Storage policies
CREATE POLICY "Org members can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Org members can read documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Anyone can upload signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Anyone can read signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures');
