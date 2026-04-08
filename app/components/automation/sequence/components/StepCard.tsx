'use client'

import React from 'react'
import { GripVertical, MoreHorizontal, Clock, Zap, Filter, Pencil, Copy, Trash2 } from 'lucide-react'
import { SequenceStep } from '../types'
import { ACTION_MAP, DELAY_UNIT_OPTIONS } from '../constants'
import { MOCK_FLOWS } from '../mockData'

interface Props {
  step: SequenceStep;
  index: number;
  dragging?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// ─── Delay Summary ────────────────────────────────────────────────────────────
function delaySummary(delay: SequenceStep['delay']): string {
  if (delay.type === 'immediate') return 'Ngay lập tức'
  const unit = DELAY_UNIT_OPTIONS.find(u => u.value === delay.unit)?.label ?? delay.unit
  const tw = delay.time_window ? `, khung giờ ${delay.time_window.from}–${delay.time_window.to}` : ''
  return `Sau ${delay.value} ${unit}${tw}`
}

// ─── Action Summary ────────────────────────────────────────────────────────────
function actionSummary(step: SequenceStep): string {
  const action = ACTION_MAP[step.action.type]
  const cfg = step.action.config as Record<string, unknown>

  switch (step.action.type) {
    case 'send_flow': {
      const flow = MOCK_FLOWS.find(f => f.id === cfg.flow_id)
      return `${action?.icon ?? '📨'} Gửi: "${flow?.name ?? 'Chưa chọn luồng'}"`
    }
    case 'assign_tags':
      return `🏷️ Gắn ${((cfg.tag_ids as string[]) ?? []).length} tags`
    case 'remove_tags':
      return `🗑️ Gỡ ${((cfg.tag_ids as string[]) ?? []).length} tags`
    case 'create_task':
      return `✅ Tạo việc: "${cfg.title ?? 'Chưa đặt tên'}"`
    case 'create_reminder':
      return `🔔 Nhắc: "${(cfg.content as string)?.slice(0, 25) ?? 'Chưa có nội dung'}${((cfg.content as string)?.length ?? 0) > 25 ? '...' : ''}"`
    case 'pause_bot':
      return `⏸️ Tạm dừng Bot ${cfg.duration_minutes} phút`
    case 'resume_bot':
      return `▶️ Kích hoạt lại Bot`
    case 'enroll_sequence':
      return `🔗 Đăng ký kịch bản khác`
    case 'cancel_sequence':
      return `🚫 Hủy kịch bản`
    default:
      return action?.label ?? 'Chưa chọn hành động'
  }
}

// ─── Step Card ────────────────────────────────────────────────────────────────
export default function StepCard({ step, index, dragging, onEdit, onDuplicate, onDelete, dragHandleProps }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const hasCondition = step.condition?.enabled && (step.condition.rules.length ?? 0) > 0

  return (
    <div
      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
        dragging
          ? 'border-blue-400 shadow-lg shadow-blue-100 scale-[1.01] opacity-90'
          : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="pt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
          title="Kéo để sắp xếp"
        >
          <GripVertical size={18} />
        </div>

        {/* Step number badge */}
        <div className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {step.name || `Bước ${index + 1}`}
              </p>

              {/* Delay */}
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500">{delaySummary(step.delay)}</span>
              </div>

              {/* Condition */}
              {hasCondition && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Filter size={12} className="text-amber-500 shrink-0" />
                  <span className="text-xs text-amber-600 font-medium">
                    {step.condition!.rules.length} điều kiện ·{' '}
                    {step.condition!.on_skip === 'continue' ? 'Bỏ qua & tiếp tục' : 'Bỏ qua & kết thúc'}
                  </span>
                </div>
              )}

              {/* Action */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <Zap size={12} className="text-blue-500 shrink-0" />
                <span className="text-xs text-gray-700 font-medium">{actionSummary(step)}</span>
              </div>
            </div>

            {/* Menu */}
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-44 overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={13} className="text-gray-400" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDuplicate() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={13} className="text-gray-400" />
                    Sao chép
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Xóa bước
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
