'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Plus, MoreHorizontal, Play, Pause, Copy, Trash2, ChevronRight, Zap, Users, Check, FolderInput, Pencil, ChevronLeft } from 'lucide-react'
import { Sequence, SequenceStatus, TriggerType, Folder } from './types'
import { SEQUENCE_STATUS_STYLES, TRIGGER_MAP, TRIGGER_GROUPS } from './constants'
import { MOCK_SEQUENCES_FULL, MOCK_FOLDERS } from './mockData'
import FolderSidebar from './FolderSidebar'

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

            {/* Tag Selection */}
            {(triggerType === 'tag_added' || triggerType === 'tag_removed') && (
              <div className="animate-in fade-in slide-in-from-top-1 mt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Chọn thẻ (Tag) *</label>
                <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn thẻ --</option>
                  <option value="vip">Khách hàng VIP</option>
                  <option value="new">Khách mới</option>
                  <option value="buy">Đã mua hàng</option>
                </select>
              </div>
            )}

            {/* Scheduled Selection */}
            {triggerType === 'scheduled' && (
              <div className="animate-in fade-in slide-in-from-top-1 mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ngày chạy *</label>
                  <input 
                    type="date" 
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Giờ chạy *</label>
                  <input 
                    type="time" 
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" 
                  />
                </div>
              </div>
            )}

            {triggerType && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
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
  const [folders, setFolders]             = useState<Folder[]>(MOCK_FOLDERS)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  
  const [query, setQuery]                 = useState('')
  const [statusFilter, setStatusFilter]   = useState<SequenceStatus | 'all'>('all')
  const [triggerFilter, setTriggerFilter] = useState<TriggerType | 'all'>('all')
  const [showCreate, setShowCreate]       = useState(false)
  const [menuOpenId, setMenuOpenId]       = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Folder states
  const [folderModal, setFolderModal] = useState<{ mode: 'create' | 'edit', folder?: Folder, name: string, error?: string } | null>(null)
  
  // Rename Modal
  const [renameModal, setRenameModal] = useState<{ id: string, name: string, error: string } | null>(null)

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moveFolderOpen, setMoveFolderOpen] = useState(false)
  const moveFolderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moveFolderRef.current && !moveFolderRef.current.contains(e.target as Node)) {
        setMoveFolderOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const foldersWithCount = folders.map(f => ({
    ...f,
    sequenceCount: sequences.filter(seq => {
      if (f.isDefault) return seq.folder?.id === f.id || !seq.folder
      return seq.folder?.id === f.id
    }).length
  })).sort((a, b) => a.position - b.position)

  const filtered = sequences.filter(s => {
    // folder
    const matchF  = selectedFolderId === null || 
                    s.folder?.id === selectedFolderId || 
                    (folders.find(f => f.id === selectedFolderId)?.isDefault && !s.folder)
    // search & filter
    const matchQ  = !query || s.name.toLowerCase().includes(query.toLowerCase())
    const matchSt = statusFilter === 'all' || s.status === statusFilter
    const matchTr = triggerFilter === 'all' || s.trigger.type === triggerFilter
    return matchF && matchQ && matchSt && matchTr
  })

  // --- Folder Handlers ---
  const handleCreateFolder = () => setFolderModal({ mode: 'create', name: '' })
  const handleEditFolder = (folder: Folder) => setFolderModal({ mode: 'edit', folder, name: folder.name })
  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Ban có muốn xóa thư mục này? Các kịch bản sẽ chuyển về "Chưa phân loại"')) {
      const defaultFolder = folders.find(f => f.isDefault)
      setSequences(prev => prev.map(seq => {
        if (seq.folder?.id === id) {
          return { ...seq, folder: defaultFolder ? { id: defaultFolder.id, name: defaultFolder.name } : undefined }
        }
        return seq
      }))
      setFolders(prev => prev.filter(f => f.id !== id))
      if (selectedFolderId === id) setSelectedFolderId(null)
    }
  }

  const submitFolder = () => {
    if (!folderModal) return
    const { mode, name, folder } = folderModal
    if (!name.trim()) {
      setFolderModal({ ...folderModal, error: 'Tên thư mục không được để trống' })
      return
    }

    if (mode === 'create') {
      const newFolder: Folder = {
        id: `f_${Date.now()}`,
        name: name.trim(),
        sequenceCount: 0,
        position: folders.length
      }
      setFolders([...folders, newFolder])
      setSelectedFolderId(newFolder.id)
    } else if (mode === 'edit' && folder) {
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name: name.trim() } : f))
    }
    setFolderModal(null)
  }

  const handleCreate = (name: string, description: string, triggerType: TriggerType) => {
    const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;
    const defaultFolder = folders.find(f => f.isDefault);
    const targetFolder = selectedFolder || defaultFolder;

    const newSeq: Sequence = {
      id: 'seq_' + Date.now(),
      name, description,
      status: 'draft',
      current_version: 1,
      folder: targetFolder ? { id: targetFolder.id, name: targetFolder.name } : undefined,
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

  // --- Selection Handlers ---
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)))
    }
  }

  const clearSelection = () => setSelectedIds(new Set())
  const selectAllVisible = () => setSelectedIds(new Set(filtered.map(s => s.id)))

  // --- Bulk Actions ---
  const handleBulkMoveToFolder = (ids: string[], folderId: string) => {
    const targetFolder = folders.find(f => f.id === folderId)
    if (!targetFolder) return
    setSequences(prev => prev.map(s =>
      ids.includes(s.id) ? { ...s, folder: { id: targetFolder.id, name: targetFolder.name } } : s
    ))
  }

  const handleBulkDuplicate = (ids: string[]) => {
    setSequences(prev => {
      const dups = prev.filter(s => ids.includes(s.id)).map(seq => ({
        ...seq,
        id: 'seq_' + Math.random().toString(36).substr(2, 9),
        name: `${seq.name} (sao chép)`,
        status: 'draft' as SequenceStatus,
        stats: { total_customers: 0, running: 0, completed: 0, cancelled: 0 }
      }))
      return [...dups, ...prev]
    })
  }

  const handleBulkDelete = (ids: string[]) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${ids.length} kịch bản đã chọn?`)) {
      setSequences(prev => prev.filter(s => !ids.includes(s.id)))
    }
  }

  const selectedCount = selectedIds.size
  
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedFiltered = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <FolderSidebar
        folders={foldersWithCount}
        selectedFolderId={selectedFolderId}
        onSelect={(id) => setSelectedFolderId(id)}
        onCreateFolder={handleCreateFolder}
        onEditFolder={handleEditFolder}
        onDeleteFolder={handleDeleteFolder}
        totalCount={sequences.length}
      />

      {/* Main content */}
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 bg-white shrink-0">
          {/* Search */}
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm kịch bản..."
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-0.5 bg-gray-100 border border-gray-200 rounded-md">
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
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                  statusFilter === opt.v ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-50'
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
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
          >
            <Plus size={15} />
            Tạo kịch bản mới
          </button>
        </div>

        {/* Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-blue-50 border-b border-blue-100 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                Đã chọn <strong>{selectedCount}</strong> kịch bản
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount < filtered.length && (
                <button
                  onClick={selectAllVisible}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-sm rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Chọn tất cả ({filtered.length})
                </button>
              )}
              <div className="relative" ref={moveFolderRef}>
                <button
                  onClick={() => setMoveFolderOpen(v => !v)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  Chuyển thư mục
                </button>
                {moveFolderOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 max-h-60 overflow-auto">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Chọn thư mục
                    </div>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          handleBulkMoveToFolder(Array.from(selectedIds), f.id)
                          setMoveFolderOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <span className="text-gray-400">📁</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  handleBulkDuplicate(Array.from(selectedIds))
                  clearSelection()
                }}
                className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Nhân bản
              </button>
              <button
                onClick={() => {
                  handleBulkDelete(Array.from(selectedIds))
                  clearSelection()
                }}
                className="px-3 py-1.5 bg-red-600 border border-transparent text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white min-w-[900px]">
            {/* Table head */}
            <div className="grid grid-cols-12 gap-0 px-5 py-2.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 items-center">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên Kịch bản</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thư mục</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Bước</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">KH</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Trạng thái</div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Thao tác</div>
          </div>

          {paginatedFiltered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Chưa có kịch bản nào</p>
              <p className="text-xs text-gray-400 mt-1">Tạo kịch bản đầu tiên để bắt đầu tự động hóa</p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors"
              >
                Tạo kịch bản mới
              </button>
            </div>
          ) : (
            paginatedFiltered.map(seq => {
              const statusStyle   = SEQUENCE_STATUS_STYLES[seq.status]
              const triggerLabel  = TRIGGER_MAP[seq.trigger.type]?.label ?? seq.trigger.type
              const triggerGroup  = TRIGGER_MAP[seq.trigger.type]?.group ?? ''
              const isMenuOpen    = menuOpenId === seq.id

              return (
                  <div key={seq.id} className={"group grid grid-cols-12 gap-0 px-5 py-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors items-center cursor-pointer " + (selectedIds.has(seq.id) ? "bg-blue-50" : "")} onClick={() => onSelectSequence(seq.id)}>
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(seq.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(seq.id) }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>

                  {/* Name + description */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0 pr-4">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={15} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelectSequence(seq.id) }}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block text-left"
                      >
                        {seq.name}
                      </button>
                      {seq.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{seq.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Folder */}
                  <div className="col-span-2 flex items-center pr-2">
                    {seq.folder ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200/60 truncate max-w-[140px]">
                        <FolderInput className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{seq.folder.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Chưa phân loại</span>
                    )}
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
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <Users size={13} className="text-gray-400 hidden sm:block" />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700">{seq.stats.running}</span>
                      <span className="text-gray-400">/{seq.stats.total_customers}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
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
                    {/* Context menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : seq.id) }}
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
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); onSelectSequence(seq.id) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ChevronRight size={13} className="text-gray-400" /> Xem chi tiết
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleToggle(seq.id) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {seq.status === 'active'
                              ? <><Pause size={13} className="text-gray-400" /> Tạm dừng</>
                              : <><Play size={13} className="text-gray-400" /> Bật kịch bản</>
                            }
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setRenameModal({ id: seq.id, name: seq.name, error: '' }) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={13} className="text-gray-400" /> Đổi tên kịch bản
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleDuplicate(seq) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Copy size={13} className="text-gray-400" /> Sao chép
                          </button>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); handleDelete(seq.id) }}
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

      {/* Pagination Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
            >
              {[10, 20, 50].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              / {filtered.length} kịch bản
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              &larr; Trước
            </button>
            <span className="px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded-md">
              {currentPage}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau &rarr;
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateSequenceModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Folder Create/Edit Modal */}
      {folderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base">
                {folderModal.mode === 'create' ? 'Tạo thư mục mới' : 'Đổi tên thư mục'}
              </h3>
            </div>

            <div className="p-5">
              <input
                autoFocus
                type="text"
                placeholder="Tên thư mục"
                value={folderModal.name}
                onChange={e => setFolderModal({ ...folderModal, name: e.target.value, error: undefined })}
                onKeyDown={e => e.key === 'Enter' && submitFolder()}
                className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                  folderModal.error ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200'
                }`}
              />
              {folderModal.error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  {folderModal.error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setFolderModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitFolder}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                {folderModal.mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base">Đổi tên kịch bản</h3>
            </div>
            <div className="p-5">
              <input
                autoFocus
                type="text"
                placeholder="Tên kịch bản..."
                value={renameModal.name}
                onChange={e => setRenameModal({ ...renameModal, name: e.target.value, error: '' })}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (!renameModal.name.trim()) {
                      setRenameModal({ ...renameModal, error: 'Tên kịch bản không được để trống' })
                      return
                    }
                    setSequences(prev => prev.map(s => s.id === renameModal.id ? { ...s, name: renameModal.name.trim() } : s))
                    setRenameModal(null)
                  }
                }}
                className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                  renameModal.error ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200'
                }`}
              />
              {renameModal.error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  {renameModal.error}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRenameModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!renameModal.name.trim()) {
                    setRenameModal({ ...renameModal, error: 'Tên kịch bản không được để trống' })
                    return
                  }
                  setSequences(prev => prev.map(s => s.id === renameModal.id ? { ...s, name: renameModal.name.trim() } : s))
                  setRenameModal(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
