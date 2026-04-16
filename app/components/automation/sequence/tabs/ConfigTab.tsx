'use client'

import React, { useState, useRef } from 'react'
import { Plus, AlertCircle, Zap } from 'lucide-react'
import { Sequence, SequenceStep, FilterRule } from '../types'
import { TRIGGER_MAP, TRIGGER_GROUPS, FILTER_FIELDS } from '../constants'
import { MOCK_TAGS_REF } from '../mockData'
import TriggerConfigForm from '../components/TriggerConfigForm'
import ConditionBuilder from '../components/ConditionBuilder'
import StepCard from '../components/StepCard'
import StepConfigModal from '../StepConfigModal'

interface Props {
  sequence: Sequence;
  onChange: (seq: Sequence) => void;
}

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function ConfigTab({ sequence, onChange }: Props) {
  const [modalStep, setModalStep]     = useState<SequenceStep | 'new' | null>(null)
  const [dragIdx, setDragIdx]         = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragNode                      = useRef<number | null>(null)

  // ─── Trigger ────────────────────────────────────────────────────────────────
  const triggerInfo = TRIGGER_MAP[sequence.trigger.type]

  const handleTriggerTypeChange = (type: string) => {
    onChange({
      ...sequence,
      trigger: { type: type as Sequence['trigger']['type'], config: {} },
    })
  }

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const handleFilterChange = (patch: Partial<Sequence['filter']>) => {
    onChange({ ...sequence, filter: { ...sequence.filter, ...patch } })
  }

  // ─── Steps ──────────────────────────────────────────────────────────────────
  const handleSaveStep = (data: Omit<SequenceStep, 'id' | 'step_order'> & { id?: string }) => {
    let steps: SequenceStep[]
    if (data.id) {
      // Edit
      steps = sequence.steps.map(s =>
        s.id === data.id
          ? { ...s, ...data, id: s.id, step_order: s.step_order }
          : s
      )
    } else {
      // New
      const newStep: SequenceStep = {
        id: uid(),
        step_order: sequence.steps.length + 1,
        name: data.name,
        delay: data.delay,
        condition: data.condition,
        action: data.action,
      }
      steps = [...sequence.steps, newStep]
    }
    onChange({ ...sequence, steps })
    setModalStep(null)
  }

  const handleDuplicateStep = (idx: number) => {
    const orig = sequence.steps[idx]
    const dup: SequenceStep = {
      ...orig,
      id: uid(),
      step_order: sequence.steps.length + 1,
      name: orig.name ? `${orig.name} (sao chép)` : undefined,
    }
    onChange({ ...sequence, steps: [...sequence.steps, dup].map((s, i) => ({ ...s, step_order: i + 1 })) })
  }

  const handleDeleteStep = (idx: number) => {
    const steps = sequence.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 }))
    onChange({ ...sequence, steps })
  }

  // ─── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = (idx: number) => {
    dragNode.current = idx
    setDragIdx(idx)
  }

  const handleDragEnter = (idx: number) => {
    setDragOverIdx(idx)
  }

  const handleDragEnd = () => {
    const from = dragNode.current
    if (from === null || dragOverIdx === null || from === dragOverIdx) {
      setDragIdx(null)
      setDragOverIdx(null)
      dragNode.current = null
      return
    }
    const steps = [...sequence.steps]
    const [moved] = steps.splice(from, 1)
    steps.splice(dragOverIdx, 0, moved)
    onChange({ ...sequence, steps: steps.map((s, i) => ({ ...s, step_order: i + 1 })) })
    setDragIdx(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  return (
    <div className="space-y-6">

      {/* ─── Section 1: Trigger ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">① Điều kiện khởi chạy</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sự kiện kích hoạt kịch bản tự động</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${triggerInfo ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
              {triggerInfo?.group ?? 'Chưa chọn'}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Trigger type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại trigger *</label>
            <select
              value={sequence.trigger.type}
              onChange={e => handleTriggerTypeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

          {/* Trigger config form */}
          {triggerInfo?.hasConfig && (
            <div className="pl-4 border-l-4 border-orange-200">
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

      {/* ─── Section 2: Điều kiện lọc KH ──────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
            <AlertCircle size={16} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">② Điều kiện lọc khách hàng</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chỉ KH thỏa điều kiện mới vào kịch bản</p>
          </div>
          {sequence.filter.enabled && (
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              {sequence.filter.rules.length} điều kiện
            </span>
          )}
        </div>
        <div className="p-6">
          <ConditionBuilder
            enabled={sequence.filter.enabled}
            logic={sequence.filter.logic}
            rules={sequence.filter.rules}
            onToggle={v => handleFilterChange({ enabled: v })}
            onLogicChange={l => handleFilterChange({ logic: l })}
            onRulesChange={r => handleFilterChange({ rules: r })}
            fields={FILTER_FIELDS}
            tags={MOCK_TAGS_REF}
            toggleLabel="Lọc khách hàng vào kịch bản"
            previewText={
              sequence.filter.rules.length > 0
                ? `${sequence.filter.rules.length} điều kiện (${sequence.filter.logic === 'all' ? 'TẤT CẢ' : 'BẤT KỲ'})`
                : undefined
            }
          />
        </div>
      </div>

      {/* ─── Section 3: Steps Timeline ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">{sequence.steps.length}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">③ Các bước thực hiện</h3>
            <p className="text-xs text-gray-500 mt-0.5">Kéo để sắp xếp thứ tự các bước</p>
          </div>
        </div>

        <div className="p-6">
          {sequence.steps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Chưa có bước nào</p>
              <p className="text-xs text-gray-400 mt-1">Thêm bước đầu tiên để bắt đầu thiết kế kịch bản</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sequence.steps.map((step, idx) => (
                <div key={step.id}>
                  {/* Drop zone indicator */}
                  {dragOverIdx === idx && dragIdx !== null && dragIdx !== idx && (
                    <div className="h-2 mx-2 mb-1 bg-blue-300 rounded-full opacity-60" />
                  )}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className={`transition-opacity ${dragIdx === idx ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <StepCard
                      step={step}
                      index={idx}
                      dragging={dragIdx === idx}
                      onEdit={() => setModalStep(step)}
                      onDuplicate={() => handleDuplicateStep(idx)}
                      onDelete={() => handleDeleteStep(idx)}
                      dragHandleProps={{}}
                    />
                  </div>

                  {/* Connector arrow */}
                  {idx < sequence.steps.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="w-px h-5 bg-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add step button */}
          <button
            type="button"
            onClick={() => setModalStep('new')}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-sm font-semibold text-gray-500 transition-all duration-200"
          >
            <Plus size={16} />
            Thêm bước mới
          </button>
        </div>
      </div>

      {/* Step Config Modal */}
      {modalStep !== null && (
        <StepConfigModal
          step={modalStep === 'new' ? null : modalStep}
          stepCount={sequence.steps.length}
          onSave={handleSaveStep}
          onClose={() => setModalStep(null)}
        />
      )}
    </div>
  )
}
