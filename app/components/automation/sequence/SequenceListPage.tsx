'use client'

import React, { useState } from 'react'
import { Search, Plus, MoreHorizontal, Play, Pause, Copy, Trash2, ChevronRight, Zap, Users } from 'lucide-react'
import { Sequence, SequenceStatus, TriggerType } from './types'
import { SEQUENCE_STATUS_STYLES, TRIGGER_MAP, TRIGGER_GROUPS } from './constants'
import { MOCK_SEQUENCES_FULL } from './mockData'

interface Props {
  onSelectSequence: (id: string) => void;
}

// ─── Create Sequence Modal ─────────────────────────────────────────────────────
function CreateSequenceModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, description: string, triggerType: TriggerType) => void;
}) {
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [triggerType, setTrigger] = useState<TriggerType | ''>('' as TriggerType | '')
  const [nameError, setNameError] = useState('')

  const handleCreate = () => {
    if (!name.trim()) { setNameError('Tên kịch bản không được để trống'); return }
    if (!triggerType)  { return }
    onCreate(name.trim(), description.trim(), triggerType as TriggerType)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">✨ Tạo Kịch bản mới</h3>
          <p className="text-xs text-gray-500 mt-0.5">Thiết kế kịch bản chăm sóc tự động cho khách hàng</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tên kịch bản *</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError('') }}
              placeholder="VD: Chăm sóc KH mới, Chúc mừng sinh nhật..."
              maxLength={100}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${nameError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              autoFocus
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mô tả <span className="font-normal text-gray-400">(tùy chọn)</span></label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Mô tả mục đích kịch bản..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Trigger khởi chạy *</label>
            <select
              value={triggerType}
              onChange={e => setTrigger(e.target.value as TriggerType)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Chọn loại trigger --</option>
              {TRIGGER_GROUPS.map(group => (
                <optgroup key={group.group} label={`── ${group.group} ──`}>
                  {group.triggers.map(t => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {triggerType && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Zap size={13} className="text-blue-500" />
                <span className="text-xs text-blue-700 font-medium">
                  Nhóm: <strong>{TRIGGER_MAP[triggerType]?.group}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || !triggerType}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Tạo kịch bản
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sequence List Page ────────────────────────────────────────────────────────
export default function SequenceListPage({ onSelectSequence }: Props) {
  const [sequences, setSequences]         = useState<Sequence[]>(MOCK_SEQUENCES_FULL)
  const [query, setQuery]                 = useState('')
  const [statusFilter, setStatusFilter]   = useState<SequenceStatus | 'all'>('all')
  const [triggerFilter, setTriggerFilter] = useState<TriggerType | 'all'>('all')
  const [showCreate, setShowCreate]       = useState(false)
  const [menuOpenId, setMenuOpenId]       = useState<string | null>(null)

  const filtered = sequences.filter(s => {
    const matchQ  = !query || s.name.toLowerCase().includes(query.toLowerCase())
    const matchSt = statusFilter === 'all' || s.status === statusFilter
    const matchTr = triggerFilter === 'all' || s.trigger.type === triggerFilter
    return matchQ && matchSt && matchTr
  })

  const handleCreate = (name: string, description: string, triggerType: TriggerType) => {
    const newSeq: Sequence = {
      id: 'seq_' + Date.now(),
      name, description,
      status: 'draft',
      current_version: 1,
      trigger: { type: triggerType, config: {} },
      filter: { enabled: false, logic: 'all', rules: [] },
      steps: [],
      stats: { total_customers: 0, running: 0, completed: 0, cancelled: 0 },
      created_by: { id: 'u1', name: 'Admin' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSequences(prev => [newSeq, ...prev])
    onSelectSequence(newSeq.id)
  }

  const handleToggle = (id: string) => {
    setSequences(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ))
  }

  const handleDuplicate = (seq: Sequence) => {
    const dup: Sequence = { ...seq, id: 'seq_' + Date.now(), name: `${seq.name} (sao chép)`, status: 'draft', stats: { total_customers: 0, running: 0, completed: 0, cancelled: 0 } }
    setSequences(prev => [dup, ...prev])
  }

  const handleDelete = (id: string) => {
    setSequences(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="h-full flex flex-col p-6 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kịch bản chăm sóc</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sequences.length} kịch bản · {sequences.filter(s => s.status === 'active').length} đang chạy
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          Tạo kịch bản mới
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm kịch bản..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl">
          {([
            { v: 'all',    l: 'Tất cả' },
            { v: 'active', l: '🟢 Đang chạy' },
            { v: 'paused', l: '🟡 Tạm dừng' },
            { v: 'draft',  l: '⚪ Bản nháp' },
          ] as const).map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStatusFilter(opt.v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === opt.v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        {/* Trigger filter */}
        <select
          value={triggerFilter}
          onChange={e => setTriggerFilter(e.target.value as TriggerType | 'all')}
          className="px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Tất cả trigger</option>
          {TRIGGER_GROUPS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.triggers.map(t => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-12 gap-0 px-5 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kịch bản</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Bước</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">KH</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</div>
            <div className="col-span-1" />
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Chưa có kịch bản nào</p>
              <p className="text-xs text-gray-400 mt-1">Tạo kịch bản đầu tiên để bắt đầu tự động hóa</p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Tạo kịch bản mới
              </button>
            </div>
          ) : (
            filtered.map(seq => {
              const statusStyle   = SEQUENCE_STATUS_STYLES[seq.status]
              const triggerLabel  = TRIGGER_MAP[seq.trigger.type]?.label ?? seq.trigger.type
              const triggerGroup  = TRIGGER_MAP[seq.trigger.type]?.group ?? ''
              const isMenuOpen    = menuOpenId === seq.id

              return (
                <div key={seq.id} className="group grid grid-cols-12 gap-0 px-5 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  {/* Name + description */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={15} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectSequence(seq.id)}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block text-left"
                      >
                        {seq.name}
                      </button>
                      {seq.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{seq.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Trigger */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg border border-orange-100 truncate max-w-[120px]">
                        {triggerLabel}
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{seq.steps.length}</span>
                  </div>

                  {/* Stats */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <Users size={13} className="text-gray-400" />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700">{seq.stats.running}</span>
                      <span className="text-gray-400">/{seq.stats.total_customers}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectSequence(seq.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Xem chi tiết"
                    >
                      <ChevronRight size={15} />
                    </button>

                    {/* Context menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(isMenuOpen ? null : seq.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 overflow-hidden"
                          onMouseLeave={() => setMenuOpenId(null)}
                        >
                          <button
                            onClick={() => { setMenuOpenId(null); onSelectSequence(seq.id) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ChevronRight size={13} className="text-gray-400" /> Xem chi tiết
                          </button>
                          <button
                            onClick={() => { setMenuOpenId(null); handleToggle(seq.id) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {seq.status === 'active'
                              ? <><Pause size={13} className="text-gray-400" /> Tạm dừng</>
                              : <><Play size={13} className="text-gray-400" /> Bật kịch bản</>
                            }
                          </button>
                          <button
                            onClick={() => { setMenuOpenId(null); handleDuplicate(seq) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Copy size={13} className="text-gray-400" /> Sao chép
                          </button>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={() => { setMenuOpenId(null); handleDelete(seq.id) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateSequenceModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
