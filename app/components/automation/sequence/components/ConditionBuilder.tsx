'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, ChevronDown, Check } from 'lucide-react'
import { FilterRule, FilterFieldOption, FilterOperator } from '../types'
import { OPERATOR_LABELS } from '../constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

// ─── Dropdown Base ────────────────────────────────────────────────────────────
function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  )
}

// ─── Select Button ────────────────────────────────────────────────────────────
function SelectBtn({ label, className = '' }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:border-blue-400 focus:outline-none transition-colors whitespace-nowrap ${className}`}
    >
      <span className="truncate max-w-[120px]">{label}</span>
      <ChevronDown size={12} className="text-gray-400 shrink-0" />
    </button>
  )
}

// ─── Value Input ──────────────────────────────────────────────────────────────
interface ValueInputProps {
  field: FilterFieldOption | undefined;
  operator: FilterOperator;
  value: FilterRule['value'];
  onChange: (v: FilterRule['value']) => void;
  tags: Array<{ id: string; name: string; color: string }>;
}
function ValueInput({ field, operator, value, onChange, tags }: ValueInputProps) {
  if (!field) return null

  if (['is_empty', 'is_not_empty'].includes(operator)) return null

  if (field.type === 'tag') {
    const selectedIds = Array.isArray(value) ? (value as string[]) : []
    const toggle = (id: string) => {
      onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
    }
    return (
      <Dropdown
        trigger={
          <SelectBtn
            label={selectedIds.length === 0 ? 'Chọn tags...' : `${selectedIds.length} tags`}
          />
        }
      >
        <div className="py-1 max-h-48 overflow-y-auto">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-gray-50"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selectedIds.includes(tag.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                {selectedIds.includes(tag.id) && <Check size={10} color="white" />}
              </div>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      </Dropdown>
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <Dropdown
        trigger={
          <SelectBtn
            label={field.options.find(o => o.value === value)?.label ?? 'Chọn...'}
          />
        }
      >
        <div className="py-1">
          {field.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${value === opt.value ? 'text-blue-600' : 'text-gray-700'}`}
            >
              {value === opt.value && <Check size={12} />}
              <span className={value === opt.value ? '' : 'ml-4'}>{opt.label}</span>
            </button>
          ))}
        </div>
      </Dropdown>
    )
  }

  if (operator === 'between') {
    const v = value as { from: number; to: number } | undefined
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={v?.from ?? ''}
          onChange={e => onChange({ from: Number(e.target.value), to: v?.to ?? 0 })}
          placeholder="Từ"
          className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">đến</span>
        <input
          type="number"
          value={v?.to ?? ''}
          onChange={e => onChange({ from: v?.from ?? 0, to: Number(e.target.value) })}
          placeholder="Đến"
          className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value as string | number}
      onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder="Giá trị..."
      className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

// ─── Rule Row ─────────────────────────────────────────────────────────────────
interface RuleRowProps {
  rule: FilterRule;
  fields: FilterFieldOption[];
  tags: Array<{ id: string; name: string; color: string }>;
  onChange: (r: FilterRule) => void;
  onDelete: () => void;
}
function RuleRow({ rule, fields, tags, onChange, onDelete }: RuleRowProps) {
  const field = fields.find(f => f.field === rule.field)
  const availableOps = field?.operators ?? []

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Field picker */}
      <Dropdown
        trigger={
          <SelectBtn label={field?.label ?? 'Chọn trường...'} />
        }
      >
        <div className="py-1 max-h-48 overflow-y-auto">
          {fields.map(f => (
            <button
              key={f.field}
              type="button"
              onClick={() => onChange({ ...rule, field: f.field, operator: f.operators[0], value: '' })}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${rule.field === f.field ? 'text-blue-600' : 'text-gray-700'}`}
            >
              {rule.field === f.field && <Check size={12} />}
              <span className={rule.field === f.field ? '' : 'ml-4'}>{f.label}</span>
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Operator picker */}
      {field && (
        <Dropdown
          trigger={
            <SelectBtn label={OPERATOR_LABELS[rule.operator] ?? rule.operator} />
          }
        >
          <div className="py-1">
            {availableOps.map(op => (
              <button
                key={op}
                type="button"
                onClick={() => onChange({ ...rule, operator: op, value: '' })}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${rule.operator === op ? 'text-blue-600' : 'text-gray-700'}`}
              >
                {rule.operator === op && <Check size={12} />}
                <span className={rule.operator === op ? '' : 'ml-4'}>{OPERATOR_LABELS[op]}</span>
              </button>
            ))}
          </div>
        </Dropdown>
      )}

      {/* Value */}
      {field && (
        <ValueInput
          field={field}
          operator={rule.operator}
          value={rule.value}
          onChange={v => onChange({ ...rule, value: v })}
          tags={tags}
        />
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── ConditionBuilder ─────────────────────────────────────────────────────────
export interface ConditionBuilderProps {
  enabled: boolean;
  logic: 'all' | 'any';
  rules: FilterRule[];
  onToggle?: (enabled: boolean) => void;
  onLogicChange: (logic: 'all' | 'any') => void;
  onRulesChange: (rules: FilterRule[]) => void;
  fields: FilterFieldOption[];
  tags: Array<{ id: string; name: string; color: string }>;
  toggleLabel?: string;
  previewText?: string;
}

export default function ConditionBuilder({
  enabled,
  logic,
  rules,
  onToggle,
  onLogicChange,
  onRulesChange,
  fields,
  tags,
  toggleLabel = 'Áp dụng điều kiện',
  previewText,
}: ConditionBuilderProps) {
  const addRule = () => {
    const defaultField = fields[0]
    onRulesChange([
      ...rules,
      {
        id: uid(),
        field: defaultField?.field ?? '',
        operator: defaultField?.operators[0] ?? 'equals',
        value: '',
      },
    ])
  }

  const updateRule = (idx: number, r: FilterRule) => {
    onRulesChange(rules.map((orig, i) => (i === idx ? r : orig)))
  }

  const deleteRule = (idx: number) => {
    onRulesChange(rules.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      {onToggle && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={`relative h-6 rounded-full transition-colors focus:outline-none shrink-0 ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
            style={{ width: 44 }}
          >
            <span
              className="absolute top-0.5 inline-block w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform"
              style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">{toggleLabel}</span>
        </div>
      )}

      {/* Builder area */}
      {enabled && (
        <div className="space-y-3">
          {/* Logic toggle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Logic:</span>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {(['all', 'any'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLogicChange(l)}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${logic === l ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {l === 'all' ? 'TẤT CẢ (AND)' : 'BẤT KỲ (OR)'}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2.5">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="flex items-start gap-2">
                {idx > 0 && (
                  <span className="text-xs font-semibold text-gray-400 w-10 text-center pt-2.5 shrink-0">
                    {logic === 'all' ? 'VÀ' : 'HOẶC'}
                  </span>
                )}
                <div className={`flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100 ${idx === 0 ? '' : ''}`}>
                  <RuleRow
                    rule={rule}
                    fields={fields}
                    tags={tags}
                    onChange={r => updateRule(idx, r)}
                    onDelete={() => deleteRule(idx)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add rule */}
          <button
            type="button"
            onClick={addRule}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus size={14} />
            Thêm điều kiện
          </button>

          {/* Preview */}
          {previewText && rules.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Điều kiện: </span>
                {previewText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
