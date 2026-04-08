'use client'

import React, { useState } from 'react'
import { X, Clock, Filter, Zap, ChevronDown, Check } from 'lucide-react'
import { SequenceStep, StepDelay, StepCondition, ActionType } from './types'
import { ACTION_OPTIONS, DELAY_UNIT_OPTIONS, STEP_CONDITION_FIELDS } from './constants'
import { MOCK_TAGS_REF } from './mockData'
import ConditionBuilder from './components/ConditionBuilder'
import ActionConfigForm from './components/ActionConfigForm'

interface Props {
  step: SequenceStep | null;   // null = new step
  stepCount: number;
  onSave: (step: Omit<SequenceStep, 'id' | 'step_order'> & { id?: string }) => void;
  onClose: () => void;
}

function uid() { return Math.random().toString(36).slice(2, 9) }

const DEFAULT_DELAY: StepDelay = { type: 'immediate' }
const DEFAULT_CONDITION: StepCondition = { enabled: false, logic: 'all', rules: [], on_skip: 'continue' }

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <span className="text-gray-400">{icon}</span>
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function StepConfigModal({ step, stepCount, onSave, onClose }: Props) {
  const isNew = !step

  const [name, setName]           = useState(step?.name ?? '')
  const [delay, setDelay]         = useState<StepDelay>(step?.delay ?? DEFAULT_DELAY)
  const [condition, setCondition] = useState<StepCondition>(step?.condition ?? DEFAULT_CONDITION)
  const [actionType, setActionType] = useState<ActionType | ''>(step?.action.type ?? '')
  const [actionConfig, setActionConfig] = useState<Record<string, unknown>>(
    (step?.action.config as Record<string, unknown>) ?? {}
  )
  const [actionDropOpen, setActionDropOpen] = useState(false)

  const canSave = actionType !== ''

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: step?.id,
      name: name.trim() || undefined,
      delay,
      condition: condition.enabled ? condition : null,
      action: { type: actionType as ActionType, config: actionConfig },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isNew ? `Thêm bước ${stepCount + 1}` : `Cấu hình bước ${step?.step_order}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Thiết lập thời gian, điều kiện và hành động</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Section 1: Tên bước ─────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên bước (tùy chọn)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`VD: Gửi tin chào mừng`}
              maxLength={100}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* ── Section 2: Thời gian ─────────────────────────────── */}
          <Section icon={<Clock size={15} />} title="⏱ Thời gian chờ">
            <div className="space-y-4">
              {/* Immediate / Wait radio */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="delay_type" value="immediate"
                    checked={delay.type === 'immediate'}
                    onChange={() => setDelay({ type: 'immediate' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Ngay lập tức</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="delay_type" value="wait"
                    checked={delay.type === 'wait'}
                    onChange={() => setDelay({ type: 'wait', value: 1, unit: 'days' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Chờ sau</span>
                </label>
              </div>

              {/* Wait config */}
              {delay.type === 'wait' && (
                <div className="space-y-3 pl-4 border-l-2 border-blue-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={365}
                      value={delay.value ?? 1}
                      onChange={e => setDelay(d => ({ ...d, value: Number(e.target.value) }))}
                      className="w-20 px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                    <select
                      value={delay.unit ?? 'days'}
                      onChange={e => setDelay(d => ({ ...d, unit: e.target.value as StepDelay['unit'] }))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {DELAY_UNIT_OPTIONS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time window */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setDelay(d => ({
                        ...d,
                        time_window: d.time_window ? undefined : { from: '08:00', to: '18:00' },
                      }))}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${delay.time_window ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
                    >
                      {delay.time_window && <Check size={10} color="white" />}
                    </div>
                    <span className="text-sm text-gray-700">Chỉ thực hiện trong khung giờ</span>
                  </label>

                  {delay.time_window && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-sm text-gray-500">Từ</span>
                      <input
                        type="time"
                        value={delay.time_window.from}
                        onChange={e => setDelay(d => ({ ...d, time_window: { ...d.time_window!, from: e.target.value } }))}
                        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">đến</span>
                      <input
                        type="time"
                        value={delay.time_window.to}
                        onChange={e => setDelay(d => ({ ...d, time_window: { ...d.time_window!, to: e.target.value } }))}
                        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* ── Section 3: Điều kiện ─────────────────────────────── */}
          <Section icon={<Filter size={15} />} title="🎯 Điều kiện thực hiện">
            <div className="space-y-4">
              <ConditionBuilder
                enabled={condition.enabled}
                logic={condition.logic}
                rules={condition.rules}
                onToggle={v => setCondition(c => ({ ...c, enabled: v }))}
                onLogicChange={l => setCondition(c => ({ ...c, logic: l }))}
                onRulesChange={r => setCondition(c => ({ ...c, rules: r }))}
                fields={STEP_CONDITION_FIELDS}
                tags={MOCK_TAGS_REF}
                toggleLabel="Áp dụng điều kiện cho bước này"
              />

              {condition.enabled && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Khi không thỏa điều kiện:</p>
                  <div className="space-y-2">
                    {([
                      { v: 'continue',    l: 'Bỏ qua bước này, tiếp tục bước sau' },
                      { v: 'end_journey', l: 'Bỏ qua bước này, kết thúc kịch bản' },
                    ] as const).map(opt => (
                      <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="on_skip"
                          value={opt.v}
                          checked={condition.on_skip === opt.v}
                          onChange={() => setCondition(c => ({ ...c, on_skip: opt.v }))}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{opt.l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ── Section 4: Hành động ─────────────────────────────── */}
          <Section icon={<Zap size={15} />} title="⚡ Hành động">
            <div className="space-y-4">
              {/* Action type dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại hành động *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActionDropOpen(o => !o)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {actionType
                      ? <span className="text-gray-800">{ACTION_OPTIONS.find(a => a.type === actionType)?.icon} {ACTION_OPTIONS.find(a => a.type === actionType)?.label}</span>
                      : <span className="text-gray-400">-- Chọn hành động --</span>}
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${actionDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {actionDropOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                      {ACTION_OPTIONS.map(opt => (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => {
                            setActionType(opt.type)
                            setActionConfig({})
                            setActionDropOpen(false)
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${actionType === opt.type ? 'bg-blue-50' : ''}`}
                        >
                          <span className="text-base shrink-0">{opt.icon}</span>
                          <div>
                            <p className={`text-sm font-semibold ${actionType === opt.type ? 'text-blue-700' : 'text-gray-800'}`}>{opt.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action config form */}
              {actionType && (
                <ActionConfigForm
                  actionType={actionType as ActionType}
                  config={actionConfig}
                  onChange={cfg => setActionConfig(cfg as Record<string, unknown>)}
                />
              )}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isNew ? 'Thêm bước' : 'Lưu bước'}
          </button>
        </div>
      </div>
    </div>
  )
}
