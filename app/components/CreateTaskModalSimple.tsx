'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle
} from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  employees: Employee[]
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  team: string
  isActive: boolean
}

export default function CreateTaskModalSimple({
  isOpen,
  onClose,
  onSave,
  employees
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    assignedTo: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        assignedTo: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Ngày đến hạn là bắt buộc'
    }

    if (!formData.dueTime) {
      newErrors.dueTime = 'Giờ đến hạn là bắt buộc'
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Phải chọn người phụ trách'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const newTask = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: `${formData.dueDate}T${formData.dueTime}:00`,
      priority: formData.priority,
      status: 'pending',
      assignedTo: formData.assignedTo,
      tags: [],
      relatedType: 'general',
      internalNotes: '',
      progressNotes: [],
      isAutoCreated: false,
      reminders: [],
      customReminders: [],
      createdAt: new Date().toISOString(),
      createdBy: 'current_user',
      updatedAt: new Date().toISOString(),
      history: []
    }

    onSave(newTask)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tạo Công việc mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tiêu đề công việc"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả chi tiết công việc"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đến hạn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ đến hạn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dueTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.dueTime && (
                <p className="mt-1 text-sm text-red-600">{errors.dueTime}</p>
              )}
            </div>
          </div>

          {/* Quick time shortcuts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hoặc chọn nhanh</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Trong 1 giờ', hours: 1 },
                { label: 'Cuối ngày hôm nay', hours: 'eod' },
                { label: 'Ngày mai 9h', hours: 'tomorrow' },
                { label: 'Trong 3 ngày', days: 3 }
              ].map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    let targetDate = new Date()
                    
                    if (option.hours === 'eod') {
                      targetDate.setHours(17, 0, 0, 0)
                    } else if (option.hours === 'tomorrow') {
                      targetDate.setDate(targetDate.getDate() + 1)
                      targetDate.setHours(9, 0, 0, 0)
                    } else if (typeof option.hours === 'number') {
                      targetDate.setHours(targetDate.getHours() + option.hours)
                    } else if (option.days) {
                      targetDate.setDate(targetDate.getDate() + option.days)
                      targetDate.setHours(9, 0, 0, 0)
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      dueDate: targetDate.toISOString().split('T')[0],
                      dueTime: targetDate.toTimeString().slice(0, 5)
                    }))
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: 'Thấp', color: 'bg-green-100 text-green-800 border-green-200' },
                { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                { value: 'high', label: 'Cao', color: 'bg-red-100 text-red-800 border-red-200' }
              ].map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  className={`p-3 border-2 rounded-lg text-center font-medium transition-all ${
                    formData.priority === priority.value 
                      ? priority.color + ' ring-2 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người phụ trách <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn nhân viên</option>
                {employees.filter(emp => emp.isActive).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                ))}
              </select>
            </div>
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
          
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu công việc</span>
          </button>
        </div>
      </div>
    </div>
  )
}