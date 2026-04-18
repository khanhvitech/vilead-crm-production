'use client'

import React, { useState } from 'react'
import { ChevronLeft, Play, Pause, Save, Check } from 'lucide-react'
import { Sequence } from './types'
import { SEQUENCE_STATUS_STYLES } from './constants'
import { MOCK_SEQUENCES_FULL } from './mockData'
import ConfigTab    from './tabs/ConfigTab'
import CustomersTab from './tabs/CustomersTab'
import ReportTab    from './tabs/ReportTab'

type TabId = 'config' | 'customers' | 'report'

interface Props {
  sequenceId: string;
  onBack: () => void;
}

export default function SequenceDetailPage({ sequenceId, onBack }: Props) {
  const initial = MOCK_SEQUENCES_FULL.find(s => s.id === sequenceId) ?? MOCK_SEQUENCES_FULL[0]

  const [sequence, setSequence]     = useState<Sequence>(initial)
  const [activeTab, setActiveTab]   = useState<TabId>('config')
  const [saved, setSaved]           = useState(false)

  const statusStyle = SEQUENCE_STATUS_STYLES[sequence.status]

  const handleSave = () => {
    // In production: API call to patch the sequence
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggleStatus = () => {
    setSequence(s => ({
      ...s,
      status: s.status === 'active' ? 'paused' : 'active',
    }))
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'config',    label: 'Cấu hình' },
    { id: 'customers', label: `Khách hàng` },
    // { id: 'report',    label: 'Báo cáo' },
  ]

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 shrink-0"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
              >
                Kịch bản chăm sóc
              </button>
              <span className="text-gray-300">/</span>
              <span className="font-bold text-gray-900 truncate">{sequence.name}</span>
            </div>

            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
              {statusStyle.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle active/pause */}
            {sequence.status !== 'draft' && (
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  sequence.status === 'active'
                    ? 'border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'border border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {sequence.status === 'active'
                  ? <><Pause size={14} /> Tạm dừng</>
                  : <><Play size={14} /> Bật kịch bản</>
                }
              </button>
            )}

            {/* Activate for drafts */}
            {sequence.status === 'draft' && (
              <button
                type="button"
                onClick={() => setSequence(s => ({ ...s, status: 'active' }))}
                disabled={sequence.steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Play size={14} />
                Kích hoạt
              </button>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saved ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu</>}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 border-b border-gray-200 -mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'config' && (
          <ConfigTab sequence={sequence} onChange={setSequence} />
        )}
        {activeTab === 'customers' && (
          <CustomersTab sequenceId={sequence.id} totalSteps={sequence.steps.length} />
        )}
        {activeTab === 'report' && (
          <ReportTab sequenceId={sequence.id} />
        )}
      </div>

    </div>
  )
}
