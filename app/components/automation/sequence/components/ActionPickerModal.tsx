'use client'

import React, { useState, useMemo } from 'react'
import { X, Search, Check, ChevronRight } from 'lucide-react'
import { ActionType, ActionConfig } from '../types'
import { ACTION_OPTIONS } from '../constants'
import { MOCK_TAGS_REF, MOCK_FLOWS, MOCK_SEQUENCE_OPTIONS } from '../mockData'

interface Props {
  onSave: (actionType: ActionType, config: ActionConfig) => void
  onClose: () => void
}

// ─── Grouped action list ──────────────────────────────────────────────────────
const GROUPS = ['Tin nhắn', 'Tag', 'Kịch bản', 'Bot', 'Khác']

// ─── Inline config per action ─────────────────────────────────────────────────
function TagSelector({ selectedIds, onChange, label }: {
  selectedIds: string[]; onChange: (ids: string[]) => void; label: string
}) {
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-2">{label} *</p>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl min-h-[44px] bg-white">
        {MOCK_TAGS_REF.map(tag => {
          const on = selectedIds.includes(tag.id)
          return (
            <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                on ? 'border-transparent text-white shadow-sm' : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
              }`}
              style={on ? { background: tag.color } : {}}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: on ? 'rgba(255,255,255,0.7)' : tag.color }} />
              {tag.name}
            </button>
          )
        })}
      </div>
      {selectedIds.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ Chọn ít nhất 1 tag</p>}
    </div>
  )
}

function InlineConfig({ actionType, config, onChange }: {
  actionType: ActionType; config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void
}) {
  switch (actionType) {
    case 'send_flow': {
      const published = MOCK_FLOWS.filter(f => f.status === 'published')
      const sel = published.find(f => f.id === config.flow_id)
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">Chọn Luồng tin nhắn *</p>
          <select value={(config.flow_id as string) ?? ''} onChange={e => onChange({ flow_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">-- Chọn luồng --</option>
            {published.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          {sel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <span className="text-blue-500">📨</span>
              <span className="text-xs text-blue-700 font-medium">{sel.message_count} tin nhắn</span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Đã xuất bản</span>
            </div>
          )}
        </div>
      )
    }
    case 'assign_tags':
      return <TagSelector selectedIds={(config.tag_ids as string[]) ?? []} onChange={ids => onChange({ tag_ids: ids })} label="Tags sẽ được gắn" />
    case 'remove_tags':
      return <TagSelector selectedIds={(config.tag_ids as string[]) ?? []} onChange={ids => onChange({ tag_ids: ids })} label="Tags sẽ bị gỡ" />
    case 'create_task':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Tiêu đề công việc <span className='text-red-500'>*</span></p>
            <input type="text" value={(config.title as string) ?? ''}
              onChange={e => onChange({ ...config, title: e.target.value })}
              placeholder="VD: Gọi điện tư vấn KH"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Giao cho <span className='text-red-500'>*</span></p>
            <div className="flex gap-3">
              {(['lead_owner', 'specific_user'] as const).map(at => (
                <label key={at} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="assign_to_ap" value={at}
                    checked={(config.assign_to as string) === at}
                    onChange={() => onChange({ ...config, assign_to: at })}
                    className="text-blue-600" />
                  <span className="text-sm text-gray-700">{at === 'lead_owner' ? 'Nhân viên đang phụ trách' : 'Nhân viên cụ thể'}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Thời hạn <span className='text-red-500'>*</span></p>
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={(config.deadline_value as number) ?? 24}
                onChange={e => onChange({ ...config, deadline_value: Number(e.target.value) })}
                className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
              <select value={(config.deadline_unit as string) ?? 'hours'}
                onChange={e => onChange({ ...config, deadline_unit: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="hours">giờ</option>
                <option value="days">ngày</option>
              </select>
              <span className="text-sm text-gray-500">kể từ khi tạo</span>
            </div>
          </div>
        </div>
      )
    case 'create_reminder':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Nội dung nhắc nhở <span className='text-red-500'>*</span></p>
            <textarea rows={2} value={(config.content as string) ?? ''}
              onChange={e => onChange({ ...config, content: e.target.value })}
              placeholder="VD: Gọi điện hỏi thăm KH"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">Nhắc cho <span className='text-red-500'>*</span></p>
            <div className="flex gap-3">
              {(['lead_owner', 'self'] as const).map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recipient_ap" value={r}
                    checked={(config.recipient as string) === r}
                    onChange={() => onChange({ ...config, recipient: r })} className="text-blue-600" />
                  <span className="text-sm text-gray-700">{r === 'lead_owner' ? 'Nhân viên đang phụ trách' : 'Bản thân tôi'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    case 'pause_bot': {
      const dur = (config.duration_minutes as number) ?? 30
      return (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600">Thời gian tạm dừng *</p>
          <div className="flex items-center gap-3">
            <input type="number" min={1} max={1440} value={dur}
              onChange={e => onChange({ duration_minutes: Number(e.target.value) })}
              className="w-24 px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
            <span className="text-sm text-gray-600">phút (1–1440)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[15, 30, 60, 120, 480, 1440].map(v => (
              <button key={v} type="button" onClick={() => onChange({ duration_minutes: v })}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${dur === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                {v >= 60 ? `${v / 60}h` : `${v}p`}
              </button>
            ))}
          </div>
        </div>
      )
    }
    case 'resume_bot':
      return <div className="p-3.5 bg-green-50 rounded-xl"><p className="text-sm text-green-700">Bot sẽ được bật lại ngay lập tức cho khách hàng này.</p></div>
    case 'enroll_sequence':
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">Kịch bản đăng ký *</p>
          <select value={(config.sequence_id as string) ?? ''} onChange={e => onChange({ sequence_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">-- Chọn kịch bản --</option>
            {MOCK_SEQUENCE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <p className="text-xs text-amber-600">⚠ Nếu KH đang trong kịch bản đã chọn, sẽ bỏ qua.</p>
        </div>
      )
    case 'cancel_sequence': {
      const mode = (config.mode as string) ?? 'current'
      return (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600">Hủy kịch bản *</p>
          <div className="space-y-2">
            {([{ v: 'current', l: 'Kịch bản hiện tại' }, { v: 'other', l: 'Kịch bản khác' }] as const).map(opt => (
              <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cancel_mode_ap" value={opt.v} checked={mode === opt.v}
                  onChange={() => onChange({ ...config, mode: opt.v })} className="text-blue-600" />
                <span className="text-sm text-gray-700">{opt.l}</span>
              </label>
            ))}
          </div>
          {mode === 'other' && (
            <select value={(config.sequence_id as string) ?? ''} onChange={e => onChange({ ...config, sequence_id: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">-- Chọn kịch bản cần hủy --</option>
              {MOCK_SEQUENCE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
      )
    }
    default:
      return null
  }
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ActionPickerModal({ onSave, onClose }: Props) {
  const [search, setSearch]             = useState('')
  const [pickedType, setPickedType]     = useState<ActionType | null>(null)
  const [config, setConfig]             = useState<Record<string, unknown>>({})

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase()
    return GROUPS.map(g => ({
      group: g,
      items: ACTION_OPTIONS.filter(a =>
        (a as unknown as { group: string }).group === g &&
        (q === '' || a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      )
    })).filter(g => g.items.length > 0)
  }, [search])

  const pickedMeta = ACTION_OPTIONS.find(a => a.type === pickedType)

  const canSave = pickedType !== null && (
    pickedType === 'resume_bot' ||
    (pickedType === 'send_flow'       && !!(config.flow_id)) ||
    (pickedType === 'assign_tags'     && (config.tag_ids as string[] | undefined)?.length) ||
    (pickedType === 'remove_tags'     && (config.tag_ids as string[] | undefined)?.length) ||
    (pickedType === 'create_task'     && !!(config.title)) ||
    (pickedType === 'create_reminder' && !!(config.content)) ||
    (pickedType === 'pause_bot'       && !!(config.duration_minutes)) ||
    (pickedType === 'enroll_sequence' && !!(config.sequence_id)) ||
    (pickedType === 'cancel_sequence' && !!(config.mode))
  )

  const handleSave = () => {
    if (!pickedType || !canSave) return
    onSave(pickedType, config as ActionConfig)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">Thêm hành động</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chọn loại hành động và cấu hình chi tiết</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left — action list */}
          <div className="w-[280px] shrink-0 border-r border-gray-100 flex flex-col">
            {/* Search */}
            <div className="px-3 py-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>

            {/* Grouped list */}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredGroups.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-4 pt-3 pb-1 tracking-widest">{group}</p>
                  {items.map(action => (
                    <button key={action.type} onClick={() => { setPickedType(action.type as ActionType); setConfig({}) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                        pickedType === action.type
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-base shrink-0">{action.icon}</span>
                      <span className="text-sm font-medium flex-1 min-w-0 truncate">{action.label}</span>
                      {pickedType === action.type && <ChevronRight size={13} className="text-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right — config form */}
          <div className="flex-1 flex flex-col min-w-0">
            {pickedType ? (
              <>
                <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pickedMeta?.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{pickedMeta?.label}</p>
                      <p className="text-xs text-gray-500">{pickedMeta?.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <InlineConfig actionType={pickedType} config={config} onChange={setConfig} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8">
                <div className="text-5xl mb-3">⚡</div>
                <p className="text-sm font-medium text-gray-400">Chọn một hành động từ danh sách bên trái</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
            Hủy
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm">
            <Check size={14} />
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}
