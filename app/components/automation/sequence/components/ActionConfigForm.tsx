'use client'

import React from 'react'
import { ActionType, ActionConfig } from '../types'
import { MOCK_FLOWS, MOCK_TAGS_REF, MOCK_SEQUENCE_OPTIONS } from '../mockData'

interface Props {
  actionType: ActionType;
  config: ActionConfig;
  onChange: (config: ActionConfig) => void;
}

// ─── Multi-tag Select (simple version) ────────────────────────────────────────
function TagMultiSelect({ selectedIds, onChange }: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])

  return (
    <div className="flex flex-wrap gap-2 p-3 border border-[#e6ebf1] rounded-[10px] min-h-[42px] bg-white">
      {MOCK_TAGS_REF.map(tag => (
        <button
          key={tag.id}
          type="button"
          onClick={() => toggle(tag.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            selectedIds.includes(tag.id)
              ? 'border-transparent text-white shadow-sm'
              : 'border-[#e6ebf1] text-gray-700 bg-white hover:border-[#e6ebf1]'
          }`}
          style={selectedIds.includes(tag.id) ? { background: tag.color } : {}}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: selectedIds.includes(tag.id) ? 'rgba(255,255,255,0.7)' : tag.color }}
          />
          {tag.name}
        </button>
      ))}
    </div>
  )
}

export default function ActionConfigForm({ actionType, config, onChange }: Props) {
  const cfg = config as Record<string, unknown>

  switch (actionType) {
    // ── send_flow ────────────────────────────────────────────────────────────
    case 'send_flow': {
      const publishedFlows = MOCK_FLOWS.filter(f => f.status === 'published')
      const selected = publishedFlows.find(f => f.id === cfg.flow_id)
      return (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600">Chọn Luồng tin nhắn *</label>
          <select
            value={(cfg.flow_id as string) ?? ''}
            onChange={e => onChange({ flow_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
          >
            <option value="">-- Chọn luồng --</option>
            {publishedFlows.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {selected && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-[10px]">
              <span className="text-blue-500">📨</span>
              <span className="text-xs text-[#3e79f7] font-medium">{selected.message_count} tin nhắn</span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Đã xuất bản</span>
            </div>
          )}
        </div>
      )
    }

    // ── assign_tags / remove_tags ─────────────────────────────────────────────
    case 'assign_tags':
    case 'remove_tags': {
      const tagIds = (cfg.tag_ids as string[]) ?? []
      return (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600">
            {actionType === 'assign_tags' ? 'Tags sẽ được gắn ' : 'Tags sẽ bị gỡ '}
            <span className="text-red-500">*</span>
          </label>
          <TagMultiSelect
            selectedIds={tagIds}
            onChange={ids => onChange({ tag_ids: ids })}
          />
          {tagIds.length === 0 && (
            <p className="text-xs text-amber-600">⚠ Chọn ít nhất 1 tag</p>
          )}
        </div>
      )
    }

    // ── create_task ───────────────────────────────────────────────────────────
    case 'create_task': {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tiêu đề công việc *</label>
            <input
              type="text"
              value={(cfg.title as string) ?? ''}
              onChange={e => onChange({ ...cfg, title: e.target.value })}
              placeholder="VD: Gọi điện tư vấn KH"
              className="w-full px-3 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giao cho *</label>
            <div className="flex gap-3">
              {(['lead_owner', 'specific_user'] as const).map(at => (
                <label key={at} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assign_to"
                    value={at}
                    checked={(cfg.assign_to as string) === at}
                    onChange={() => onChange({ ...cfg, assign_to: at })}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {at === 'lead_owner' ? 'NV phụ trách KH' : 'NV cụ thể'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thời hạn *</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1}
                value={(cfg.deadline_value as number) ?? 24}
                onChange={e => onChange({ ...cfg, deadline_value: Number(e.target.value) })}
                className="w-20 px-3 py-2 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] text-center"
              />
              <select
                value={(cfg.deadline_unit as string) ?? 'hours'}
                onChange={e => onChange({ ...cfg, deadline_unit: e.target.value })}
                className="px-3 py-2 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
              >
                <option value="hours">giờ</option>
                <option value="days">ngày</option>
              </select>
              <span className="text-sm text-gray-500">kể từ khi tạo</span>
            </div>
          </div>
        </div>
      )
    }

    // ── create_reminder ────────────────────────────────────────────────────────
    case 'create_reminder': {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nội dung nhắc nhở *</label>
            <textarea
              rows={2}
              value={(cfg.content as string) ?? ''}
              onChange={e => onChange({ ...cfg, content: e.target.value })}
              placeholder="VD: Gọi điện hỏi thăm KH sau đơn hàng"
              className="w-full px-3 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nhắc cho *</label>
            <div className="flex gap-3">
              {(['lead_owner', 'self'] as const).map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipient"
                    value={r}
                    checked={(cfg.recipient as string) === r}
                    onChange={() => onChange({ ...cfg, recipient: r })}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {r === 'lead_owner' ? 'NV phụ trách KH' : 'Bản thân'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // ── pause_bot ──────────────────────────────────────────────────────────────
    case 'pause_bot': {
      const dur = (cfg.duration_minutes as number) ?? 30
      const presets = [15, 30, 60, 120, 480, 1440]
      return (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-600">Thời gian tạm dừng <span className='text-red-500'>*</span></label>
          <div className="flex items-center gap-3">
            <input
              type="number" min={1} max={1440}
              value={dur}
              onChange={e => onChange({ duration_minutes: Number(e.target.value) })}
              className="w-24 px-3 py-2 text-sm font-semibold border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] text-center"
            />
            <span className="text-sm text-gray-600">phút</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ duration_minutes: v })}
                className={`px-3 py-1 text-xs rounded-[10px] border transition-colors ${dur === v ? 'bg-[#3e79f7] text-white border-[#3e79f7]' : 'border-[#e6ebf1] text-gray-600 hover:border-[#699dff]'}`}
              >
                {v >= 60 ? `${v / 60}h` : `${v}p`}
              </button>
            ))}
          </div>
        </div>
      )
    }

    // ── resume_bot ─────────────────────────────────────────────────────────────
    case 'resume_bot':
      return (
        <div className="p-3.5 bg-green-50 rounded-[10px]">
          <p className="text-sm text-green-700">Bot sẽ được bật lại ngay lập tức cho khách hàng này.</p>
        </div>
      )

    // ── enroll_sequence ────────────────────────────────────────────────────────
    case 'enroll_sequence': {
      return (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600">Kịch bản *</label>
          <select
            value={(cfg.sequence_id as string) ?? ''}
            onChange={e => onChange({ sequence_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
          >
            <option value="">-- Chọn kịch bản --</option>
            {MOCK_SEQUENCE_OPTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <p className="text-xs text-amber-600">⚠ Nếu KH đang trong kịch bản đã chọn, sẽ bỏ qua.</p>
        </div>
      )
    }

    // ── cancel_sequence ────────────────────────────────────────────────────────
    case 'cancel_sequence': {
      const mode = (cfg.mode as string) ?? 'current'
      return (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-600">Hủy kịch bản *</label>
          <div className="space-y-2">
            {([{ v: 'current', l: 'Kịch bản hiện tại' }, { v: 'other', l: 'Kịch bản khác' }] as const).map(opt => (
              <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cancel_mode"
                  value={opt.v}
                  checked={mode === opt.v}
                  onChange={() => onChange({ ...cfg, mode: opt.v })}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{opt.l}</span>
              </label>
            ))}
          </div>
          {mode === 'other' && (
            <select
              value={(cfg.sequence_id as string) ?? ''}
              onChange={e => onChange({ ...cfg, sequence_id: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
            >
              <option value="">-- Chọn kịch bản cần hủy --</option>
              {MOCK_SEQUENCE_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      )
    }

    default:
      return null
  }
}
