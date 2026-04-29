'use client'

import React, { useState, useRef } from 'react'
import { Download, Upload, ChevronRight, CheckCircle2, AlertTriangle, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TaskImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (tasks: any[]) => void
  existingTasks: { title: string; dueDate: string }[]
}

const SYSTEM_FIELDS = [
  { key: 'title', label: 'Tên công việc', required: true },
  { key: 'dueDate', label: 'Ngày đến hạn', required: true },
  { key: 'assignedTo', label: 'Người phụ trách', required: true },
  { key: 'priority', label: 'Mức độ ưu tiên', required: false },
  { key: 'description', label: 'Mô tả', required: false },
  { key: 'relatedType', label: 'Loại liên kết', required: false },
  { key: 'relatedTo', label: 'Tên liên kết', required: false },
  { key: 'internalNotes', label: 'Ghi chú nội bộ', required: false },
]

const AUTO_DETECT_MAP: Record<string, string> = {
  'tên công việc': 'title',
  'tiêu đề': 'title',
  'công việc': 'title',
  'ngày đến hạn': 'dueDate',
  'hạn hoàn thành': 'dueDate',
  'deadline': 'dueDate',
  'ngày hạn': 'dueDate',
  'người phụ trách': 'assignedTo',
  'phụ trách': 'assignedTo',
  'nhân viên': 'assignedTo',
  'mức độ ưu tiên': 'priority',
  'ưu tiên': 'priority',
  'priority': 'priority',
  'mô tả': 'description',
  'description': 'description',
  'loại liên kết': 'relatedType',
  'tên liên kết': 'relatedTo',
  'ghi chú nội bộ': 'internalNotes',
  'ghi chú': 'internalNotes',
}

const STEPS = ['File mẫu', 'Upload file', 'Mapping cột', 'Preview', 'Xác nhận']

const TEMPLATE_ROWS = [
  ['Tên công việc', 'Ngày đến hạn', 'Người phụ trách', 'Mức độ ưu tiên', 'Mô tả', 'Ghi chú nội bộ'],
  ['Gọi điện tư vấn khách hàng ABC', '2026-05-10', 'Nguyễn Văn A', 'high', 'Tư vấn gói Pro', ''],
  ['Gửi báo giá cho Công ty XYZ', '2026-05-15', 'Trần Thị B', 'medium', '', 'Đã liên hệ qua email'],
]

function parseDate(val: string): string | null {
  if (!val) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return null
}

function normalizePriority(val: string): string {
  const v = (val || '').toLowerCase().trim()
  if (['high', 'cao', 'khẩn'].includes(v)) return 'high'
  if (['low', 'thấp'].includes(v)) return 'low'
  return 'medium'
}

export default function TaskImportModal({ isOpen, onClose, onImport, existingTasks }: TaskImportModalProps) {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [parseError, setParseError] = useState('')
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep(0); setFile(null); setRawHeaders([]); setRawRows([])
    setMapping({}); setParseError(''); setImportedCount(0)
  }

  const handleClose = () => { reset(); onClose() }

  const downloadTemplate = () => {
    const csv = TEMPLATE_ROWS.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'mau_import_cong_viec.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string): string[][] => {
    return text.split('\n').filter(l => l.trim()).map(line => {
      const cols: string[] = []
      let cur = ''; let inQ = false
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQ = !inQ }
        else if (line[i] === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
        else cur += line[i]
      }
      cols.push(cur.trim())
      return cols
    })
  }

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(csv|xlsx)$/i)) { setParseError('Chỉ hỗ trợ file .csv hoặc .xlsx'); return }
    if (f.size > 5 * 1024 * 1024) { setParseError('File không được vượt quá 5MB'); return }
    setParseError(''); setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) { setParseError('File không có dữ liệu'); return }
      const headers = rows[0]
      const dataRows = rows.slice(1).filter(r => r.some(c => c.trim()))
      setRawHeaders(headers); setRawRows(dataRows)
      const autoMap: Record<string, string> = {}
      headers.forEach(h => {
        const key = AUTO_DETECT_MAP[h.toLowerCase().trim()]
        if (key) autoMap[h] = key
      })
      setMapping(autoMap); setStep(2)
    }
    reader.readAsText(f, 'UTF-8')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const buildRow = (raw: string[]) => {
    const obj: Record<string, string> = {}
    rawHeaders.forEach((h, i) => {
      const field = mapping[h]
      if (field) obj[field] = raw[i] || ''
    })
    return obj
  }

  const validateRow = (row: Record<string, string>): string[] => {
    const errs: string[] = []
    if (!row.title?.trim()) errs.push('Thiếu tên công việc')
    if (!row.dueDate?.trim()) errs.push('Thiếu ngày đến hạn')
    else if (!parseDate(row.dueDate)) errs.push('Sai định dạng ngày')
    if (!row.assignedTo?.trim()) errs.push('Thiếu người phụ trách')
    return errs
  }

  const previewRows = rawRows.map(r => ({ data: buildRow(r), errors: validateRow(buildRow(r)) }))
  const validRows = previewRows.filter(r => r.errors.length === 0)
  const errorRows = previewRows.filter(r => r.errors.length > 0)
  const duplicateRows = validRows.filter(r =>
    existingTasks.some(t => t.title === r.data.title && t.dueDate === (parseDate(r.data.dueDate || '') || ''))
  )
  const importableRows = validRows.filter(r =>
    !existingTasks.some(t => t.title === r.data.title && t.dueDate === (parseDate(r.data.dueDate || '') || ''))
  )

  const requiredMapped = SYSTEM_FIELDS.filter(f => f.required).every(f =>
    Object.values(mapping).includes(f.key)
  )

  const handleImport = () => {
    const tasks = importableRows.map(r => ({
      title: r.data.title,
      description: r.data.description || '',
      dueDate: `${parseDate(r.data.dueDate)}T09:00:00`,
      priority: normalizePriority(r.data.priority || 'medium'),
      assignedTo: r.data.assignedTo,
      relatedType: r.data.relatedType || 'general',
      relatedTo: r.data.relatedTo || '',
      internalNotes: r.data.internalNotes || '',
    }))
    setImportedCount(tasks.length)
    onImport(tasks)
    setStep(5)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[780px] p-0 border-0 rounded-[10px] overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 bg-white border-b border-[#e6ebf1]">
          <DialogTitle className="text-xl font-bold text-gray-900">Import công việc từ Excel/CSV</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Nhập hàng loạt công việc từ file của bạn.</p>
        </DialogHeader>

        {/* Stepper */}
        {step < 5 && (
          <div className="flex items-center px-6 py-3 bg-white border-b border-[#e6ebf1] overflow-x-auto gap-1">
            {STEPS.map((label, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 transition-colors ${
                    idx < step ? 'bg-green-500 border-green-500 text-white' :
                    idx === step ? 'bg-[#1a56db] border-[#1a56db] text-white' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {idx < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${idx === step ? 'text-[#1a56db]' : idx < step ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                </div>
                {idx < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="p-6 min-h-[340px] bg-gray-50/40">

          {/* Step 0: Template */}
          {step === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-8 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#1a56db]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Chuẩn bị file dữ liệu</h3>
                <p className="text-sm text-gray-500 max-w-md">Tải file mẫu để điền dữ liệu đúng định dạng, hoặc dùng file Excel/CSV của bạn với các cột tương ứng.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] text-white rounded-[10px] font-bold text-sm hover:bg-[#1e40af] transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Tải file mẫu .csv
                </button>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#e6ebf1] text-gray-700 rounded-[10px] font-bold text-sm hover:bg-gray-50 transition-colors">
                  Dùng file của tôi →
                </button>
              </div>
              <p className="text-xs text-gray-400">Hỗ trợ: .csv, .xlsx — Tối đa 5MB</p>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[10px] p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-[#1a56db] bg-blue-50' : 'border-[#e6ebf1] bg-white hover:bg-gray-50'}`}
              >
                <Upload className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-700 mb-1">Kéo thả file vào đây</p>
                <p className="text-xs text-gray-400">hoặc click để chọn file (.csv, .xlsx)</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
              </div>
              {parseError && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{parseError}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-600 font-medium">File: <strong>{file?.name}</strong> — {rawRows.length} dòng dữ liệu</p>
                {!requiredMapped && <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Chưa map đủ trường bắt buộc (*)</span>}
              </div>
              <div className="bg-white rounded-[10px] border border-[#e6ebf1] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-[#e6ebf1]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cột trong file</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trường hệ thống</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Dữ liệu mẫu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawHeaders.map((h, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{h}</td>
                        <td className="px-4 py-3">
                          <select
                            value={mapping[h] || ''}
                            onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                            className="w-full border border-[#e6ebf1] rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#3e79f7]"
                          >
                            <option value="">— Bỏ qua —</option>
                            {SYSTEM_FIELDS.map(f => (
                              <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[160px]">{rawRows[0]?.[i] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">{validRows.length} dòng hợp lệ</span>
                {errorRows.length > 0 && <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-200">{errorRows.length} dòng lỗi</span>}
                {duplicateRows.length > 0 && <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">{duplicateRows.length} trùng (bỏ qua)</span>}
              </div>
              <div className="bg-white rounded-[10px] border border-[#e6ebf1] overflow-auto max-h-[280px]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-[#e6ebf1] sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">#</th>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">Tên công việc</th>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">Ngày đến hạn</th>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">Người phụ trách</th>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">Ưu tiên</th>
                      <th className="px-3 py-2.5 text-left font-bold text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 10).map((row, i) => {
                      const isDup = duplicateRows.includes(row)
                      return (
                        <tr key={i} className={`border-b border-gray-50 ${row.errors.length > 0 ? 'bg-red-50' : isDup ? 'bg-yellow-50' : ''}`}>
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">{row.data.title || <span className="text-red-400">—</span>}</td>
                          <td className="px-3 py-2 text-gray-600">{row.data.dueDate || <span className="text-red-400">—</span>}</td>
                          <td className="px-3 py-2 text-gray-600">{row.data.assignedTo || <span className="text-red-400">—</span>}</td>
                          <td className="px-3 py-2 text-gray-600">{row.data.priority || 'medium'}</td>
                          <td className="px-3 py-2">
                            {row.errors.length > 0
                              ? <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{row.errors[0]}</span>
                              : isDup
                                ? <span className="text-yellow-600 font-bold">Trùng — bỏ qua</span>
                                : <span className="text-green-600 font-bold">Hợp lệ</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {previewRows.length > 10 && <p className="text-xs text-gray-400 px-3 py-2">... và {previewRows.length - 10} dòng khác</p>}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-6 gap-5">
              <div className="bg-white rounded-[10px] border border-[#e6ebf1] p-6 w-full max-w-sm">
                <h4 className="font-bold text-gray-900 mb-4 text-center">Tóm tắt import</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Tổng dòng trong file</span><span className="font-bold">{rawRows.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Dòng hợp lệ</span><span className="font-bold text-green-600">{validRows.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Dòng lỗi (bỏ qua)</span><span className="font-bold text-red-500">{errorRows.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trùng lặp (bỏ qua)</span><span className="font-bold text-yellow-600">{duplicateRows.length}</span></div>
                  <div className="border-t border-dashed border-[#e6ebf1] pt-3 flex justify-between">
                    <span className="font-extrabold text-gray-900">Sẽ nhập</span>
                    <span className="font-extrabold text-[#1a56db] text-base">{importableRows.length} công việc</span>
                  </div>
                </div>
              </div>
              {importableRows.length === 0 && (
                <p className="text-sm text-red-500 font-medium">Không có dòng nào để import.</p>
              )}
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Import thành công!</h3>
              <p className="text-sm text-gray-500">Đã nhập <strong className="text-[#1a56db]">{importedCount} công việc</strong> vào hệ thống.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[#e6ebf1] flex justify-between gap-3">
          {step < 5
            ? <Button variant="outline" onClick={step === 0 ? handleClose : () => setStep(s => s - 1)} className="font-semibold border-[#e6ebf1]">
                {step === 0 ? 'Đóng' : 'Quay lại'}
              </Button>
            : <div />
          }
          <div className="flex gap-3">
            {step === 0 && <Button onClick={() => setStep(1)} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-6">Tiếp tục →</Button>}
            {step === 2 && <Button onClick={() => setStep(3)} disabled={!requiredMapped} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-6 disabled:opacity-50">Xem preview →</Button>}
            {step === 3 && <Button onClick={() => setStep(4)} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-6">Tiếp tục →</Button>}
            {step === 4 && <Button onClick={handleImport} disabled={importableRows.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 disabled:opacity-50">Nhập dữ liệu</Button>}
            {step === 5 && <Button onClick={handleClose} className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold px-6">Đóng</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
