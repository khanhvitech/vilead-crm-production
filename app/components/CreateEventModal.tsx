'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bell, 
  Repeat, 
  Tag,
  Building,
  Coffee,
  User,
  Video,
  Phone
} from 'lucide-react'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  selectedDate?: Date | null
  employees: Employee[]
  leads: Lead[]
  orders: Order[]
  customers: Customer[]
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  type: 'task' | 'meeting' | 'internal' | 'personal' | 'holiday'
  priority: 'low' | 'medium' | 'high'
  location?: string
  attendees: string[]
  relatedType?: 'lead' | 'order' | 'customer'
  relatedId?: string
  relatedName?: string
  isAllDay: boolean
  isRecurring: boolean
  recurringPattern?: string
  reminderMinutes: number[]
  color: string
  createdBy: string
  createdAt: string
  updatedAt: string
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

export default function CreateEventModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  employees,
  leads,
  orders,
  customers
}: CreateEventModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting' as const,
    priority: 'medium' as const,
    location: '',
    attendees: [] as string[],
    relatedType: '' as 'lead' | 'order' | 'customer' | '',
    relatedId: '',
    relatedName: '',
    isAllDay: false,
    isRecurring: false,
    recurringPattern: '',
    reminderMinutes: [15] as number[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      const today = selectedDate || new Date()
      setFormData(prev => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        attendees: [employees[0]?.id || '']
      }))
      setStep(1)
      setErrors({})
    }
  }, [isOpen, selectedDate, employees])

  const eventTypes = [
    { value: 'meeting', label: 'Gặp khách hàng', icon: Users, color: '#3B82F6' },
    { value: 'internal', label: 'Nội bộ', icon: Building, color: '#10B981' },
    { value: 'personal', label: 'Cá nhân', icon: Coffee, color: '#6B7280' }
  ]

  const meetingTypes = [
    { value: 'in_person', label: 'Trực tiếp', icon: MapPin },
    { value: 'online', label: 'Trực tuyến', icon: Video },
    { value: 'phone', label: 'Điện thoại', icon: Phone }
  ]

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Vui lòng nhập tiêu đề'
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
      }
      if (!formData.isAllDay && !formData.startTime) {
        newErrors.startTime = 'Vui lòng chọn giờ bắt đầu'
      }
      if (!formData.isAllDay && !formData.endTime) {
        newErrors.endTime = 'Vui lòng chọn giờ kết thúc'
      }
      if (!formData.isAllDay && formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu'
      }
    }

    if (stepNumber === 2) {
      if (formData.attendees.length === 0) {
        newErrors.attendees = 'Vui lòng chọn ít nhất một người tham gia'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSave = () => {
    if (validateStep(step)) {
      const selectedType = eventTypes.find(t => t.value === formData.type)
      
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        attendees: formData.attendees,
        relatedType: formData.relatedType || undefined,
        relatedId: formData.relatedId || undefined,
        relatedName: formData.relatedName || undefined,
        isAllDay: formData.isAllDay,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern || undefined,
        reminderMinutes: formData.reminderMinutes,
        color: selectedType?.color || '#3B82F6',
        createdBy: employees[0]?.id || '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onSave(newEvent)
      onClose()
    }
  }

  const getRelatedOptions = () => {
    switch (formData.relatedType) {
      case 'lead':
        return leads.map(lead => ({ id: lead.id, name: lead.name }))
      case 'order':
        return orders.map(order => ({ id: order.id, name: `${order.orderNumber} - ${order.customerName}` }))
      case 'customer':
        return customers.map(customer => ({ id: customer.id, name: customer.name }))
      default:
        return []
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[10px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e6ebf1]">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tạo lịch mới</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Bước {step}/3
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
              
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại sự kiện
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {eventTypes.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                        className={`p-4 border-2 rounded-[10px] flex flex-col items-center space-y-2 transition-all ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-[#e6ebf1] hover:border-[#e6ebf1]'
                        }`}
                      >
                        <Icon className="w-6 h-6" style={{ color: type.color }} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7] ${
                    errors.title ? 'border-red-500' : 'border-[#e6ebf1]'
                  }`}
                  placeholder="Nhập tiêu đề sự kiện..."
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                  placeholder="Mô tả chi tiết về sự kiện..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7] ${
                      errors.startDate ? 'border-red-500' : 'border-[#e6ebf1]'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                  />
                </div>
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isAllDay" className="text-sm font-medium text-gray-700">
                  Cả ngày
                </label>
              </div>

              {/* Time */}
              {!formData.isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7] ${
                        errors.startTime ? 'border-red-500' : 'border-[#e6ebf1]'
                      }`}
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ kết thúc *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7] ${
                        errors.endTime ? 'border-red-500' : 'border-[#e6ebf1]'
                      }`}
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ ưu tiên
                </label>
                <div className="flex space-x-3">
                  {[
                    { value: 'low', label: 'Thấp', color: 'green' },
                    { value: 'medium', label: 'Trung bình', color: 'yellow' },
                    { value: 'high', label: 'Cao', color: 'red' }
                  ].map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        formData.priority === priority.value
                          ? `bg-${priority.color}-100 border-${priority.color}-500 text-${priority.color}-700`
                          : 'border-[#e6ebf1] text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Attendees */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Địa điểm & Người tham gia</h3>
              
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                    placeholder="Nhập địa điểm..."
                  />
                </div>
              </div>

              {/* Meeting Type for customer meetings */}
              {formData.type === 'meeting' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hình thức
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {meetingTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          className="p-3 border border-[#e6ebf1] rounded-[10px] flex flex-col items-center space-y-2 hover:border-[#e6ebf1] transition-colors"
                        >
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người tham gia *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-[#e6ebf1] rounded-md p-3">
                  {employees.map(employee => (
                    <label key={employee.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              attendees: [...prev.attendees, employee.id] 
                            }))
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              attendees: prev.attendees.filter(id => id !== employee.id) 
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.role} - {employee.team}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.attendees && (
                  <p className="text-red-500 text-sm mt-1">{errors.attendees}</p>
                )}
              </div>

              {/* Related Entity */}
              {formData.type === 'meeting' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liên quan đến
                    </label>
                    <select
                      value={formData.relatedType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        relatedType: e.target.value as any,
                        relatedId: '',
                        relatedName: ''
                      }))}
                      className="w-full px-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                    >
                      <option value="">Chọn loại</option>
                      <option value="lead">Lead</option>
                      <option value="order">Đơn hàng</option>
                      <option value="customer">Khách hàng</option>
                    </select>
                  </div>

                  {formData.relatedType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn {formData.relatedType === 'lead' ? 'Lead' : 
                               formData.relatedType === 'order' ? 'Đơn hàng' : 'Khách hàng'}
                      </label>
                      <select
                        value={formData.relatedId}
                        onChange={(e) => {
                          const selected = getRelatedOptions().find(opt => opt.id === e.target.value)
                          setFormData(prev => ({ 
                            ...prev, 
                            relatedId: e.target.value,
                            relatedName: selected?.name || ''
                          }))
                        }}
                        className="w-full px-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                      >
                        <option value="">Chọn...</option>
                        {getRelatedOptions().map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt nâng cao</h3>
              
              {/* Recurring */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Lặp lại
                  </label>
                </div>

                {formData.isRecurring && (
                  <select
                    value={formData.recurringPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e6ebf1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e79f7]"
                  >
                    <option value="">Chọn chu kỳ</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                    <option value="yearly">Hàng năm</option>
                  </select>
                )}
              </div>

              {/* Reminders */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nhắc nhở trước
                </label>
                <div className="space-y-2">
                  {[5, 10, 15, 30, 60].map(minutes => (
                    <label key={minutes} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.reminderMinutes.includes(minutes)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              reminderMinutes: [...prev.reminderMinutes, minutes] 
                            }))
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              reminderMinutes: prev.reminderMinutes.filter(m => m !== minutes) 
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {minutes} phút trước
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-[10px]">
                <h4 className="font-medium text-gray-900 mb-2">Tóm tắt</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Tiêu đề:</strong> {formData.title}</div>
                  <div><strong>Loại:</strong> {eventTypes.find(t => t.value === formData.type)?.label}</div>
                  <div><strong>Thời gian:</strong> {formData.startDate} {!formData.isAllDay && `${formData.startTime} - ${formData.endTime}`}</div>
                  {formData.location && <div><strong>Địa điểm:</strong> {formData.location}</div>}
                  <div><strong>Người tham gia:</strong> {formData.attendees.length} người</div>
                  {formData.relatedName && <div><strong>Liên quan:</strong> {formData.relatedName}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#e6ebf1]">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#e6ebf1] text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#e6ebf1] text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#3e79f7] text-white rounded-md hover:bg-[#699dff] transition-colors flex items-center space-x-2"
              >
                <span>Tiếp theo</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2dc56a] text-white rounded-md hover:bg-[#04d182] transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Tạo lịch</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
