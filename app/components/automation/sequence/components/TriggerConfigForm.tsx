'use client'

import React from 'react'
import { TriggerType, TriggerConfig, TriggerConfigChannels, TriggerConfigReturning, TriggerConfigBirthday, TriggerConfigNoInteraction, TriggerConfigTag, TriggerConfigScheduled, TriggerConfigOrderStatus } from '../types'
import { CHANNEL_OPTIONS } from '../constants'

interface Props {
  triggerType: TriggerType;
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
  tags: Array<{ id: string; name: string; color: string }>;
}

// ─── Channel checkboxes (for conversation triggers) ────────────────────────────
function ChannelSelector({ channels, onChange }: {
  channels: string[];
  onChange: (channels: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(channels.includes(val) ? channels.filter(c => c !== val) : [...channels, val])
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2">Kênh áp dụng *</label>
      <div className="flex gap-3 flex-wrap">
        {CHANNEL_OPTIONS.map(ch => (
          <label key={ch.value} className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => toggle(ch.value)}
              className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${channels.includes(ch.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}
              style={{ width: 18, height: 18 }}
            >
              {channels.includes(ch.value) && (
                <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
            <span className="text-sm text-gray-700">{ch.label}</span>
          </label>
        ))}
      </div>
      {channels.length === 0 && (
        <p className="text-xs text-amber-600 mt-1.5">⚠ Chọn ít nhất 1 kênh</p>
      )}
    </div>
  )
}

export default function TriggerConfigForm({ triggerType, config, onChange, tags }: Props) {
  const cfg = config as Record<string, unknown>

  switch (triggerType) {
    // ── Hội thoại: channels ────────────────────────────────────────────────────
    case 'conversation_synced':
    case 'first_message': {
      const c = config as Partial<TriggerConfigChannels>
      return (
        <ChannelSelector
          channels={c.channels ?? []}
          onChange={channels => onChange({ ...c, channels } as TriggerConfigChannels)}
        />
      )
    }

    case 'returning_customer': {
      const c = config as Partial<TriggerConfigReturning>
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số ngày không tương tác *</label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} max={365}
                value={c.inactive_days ?? 30}
                onChange={e => onChange({ ...c, inactive_days: Number(e.target.value) } as TriggerConfigReturning)}
                className="w-24 px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
              <span className="text-sm text-gray-600">ngày (1–365)</span>
            </div>
          </div>
          <ChannelSelector
            channels={c.channels ?? []}
            onChange={channels => onChange({ ...c, channels } as TriggerConfigReturning)}
          />
        </div>
      )
    }

    // ── Đơn hàng: order_status_changed ────────────────────────────────────────
    case 'order_status_changed': {
      const c = config as Partial<TriggerConfigOrderStatus>
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái đơn hàng *</label>
          <select
            value={c.target_status ?? ''}
            onChange={e => onChange({ target_status: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="returned">Hoàn hàng</option>
          </select>
        </div>
      )
    }

    // ── Khách hàng: birthday ───────────────────────────────────────────────────
    case 'customer_birthday': {
      const c = config as Partial<TriggerConfigBirthday>
      return (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-600">Thời điểm trigger</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="birthday_mode"
                value="on_day"
                checked={(c.mode ?? 'on_day') === 'on_day'}
                onChange={() => onChange({ mode: 'on_day' })}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Vào đúng ngày sinh nhật</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="birthday_mode"
                value="before_x_days"
                checked={c.mode === 'before_x_days'}
                onChange={() => onChange({ mode: 'before_x_days', days_before: c.days_before ?? 1 })}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Trước</span>
              {c.mode === 'before_x_days' && (
                <input
                  type="number" min={1} max={30}
                  value={c.days_before ?? 1}
                  onChange={e => onChange({ mode: 'before_x_days', days_before: Number(e.target.value) })}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              )}
              {c.mode === 'before_x_days' && <span className="text-sm text-gray-600">ngày</span>}
            </label>
          </div>
        </div>
      )
    }

    // ── Khách hàng: no_interaction ─────────────────────────────────────────────
    case 'no_interaction': {
      const c = config as Partial<TriggerConfigNoInteraction>
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số ngày không tương tác *</label>
          <div className="flex items-center gap-3">
            <input
              type="number" min={1} max={365}
              value={c.days ?? 30}
              onChange={e => onChange({ days: Number(e.target.value) })}
              className="w-24 px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <span className="text-sm text-gray-600">ngày (1–365)</span>
          </div>
        </div>
      )
    }

    // ── Tag: tag_added / tag_removed ───────────────────────────────────────────
    case 'tag_added':
    case 'tag_removed': {
      const c = config as Partial<TriggerConfigTag>
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {triggerType === 'tag_added' ? 'Tag được gắn *' : 'Tag bị gỡ *'}
          </label>
          <select
            value={c.tag_id ?? ''}
            onChange={e => onChange({ tag_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Chọn tag --</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>
      )
    }

    // ── Thời gian: scheduled ───────────────────────────────────────────────────
    case 'scheduled': {
      const c = config as Partial<TriggerConfigScheduled>
      const freq = c.frequency ?? 'daily'
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tần suất *</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {([
                { v: 'daily',   l: 'Hàng ngày' },
                { v: 'weekly',  l: 'Hàng tuần' },
                { v: 'monthly', l: 'Hàng tháng' },
              ] as const).map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => onChange({ ...c, frequency: opt.v } as TriggerConfigScheduled)}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${freq === opt.v ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thời điểm *</label>
            <input
              type="time"
              value={c.time ?? '09:00'}
              onChange={e => onChange({ ...c, time: e.target.value } as TriggerConfigScheduled)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {freq === 'weekly' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Ngày trong tuần *</label>
              <div className="flex gap-2 flex-wrap">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange({ ...c, day_of_week: i } as TriggerConfigScheduled)}
                    className={`w-9 h-9 text-xs font-semibold rounded-xl border transition-colors ${(c as TriggerConfigScheduled).day_of_week === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
          {freq === 'monthly' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày trong tháng *</label>
              <input
                type="number" min={1} max={31}
                value={(c as TriggerConfigScheduled).day_of_month ?? 1}
                onChange={e => onChange({ ...c, day_of_month: Number(e.target.value) } as TriggerConfigScheduled)}
                className="w-20 px-3 py-2 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
          )}
        </div>
      )
    }

    // ── No config triggers ─────────────────────────────────────────────────────
    default:
      return (
        <div className="p-3.5 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 italic">Trigger này không cần cấu hình thêm.</p>
        </div>
      )
  }
}
