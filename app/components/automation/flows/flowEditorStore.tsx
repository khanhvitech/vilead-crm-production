'use client'

/**
 * Flow Editor Store — Zustand
 * Replaces the old Context + useReducer implementation.
 * Uses subscribeWithSelector to prevent wasted re-renders.
 */

import { createContext, useContext, useRef, ReactNode } from 'react'
import { createStore, useStore } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { type Node, type Edge, addEdge as rfAddEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import {
  FlowEditorState, FlowNode, FlowEdge, NodeType, NodeData,
  FlowDetail, ValidationError, XY,
} from './types'
import { NODE_WIDTH, NODE_HEIGHT } from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// Default data per node type
// ─────────────────────────────────────────────────────────────────────────────
function defaultNodeData(nodeType: NodeType): NodeData {
  switch (nodeType) {
    case 'text':          return { items: [{ id: `txt_${Date.now()}`, content: '' }] }
    case 'image':         return { items: [{ id: `img_${Date.now()}`, url: '', caption: '' }] }
    case 'video':         return { items: [{ id: `vid_${Date.now()}`, url: '' }] }
    case 'audio':         return { items: [{ id: `aud_${Date.now()}`, fileId: '' }] }
    case 'file':          return { items: [{ id: `file_${Date.now()}`, fileId: '', fileName: '', fileSize: 0 }] }
    case 'carousel':      return { cards: [{ id: `card_${Date.now()}`, imageUrl: '', title: '', description: '', buttons: [] }] }
    case 'buttons':       return { buttons: [{ id: `btn_${Date.now()}`, label: 'Nút 1', type: 'flow', value: '' }] }
    case 'quick_reply':   return { replies: [{ id: `qr_${Date.now()}`, label: 'Trả lời 1', type: 'flow' }] }
    case 'wait_response': return { timeoutValue: 24, timeoutUnit: 'hours' }
    case 'condition':     return { branches: [{ id: `branch_${Date.now()}`, logic: 'and', conditions: [] }] }
    case 'random':        return { branches: [{ id: `b1_${Date.now()}`, name: 'Nhánh A', percentage: 50 }, { id: `b2_${Date.now()}`, name: 'Nhánh B', percentage: 50 }] }
    case 'delay':         return { value: 1, unit: 'hours' }
    case 'action':        return { actions: [] }
    default:              return {}
  }
}

let _nodeCounter = 100

// ─────────────────────────────────────────────────────────────────────────────
// Store definition
// ─────────────────────────────────────────────────────────────────────────────
interface FlowStore {
  // State
  flowId: string | null
  flowName: string
  status: FlowEditorState['status']
  nodes: Node<{ nodeType: NodeType; nodeData: NodeData }>[]
  edges: Edge[]
  selectedNodeId: string | null
  hasUnsavedChanges: boolean
  isPreviewOpen: boolean
  validationErrors: ValidationError[]

  // Actions
  setFlow: (flow: FlowDetail) => void
  addNode: (nodeType: NodeType, position: XY) => string
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void
  onNodesChange: (changes: Parameters<typeof applyNodeChanges>[0]) => void
  onEdgesChange: (changes: Parameters<typeof applyEdgeChanges>[0]) => void
  onConnect: (connection: Parameters<typeof rfAddEdge>[0]) => void
  deleteNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => string | null
  selectNode: (nodeId: string | null) => void
  setPreviewOpen: (open: boolean) => void
  setFlowName: (name: string) => void
  markSaved: () => void
  validate: () => ValidationError[]

  // Helpers to get app-level node/edge types
  getFlowNodes: () => FlowNode[]
  getFlowEdges: () => FlowEdge[]
}

function createFlowStore() {
  return createStore<FlowStore>()(
    subscribeWithSelector((set, get) => ({
      flowId: null,
      flowName: 'Luồng mới',
      status: 'draft',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      hasUnsavedChanges: false,
      isPreviewOpen: false,
      validationErrors: [],

      setFlow: (flow) => {
        // Convert FlowNode[] → RF Node[]
        const rfNodes: Node<{ nodeType: NodeType; nodeData: NodeData }>[] =
          flow.nodes.map(n => ({
            id: n.id,
            type: 'flowNode',
            position: n.position,
            data: { nodeType: n.type, nodeData: n.data },
            selected: false,
          }))
        const rfEdges: Edge[] = flow.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: null,
          label: e.label,
        }))
        set({
          flowId: flow.id,
          flowName: flow.name,
          status: flow.status,
          nodes: rfNodes,
          edges: rfEdges,
          selectedNodeId: null,
          hasUnsavedChanges: false,
          validationErrors: [],
        })
      },

      addNode: (nodeType, position) => {
        _nodeCounter++
        const id = `node_${_nodeCounter}`
        const newNode: Node<{ nodeType: NodeType; nodeData: NodeData }> = {
          id,
          type: 'flowNode',
          position,
          data: { nodeType, nodeData: defaultNodeData(nodeType) },
          selected: false,
        }
        set(s => ({
          nodes: [...s.nodes, newNode],
          selectedNodeId: id,
          hasUnsavedChanges: true,
        }))
        return id
      },

      updateNodeData: (nodeId, data) => {
        set(s => ({
          nodes: s.nodes.map(n =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, nodeData: { ...n.data.nodeData, ...data } } }
              : n
          ),
          hasUnsavedChanges: true,
        }))
      },

      onNodesChange: (changes) => {
        set(s => {
          const updated = applyNodeChanges(changes, s.nodes) as Node<{ nodeType: NodeType; nodeData: NodeData }>[]

          // Sync selectedNodeId when a node is selected via RF
          let selectedNodeId = s.selectedNodeId
          for (const c of changes) {
            if (c.type === 'select') {
              selectedNodeId = c.selected ? c.id : (selectedNodeId === c.id ? null : selectedNodeId)
            }
            if (c.type === 'remove') {
              if (selectedNodeId === c.id) selectedNodeId = null
            }
          }

          return { nodes: updated, selectedNodeId, hasUnsavedChanges: true }
        })
      },

      onEdgesChange: (changes) => {
        set(s => ({
          edges: applyEdgeChanges(changes, s.edges),
          hasUnsavedChanges: true,
        }))
      },

      onConnect: (connection) => {
        set(s => {
          // Prevent duplicate connections from the same source handle
          const filtered = s.edges.filter(e => {
            if (e.source === connection.source && e.sourceHandle === (connection.sourceHandle ?? null)) {
              return false // remove old edge from same handle
            }
            return true
          })
          return {
            edges: rfAddEdge(
              {
                ...connection,
                id: `edge_${Date.now()}`,
                animated: false,
                style: { strokeWidth: 2 },
              },
              filtered
            ),
            hasUnsavedChanges: true,
          }
        })
      },

      deleteNode: (nodeId) => {
        set(s => ({
          nodes: s.nodes.filter(n => n.id !== nodeId),
          edges: s.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
          selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
          hasUnsavedChanges: true,
        }))
      },

      duplicateNode: (nodeId) => {
        const state = get()
        const original = state.nodes.find(n => n.id === nodeId)
        if (!original) return null
        _nodeCounter++
        const newId = `node_${_nodeCounter}`
        const cloned = {
          ...original,
          id: newId,
          position: { x: original.position.x + 60, y: original.position.y + 60 },
          selected: false,
          data: { ...original.data, nodeData: { ...original.data.nodeData } },
        }
        set(s => ({
          nodes: [...s.nodes, cloned],
          selectedNodeId: newId,
          hasUnsavedChanges: true,
        }))
        return newId
      },

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      setPreviewOpen: (open) => set({ isPreviewOpen: open }),

      setFlowName: (name) => set({ flowName: name, hasUnsavedChanges: true }),

      markSaved: () => set({ hasUnsavedChanges: false }),

      validate: () => {
        const { nodes, edges } = get()
        const errors: ValidationError[] = []

        const startNode = nodes.find(n => n.data.nodeType === 'start')
        if (!startNode) {
          errors.push({ code: 'NO_START_NODE', message: 'Flow cần có node Bắt đầu' })
          set({ validationErrors: errors })
          return errors
        }

        const startEdges = edges.filter(e => e.source === startNode.id)
        if (startEdges.length === 0) {
          errors.push({ code: 'NO_CONTENT_NODE', message: 'Cần có ít nhất 1 node sau điểm Bắt đầu' })
        }

        // BFS reachability
        const reachable = new Set<string>([startNode.id])
        const queue = [startNode.id]
        while (queue.length) {
          const curr = queue.shift()!
          edges.filter(e => e.source === curr).forEach(e => {
            if (!reachable.has(e.target)) {
              reachable.add(e.target)
              queue.push(e.target)
            }
          })
        }

        nodes.forEach(n => {
          if (n.data.nodeType !== 'start' && !reachable.has(n.id)) {
            errors.push({ nodeId: n.id, code: 'DISCONNECTED_NODE', message: 'Node chưa được kết nối' })
          }
          if (['text', 'image', 'video', 'audio', 'file'].includes(n.data.nodeType)) {
            const d = n.data.nodeData as any
            const isEmpty = n.data.nodeType === 'text' ? !d.content : !d.url && !d.fileId
            if (isEmpty) {
              errors.push({ nodeId: n.id, code: 'EMPTY_CONTENT', message: 'Node chưa có nội dung' })
            }
          }
          if (n.data.nodeType === 'condition') {
            const d = n.data.nodeData as any
            if (!d.conditions || d.conditions.length === 0) {
              errors.push({ nodeId: n.id, code: 'EMPTY_CONDITION', message: 'Node Điều kiện cần ít nhất 1 điều kiện' })
            }
          }
          if (n.data.nodeType === 'random') {
            const d = n.data.nodeData as any
            const total = (d.branches || []).reduce((s: number, b: any) => s + b.percentage, 0)
            if (total !== 100) {
              errors.push({ nodeId: n.id, code: 'INVALID_PERCENTAGE', message: `Tổng tỷ lệ = ${total}%, cần = 100%` })
            }
          }
        })

        set({ validationErrors: errors })
        return errors
      },

      getFlowNodes: () => {
        return get().nodes.map(n => ({
          id: n.id,
          type: n.data.nodeType,
          position: n.position,
          data: n.data.nodeData,
        }))
      },

      getFlowEdges: () => {
        return get().edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? undefined,
          label: e.label as string | undefined,
        }))
      },
    }))
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
type FlowStoreApi = ReturnType<typeof createFlowStore>
const FlowStoreContext = createContext<FlowStoreApi | null>(null)

export function FlowEditorProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<FlowStoreApi | null>(null)
  if (!storeRef.current) {
    storeRef.current = createFlowStore()
  }
  return (
    <FlowStoreContext.Provider value={storeRef.current}>
      {children}
    </FlowStoreContext.Provider>
  )
}

export function useFlowEditor<T = FlowStore>(selector?: (s: FlowStore) => T): T {
  const store = useContext(FlowStoreContext)
  if (!store) throw new Error('useFlowEditor must be used within FlowEditorProvider')
  return useStore(store, selector ?? ((s) => s as T))
}
