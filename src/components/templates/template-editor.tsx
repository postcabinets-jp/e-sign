'use client'

import { useState } from 'react'
import { updateTemplate } from '@/app/actions/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, Trash2, GripVertical } from 'lucide-react'
import type { Database } from '@/types/database'

type Template = Database['public']['Tables']['templates']['Row']

interface TemplateEditorProps {
  template: Template
}

type SignerRole = { id: string; name: string; order: number }
type FieldType = 'signature' | 'initial' | 'text' | 'date' | 'checkbox' | 'radio' | 'file' | 'select' | 'number'
type Field = {
  id: string
  type: FieldType
  label: string
  role: string
  required: boolean
  page: number
  x: number
  y: number
  width: number
  height: number
}

const fieldTypeLabels: Record<FieldType, string> = {
  signature: '署名',
  initial: 'イニシャル',
  text: 'テキスト',
  date: '日付',
  checkbox: 'チェックボックス',
  radio: 'ラジオ',
  file: 'ファイル',
  select: 'セレクト',
  number: '数値',
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description ?? '')
  const [signerRoles, setSignerRoles] = useState<SignerRole[]>(
    (template.signer_roles as SignerRole[]) ?? []
  )
  const [fields, setFields] = useState<Field[]>(
    (template.fields as Field[]) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addSignerRole() {
    const newRole: SignerRole = {
      id: `role_${Date.now()}`,
      name: `署名者 ${signerRoles.length + 1}`,
      order: signerRoles.length,
    }
    setSignerRoles([...signerRoles, newRole])
  }

  function removeSignerRole(id: string) {
    setSignerRoles(signerRoles.filter(r => r.id !== id))
    setFields(fields.filter(f => f.role !== id))
  }

  function addField(type: FieldType) {
    const newField: Field = {
      id: `field_${Date.now()}`,
      type,
      label: fieldTypeLabels[type],
      role: signerRoles[0]?.id ?? '',
      required: true,
      page: 1,
      x: 100,
      y: 100,
      width: type === 'signature' ? 200 : 120,
      height: type === 'signature' ? 60 : 30,
    }
    setFields([...fields, newField])
  }

  function removeField(id: string) {
    setFields(fields.filter(f => f.id !== id))
  }

  async function handleSave() {
    setSaving(true)
    await updateTemplate(template.id, {
      name,
      description,
      fields,
      signerRoles,
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Settings */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">テンプレート設定</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">テンプレート名</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">説明</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 text-sm" />
            </div>
          </div>
        </div>

        {/* Signer Roles */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">署名者の役割</h3>
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={addSignerRole}>
              <Plus className="w-3 h-3" /> 追加
            </Button>
          </div>
          {signerRoles.length === 0 ? (
            <p className="text-xs text-zinc-400">役割を追加してください</p>
          ) : (
            <div className="space-y-2">
              {signerRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <GripVertical className="w-3 h-3 text-zinc-300" />
                  <Input
                    value={role.name}
                    onChange={(e) => setSignerRoles(signerRoles.map(r =>
                      r.id === role.id ? { ...r, name: e.target.value } : r
                    ))}
                    className="h-7 text-xs flex-1"
                  />
                  <button onClick={() => removeSignerRole(role.id)} className="text-zinc-300 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">フィールドを追加</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="text-xs text-left px-2 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
              >
                {fieldTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center + Right: Preview + Fields */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">フィールド一覧</h3>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-sm text-zinc-400">
              左のメニューからフィールドを追加してください
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => {
                const role = signerRoles.find(r => r.id === field.role)
                return (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-zinc-400 mb-0.5">タイプ</p>
                        <Badge variant="secondary" className="text-xs">
                          {fieldTypeLabels[field.type]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 mb-0.5">ラベル</p>
                        <Input
                          value={field.label}
                          onChange={(e) => setFields(fields.map(f =>
                            f.id === field.id ? { ...f, label: e.target.value } : f
                          ))}
                          className="h-6 text-xs"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 mb-0.5">担当者</p>
                        <select
                          value={field.role}
                          onChange={(e) => setFields(fields.map(f =>
                            f.id === field.id ? { ...f, role: e.target.value } : f
                          ))}
                          className="h-6 text-xs border rounded px-1 w-full"
                        >
                          {signerRoles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeField(field.id)} className="text-zinc-300 hover:text-red-500 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saved ? '保存しました' : saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}
