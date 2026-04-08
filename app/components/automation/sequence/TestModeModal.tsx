'use client'

import React, { useState } from 'react'
import { X, Search, AlertTriangle, Check, User } from 'lucide-react'

interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  channel: string;
  avatar?: string;
}

const MOCK_CUSTOMERS: MockCustomer[] = [
  { id: 'c1', name: 'Nguyễn Văn A',   phone: '0901234567', channel: 'Zalo OA' },
  { id: 'c2', name: 'Trần Thị B',     phone: '0912345678', channel: 'Facebook' },
  { id: 'c3', name: 'Lê Minh C',      phone: '0923456789', channel: 'Zalo OA' },
  { id: 'c4', name: 'Phạm Thị D',     phone: '0934567890', channel: 'Zalo cá nhân' },
  { id: 'c5', name: 'Hoàng Văn E',    phone: '0945678901', channel: 'Facebook' },
  { id: 'c6', name: 'Đặng Thị F',     phone: '0956789012', channel: 'Zalo OA' },
]

interface Props {
  sequenceName: string;
  onClose: () => void;
  onTest: (customerId: string) => void;
}

export default function TestModeModal({ sequenceName, onClose, onTest }: Props) {
  const [query, setQuery]          = useState('')
  const [selected, setSelected]    = useState<MockCustomer | null>(null)
  const [confirmed, setConfirmed]  = useState(false)
  const [sent, setSent]            = useState(false)

  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  )

  const handleSend = () => {
    if (!selected || !confirmed) return
    setSent(true)
    setTimeout(() => {
      onTest(selected.id)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">🧪 Gửi thử Kịch bản</h3>
            <p className="text-xs text-gray-500 mt-0.5">Kiểm tra kịch bản với khách hàng thật</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Target sequence info */}
          <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">KB</div>
            <div className="min-w-0">
              <p className="text-xs text-blue-600 font-semibold">Kịch bản</p>
              <p className="text-sm font-bold text-blue-900 truncate">{sequenceName}</p>
            </div>
          </div>

          {/* Customer search */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Chọn khách hàng gửi thử *</label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm tên hoặc số điện thoại..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Customer list */}
            <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">Không tìm thấy khách hàng</div>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(s => s?.id === c.id ? null : c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-none transition-colors ${
                      selected?.id === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected?.id === c.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {selected?.id === c.id
                        ? <Check size={14} />
                        : c.name[0].toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone} · {c.channel}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected customer summary */}
          {selected && (
            <div className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">{selected.name}</p>
                <p className="text-xs text-green-700">{selected.phone} · {selected.channel}</p>
              </div>
              <Check size={16} className="ml-auto text-green-500 shrink-0" />
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-1">
              <p className="font-semibold">Lưu ý quan trọng</p>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-700">
                <li>Các tin nhắn sẽ được gửi thật đến khách hàng đã chọn</li>
                <li>Bước gửi thử sẽ được đánh dấu là <span className="font-semibold">Test</span> trong hệ thống</li>
                <li>Dữ liệu gửi thử không tính vào báo cáo chính thức</li>
              </ul>
            </div>
          </div>

          {/* Confirm checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setConfirmed(c => !c)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${confirmed ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
            >
              {confirmed && <Check size={12} color="white" />}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              Tôi hiểu và xác nhận gửi thử kịch bản
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selected || !confirmed || sent}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {sent ? (
              <>
                <Check size={14} />
                Đang gửi...
              </>
            ) : (
              '🧪 Gửi thử ngay'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
