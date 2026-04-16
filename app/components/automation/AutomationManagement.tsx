'use client'

import React, { useState } from 'react'
import { Zap, GitBranch, Settings2 } from 'lucide-react'
import FlowListPage from './flows/FlowListPage'
import FlowEditorPage from './flows/editor/FlowEditorPage'
import AutomationSettings from './settings/AutomationSettings'
import SequenceListPage from './sequence/SequenceListPage'
import SequenceDetailPage from './sequence/SequenceDetailPage'

type AutomationView =
  | 'flows-list'
  | 'flows-editor'
  | 'settings'
  | 'sequence-list'
  | 'sequence-detail'

export default function AutomationManagement() {
  const [view, setView]                   = useState<AutomationView>('flows-list')
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null)
  const [editingSeqId, setEditingSeqId]   = useState<string | null>(null)

  const openEditor    = (flowId: string) => { setEditingFlowId(flowId); setView('flows-editor') }
  const openFlowList  = () => { setEditingFlowId(null); setView('flows-list') }
  const openSeqList   = () => { setEditingSeqId(null); setView('sequence-list') }
  const openSeqDetail = (id: string) => { setEditingSeqId(id); setView('sequence-detail') }

  // ── Flow Editor ─────────────────────────────────────────────────────────────
  if (view === 'flows-editor' && editingFlowId) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <FlowEditorPage flowId={editingFlowId} onBack={openFlowList} />
      </div>
    )
  }

  // ── Sequence Detail ──────────────────────────────────────────────────────────
  if (view === 'sequence-detail' && editingSeqId) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <SequenceDetailPage
          sequenceId={editingSeqId}
          onBack={openSeqList}
        />
      </div>
    )
  }

  const channels = [
    {
      id: 'flows-list' as const,
      label: 'Luồng tin nhắn',
      icon: Zap,
    },
    {
      id: 'sequence-list' as const,
      label: 'Kịch bản chạy',
      icon: GitBranch,
    },
    {
      id: 'settings' as const,
      label: 'Cấu hình Automation',
      icon: Settings2,
    },
  ]

  // Main UI with vertical tabs
  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between p-6 pb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-600 mt-1">Tự động hóa quy trình chăm sóc khách hàng đa kênh</p>
        </div>
      </div>
      
      {/* Container below header */}
      <div className="flex flex-1 overflow-hidden p-6 pt-4">
        {/* Left vertical tabs */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 pr-4">
          <nav className="space-y-0.5">
            {channels.map((channel) => {
              const Icon = channel.icon
              const isActive = view === channel.id
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setView(channel.id)
                    if (channel.id === 'flows-list') openFlowList()
                    if (channel.id === 'sequence-list') openSeqList()
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-[#3e79f7] bg-[#f0f7ff]'
                      : 'text-[#455560] hover:text-[#3e79f7] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {channel.label}
                  {channel.id === 'sequence-list' && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Mới
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 pl-6 min-w-0 flex flex-col h-full overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            {view === 'flows-list' && <FlowListPage onOpenEditor={openEditor} />}
            {view === 'sequence-list' && <SequenceListPage onSelectSequence={openSeqDetail} />}
            {view === 'settings' && <AutomationSettings onBack={() => {}} />}
          </div>
        </div>
      </div>
    </div>
  )
}

