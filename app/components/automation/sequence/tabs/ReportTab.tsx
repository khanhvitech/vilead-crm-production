'use client'

import React, { useState } from 'react'
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { SequenceReport, StepFunnel } from '../types'
import { MOCK_REPORT } from '../mockData'

// ─── Date range presets ────────────────────────────────────────────────────────
type DateRangePreset = '7d' | '30d' | '90d'

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0`} style={{ background: color + '20' }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Funnel Bar ───────────────────────────────────────────────────────────────
function FunnelChart({ steps }: { steps: StepFunnel[] }) {
  const max = Math.max(...steps.map(s => s.entered), 1)

  return (
    <div className="space-y-3">
      {steps.map(step => {
        const completedPct  = (step.completed / step.entered) * 100
        const skippedPct    = (step.skipped  / step.entered) * 100
        const droppedPct    = (step.dropped  / step.entered) * 100
        const barWidth      = (step.entered / max) * 100

        return (
          <div key={step.step_order} className="flex items-center gap-4">
            {/* Step label */}
            <div className="w-36 shrink-0 text-right">
              <p className="text-xs font-semibold text-gray-700 truncate">{step.name}</p>
              <p className="text-xs text-gray-400">{step.entered.toLocaleString()} KH</p>
            </div>

            {/* Bar */}
            <div className="flex-1 h-8 bg-gray-100 rounded-xl overflow-hidden relative">
              {/* Relative width based on max */}
              <div
                className="h-full flex rounded-xl overflow-hidden"
                style={{ width: `${barWidth}%` }}
              >
                {/* Completed portion */}
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${completedPct}%` }}
                  title={`Hoàn thành: ${step.completed}`}
                />
                {/* Skipped portion */}
                {step.skipped > 0 && (
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${skippedPct}%` }}
                    title={`Bỏ qua: ${step.skipped}`}
                  />
                )}
                {/* Dropped portion */}
                {step.dropped > 0 && (
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${droppedPct}%` }}
                    title={`Rời bỏ: ${step.dropped}`}
                  />
                )}
              </div>

              {/* Labels */}
              <div className="absolute inset-0 flex items-center px-3 gap-3">
                <span className="text-xs text-white font-semibold drop-shadow-sm">{Math.round(completedPct)}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="w-40 shrink-0 flex gap-3 text-xs">
              <span className="text-blue-600 font-semibold">✓ {step.completed}</span>
              {step.skipped > 0 && <span className="text-amber-500">⊘ {step.skipped}</span>}
              {step.dropped > 0 && <span className="text-red-500">✕ {step.dropped}</span>}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 pl-40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-xs text-gray-500">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span className="text-xs text-gray-500">Bỏ qua</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span className="text-xs text-gray-500">Rời bỏ</span>
        </div>
      </div>
    </div>
  )
}

// ─── Timeline Line Chart (SVG) ────────────────────────────────────────────────
function TimelineChart({ data }: { data: SequenceReport['timeline'] }) {
  const W = 600, H = 140, PAD_L = 40, PAD_R = 20, PAD_T = 20, PAD_B = 30

  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  const max = Math.max(...data.flatMap(d => [d.enrolled, d.completed, d.cancelled]), 1)

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW
  const toY = (v: number) => PAD_T + chartH - (v / max) * chartH

  const polyline = (getter: (d: typeof data[0]) => number, dash = '') => {
    const pts = data.map((d, i) => `${toX(i)},${toY(getter(d))}`).join(' ')
    return pts
  }

  const series = [
    { id: 'enrolled',  label: 'Vào KBan',   color: '#3B82F6', getter: (d: typeof data[0]) => d.enrolled },
    { id: 'completed', label: 'Hoàn thành', color: '#22C55E', getter: (d: typeof data[0]) => d.completed },
    { id: 'cancelled', label: 'Hủy',        color: '#F87171', getter: (d: typeof data[0]) => d.cancelled },
  ]

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 400 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = PAD_T + chartH * (1 - pct)
          return (
            <g key={pct}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 4} fontSize={9} fill="#9CA3AF" textAnchor="end">
                {Math.round(max * pct)}
              </text>
            </g>
          )
        })}

        {/* Date labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 5} fontSize={9} fill="#9CA3AF" textAnchor="middle">
            {new Date(d.date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
          </text>
        ))}

        {/* Lines */}
        {series.map(s => (
          <polyline
            key={s.id}
            points={polyline(s.getter)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Data points */}
        {series.map(s =>
          data.map((d, i) => (
            <circle key={`${s.id}-${i}`} cx={toX(i)} cy={toY(s.getter(d))} r={3} fill={s.color} />
          ))
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {series.map(s => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Report Tab ───────────────────────────────────────────────────────────────
interface Props {
  sequenceId: string;
}

export default function ReportTab({ sequenceId }: Props) {
  const [preset, setPreset] = useState<DateRangePreset>('7d')
  const report = MOCK_REPORT // Would be fetched based on sequenceId + preset

  const fmt = (n: number) => n.toLocaleString('vi-VN')
  const fmtCurrency = (n: number) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}tr₫`
    : `${fmt(n)}đ`

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Báo cáo hiệu quả</h3>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {([
            { v: '7d',  l: '7 ngày' },
            { v: '30d', l: '30 ngày' },
            { v: '90d', l: '90 ngày' },
          ] as const).map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setPreset(opt.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                preset === opt.v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          label="Tổng KH vào KB"
          value={fmt(report.summary.total_enrolled)}
          icon={<Users size={20} />}
          color="#3B82F6"
        />
        <MetricCard
          label="Đang chạy"
          value={fmt(report.summary.running)}
          sub={`${((report.summary.running / report.summary.total_enrolled) * 100).toFixed(1)}% tổng`}
          icon={<TrendingUp size={20} />}
          color="#F59E0B"
        />
        <MetricCard
          label="Hoàn thành"
          value={fmt(report.summary.completed)}
          sub={`Tỷ lệ: ${report.summary.completion_rate}%`}
          icon={<CheckCircle size={20} />}
          color="#22C55E"
        />
        <MetricCard
          label="Đã hủy (auto)"
          value={fmt(report.summary.cancelled_auto)}
          sub={`Thủ công: ${fmt(report.summary.cancelled_manual)}`}
          icon={<XCircle size={20} />}
          color="#EF4444"
        />
        <MetricCard
          label="Đơn hàng phát sinh"
          value={fmt(report.summary.conversion.orders_count)}
          sub={`Tỷ lệ: ${report.summary.conversion.rate}%`}
          icon={<ShoppingBag size={20} />}
          color="#8B5CF6"
        />
        <MetricCard
          label="Doanh thu ước tính"
          value={fmtCurrency(report.summary.conversion.revenue)}
          sub="Từ KH trong kịch bản"
          icon={<TrendingUp size={20} />}
          color="#10B981"
        />
      </div>

      {/* Step funnel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-5 bg-blue-600 rounded-full" />
          <h4 className="text-sm font-bold text-gray-900">Phễu theo bước</h4>
          <span className="text-xs text-gray-500 ml-auto">{report.step_funnel.length} bước</span>
        </div>
        <FunnelChart steps={report.step_funnel} />
      </div>

      {/* Timeline chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-5 bg-green-500 rounded-full" />
          <h4 className="text-sm font-bold text-gray-900">Xu hướng theo thời gian</h4>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            7 ngày gần nhất
          </div>
        </div>
        <TimelineChart data={report.timeline} />
      </div>
    </div>
  )
}
