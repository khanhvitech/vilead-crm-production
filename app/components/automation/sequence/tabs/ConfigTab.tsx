'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Plus, Zap, MessageSquare, ChevronDown, CheckSquare, Power, PowerOff, Copy, Trash2, X } from 'lucide-react'
import { Sequence, SequenceStep, ActionType, ActionConfig } from '../types'
import { TRIGGER_MAP, TRIGGER_GROUPS } from '../constants'
import { MOCK_TAGS_REF } from '../mockData'
import TriggerConfigForm from '../components/TriggerConfigForm'
import TimelineStepRow from '../components/TimelineStepRow'
import ActionPickerModal from '../components/ActionPickerModal'

interface Props {
  sequence: Sequence
  onChange: (seq: Sequence) => void
}

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function ConfigTab({ sequence, onChange }: Props) {
  const [addMenuOpen,         setAddMenuOpen]       = useState(false)
  const [showActionPicker,    setShowActionPicker]  = useState(false)
  const [enabledMap,          setEnabledMap]        = useState<Record<string, boolean>>({})
  const [selectedStepIds,     setSelectedStepIds]   = useState<Set<string>>(new Set())
  const [dragIdx,             setDragIdx]           = useState<number | null>(null)
  const [dragOverIdx,         setDragOverIdx]       = useState<number | null>(null)
  const dragNode                                    = useRef<number | null>(null)

  const triggerInfo = TRIGGER_MAP[sequence.trigger.type]

  const handleTriggerTypeChange = (type: string) => {
    onChange({ ...sequence, trigger: { type: type as Sequence['trigger']['type'], config: {} } })
  }

  // ─── Step CRUD ────────────────────────────────────────────────────────────
  const handleUpdateStep = (updated: SequenceStep) => {
    onChange({ ...sequence, steps: sequence.steps.map(s => s.id === updated.id ? updated : s) })
  }

  const handleToggleEnabled = (stepId: string) => {
    setEnabledMap(prev => ({ ...prev, [stepId]: !(prev[stepId] ?? true) }))
  }

  const handleDuplicateStep = (idx: number) => {
    const orig = sequence.steps[idx]
    const dup: SequenceStep = {
      ...orig,
      id: uid(),
      step_order: sequence.steps.length + 1,
      name: orig.name ? `${orig.name} (sao chép)` : undefined,
    }
    onChange({
      ...sequence,
      steps: [...sequence.steps, dup].map((s, i) => ({ ...s, step_order: i + 1 })),
    })
  }

  const handleDeleteStep = (idx: number) => {
    const steps = sequence.steps
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, step_order: i + 1 }))
    onChange({ ...sequence, steps })
    // Remove from selection
    const removed = sequence.steps[idx]
    if (removed) setSelectedStepIds(prev => { const next = new Set(prev); next.delete(removed.id); return next })
  }

  // ─── Checkbox selection ────────────────────────────────────────────────────
  const handleCheckChange = useCallback((id: string, checked: boolean) => {
    setSelectedStepIds(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }, [])

  const selectedCount = selectedStepIds.size

  const handleSelectAll = () => {
    setSelectedStepIds(new Set(sequence.steps.map(s => s.id)))
  }
  const handleDeselectAll = () => setSelectedStepIds(new Set())

  const handleBulkActivate = () => {
    setEnabledMap(prev => {
      const next = { ...prev }
      selectedStepIds.forEach(id => { next[id] = true })
      return next
    })
  }
  const handleBulkDeactivate = () => {
    setEnabledMap(prev => {
      const next = { ...prev }
      selectedStepIds.forEach(id => { next[id] = false })
      return next
    })
  }
  const handleBulkDuplicate = () => {
    const toDup = sequence.steps.filter(s => selectedStepIds.has(s.id))
    const dups: SequenceStep[] = toDup.map(orig => ({
      ...orig,
      id: uid(),
      step_order: sequence.steps.length + 1,
      name: orig.name ? `${orig.name} (sao chép)` : undefined,
    }))
    onChange({
      ...sequence,
      steps: [...sequence.steps, ...dups].map((s, i) => ({ ...s, step_order: i + 1 })),
    })
    setSelectedStepIds(new Set())
  }
  const handleBulkDelete = () => {
    const steps = sequence.steps
      .filter(s => !selectedStepIds.has(s.id))
      .map((s, i) => ({ ...s, step_order: i + 1 }))
    onChange({ ...sequence, steps })
    setSelectedStepIds(new Set())
  }

  // ─── Add message step immediately ─────────────────────────────────────────
  const handleAddMessage = () => {
    const newStep: SequenceStep = {
      id: uid(),
      step_order: sequence.steps.length + 1,
      name: undefined,
      delay: { type: 'immediate' },
      condition: null,
      action: { type: 'send_flow', config: {} },
    }
    setEnabledMap(prev => ({ ...prev, [newStep.id]: true }))
    onChange({ ...sequence, steps: [...sequence.steps, newStep] })
    setAddMenuOpen(false)
  }

  // ─── Add action step via ActionPickerModal ─────────────────────────────────
  const handleActionSave = (actionType: ActionType, config: ActionConfig) => {
    const newStep: SequenceStep = {
      id: uid(),
      step_order: sequence.steps.length + 1,
      name: undefined,
      delay: { type: 'immediate' },
      condition: null,
      action: { type: actionType, config },
    }
    setEnabledMap(prev => ({ ...prev, [newStep.id]: true }))
    onChange({ ...sequence, steps: [...sequence.steps, newStep] })
    setShowActionPicker(false)
  }

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDragStart = (idx: number) => { dragNode.current = idx; setDragIdx(idx) }
  const handleDragEnter = (idx: number) => { setDragOverIdx(idx) }
  const handleDragEnd = () => {
    const from = dragNode.current
    if (from === null || dragOverIdx === null || from === dragOverIdx) {
      setDragIdx(null); setDragOverIdx(null); dragNode.current = null; return
    }
    const steps = [...sequence.steps]
    const [moved] = steps.splice(from, 1)
    steps.splice(dragOverIdx, 0, moved)
    onChange({ ...sequence, steps: steps.map((s, i) => ({ ...s, step_order: i + 1 })) })
    setDragIdx(null); setDragOverIdx(null); dragNode.current = null
  }

  return (
    <div className="space-y-4">

      {/* ══ BLOCK 1: Điều kiện khởi chạy ═══════════════════════════════════════ */}
      <div className="bg-white border border-[#e6ebf1] rounded-[10px] overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-white bg-gray-50/80 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-[10px] flex items-center justify-center shrink-0">
            <Zap size={16} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">Điều kiện khởi chạy</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sự kiện kích hoạt kịch bản tự động</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            triggerInfo ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {triggerInfo?.group ?? 'Chưa chọn'}
          </span>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại trigger *</label>
            <select
              value={sequence.trigger.type}
              onChange={e => handleTriggerTypeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
            >
              {TRIGGER_GROUPS.map(group => (
                <optgroup key={group.group} label={`── ${group.group} ──`}>
                  {group.triggers.map(t => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {triggerInfo?.hasConfig && (
            <div className="pl-4 border-l-4 border-gray-100">
              <TriggerConfigForm
                triggerType={sequence.trigger.type}
                config={sequence.trigger.config}
                onChange={config => onChange({ ...sequence, trigger: { ...sequence.trigger, config } })}
                tags={MOCK_TAGS_REF}
              />
            </div>
          )}
        </div>
      </div>

      {/* ══ BLOCK 2: Timeline Steps ═════════════════════════════════════════════ */}
      <div className="bg-white border border-[#e6ebf1] rounded-[10px]">

{/* ── Bulk action bar ── */}
        {selectedCount > 0 && (
          <div className="border-t border-blue-100 bg-blue-50 px-4 py-3 rounded-b-lg flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-blue-800 shrink-0">
              Đã chọn {selectedCount} bước
            </span>

            <button onClick={handleDeselectAll}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
              <X size={12} />Bỏ chọn
            </button>

            <div className="flex-1" />

            <button onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c7d9fd] rounded-[10px] text-xs font-semibold text-[#3e79f7] hover:bg-blue-100 transition-colors shrink-0">
              <CheckSquare size={13} />Chọn tất cả ({sequence.steps.length})
            </button>

            <button onClick={handleBulkActivate}
              className="px-3 py-1.5 bg-[#2dc56a] text-white text-sm rounded-md hover:bg-[#04d182] transition-colors flex items-center gap-1.5">
              <Power size={13} />Kích hoạt
            </button>

            <button onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1.5">
              <PowerOff size={13} />Hủy kích hoạt
            </button>

            <button onClick={handleBulkDuplicate}
              className="px-3 py-1.5 bg-[#3e79f7] text-white text-sm rounded-md hover:bg-[#699dff] transition-colors flex items-center gap-1.5">
              <Copy size={13} />Nhân bản
            </button>

            <button onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-[#ff6b72] text-white text-sm rounded-md hover:bg-[#d9505c] transition-colors flex items-center gap-1.5">
              <Trash2 size={13} />Xóa
            </button>
          </div>
        )}

        {/* Table header */}
        <div className="flex items-center border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 rounded-t-lg">
          <div className="w-44 shrink-0 text-right pr-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Lịch</span>
          </div>
          <div className="flex-1 flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="w-5 shrink-0" />{/* drag */}
            <div className="w-4 shrink-0">☐</div>
            <div className="w-9 shrink-0">Kích hoạt</div>
            <div className="flex-1">Nội dung</div>
            <div className="w-14 text-right shrink-0">Đã gửi</div>
            <div className="w-7 shrink-0" />
          </div>
        </div>

        {/* Timeline rows */}
        <div className="px-4 pt-3 pb-2">
          {sequence.steps.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-[#e6ebf1] rounded-[10px] flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Chưa có bước nào</p>
              <p className="text-xs text-gray-400 mt-1">Thêm bước đầu tiên để bắt đầu thiết kế kịch bản</p>
            </div>
          ) : (
            sequence.steps.map((step, idx) => (
              <div
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
              >
                {dragOverIdx === idx && dragIdx !== null && dragIdx !== idx && (
                  <div className="h-1 bg-blue-400 rounded-full mb-2 mx-2" />
                )}
                <TimelineStepRow
                  step={step}
                  index={idx}
                  isLast={idx === sequence.steps.length - 1}
                  enabled={enabledMap[step.id] ?? true}
                  dragging={dragIdx === idx}
                  isSelected={selectedStepIds.has(step.id)}
                  onCheckChange={handleCheckChange}
                  onUpdate={handleUpdateStep}
                  onToggleEnabled={() => handleToggleEnabled(step.id)}
                  onDuplicate={() => handleDuplicateStep(idx)}
                  onDelete={() => handleDeleteStep(idx)}
                />
              </div>
            ))
          )}

          {/* ── Add button ── */}
          <div className="flex items-center mt-1 pb-2">
            <div className="w-44 shrink-0" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setAddMenuOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-dashed border-[#e6ebf1] text-sm font-semibold text-gray-500 hover:border-[#699dff] hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Plus size={15} />
                Thêm mới
                <ChevronDown size={13} className={`transition-transform ${addMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {addMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#e6ebf1] rounded-[10px] shadow-xl z-50 w-52 overflow-hidden py-1">
                  <button
                    onClick={handleAddMessage}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <MessageSquare size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Tin nhắn</p>
                      <p className="text-xs text-gray-400">Thêm bước gửi luồng tin nhắn</p>
                    </div>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => { setAddMenuOpen(false); setShowActionPicker(true) }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Hành động</p>
                      <p className="text-xs text-gray-400">Gắn tag, tạo task, hủy kịch bản...</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>

      {/* Action Picker Modal */}
      {showActionPicker && (
        <ActionPickerModal
          onSave={handleActionSave}
          onClose={() => setShowActionPicker(false)}
        />
      )}
    </div>
  )
}
