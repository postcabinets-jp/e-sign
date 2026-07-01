export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          custom_domain: string | null
          plan: 'free' | 'pro' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          custom_domain?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          custom_domain?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at?: string
          joined_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          description: string | null
          source_file_url: string
          fields: Json
          signer_roles: Json
          is_public: boolean
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          description?: string | null
          source_file_url: string
          fields?: Json
          signer_roles?: Json
          is_public?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          name?: string
          description?: string | null
          source_file_url?: string
          fields?: Json
          signer_roles?: Json
          is_public?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      envelopes: {
        Row: {
          id: string
          organization_id: string
          template_id: string | null
          created_by: string
          title: string
          status: 'draft' | 'sent' | 'partial' | 'completed' | 'declined' | 'voided' | 'expired'
          source_file_url: string
          completed_file_url: string | null
          expires_at: string | null
          completed_at: string | null
          voided_at: string | null
          void_reason: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          template_id?: string | null
          created_by: string
          title: string
          status?: 'draft' | 'sent' | 'partial' | 'completed' | 'declined' | 'voided' | 'expired'
          source_file_url: string
          completed_file_url?: string | null
          expires_at?: string | null
          completed_at?: string | null
          voided_at?: string | null
          void_reason?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          template_id?: string | null
          created_by?: string
          title?: string
          status?: 'draft' | 'sent' | 'partial' | 'completed' | 'declined' | 'voided' | 'expired'
          source_file_url?: string
          completed_file_url?: string | null
          expires_at?: string | null
          completed_at?: string | null
          voided_at?: string | null
          void_reason?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      signers: {
        Row: {
          id: string
          envelope_id: string
          name: string
          email: string
          phone: string | null
          role: string | null
          order_index: number
          status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined'
          signing_token: string
          token_expires_at: string
          viewed_at: string | null
          signed_at: string | null
          declined_at: string | null
          decline_reason: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          envelope_id: string
          name: string
          email: string
          phone?: string | null
          role?: string | null
          order_index?: number
          status?: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined'
          signing_token?: string
          token_expires_at?: string
          viewed_at?: string | null
          signed_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          envelope_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: string | null
          order_index?: number
          status?: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined'
          signing_token?: string
          token_expires_at?: string
          viewed_at?: string | null
          signed_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      signing_fields: {
        Row: {
          id: string
          envelope_id: string
          signer_id: string
          field_id: string
          field_type: 'signature' | 'initial' | 'text' | 'date' | 'checkbox' | 'radio' | 'file' | 'select' | 'number'
          value: string | null
          file_url: string | null
          is_required: boolean
          position: Json
          filled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          envelope_id: string
          signer_id: string
          field_id: string
          field_type: 'signature' | 'initial' | 'text' | 'date' | 'checkbox' | 'radio' | 'file' | 'select' | 'number'
          value?: string | null
          file_url?: string | null
          is_required?: boolean
          position: Json
          filled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          envelope_id?: string
          signer_id?: string
          field_id?: string
          field_type?: 'signature' | 'initial' | 'text' | 'date' | 'checkbox' | 'radio' | 'file' | 'select' | 'number'
          value?: string | null
          file_url?: string | null
          is_required?: boolean
          position?: Json
          filled_at?: string | null
          created_at?: string
        }
      }
      audit_events: {
        Row: {
          id: string
          envelope_id: string
          signer_id: string | null
          event_type: string
          actor_user_id: string | null
          actor_email: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          envelope_id: string
          signer_id?: string | null
          event_type: string
          actor_user_id?: string | null
          actor_email?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          envelope_id?: string
          signer_id?: string | null
          event_type?: string
          actor_user_id?: string | null
          actor_email?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          organization_id: string
          url: string
          secret: string
          events: string[]
          is_active: boolean
          last_triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          url: string
          secret?: string
          events?: string[]
          is_active?: boolean
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          url?: string
          secret?: string
          events?: string[]
          is_active?: boolean
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          name: string
          key_hash: string
          key_prefix: string
          scopes: string[]
          last_used_at: string | null
          expires_at: string | null
          revoked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          name: string
          key_hash: string
          key_prefix: string
          scopes?: string[]
          last_used_at?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          scopes?: string[]
          last_used_at?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
