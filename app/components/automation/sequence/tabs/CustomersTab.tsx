'use client'

import React, { useState } from 'react'
import { Search, X, ChevronRight, Clock, Check, SkipForward, Play, AlertCircle, FlaskConical } from 'lucide-react'
import { CustomerJourney, JourneyStatus } from '../types'
import { JOURNEY_STATUS_STYLES, STEP_LOG_STYLES } from '../constants'
import { MOCK_JOURNEYS } from '../mockData'

interface Props {
  sequenceId: string;
  totalSteps: number;
}

// ─── Journey Detail Modal ─────────────────────────────────────────────────────
function JourneyDetailModal({ journey, onClose }: { journey: CustomerJourney; onClose: () => void }) {
  const statusStyle = JOURNEY_STATUS_STYLES[journey.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e6ebf1] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3e79f7] rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {journey.customer.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{journey.customer.name}</p>
                {journey.is_test && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                    <FlaskConical size={10} /> TEST
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{journey.customer.phone} · {journey.customer.channel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-[10px] hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Status row */}
        <div className="px-6 py-3 bg-gray-50 border-b border-[#e6ebf1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <span>{statusStyle.icon}</span>
              {statusStyle.label}
            </span>
            <span className="text-xs text-gray-500">
              Bước {journey.current_step}/{journey.total_steps}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={11} />
            {new Date(journey.enrolled_at).toLocaleDateString('vi-VN')}
          </div>
        </div>

        {/* Step logs timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {journey.step_logs.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Chưa có dữ liệu bước</div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

              <div className="space-y-0">
                {journey.step_logs.map((log, idx) => {
                  const style = STEP_LOG_STYLES[log.status]
                  return (
                    <div key={log.id} className="flex gap-4 pb-5 last:pb-0">
                      {/* Icon */}
                      <div
                        className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 border-white shadow-sm"
                        style={{ background: log.status === 'completed' ? '#DCFCE7' : log.status === 'failed' ? '#FEE2E2' : log.status === 'skipped' ? '#FEF3C7' : log.status === 'running' ? '#DBEAFE' : '#F1F5F9' }}
                      >
                        <span style={{ color: style.color }}>{style.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Bước {log.step_order}{log.step_name ? `: ${log.step_name}` : ''}
                            </p>
                            <span className="inline-block mt-0.5 text-xs font-semibold" style={{ color: style.color }}>
                              {style.label}
                            </span>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="mt-1.5 space-y-0.5">
                          {log.scheduled_at && (
                            <p className="text-xs text-gray-500">
                              ⏰ Dự kiến: {new Date(log.scheduled_at).toLocaleString('vi-VN')}
                            </p>
                          )}
                          {log.completed_at && (
                            <p className="text-xs text-gray-500">
                              ✓ Hoàn thành: {new Date(log.completed_at).toLocaleString('vi-VN')}
                            </p>
                          )}
                          {log.skipped_reason && (
                            <p className="text-xs text-amber-600">
                              ⊘ Bỏ qua: {log.skipped_reason}
                            </p>
                          )}
                          {log.error_message && (
                            <p className="text-xs text-red-600">
                              ✕ Lỗi: {log.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Customers Tab ────────────────────────────────────────────────────────────
export default function CustomersTab({ sequenceId, totalSteps }: Props) {
  const [query, setQuery]               = useState('')
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | 'all'>('all')
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourney | null>(null)

  const allJourneys = MOCK_JOURNEYS.filter(j => j.sequence_id === sequenceId)

  const filteredJourneys = allJourneys.filter(j => {
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    const matchQuery  = !query || j.customer.name.toLowerCase().includes(query.toLowerCase()) || j.customer.phone.includes(query)
    return matchStatus && matchQuery
  })

  // Stats
  const stats = {
    total:     allJourneys.length,
    running:   allJourneys.filter(j => j.status === 'running').length,
    completed: allJourneys.filter(j => j.status === 'completed').length,
    cancelled: allJourneys.filter(j => j.status === 'cancelled').length,
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng số',     value: stats.total,     color: 'text-gray-900', bg: 'bg-gray-50',   border: 'border-[#e6ebf1]' },
          { label: 'Đang chạy',   value: stats.running,   color: 'text-[#3e79f7]', bg: 'bg-blue-50',   border: 'border-[#c7d9fd]' },
          { label: 'Hoàn thành',  value: stats.completed, color: 'text-green-700',bg: 'bg-green-50',  border: 'border-green-200' },
          { label: 'Đã hủy',      value: stats.cancelled, color: 'text-red-700',  bg: 'bg-red-50',    border: 'border-red-200' },
        ].map(s => (
          <div key={s.label} className={`p-4 ${s.bg} border ${s.border} rounded-[10px]`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm khách hàng..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-[10px]">
          {([
            { v: 'all',       l: 'Tất cả' },
            { v: 'running',   l: 'Đang chạy' },
            { v: 'completed', l: 'Hoàn thành' },
            { v: 'cancelled', l: 'Đã hủy' },
          ] as const).map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStatusFilter(opt.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-colors ${
                statusFilter === opt.v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e6ebf1] rounded-[10px] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-0 px-5 py-3 bg-gray-50 border-b border-[#e6ebf1]">
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Khách hàng</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kênh</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiến độ</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vào lúc</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</div>
        </div>

        {filteredJourneys.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400 font-medium">Không có dữ liệu</p>
          </div>
        ) : (
          filteredJourneys.map(journey => {
            const statusStyle = JOURNEY_STATUS_STYLES[journey.status]
            const progress = Math.round((journey.current_step / journey.total_steps) * 100)
            return (
              <button
                key={journey.id}
                type="button"
                onClick={() => setSelectedJourney(journey)}
                className="w-full grid grid-cols-12 gap-0 px-5 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors text-left group"
              >
                {/* Customer */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-[#3e79f7] shrink-0">
                    {journey.customer.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{journey.customer.name}</p>
                      {journey.is_test && (
                        <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded shrink-0">TEST</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{journey.customer.phone}</p>
                  </div>
                </div>

                {/* Channel */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-600">{journey.customer.channel === 'zalo_oa' ? 'Zalo OA' : journey.customer.channel === 'zalo_personal' ? 'Zalo CN' : 'Facebook'}</span>
                </div>

                {/* Progress */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{journey.current_step}/{journey.total_steps}</span>
                </div>

                {/* Enrolled at */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(journey.enrolled_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.icon} {statusStyle.label}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 ml-auto transition-colors" />
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Journey Detail Modal */}
      {selectedJourney && (
        <JourneyDetailModal
          journey={selectedJourney}
          onClose={() => setSelectedJourney(null)}
        />
      )}
    </div>
  )
}
