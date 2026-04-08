'use client'

import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { FlowEditorProvider, useFlowEditor } from '../flowEditorStore'
import { FlowDetail, NodeType } from '../types'
import Toolbar from './Toolbar'
import NodePalette from './NodePalette'
import FlowCanvas from './FlowCanvas'
import ConfigPanel from './ConfigPanel'
import PreviewPanel from './PreviewPanel'

// ─── Toast components ─────────────────────────────────────────────────────────
function ValidationToast({ errors, onClose }: { errors: Array<{ message: string; nodeId?: string }>; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-100">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <span className="text-sm font-semibold text-red-700 flex-1">Flow chưa hợp lệ ({errors.length} lỗi)</span>
        <button onClick={onClose} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="max-h-40 overflow-y-auto p-3 space-y-1.5">
        {errors.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-red-700">
            <span className="text-red-400 mt-0.5">•</span>
            {e.message}
          </div>
        ))}
      </div>
    </div>
  )
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2.5">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

// ─── Inner editor ─────────────────────────────────────────────────────────────
function FlowEditorInner({ flowData, onBack }: { flowData: FlowDetail; onBack: () => void }) {
  // Zustand selectors — granular to avoid unnecessary re-renders
  const setFlow        = useFlowEditor(s => s.setFlow)
  const addNodeFn      = useFlowEditor(s => s.addNode)
  const updateNodeData = useFlowEditor(s => s.updateNodeData)
  const deleteNodeFn   = useFlowEditor(s => s.deleteNode)
  const selectNodeFn   = useFlowEditor(s => s.selectNode)
  const setPreviewOpen = useFlowEditor(s => s.setPreviewOpen)
  const setFlowName    = useFlowEditor(s => s.setFlowName)
  const markSaved      = useFlowEditor(s => s.markSaved)
  const validate       = useFlowEditor(s => s.validate)

  const flowName          = useFlowEditor(s => s.flowName)
  const status            = useFlowEditor(s => s.status)
  const hasUnsavedChanges = useFlowEditor(s => s.hasUnsavedChanges)
  const isPreviewOpen     = useFlowEditor(s => s.isPreviewOpen)
  const selectedNodeId    = useFlowEditor(s => s.selectedNodeId)
  const nodes             = useFlowEditor(s => s.nodes)
  const validationErrors  = useFlowEditor(s => s.validationErrors)
  const getFlowNodes      = useFlowEditor(s => s.getFlowNodes)
  const getFlowEdges      = useFlowEditor(s => s.getFlowEdges)

  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState<{ type: 'success' | 'error'; message?: string } | null>(null)
  const [showValidErrors, setShowValidErrors] = useState(false)

  // Initialize flow
  useEffect(() => { setFlow(flowData) }, [flowData, setFlow])

  // Auto-place start node for empty flows
  useEffect(() => {
    if (nodes.length === 0) {
      addNodeFn('start', { x: 300, y: 80 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  // Drag-start from NodePalette
  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('nodeType', nodeType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Drop on canvas
  const handleDropNode = useCallback((nodeType: NodeType, x: number, y: number) => {
    addNodeFn(nodeType, { x, y })
  }, [addNodeFn])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    markSaved()
    setSaving(false)
    setToast({ type: 'success', message: 'Đã lưu luồng thành công' })
  }

  const handlePublish = async () => {
    const errors = validate()
    if (errors.length > 0) {
      setShowValidErrors(true)
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    markSaved()
    setSaving(false)
    setToast({ type: 'success', message: 'Đã xuất bản luồng thành công! 🎉' })
  }

  // Node display index — needed by ConfigPanel title
  const nodeDisplayIndex = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 1
    nodes.forEach(n => {
      if (n.data.nodeType !== 'start') map.set(n.id, idx++)
    })
    return map
  }, [nodes])

  // Selected node — convert RF node → FlowNode for ConfigPanel
  const selectedRFNode   = nodes.find(n => n.id === selectedNodeId) || null
  const selectedFlowNode = selectedRFNode
    ? { id: selectedRFNode.id, type: selectedRFNode.data.nodeType, position: selectedRFNode.position, data: selectedRFNode.data.nodeData }
    : null
  const selectedNodeIndex = selectedFlowNode ? (nodeDisplayIndex.get(selectedFlowNode.id) || 1) : 1

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        flowName={flowName}
        flowGroupName={flowData.folder?.name || 'Tin nhắn Kịch bản'}
        status={status}
        hasChanges={hasUnsavedChanges}
        saving={saving}
        onBack={onBack}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => setPreviewOpen(true)}
        onFlowNameChange={setFlowName}
      />

      {/* Main area: palette | canvas | config panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left: Node Palette — always visible */}
        <NodePalette onDragStart={handleDragStart} />

        {/* Center: Canvas — fills remaining space */}
        <FlowCanvas onDropNode={handleDropNode} />

        {/* Right: Config Panel — floating overlay on canvas right side */}
        {selectedFlowNode && (
          <div
            className="absolute right-0 top-0 h-full z-30 shadow-2xl"
            style={{
              width: 360,
              background: 'white',
              borderLeft: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ConfigPanel
              selectedNode={selectedFlowNode}
              nodeIndex={selectedNodeIndex}
              onUpdate={(nodeId, data) => updateNodeData(nodeId, data)}
              onDelete={(nodeId) => { deleteNodeFn(nodeId); selectNodeFn(null) }}
              onClose={() => selectNodeFn(null)}
            />
          </div>
        )}
      </div>

      <PreviewPanel
        open={isPreviewOpen}
        nodes={getFlowNodes()}
        edges={getFlowEdges()}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Toasts */}
      {showValidErrors && validationErrors.length > 0 && (
        <ValidationToast errors={validationErrors} onClose={() => setShowValidErrors(false)} />
      )}
      {toast?.type === 'success' && (
        <SuccessToast message={toast.message || 'Thành công'} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────
interface FlowEditorPageProps {
  flowId: string
  onBack: () => void
}

function getMockFlowData(flowId: string): FlowDetail {
  const folder = flowId === 'flow1' ? { id: 'f2', name: 'Marketing' }
    : flowId === 'flow2' ? { id: 'f3', name: 'Sales' }
    : { id: '00000000-0000-0000-0000-000000000001', name: 'Chưa phân loại' }
  return {
    id: flowId,
    name: flowId === 'flow1' ? 'Chào mừng KH mới'
      : flowId === 'flow2' ? 'Xác nhận đơn hàng' : 'Luồng tin nhắn',
    shortcut: flowId === 'flow1' ? '/chao' : null,
    folder,
    status: 'draft',
    currentVersion: 1,
    nodes: [],
    edges: [],
    usedByCount: 0,
    updatedAt: new Date().toISOString(),
  }
}

export default function FlowEditorPage({ flowId, onBack }: FlowEditorPageProps) {
  const flowData = getMockFlowData(flowId)
  return (
    <FlowEditorProvider>
      <FlowEditorInner flowData={flowData} onBack={onBack} />
    </FlowEditorProvider>
  )
}
