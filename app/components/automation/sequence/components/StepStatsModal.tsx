'use client'

import React, { useState } from 'react'
import { X, Calendar, ChevronRight, ChevronDown } from 'lucide-react'
import { SequenceStep } from '../types'
import { ACTION_MAP } from '../constants'

// ─── Mock step log data ───────────────────────────────────────────────────────
interface StepDayLog {
  date: string
  sent: number
  retained: number // "KH để lại SĐT" — hidden for now
  customers: { name: string; phone: string; channel: string; sentAt: string; status: 'sent' | 'failed' | 'skipped' }[]
}

function generateStepLogs(step: SequenceStep): StepDayLog[] {
  const base = [
    { date: '2026-04-14', sent: 12, retained: 0 },
    { date: '2026-04-15', sent: 8,  retained: 0 },
    { date: '2026-04-16', sent: 15, retained: 0 },
    { date: '2026-04-17', sent: 5,  retained: 0 },
    { date: '2026-04-18', sent: 3,  retained: 0 },
  ]
  return base.map(d => ({
    ...d,
    customers: Array.from({ length: d.sent }, (_, i) => ({
      name: `Khách hàng ${i + 1}`,
      phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      channel: ['Zalo OA', 'Facebook', 'Zalo cá nhân'][i % 3],
      sentAt: `${d.date} ${String(7 + (i * 11) % 14).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`,
      status: i % 10 === 0 ? 'failed' : 'sent',
    })) as StepDayLog['customers']
  }))
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate()} Th${dt.getMonth() + 1} ${dt.getFullYear()}`
}

interface Props {
  step: SequenceStep
  onClose: () => void
}

export default function StepStatsModal({ step, onClose }: Props) {
  const [dateFrom, setDateFrom] = useState('2026-04-14')
  const [dateTo, setDateTo]     = useState('2026-04-18')
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const actionMeta = ACTION_MAP[step.action.type]
  const logs = generateStepLogs(step)

  const filtered = logs.filter(l => l.date >= dateFrom && l.date <= dateTo)
  const totalSent = filtered.reduce((s, l) => s + l.sent, 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{step.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Thống kê gửi tin theo ngày</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[10px] hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-600 shrink-0">Khoảng thời gian:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white" />
          <span className="text-gray-400 text-xs">–</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-[#e6ebf1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] bg-white" />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {/* Table header */}
          <div className="grid text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-2.5 border-b border-gray-100 bg-gray-50 sticky top-0"
            style={{ gridTemplateColumns: '48px 1fr 120px 32px' }}>
            <div>STT</div>
            <div>Ngày</div>
            <div className="text-center">KH được gửi tin</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Calendar size={36} className="mb-3 opacity-30" />
              <p className="text-sm text-gray-400">Không có dữ liệu trong khoảng thời gian này</p>
            </div>
          ) : (
            <>
              {filtered.map((log, idx) => (
                <React.Fragment key={log.date}>
                  {/* Day row */}
                  <button
                    onClick={() => setExpandedDay(expandedDay === log.date ? null : log.date)}
                    className="w-full grid items-center px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
                    style={{ gridTemplateColumns: '48px 1fr 120px 32px' }}
                  >
                    <span className="text-sm text-gray-500">{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{formatDate(log.date)}</span>
                    <span className="text-sm font-bold text-center text-[#3e79f7]">{log.sent}</span>
                    <div className="flex justify-end">
                      {expandedDay === log.date
                        ? <ChevronDown size={14} className="text-gray-400" />
                        : <ChevronRight size={14} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* Expanded day — customer list */}
                  {expandedDay === log.date && (
                    <div className="bg-blue-50/40 border-b border-blue-100">
                      <div className="grid text-[10px] font-bold text-gray-400 uppercase px-10 py-2 border-b border-blue-100"
                        style={{ gridTemplateColumns: '1fr 130px 110px 80px' }}>
                        <div>Tên khách hàng</div>
                        <div>Kênh</div>
                        <div>Thời gian gửi</div>
                        <div>Trạng thái</div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {log.customers.map((c, ci) => (
                          <div key={ci} className="grid items-center px-10 py-2.5 border-b border-blue-50 last:border-0"
                            style={{ gridTemplateColumns: '1fr 130px 110px 80px' }}>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.phone}</p>
                            </div>
                            <span className="text-xs text-gray-600">{c.channel}</span>
                            <span className="text-xs text-gray-500">{c.sentAt.split(' ')[1]}</span>
                            <span className={`text-xs font-semibold ${c.status === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
                              {c.status === 'sent' ? '✓ Đã gửi' : '✕ Lỗi'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Total row */}
              <div className="grid items-center px-6 py-3.5 bg-gray-50 border-t border-[#e6ebf1] font-bold"
                style={{ gridTemplateColumns: '48px 1fr 120px 32px' }}>
                <span className="text-sm text-gray-500" />
                <span className="text-sm text-gray-700">Tổng</span>
                <span className="text-sm font-bold text-center text-[#3e79f7]">{totalSent}</span>
                <span />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-[10px] transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
