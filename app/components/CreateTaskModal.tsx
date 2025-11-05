'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  Building,
  ShoppingCart,
  Users,
  Search,
  Tag,
  Plus
} from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  templates: TaskTemplate[]
  employees: Employee[]
  leads: Lead[]
  orders: Order[]
  customers: Customer[]
}

interface TaskTemplate {
  id: string
  title: string
  description: string
  category: 'lead' | 'order' | 'customer' | 'general'
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

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  stage: string
  assignedTo: string
  tags: string[]
  isVip: boolean
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  status: string
  paymentStatus: string
  total: number
  assignedTo: string
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  type: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSave,
  employees,
  templates = [],
  leads = [],
  orders = [],
  customers = []
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    assignedTo: '',
    selectedTemplate: '',
    relatedType: '',
    relatedId: '',
    relatedName: '',
    assignedTeam: '',
    tags: [] as string[],
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeStep, setActiveStep] = useState(1)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showRelatedSearch, setShowRelatedSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTag, setNewTag] = useState('')

  // Mock data
  const teams = [
    { id: 'sales', name: 'Đội bán hàng' },
    { id: 'marketing', name: 'Đội marketing' },
    { id: 'support', name: 'Đội hỗ trợ' }
  ]

  const availableTags = [
    'Khẩn cấp', 'Quan trọng', 'Theo dõi', 'Gọi lại', 'Email', 'Họp'
  ]

  // Helper functions
  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      selectedTemplate: template.id,
      title: template.title,
      description: template.description
    }))
    setShowTemplates(false)
  }

  const getRelatedItems = () => {
    if (!formData.relatedType || !searchTerm) return []
    
    switch (formData.relatedType) {
      case 'lead':
        return leads.filter((lead: any) => 
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm)
        ).slice(0, 5)
      case 'order':
        return orders.filter((order: any) => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
      case 'customer':
        return customers.filter((customer: any) => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
        ).slice(0, 5)
      default:
        return []
    }
  }

  const handleRelatedSelect = (type: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      relatedId: item.id,
      relatedName: item.name || item.customerName || item.id
    }))
    setShowRelatedSearch(false)
    setSearchTerm('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        assignedTo: '',
        selectedTemplate: '',
        relatedType: '',
        relatedId: '',
        relatedName: '',
        assignedTeam: '',
        tags: [],
        notes: ''
      })
      setErrors({})
      setActiveStep(1)
      setShowTemplates(false)
      setShowRelatedSearch(false)
      setSearchTerm('')
      setNewTag('')
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
      progress: 0,
      assignedTo: formData.assignedTo,
      tags: [],
      relatedType: 'general',
      notes: formData.notes,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                activeStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Thông tin cơ bản</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-300"></div>
            
            <div className={`flex items-center ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                activeStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Liên kết & Phân công</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-300"></div>
            
            <div className={`flex items-center ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                activeStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Ghi chú & Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sử dụng mẫu có sẵn
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className="text-gray-500">
                      {formData.selectedTemplate ? 
                        templates.find(t => t.id === formData.selectedTemplate)?.title :
                        'Chọn mẫu hoặc tạo mới'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showTemplates && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, useTemplate: false, selectedTemplate: '', customTitle: true }))
                            setShowTemplates(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          <div className="font-medium">Tạo mới</div>
                          <div className="text-gray-500">Nhập thông tin tự do</div>
                        </button>
                      </div>
                      <div className="border-t border-gray-100">
                        {templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-50 last:border-b-0"
                          >
                            <div className="font-medium">{template.title}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề công việc (tối đa 100 ký tự)"
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{formData.title.length}/100 ký tự</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết công việc (tối đa 1000 ký tự)"
                  maxLength={1000}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000 ký tự</p>
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
                    { label: 'Trong 4 giờ', hours: 4 },
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Ưu tiên</label>
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
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assignment & Related */}
          {activeStep === 2 && (
            <div className="p-6 space-y-6">
              {/* Related Entity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gắn với Lead/Đơn hàng/Khách hàng hoặc Công việc chung
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  {[
                    { value: 'lead', label: 'Lead', icon: Building },
                    { value: 'order', label: 'Đơn hàng', icon: ShoppingCart },
                    { value: 'customer', label: 'Khách hàng', icon: Users },
                    { value: 'general', label: 'Công việc chung', icon: FileText }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        if (type.value === 'general') {
                          setFormData(prev => ({ ...prev, relatedType: type.value, relatedId: '', relatedName: '' }))
                          setShowRelatedSearch(false)
                        } else {
                          setFormData(prev => ({ ...prev, relatedType: type.value, relatedId: '', relatedName: '' }))
                          setShowRelatedSearch(true)
                        }
                        setSearchTerm('')
                      }}
                      className={`p-3 border-2 rounded-lg text-center font-medium transition-all flex items-center justify-center space-x-2 ${
                        formData.relatedType === type.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Related Entity Search */}
                {formData.relatedType && formData.relatedType !== 'general' && (
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={`Tìm kiếm ${
                            formData.relatedType === 'lead' ? 'lead' :
                            formData.relatedType === 'order' ? 'đơn hàng' : 'khách hàng'
                          }...`}
                          onFocus={() => setShowRelatedSearch(true)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {formData.relatedId && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, relatedType: '', relatedId: '', relatedName: '' }))
                            setSearchTerm('')
                          }}
                          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {showRelatedSearch && getRelatedItems().length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getRelatedItems().map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleRelatedSelect(formData.relatedType, item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-50 last:border-b-0"
                          >
                            {formData.relatedType === 'lead' && (
                              <div>
                                <div className="font-medium flex items-center">
                                  {(item as Lead).name}
                                  {(item as Lead).isVip && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                      VIP
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{(item as Lead).phone} • {(item as Lead).stage}</div>
                              </div>
                            )}
                            {formData.relatedType === 'order' && (
                              <div>
                                <div className="font-medium">{(item as Order).orderNumber}</div>
                                <div className="text-sm text-gray-500">
                                  {(item as Order).customerName} • {formatCurrency((item as Order).total)} • {(item as Order).status}
                                </div>
                              </div>
                            )}
                            {formData.relatedType === 'customer' && (
                              <div>
                                <div className="font-medium">{(item as Customer).name}</div>
                                <div className="text-sm text-gray-500">
                                  {(item as Customer).phone} • {(item as Customer).totalOrders} đơn • {formatCurrency((item as Customer).totalSpent)}
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Related Entity */}
                {(formData.relatedType === 'general' || formData.relatedId) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {formData.relatedType === 'lead' && <Building className="w-4 h-4 text-blue-600" />}
                        {formData.relatedType === 'order' && <ShoppingCart className="w-4 h-4 text-blue-600" />}
                        {formData.relatedType === 'customer' && <Users className="w-4 h-4 text-blue-600" />}
                        {formData.relatedType === 'general' && <FileText className="w-4 h-4 text-blue-600" />}
                        <span className="font-medium text-blue-900">
                          {formData.relatedType === 'general' ? 'Công việc chung' : formData.relatedName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, relatedType: '', relatedId: '', relatedName: '' }))
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người phụ trách <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value, assignedTeam: '' }))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hoặc gán cho đội
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.assignedTeam}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedTeam: e.target.value, assignedTo: '' }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn đội</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhãn</label>
                
                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.filter(tag => !formData.tags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Tạo nhãn mới..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Notes & Final */}
          {activeStep === 3 && (
            <div className="p-6 space-y-6">
              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú nội bộ
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Thêm ghi chú nội bộ cho nhân viên phụ trách (tối đa 500 ký tự)"
                  maxLength={500}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.notes ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{formData.notes.length}/500 ký tự</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt công việc</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">{formData.title}</div>
                      <div className="text-sm text-gray-600">{formData.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Đến hạn: </span>
                      {formData.dueDate && formData.dueTime && (
                        <span>{new Date(`${formData.dueDate}T${formData.dueTime}`).toLocaleString('vi-VN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Ưu tiên: </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        formData.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {formData.priority === 'high' ? 'Cao' : formData.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                  </div>

                  {(formData.assignedTo || formData.assignedTeam) && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Phụ trách: </span>
                        {formData.assignedTo ? (
                          <span>{employees.find(e => e.id === formData.assignedTo)?.name}</span>
                        ) : (
                          <span>{teams.find(t => t.id === formData.assignedTeam)?.name}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {(formData.relatedType === 'general' || formData.relatedId) && (
                    <div className="flex items-center space-x-3">
                      {formData.relatedType === 'lead' && <Building className="w-5 h-5 text-gray-400" />}
                      {formData.relatedType === 'order' && <ShoppingCart className="w-5 h-5 text-gray-400" />}
                      {formData.relatedType === 'customer' && <Users className="w-5 h-5 text-gray-400" />}
                      {formData.relatedType === 'general' && <FileText className="w-5 h-5 text-gray-400" />}
                      <div>
                        <span className="font-medium">Loại: </span>
                        <span>
                          {formData.relatedType === 'general' ? 'Công việc chung' : formData.relatedName}
                        </span>
                      </div>
                    </div>
                  )}

                  {formData.tags.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.notes && (
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">Ghi chú:</div>
                        <div className="text-sm text-gray-600">{formData.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Trước
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            
            {activeStep < 3 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tiếp →
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu công việc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
