'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import { SequenceStep, StepDelay, StepCondition } from '../types'
import { DELAY_UNIT_OPTIONS, STEP_CONDITION_FIELDS } from '../constants'
import { MOCK_TAGS_REF } from '../mockData'
import ConditionBuilder from './ConditionBuilder'

interface Props {
  step: SequenceStep
  anchorEl: HTMLElement | null          // button that triggered the popup
  onSave: (delay: StepDelay, condition: StepCondition | null) => void
  onClose: () => void
}

type DelayMode = 'immediate' | 'after'

function RadioDot({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
        checked ? 'border-[#3e79f7] bg-[#3e79f7]' : 'border-[#e6ebf1] hover:border-gray-400'
      }`}
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
  )
}

function PopupContent({
  step, anchorEl, onSave, onClose,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null)

  const initMode = (): DelayMode => step.delay.type === 'immediate' ? 'immediate' : 'after'

  const [mode, setMode]             = useState<DelayMode>(initMode)
  const [value, setValue]           = useState(step.delay.value ?? 1)
  const [unit, setUnit]             = useState<'minutes' | 'hours' | 'days'>(step.delay.unit ?? 'days')
  const [useWindow, setUseWindow]   = useState(!!step.delay.time_window)
  const [windowFrom, setWindowFrom] = useState(step.delay.time_window?.from ?? '08:00')
  const [windowTo, setWindowTo]     = useState(step.delay.time_window?.to ?? '22:00')
  const [condition, setCondition]   = useState<StepCondition>(
    step.condition ?? { enabled: false, logic: 'all', rules: [], on_skip: 'continue' }
  )

  // Calculate position from anchor element — flip up if near bottom
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 })

  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const POPUP_WIDTH  = 440
    const POPUP_HEIGHT = 520   // estimated max height
    const viewW = window.innerWidth
    const viewH = window.innerHeight

    let left = rect.left
    if (left + POPUP_WIDTH > viewW - 16) left = viewW - POPUP_WIDTH - 16

    // Flip up when not enough room below
    if (rect.bottom + POPUP_HEIGHT + 12 > viewH) {
      setPos({ bottom: viewH - rect.top + 6, left })
    } else {
      setPos({ top: rect.bottom + 6, left })
    }
  }, [anchorEl])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        anchorEl && !anchorEl.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [anchorEl, onClose])

  // Close on scroll
  useEffect(() => {
    const handler = () => onClose()
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [onClose])

  const handleSave = () => {
    let delay: StepDelay
    if (mode === 'immediate') {
      delay = { type: 'immediate' }
    } else {
      delay = {
        type: 'wait',
        value,
        unit: unit as StepDelay['unit'],
        time_window: useWindow ? { from: windowFrom, to: windowTo } : undefined,
      }
    }
    onSave(delay, condition.enabled ? condition : null)
    onClose()
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

  return (
    <div
      ref={popupRef}
      style={{ position: 'fixed', ...pos, width: 440, zIndex: 9999 }}
      className="bg-white border border-[#e6ebf1] rounded-[10px] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Cài đặt gửi tin nhắn</h4>
          <p className="text-xs text-gray-400 mt-0.5">Thời gian được tính từ lúc kịch bản được khởi chạy</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-[10px] hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="px-5 py-4 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>

        {/* ── Section 1: Timing ── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3">
            Khi kịch bản được khởi chạy - Tin nhắn được gửi:
          </p>
          <div className="space-y-3">
            {/* Ngay lập tức */}
            <label className="flex items-center gap-3 cursor-pointer">
              <RadioDot checked={mode === 'immediate'} onClick={() => setMode('immediate')} />
              <span className="text-sm text-gray-700">Ngay lập tức</span>
            </label>

            {/* Sau N đơn vị */}
            <div className="flex items-center gap-3 flex-wrap">
              <RadioDot checked={mode === 'after'} onClick={() => setMode('after')} />
              <span className="text-sm text-gray-700 shrink-0">Thời gian</span>
              {mode === 'after' && (
                <>
                  <input
                    type="number" min={1} max={365} value={value}
                    onChange={e => setValue(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-3 py-2 text-sm font-semibold border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] text-center"
                  />
                  <select
                    value={unit} onChange={e => setUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                    className="flex-1 min-w-[80px] px-3 py-2 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
                  >
                    {DELAY_UNIT_OPTIONS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Section 2: Time window ── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3">Cho phép gửi tin nhắn:</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <RadioDot checked={!useWindow} onClick={() => setUseWindow(false)} />
              <span className="text-sm text-gray-700">Mọi lúc</span>
            </label>

            <div className="flex items-center gap-3 flex-wrap">
              <RadioDot checked={useWindow} onClick={() => setUseWindow(true)} />
              <span className="text-sm text-gray-700 shrink-0">Trong khoảng thời gian</span>
              {useWindow && (
                <div className="flex items-center gap-2">
                  <select
                    value={windowFrom} onChange={e => setWindowFrom(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
                  >
                    {hourOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-xs text-gray-500">đến</span>
                  <select
                    value={windowTo} onChange={e => setWindowTo(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
                  >
                    {hourOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Section 3: Filter conditions ── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3">Điều kiện gửi tin nhắn</p>
          <ConditionBuilder
            enabled={condition.enabled}
            logic={condition.logic}
            rules={condition.rules}
            onToggle={v => setCondition(c => ({ ...c, enabled: v }))}
            onLogicChange={l => setCondition(c => ({ ...c, logic: l }))}
            onRulesChange={r => setCondition(c => ({ ...c, rules: r }))}
            fields={STEP_CONDITION_FIELDS}
            tags={MOCK_TAGS_REF}
            toggleLabel="Áp dụng điều kiện"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-[10px] transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-[#3e79f7] hover:bg-[#699dff] rounded-[10px] transition-colors shadow-sm"
        >
          <Check size={14} />
          Lưu và cập nhật
        </button>
      </div>
    </div>
  )
}

export default function TimingPopup(props: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(<PopupContent {...props} />, document.body)
}
