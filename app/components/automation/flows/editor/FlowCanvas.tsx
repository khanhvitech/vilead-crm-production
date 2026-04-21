'use client'

import React, { useCallback, useMemo, useRef, DragEvent } from 'react'
import {
  ReactFlow,
  Background, BackgroundVariant,
  Controls,
  MiniMap,
  NodeTypes,
  DefaultEdgeOptions,
  ConnectionLineType,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus } from 'lucide-react'
import { NodeType } from '../types'
import { NODE_COLOR } from '../constants'
import { useFlowEditor } from '../flowEditorStore'
import FlowNodeCard from './NodeCard'

// ─── Node types map ─────────────────────────────────────────────────────────────
const nodeTypes: NodeTypes = {
  flowNode: FlowNodeCard,
}

// ─── Edge defaults ─────────────────────────────────────────────────────────────
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { strokeWidth: 2, stroke: '#9CA3AF' },
  markerEnd: { type: 'arrowclosed' as any, width: 18, height: 18, color: '#9CA3AF' },
}

// ─── Connection styling based on sourceHandle ──────────────────────────────────
function edgeColor(sourceHandle: string | null | undefined): string {
  if (sourceHandle === 'true') return '#22C55E'
  if (sourceHandle === 'false') return '#F87171'
  if (sourceHandle?.startsWith('branch_')) return '#8B5CF6'
  return '#9CA3AF'
}

// ─── Inner canvas (uses RF context) ────────────────────────────────────────────
interface InnerCanvasProps {
  onDropNode: (nodeType: NodeType, x: number, y: number) => void
}

function InnerCanvas({ onDropNode }: InnerCanvasProps) {
  const { screenToFlowPosition } = useReactFlow()

  const nodes          = useFlowEditor(s => s.nodes)
  const edges          = useFlowEditor(s => s.edges)
  const selectedNodeId = useFlowEditor(s => s.selectedNodeId)
  const validErrors    = useFlowEditor(s => s.validationErrors)
  const onNodesChange  = useFlowEditor(s => s.onNodesChange)
  const onEdgesChange  = useFlowEditor(s => s.onEdgesChange)
  const onConnect      = useFlowEditor(s => s.onConnect)
  const selectNodeFn   = useFlowEditor(s => s.selectNode)

  // Error node set
  const errorNodeIds = useMemo(
    () => new Set(validErrors.map(e => e.nodeId).filter(Boolean) as string[]),
    [validErrors]
  )

  // Node display index (non-start nodes get a number)
  const nodeDisplayIndex = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 1
    nodes.forEach(n => {
      if (n.data.nodeType !== 'start') map.set(n.id, idx++)
    })
    return map
  }, [nodes])

  // Enrich node data with index and error info
  const enrichedNodes = useMemo(() => nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      nodeIndex: nodeDisplayIndex.get(n.id) ?? 1,
      hasError: errorNodeIds.has(n.id),
    },
    selected: n.id === selectedNodeId,
  })), [nodes, nodeDisplayIndex, errorNodeIds, selectedNodeId])

  // Enrich edges with color based on handle
  const enrichedEdges = useMemo(() => edges.map(e => {
    const color = edgeColor(e.sourceHandle)
    return {
      ...e,
      style: { strokeWidth: 2, stroke: color },
      markerEnd: { type: 'arrowclosed' as any, width: 16, height: 16, color },
    }
  }), [edges])

  // ── Drop from palette ────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const nodeType = e.dataTransfer.getData('nodeType') as NodeType
    if (!nodeType) return
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    onDropNode(nodeType, Math.round(pos.x), Math.round(pos.y))
  }, [screenToFlowPosition, onDropNode])

  // ── Node click deselect ──────────────────────────────────────────────────────
  const handlePaneClick = useCallback(() => {
    selectNodeFn(null)
  }, [selectNodeFn])

  // ── onConnect → store ────────────────────────────────────────────────────────
  const handleConnect = useCallback((connection: Connection) => {
    onConnect(connection)
  }, [onConnect])

  // ── NodesChange proxy — sync selection to store ──────────────────────────────
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
  }, [onNodesChange])

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes)
  }, [onEdgesChange])

  const isEmpty = nodes.length === 0

  return (
    <ReactFlow
      nodes={enrichedNodes}
      edges={enrichedEdges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '6 4' }}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      onPaneClick={handlePaneClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      fitView
      fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
      deleteKeyCode={['Backspace', 'Delete']}
      multiSelectionKeyCode="Shift"
      panOnDrag={[1, 2]}          // middle + drag = pan
      selectionOnDrag={false}
      selectNodesOnDrag={false}
      snapToGrid={true}
      snapGrid={[16, 16]}
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable
      nodesConnectable
      elementsSelectable
      style={{ background: '#F1F3F5' }}
    >
      {/* Dot-grid background */}
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#D1D5DB" />

      {/* Built-in zoom/pan controls (bottom-left) */}
      <Controls
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}
        showFitView
        showZoom
        showInteractive={false}
      />

      {/* Mini-map */}
      <MiniMap
        style={{
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        nodeColor={(n) => {
          const nt = (n.data as any)?.nodeType as NodeType
          return NODE_COLOR[nt] || '#94A3B8'
        }}
        maskColor="rgba(241,243,245,0.7)"
        pannable
        zoomable
        position="bottom-right"
      />

      {/* Empty state hint */}
      {isEmpty && (
        <Panel position="top-center">
          <div className="mt-20 flex flex-col items-center gap-3 pointer-events-none select-none">
            <div className="w-16 h-16 rounded-[10px] bg-white border-2 border-dashed border-[#e6ebf1] flex items-center justify-center shadow-sm">
              <Plus size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Kéo và thả node từ bảng bên trái</p>
            <p className="text-gray-400 text-xs">Hoặc kéo node để kết nối với nhau</p>
          </div>
        </Panel>
      )}
    </ReactFlow>
  )
}

// ─── Public FlowCanvas ──────────────────────────────────────────────────────────
interface FlowCanvasProps {
  onDropNode: (nodeType: NodeType, x: number, y: number) => void
}

export default function FlowCanvas({ onDropNode }: FlowCanvasProps) {
  return (
    <div className="flex-1 relative overflow-hidden">
      <ReactFlowProvider>
        <InnerCanvas onDropNode={onDropNode} />
      </ReactFlowProvider>
    </div>
  )
}
