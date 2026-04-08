'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react'
import {
  MessageSquare, Image, Video, Mic, Paperclip, LayoutGrid,
  MousePointerClick, MessageCircle, Clock, GitBranch, Shuffle,
  Timer, Zap, Play, Pencil
} from 'lucide-react'
import {
  NodeType, TextNodeData, ConditionNodeData, RandomNodeData,
  DelayNodeData, ActionNodeData, ButtonsNodeData, QuickReplyNodeData, NodeData
} from '../types'
import { NODE_COLOR, NODE_ICON_BG, NODE_LABEL } from '../constants'
import { useFlowEditor } from '../flowEditorStore'

// ─── Node icon ─────────────────────────────────────────────────────────────────
function NodeIcon({ type, size = 15 }: { type: NodeType; size?: number }) {
  const color = NODE_COLOR[type] || '#6B7280'
  const p = { size, color, strokeWidth: 2 }
  switch (type) {
    case 'start':         return <Play {...p} />
    case 'text':          return <MessageSquare {...p} />
    case 'image':         return <Image {...p} />
    case 'video':         return <Video {...p} />
    case 'audio':         return <Mic {...p} />
    case 'file':          return <Paperclip {...p} />
    case 'carousel':      return <LayoutGrid {...p} />
    case 'buttons':       return <MousePointerClick {...p} />
    case 'quick_reply':   return <MessageCircle {...p} />
    case 'wait_response': return <Clock {...p} />
    case 'condition':     return <GitBranch {...p} />
    case 'random':        return <Shuffle {...p} />
    case 'delay':         return <Timer {...p} />
    case 'action':        return <Zap {...p} />
    default:              return <MessageSquare {...p} />
  }
}

// ─── Body preview ──────────────────────────────────────────────────────────────
function NodeBodyPreview({ type, data }: { type: NodeType; data: NodeData }) {
  switch (type) {
    case 'start':
      return (
        <div className="flex items-center justify-center py-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">A</div>
        </div>
      )
    case 'text': {
      const d = data as TextNodeData
      return (
        <div className="min-h-[36px] flex items-center">
          {d.content
            ? <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{d.content}</p>
            : <p className="text-xs text-gray-300 italic">Chưa có nội dung</p>
          }
        </div>
      )
    }
    case 'image':
      return <div className="flex flex-col items-center justify-center py-2 gap-0.5"><Image size={20} className="text-gray-300" /><span className="text-[10px] text-gray-300">Hình ảnh</span></div>
    case 'video':
      return <div className="flex flex-col items-center justify-center py-2 gap-0.5"><Video size={20} className="text-gray-300" /><span className="text-[10px] text-gray-300">Video</span></div>
    case 'audio':
      return <div className="flex flex-col items-center justify-center py-2 gap-0.5"><Mic size={20} className="text-gray-300" /><span className="text-[10px] text-gray-300">Âm thanh</span></div>
    case 'file':
      return <div className="flex flex-col items-center justify-center py-2 gap-0.5"><Paperclip size={20} className="text-gray-300" /><span className="text-[10px] text-gray-300">File đính kèm</span></div>
    case 'carousel':
      return <div className="flex flex-col items-center justify-center py-2 gap-0.5"><LayoutGrid size={20} className="text-gray-300" /><span className="text-[10px] text-gray-300">Bộ sưu tập</span></div>
    case 'buttons': {
      const d = data as ButtonsNodeData
      return (
        <div className="space-y-1">
          {d.buttons.length === 0
            ? <p className="text-[10px] text-gray-300 italic text-center py-1">Chưa có nút</p>
            : d.buttons.slice(0, 2).map(btn => (
                <div key={btn.id} className="text-[10px] text-gray-600 py-1 px-2 rounded border border-gray-100 truncate">{btn.label}</div>
              ))
          }
          {d.buttons.length > 2 && <p className="text-[10px] text-gray-400">+{d.buttons.length - 2} nút khác</p>}
        </div>
      )
    }
    case 'quick_reply': {
      const d = data as QuickReplyNodeData
      return (
        <div className="space-y-0.5">
          {d.replies.slice(0, 2).map(r => <div key={r.id} className="text-[10px] text-gray-600 truncate">{r.label}</div>)}
          <p className="text-[10px] text-gray-400 flex items-center gap-1"><MessageCircle size={9} />Chờ phản hồi</p>
        </div>
      )
    }
    case 'wait_response':
      return <p className="text-[10px] text-gray-400 flex items-center gap-1"><MessageCircle size={9} />Chờ phản hồi từ người dùng</p>
    case 'condition': {
      const d = data as ConditionNodeData
      if (!d.conditions || d.conditions.length === 0)
        return <p className="text-[10px] text-gray-300 italic py-1 text-center">Click để thêm điều kiện</p>
      return (
        <div className="space-y-0.5">
          {d.conditions.slice(0, 2).map((c, i) => (
            <div key={c.id} className="text-[10px] text-gray-600 truncate">
              {i > 0 && <span className="text-purple-400 mr-1">{d.logic === 'and' ? 'VÀ' : 'HOẶC'}</span>}
              {c.field} {c.operator}
            </div>
          ))}
        </div>
      )
    }
    case 'random': {
      const d = data as RandomNodeData
      return (
        <div className="space-y-0.5">
          {d.branches.map(b => (
            <div key={b.id} className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">{b.name}</span>
              <span className="text-gray-500 font-medium">{b.percentage}%</span>
            </div>
          ))}
        </div>
      )
    }
    case 'delay': {
      const d = data as DelayNodeData
      const unitMap: Record<string, string> = { minutes: 'phút', hours: 'giờ', days: 'ngày' }
      return <p className="text-[10px] text-gray-600">Chờ <strong>{d.value} {unitMap[d.unit] || d.unit}</strong></p>
    }
    case 'action': {
      const d = data as ActionNodeData
      if (!d.actions || d.actions.length === 0)
        return <p className="text-[10px] text-gray-300 italic py-1 text-center">Thêm hành động</p>
      return (
        <div className="space-y-0.5">
          {d.actions.slice(0, 2).map((a, i) => (
            <div key={i} className="text-[10px] text-gray-600 flex items-center gap-1">
              <Zap size={9} className="text-amber-400" />{a.type.replace(/_/g, ' ')}
            </div>
          ))}
          {d.actions.length > 2 && <p className="text-[10px] text-gray-400">+{d.actions.length - 2} hành động</p>}
        </div>
      )
    }
    default:
      return <p className="text-[10px] text-gray-300 italic py-1">...</p>
  }
}

// ─── Handle styles ─────────────────────────────────────────────────────────────
const inputHandleStyle: React.CSSProperties = {
  width: 12, height: 12,
  border: '2.5px solid white',
  background: '#94A3B8',
  boxShadow: '0 0 0 1.5px #94A3B8',
  top: -6,
}

function outputHandleStyle(color: string): React.CSSProperties {
  return {
    width: 12, height: 12,
    border: '2.5px solid white',
    background: color,
    boxShadow: `0 0 0 1.5px ${color}`,
    bottom: -6,
  }
}

// ─── Node index lookup (counts non-start nodes in order) ───────────────────────
// We pass this via data from parent
// ─────────────────────────────────────────────────────────────────────────────

// ─── RF Custom Node Component ──────────────────────────────────────────────────
interface NodeRFData {
  nodeType: NodeType
  nodeData: NodeData
  nodeIndex?: number
  hasError?: boolean
}

const FlowNodeCard = memo(function FlowNodeCard({ id, data, selected }: NodeProps) {
  const rfData = data as unknown as NodeRFData
  const { nodeType, nodeData, nodeIndex = 1, hasError = false } = rfData

  const selectNode      = useFlowEditor(s => s.selectNode)
  const selectedNodeId  = useFlowEditor(s => s.selectedNodeId)

  const isSelected  = selected || selectedNodeId === id
  const isStart     = nodeType === 'start'
  const isCondition = nodeType === 'condition'
  const isRandom    = nodeType === 'random'

  const accent  = NODE_COLOR[nodeType] || '#6B7280'
  const iconBg  = NODE_ICON_BG[nodeType] || '#F3F4F6'
  const label   = NODE_LABEL[nodeType] || nodeType

  const borderColor = hasError ? '#EF4444' : isSelected ? (accent !== '#6B7280' ? accent : '#3B82F6') : '#E5E7EB'
  const borderWidth = (hasError || isSelected) ? 2 : 1
  const boxShadow   = isSelected
    ? `0 0 0 3px ${accent !== '#6B7280' ? accent + '33' : '#BFDBFE'}, 0 4px 12px rgba(0,0,0,0.1)`
    : '0 2px 8px rgba(0,0,0,0.07)'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectNode(id)
  }

  return (
    <div
      className="relative select-none"
      style={{ width: 256 }}
      onClick={handleClick}
    >
      {/* Input handle — top center */}
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          style={inputHandleStyle}
          className="!cursor-crosshair hover:!scale-125 transition-transform"
        />
      )}

      {/* Card */}
      <div
        className="bg-white rounded-xl overflow-hidden transition-all duration-150"
        style={{ border: `${borderWidth}px solid ${borderColor}`, boxShadow }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <NodeIcon type={nodeType} size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-800 flex-1 truncate">
            {isStart ? 'Bắt đầu' : `${label} #${nodeIndex}`}
          </span>
          <button
            className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); selectNode(id) }}
          >
            <Pencil size={11} />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 min-h-[40px]">
          <NodeBodyPreview type={nodeType} data={nodeData} />
        </div>

        {/* Condition branch labels */}
        {isCondition && (
          <div className="px-3 pb-2.5 flex justify-between text-[10px]">
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>Thỏa mãn
            </span>
            <span className="text-red-500 font-semibold flex items-center gap-1">
              Không thỏa<span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"/>
            </span>
          </div>
        )}
      </div>

      {/* Output handle — standard types: bottom center */}
      {!isCondition && !isRandom && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          style={outputHandleStyle(accent)}
          className="!cursor-crosshair hover:!scale-125 transition-transform"
        />
      )}

      {/* Condition: two handles — true (left-ish) and false (right-ish) */}
      {isCondition && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ ...outputHandleStyle('#22C55E'), left: '30%' }}
            className="!cursor-crosshair hover:!scale-125 transition-transform"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ ...outputHandleStyle('#F87171'), left: '70%' }}
            className="!cursor-crosshair hover:!scale-125 transition-transform"
          />
        </>
      )}

      {/* Random: one handle per branch at bottom */}
      {isRandom && (() => {
        const d = nodeData as RandomNodeData
        const count = d.branches?.length || 2
        return d.branches?.map((branch, i) => (
          <Handle
            key={branch.id}
            type="source"
            position={Position.Bottom}
            id={`branch_${i}`}
            style={{
              ...outputHandleStyle('#8B5CF6'),
              left: `${((i + 1) / (count + 1)) * 100}%`,
              bottom: -6,
            }}
            className="!cursor-crosshair hover:!scale-125 transition-transform"
          />
        ))
      })()}
    </div>
  )
})

export default FlowNodeCard
