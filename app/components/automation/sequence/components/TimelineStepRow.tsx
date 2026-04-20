'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  GripVertical, MoreHorizontal,
  Pencil, Copy, Trash2, BarChart2, ArrowRightLeft,
  Clock, Filter
} from 'lucide-react'
import { SequenceStep, StepDelay, StepCondition, ActionType, ActionConfig } from '../types'
import { DELAY_UNIT_OPTIONS } from '../constants'
import { MOCK_FLOWS } from '../mockData'
import TimingPopup from './TimingPopup'
import FlowPickerModal from './FlowPickerModal'
import ActionPickerModal from './ActionPickerModal'
import StepStatsModal from './StepStatsModal'

interface Props {
  step: SequenceStep
  index: number
  isLast: boolean
  enabled: boolean
  dragging?: boolean
  isSelected: boolean
  onCheckChange: (id: string, checked: boolean) => void
  onUpdate: (step: SequenceStep) => void
  onToggleEnabled: () => void
  onDuplicate: () => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

// ─── Timing label ──────────────────────────────────────────────────────────────
function buildTimingLabel(delay: StepDelay): { main: string; sub?: string } {
  if (delay.type === 'immediate') return { main: 'Ngay lập tức' }
  const unit = DELAY_UNIT_OPTIONS.find(u => u.value === delay.unit)?.label ?? delay.unit
  const main = `Sau ${delay.value} ${unit}`
  const sub = delay.time_window
    ? `${delay.time_window.from} - ${delay.time_window.to}`
    : undefined
  return { main, sub }
}

// ─── Action Title ─────────────────────────────────────────────────────────────
function ActionTitle({
  step,
  onPickFlow,
}: {
  step: SequenceStep
  onPickFlow: () => void
}) {
  const cfg = step.action.config as Record<string, unknown>

  switch (step.action.type) {
    case 'send_flow': {
      const flow = MOCK_FLOWS.find(f => f.id === cfg.flow_id)
      if (flow) {
        return (
          <span className="text-sm font-medium text-gray-800">
            <span className="text-gray-400 font-normal mr-1">Gửi:</span>
            {flow.name}
          </span>
        )
      }
      return (
        <span className="text-sm">
          <button
            type="button"
            onClick={onPickFlow}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Chọn từ danh sách đã có
          </button>
        </span>
      )
    }
    case 'assign_tags': {
      const ids = (cfg.tag_ids as string[]) ?? []
      return <span className="text-sm font-medium text-gray-800">🏷️ Gắn {ids.length} thẻ</span>
    }
    case 'remove_tags': {
      const ids = (cfg.tag_ids as string[]) ?? []
      return <span className="text-sm font-medium text-gray-800">🗑️ Gỡ {ids.length} thẻ</span>
    }
    case 'create_task': {
      const title = (cfg.title as string) ?? 'Chưa đặt tên'
      return <span className="text-sm font-medium text-gray-800">✅ {title}</span>
    }
    case 'create_reminder': {
      const content = (cfg.content as string) ?? ''
      return <span className="text-sm font-medium text-gray-800">🔔 Nhắc: &quot;{content.slice(0, 40)}&quot;</span>
    }
    case 'pause_bot':
      return <span className="text-sm font-medium text-gray-800">⏸️ Tạm dừng Bot {cfg.duration_minutes as number} phút</span>
    case 'resume_bot':
      return <span className="text-sm font-medium text-gray-800">▶️ Kích hoạt lại Bot</span>
    case 'enroll_sequence':
      return <span className="text-sm font-medium text-gray-800">🔗 Đăng ký kịch bản khác</span>
    case 'cancel_sequence':
      return <span className="text-sm font-medium text-gray-800">🚫 Hủy kịch bản</span>
    default:
      return <span className="text-sm text-gray-400 italic">Chưa chọn hành động</span>
  }
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#3e79f7]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

// ─── Main Row Component ────────────────────────────────────────────────────────
export default function TimelineStepRow({
  step, index, isLast, enabled, dragging,
  isSelected, onCheckChange,
  onUpdate, onToggleEnabled, onDuplicate, onDelete,
  dragHandleProps,
}: Props) {
  const [showTimingPopup,    setShowTimingPopup]    = useState(false)
  const [menuOpen,           setMenuOpen]           = useState(false)
  const [showFlowPicker,     setShowFlowPicker]     = useState(false)
  const [showActionPicker,   setShowActionPicker]   = useState(false)
  const [showStats,          setShowStats]          = useState(false)

  const menuRef      = useRef<HTMLDivElement>(null)
  const timingBtnRef = useRef<HTMLButtonElement>(null)

  const timing      = buildTimingLabel(step.delay)
  const hasCondition = step.condition?.enabled && (step.condition.rules.length ?? 0) > 0

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTimingSave = (delay: StepDelay, condition: StepCondition | null) => {
    onUpdate({ ...step, delay, condition })
    setShowTimingPopup(false)
  }

  const handleFlowSelect = (flowId: string) => {
    onUpdate({ ...step, action: { ...step.action, config: { flow_id: flowId } } })
    setShowFlowPicker(false)
  }

  const handleActionSave = (actionType: ActionType, config: ActionConfig) => {
    onUpdate({ ...step, action: { type: actionType, config } })
    setShowActionPicker(false)
  }

  const ROW_H = 48

  return (
    <>
      <div className={`flex items-center transition-opacity ${dragging ? 'opacity-40' : 'opacity-100'}`}>

        {/* ── LEFT: Timeline column ─────────────────────────────────────── */}
        <div className="w-44 shrink-0 flex flex-col items-end pr-4 relative" style={{ minHeight: ROW_H }}>
          {/* Vertical connector line */}
          {!isLast && (
            <div className="absolute right-[11px] top-1/2 bottom-0 w-px bg-gray-200"
              style={{ transform: 'translateY(50%)' }}
            />
          )}
          {index > 0 && (
            <div className="absolute right-[11px] bottom-1/2 top-0 w-px bg-gray-200"
              style={{ transform: 'translateY(-50%)' }}
            />
          )}
          <div className="absolute right-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#e6ebf1] z-10" />

          {/* Timing button */}
          <button
            ref={timingBtnRef}
            type="button"
            onClick={() => setShowTimingPopup(p => !p)}
            className={`text-right leading-snug transition-colors group pr-5 ${
              showTimingPopup ? 'text-[#3e79f7]' : 'text-blue-500 hover:text-[#3e79f7]'
            }`}
          >
            <div className="flex items-center gap-1 justify-end">
              <Clock size={11} className="shrink-0 opacity-70" />
              <span className="text-xs font-semibold underline-offset-2 group-hover:underline whitespace-nowrap">
                {timing.main}
              </span>
            </div>
            {timing.sub && (
              <div className="text-[10px] text-gray-400 mt-0.5 pr-0.5">{timing.sub}</div>
            )}
          </button>
        </div>

        {/* ── RIGHT: Content row ────────────────────────────────────────── */}
        <div
          className={`flex-1 flex items-center gap-4 px-4 py-3 border rounded-[10px] mb-3 bg-white transition-all duration-150 ${
            isSelected
              ? 'border-blue-300 bg-blue-50/50 shadow-sm'
              : dragging
                ? 'border-[#699dff] shadow-lg shadow-blue-50 scale-[1.005]'
                : 'border-gray-100 hover:border-blue-100 hover:shadow-sm'
          }`}
        >
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
            title="Kéo để sắp xếp"
          >
            <GripVertical size={16} />
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onCheckChange(step.id, e.target.checked)}
            className="w-4 h-4 rounded border-[#e6ebf1] text-blue-600 cursor-pointer shrink-0"
          />

          {/* Toggle kích hoạt */}
          <div className="shrink-0">
            <ToggleSwitch checked={enabled} onChange={onToggleEnabled} />
          </div>

          {/* Content — title only */}
          <div className="flex-1 min-w-0">
            <ActionTitle step={step} onPickFlow={() => setShowFlowPicker(true)} />
            {hasCondition && (
              <div className="flex items-center gap-1 mt-0.5">
                <Filter size={10} className="text-amber-500 shrink-0" />
                <span className="text-[11px] text-amber-600 font-medium">
                  {step.condition!.rules.length} điều kiện ·{' '}
                  {step.condition!.on_skip === 'continue' ? 'Bỏ qua & tiếp tục' : 'Bỏ qua & kết thúc'}
                </span>
              </div>
            )}
          </div>

          {/* Đã gửi */}
          <div className="shrink-0 w-14 text-right">
            <span className="text-xs text-gray-400 font-medium">0</span>
          </div>

          {/* Context menu */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-[10px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-[#e6ebf1] rounded-[10px] shadow-xl z-50 w-48 overflow-hidden py-1">
                <button onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Pencil size={13} className="text-gray-400" />Sửa tên
                </button>
                <button onClick={() => { setMenuOpen(false); setShowActionPicker(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <ArrowRightLeft size={13} className="text-gray-400" />Thay thế hành động
                </button>
                <button onClick={() => { setMenuOpen(false); onDuplicate() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Copy size={13} className="text-gray-400" />Nhân bản
                </button>
                <button onClick={() => { setMenuOpen(false); setShowStats(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <BarChart2 size={13} className="text-gray-400" />Thống kê
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { setMenuOpen(false); onDelete() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />Xóa bước này
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TimingPopup portal */}
      {showTimingPopup && (
        <TimingPopup
          step={step}
          anchorEl={timingBtnRef.current}
          onSave={handleTimingSave}
          onClose={() => setShowTimingPopup(false)}
        />
      )}

      {/* Flow picker modal */}
      {showFlowPicker && (
        <FlowPickerModal
          currentFlowId={(step.action.config as Record<string, unknown>).flow_id as string | undefined}
          onSelect={handleFlowSelect}
          onClose={() => setShowFlowPicker(false)}
        />
      )}

      {/* Action picker modal (replace action) */}
      {showActionPicker && (
        <ActionPickerModal
          onSave={handleActionSave}
          onClose={() => setShowActionPicker(false)}
        />
      )}

      {/* Stats modal */}
      {showStats && (
        <StepStatsModal
          step={step}
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  )
}
