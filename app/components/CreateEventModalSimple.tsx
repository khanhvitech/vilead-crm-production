'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User
} from 'lucide-react'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  selectedDate?: Date | null
  employees: Employee[]
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  type: 'meeting' | 'internal' | 'personal'
  priority: 'low' | 'medium' | 'high'
  location?: string
  attendees: string[]
  isAllDay: boolean
  isRecurring: boolean
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

export default function CreateEventModalSimple({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  employees
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    location: '',
    attendees: [] as string[],
    isAllDay: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attendeeSearch, setAttendeeSearch] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      
      setFormData({
        title: '',
        description: '',
        startDate: dateStr,
        endDate: dateStr,
        startTime: '09:00',
        endTime: '10:00',
        type: 'meeting',
        location: '',
        attendees: [],
        isAllDay: false
      })
      setErrors({})
      setAttendeeSearch('')
    }
  }, [isOpen, selectedDate])

  const eventTypes = [
    { value: 'meeting', label: 'Họp khách hàng', color: '#3B82F6', icon: Users },
    { value: 'internal', label: 'Họp nội bộ', color: '#10B981', icon: User },
    { value: 'personal', label: 'Cá nhân', color: '#6B7280', icon: Calendar }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc'
    }

    if (!formData.isAllDay) {
      if (!formData.startTime) {
        newErrors.startTime = 'Giờ bắt đầu là bắt buộc'
      }

      if (!formData.endTime) {
        newErrors.endTime = 'Giờ kết thúc là bắt buộc'
      }

      // Check if end time is after start time
      if (formData.startTime && formData.endTime && formData.startDate === formData.endDate) {
        if (formData.startTime >= formData.endTime) {
          newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu'
        }
      }
    }

    // Check if end date is after start date
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const selectedType = eventTypes.find(t => t.value === formData.type)
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.isAllDay ? '00:00' : formData.startTime,
      endTime: formData.isAllDay ? '23:59' : formData.endTime,
      type: formData.type as 'meeting' | 'internal' | 'personal',
      priority: 'medium',
      location: formData.location,
      attendees: formData.attendees,
      isAllDay: formData.isAllDay,
      isRecurring: false,
      reminderMinutes: [15],
      color: selectedType?.color || '#3B82F6',
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(newEvent)
    onClose()
  }

  const handleAttendeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(employeeId)
        ? prev.attendees.filter(id => id !== employeeId)
        : [...prev.attendees, employeeId]
    }))
  }

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.isActive && (
      emp.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      emp.team.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(attendeeSearch.toLowerCase())
    )
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        {/* Lark-style Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Tạo sự kiện mới</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title - Lark style */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tiêu đề sự kiện"
              className={`w-full text-xl font-medium placeholder-gray-400 border-0 border-b-2 pb-3 mb-1 focus:outline-none focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Event Type - Lark style buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Loại sự kiện</label>
            <div className="flex space-x-3">
              {eventTypes.map(type => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                      formData.type === type.value 
                        ? 'border-blue-500 bg-blue-50 shadow-sm transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.type === type.value ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: formData.type === type.value ? type.color : '#6B7280' }} 
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.type === type.value ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date and Time - Lark style grid */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Cả ngày</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startDate: e.target.value,
                      endDate: prev.endDate || e.target.value
                    }))}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Time Fields - only show if not all day */}
            {!formData.isAllDay && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.startTime ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.endTime ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                {/* Quick Duration Pills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng nhanh</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '15p', minutes: 15 },
                      { label: '30p', minutes: 30 },
                      { label: '1h', minutes: 60 },
                      { label: '2h', minutes: 120 },
                      { label: '3h', minutes: 180 }
                    ].map((duration) => (
                      <button
                        key={duration.minutes}
                        type="button"
                        onClick={() => {
                          if (formData.startTime) {
                            const [hours, minutes] = formData.startTime.split(':').map(Number)
                            const startMinutes = hours * 60 + minutes
                            const endMinutes = startMinutes + duration.minutes
                            const endHours = Math.floor(endMinutes / 60)
                            const endMins = endMinutes % 60
                            
                            setFormData(prev => ({
                              ...prev,
                              endTime: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
                            }))
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
                      >
                        {duration.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Thêm mô tả cho sự kiện..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Thêm địa điểm"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Attendees - Lark style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Người tham gia</label>
            
            {/* Search box */}
            <div className="relative mb-3">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Tìm kiếm nhân viên..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {attendeeSearch && (
                <button
                  onClick={() => setAttendeeSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selected attendees preview */}
            {formData.attendees.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-700 mb-2">
                  {formData.attendees.length} người được mời:
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.attendees.map(attendeeId => {
                    const employee = employees.find(emp => emp.id === attendeeId)
                    if (!employee) return null
                    return (
                      <div key={attendeeId} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full text-sm">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{employee.name}</span>
                        <button
                          onClick={() => handleAttendeeToggle(attendeeId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                <div className="space-y-3">
                  {filteredEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(employee.id)}
                          onChange={() => handleAttendeeToggle(employee.id)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                          {formData.attendees.includes(employee.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </label>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.role} • {employee.team}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">
                    {attendeeSearch ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lark-style Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-500">
            {formData.startDate && !formData.isAllDay && formData.startTime && formData.endTime && (
              <>
                {new Date(formData.startDate).toLocaleDateString('vi-VN')} • {formData.startTime} - {formData.endTime}
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Hủy
            </button>
            
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Tạo sự kiện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}