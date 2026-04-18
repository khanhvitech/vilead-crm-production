'use client'

import React, { useState, useMemo } from 'react'
import { X, Search, Check, FolderOpen, MessageSquare } from 'lucide-react'
import { MOCK_FLOWS } from '../mockData'

interface Props {
  currentFlowId?: string
  onSelect: (flowId: string) => void
  onClose: () => void
}

// Extend flows with mock folder for display
const ALL_FLOWS_WITH_FOLDER = [
  { ...MOCK_FLOWS[0], folder: 'Marketing',       shortcut: '/chao'    },
  { ...MOCK_FLOWS[1], folder: 'Sales',           shortcut: '/xacnhan' },
  { ...MOCK_FLOWS[2], folder: 'Support',         shortcut: '/fb'      },
  { ...MOCK_FLOWS[3], folder: 'Marketing',       shortcut: '/upsell'  },
  { ...MOCK_FLOWS[4], folder: 'Chăm sóc KH',    shortcut: '/gahan'   },
  { ...MOCK_FLOWS[5], folder: 'Marketing',       shortcut: '/sinh'    },
  { ...MOCK_FLOWS[6], folder: 'Chăm sóc KH',    shortcut: '/csmua'   },
  { ...MOCK_FLOWS[7], folder: 'Chưa phân loại', shortcut: ''         },
]

const FOLDERS = ['Tất cả', 'Chưa phân loại', 'Marketing', 'Sales', 'Support', 'Chăm sóc KH']
const FOLDER_COUNTS: Record<string, number> = {
  'Tất cả':        ALL_FLOWS_WITH_FOLDER.length,
  'Chưa phân loại': ALL_FLOWS_WITH_FOLDER.filter(f => f.folder === 'Chưa phân loại').length,
  'Marketing':     ALL_FLOWS_WITH_FOLDER.filter(f => f.folder === 'Marketing').length,
  'Sales':         ALL_FLOWS_WITH_FOLDER.filter(f => f.folder === 'Sales').length,
  'Support':       ALL_FLOWS_WITH_FOLDER.filter(f => f.folder === 'Support').length,
  'Chăm sóc KH':  ALL_FLOWS_WITH_FOLDER.filter(f => f.folder === 'Chăm sóc KH').length,
}

function StatusBadge({ status }: { status: 'published' | 'draft' }) {
  return status === 'published' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
      Đã xuất bản
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
      Bản nháp
    </span>
  )
}

export default function FlowPickerModal({ currentFlowId, onSelect, onClose }: Props) {
  const [activeFolder, setActiveFolder] = useState('Tất cả')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<string | undefined>(currentFlowId)

  const filtered = useMemo(() => {
    let list = ALL_FLOWS_WITH_FOLDER
    if (activeFolder !== 'Tất cả') list = list.filter(f => f.folder === activeFolder)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q) || (f.shortcut && f.shortcut.includes(q)))
    }
    return list
  }, [activeFolder, search])

  const handleConfirm = () => {
    if (selected) onSelect(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">Chọn luồng tin nhắn</h3>
            <p className="text-xs text-gray-500 mt-0.5">Chọn 1 luồng tin nhắn sẽ được gửi khi điều kiện thỏa mãn</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 border-r border-gray-100 py-3 overflow-y-auto bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Thư mục</p>
            {FOLDERS.map(folder => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                  activeFolder === folder
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen size={14} className={activeFolder === folder ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="truncate">{folder}</span>
                </div>
                <span className={`text-xs shrink-0 ml-1 ${activeFolder === folder ? 'text-blue-500' : 'text-gray-400'}`}>
                  {FOLDER_COUNTS[folder]}
                </span>
              </button>
            ))}
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search bar */}
            <div className="px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm tên luồng hoặc shortcut..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Table header */}
            <div className="flex items-center px-5 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
              <div className="w-8 shrink-0" />
              <div className="flex-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tên luồng</div>
              <div className="w-36 shrink-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Thư mục</div>
              <div className="w-28 shrink-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Shortcut</div>
              <div className="w-32 shrink-0 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Search size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Không tìm thấy luồng tin nhắn nào</p>
                </div>
              ) : (
                filtered.map(flow => (
                  <button
                    key={flow.id}
                    onClick={() => setSelected(flow.id)}
                    className={`w-full flex items-center px-5 py-3.5 border-b border-gray-50 text-left transition-colors ${
                      selected === flow.id
                        ? 'bg-blue-50 border-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Check indicator */}
                    <div className="w-8 shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selected === flow.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {selected === flow.id && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <MessageSquare size={13} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${selected === flow.id ? 'text-blue-800' : 'text-gray-800'}`}>
                          {flow.name}
                        </p>
                        <p className="text-xs text-gray-400">{flow.message_count} tin nhắn</p>
                      </div>
                    </div>

                    {/* Folder */}
                    <div className="w-36 shrink-0">
                      <span className="text-xs text-gray-500">{flow.folder}</span>
                    </div>

                    {/* Shortcut */}
                    <div className="w-28 shrink-0">
                      {flow.shortcut && (
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                          {flow.shortcut}
                        </code>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-32 shrink-0">
                      <StatusBadge status={flow.status as 'published' | 'draft'} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <p className="text-xs text-gray-500">
            {selected
              ? <span>Đã chọn: <strong className="text-gray-800">{ALL_FLOWS_WITH_FOLDER.find(f => f.id === selected)?.name}</strong></span>
              : 'Chưa chọn luồng nào'
            }
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
            >
              <Check size={14} />
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
