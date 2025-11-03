'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  User,
  CheckCircle,
  Settings,
  X,
  ArrowRight
} from 'lucide-react'

interface Lead {
  id: number
  name: string
  phone: string
  email: string
  source: string
  region: string
  product: string
  tags: string[]
  content: string
  status: string
  stage: string
  notes: string
  assignedTo: string
  value: number
  lastContactedAt: string | null
  createdAt: string
  updatedAt: string
  type: string
  company: string
  priority: string
  nextAction: string
  nextActionDate: string
  address?: string
  customerType?: string
  winProbability?: number
  interactionCount?: number
  lastInteractionAt?: string | null
  quickNotes?: any[]
}

export default function SalesManagement() {
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [showAssignSalesModal, setShowAssignSalesModal] = useState(false)
  
  // Sample leads data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      source: 'facebook',
      region: 'ha_noi',
      product: 'CRM Solution',
      tags: ['hot', 'enterprise'],
      content: 'Cần giải pháp CRM cho 100+ nhân viên bán hàng',
      status: 'converted',
      stage: 'deal_created',
      notes: 'Quan tâm đến tính năng AI, budget 50M',
      assignedTo: 'Minh Expert',
      value: 50000000,
      lastContactedAt: '2024-01-20T14:30:00',
      createdAt: '2024-01-15T09:00:00',
      updatedAt: '2024-01-20T14:30:00',
      type: 'lead',
      company: 'ABC Corp',
      priority: 'urgent',
      nextAction: 'Ký hợp đồng',
      nextActionDate: '2024-01-25T10:00:00',
      address: '123 Nguyễn Du, Hai Bà Trưng, Hà Nội',
      customerType: 'business',
      winProbability: 85,
      interactionCount: 8,
      lastInteractionAt: '2024-01-20T14:30:00'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0912345678',
      email: 'tranthib@email.com',
      source: 'website',
      region: 'ho_chi_minh',
      product: 'Marketing Automation',
      tags: ['warm', 'sme'],
      content: 'Tự động hóa marketing cho startup',
      status: 'qualified',
      stage: 'proposal_sent',
      notes: 'Đã gửi proposal, chờ phản hồi',
      assignedTo: 'An Expert',
      value: 25000000,
      lastContactedAt: '2024-01-19T16:45:00',
      createdAt: '2024-01-16T11:20:00',
      updatedAt: '2024-01-19T16:45:00',
      type: 'lead',
      company: 'DEF Startup',
      priority: 'high',
      nextAction: 'Gửi báo giá chi tiết',
      nextActionDate: '2024-01-22T09:30:00',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      customerType: 'business',
      winProbability: 60,
      interactionCount: 5,
      lastInteractionAt: '2024-01-19T16:45:00'
    }
  ])

  // Sales team data
  const salesTeam = [
    { id: 1, name: 'Minh Expert', department: 'CRM Solutions', title: 'Senior Sales Expert', avatar: '👨‍💼', activeLeads: 12 },
    { id: 2, name: 'An Expert', department: 'Marketing Automation', title: 'Marketing Specialist', avatar: '👩‍💼', activeLeads: 8 },
    { id: 3, name: 'An Sales', department: 'Enterprise Sales', title: 'Enterprise Account Manager', avatar: '👨‍💼', activeLeads: 15 }
  ]

  const handleToggleSelectLead = (id: number) => {
    setSelectedLeadIds(prev => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter(x => x !== id) : [...prev, id]
      setSelectAllChecked(leads.length > 0 && next.length === leads.length)
      return next
    })
  }

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAllChecked(checked)
    if (checked) {
      setSelectedLeadIds(leads.map(l => l.id))
    } else {
      setSelectedLeadIds([])
    }
  }

  const confirmAssignSales = (salesPerson: { name: string }) => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, assignedTo: salesPerson.name } : l))
    setNotification({ message: `Đã gán ${salesPerson.name} cho ${selectedLeadIds.length} leads`, type: 'success' })
    setSelectedLeadIds([])
    setSelectAllChecked(false)
    setShowAssignSalesModal(false)
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{notification?.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoạt động Bán hàng</h1>
          <p className="text-gray-600">Quản lý toàn bộ quy trình từ Lead đến Đơn hàng</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {leads.length} leads
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAssignSalesModal(true)}
              disabled={selectedLeadIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gán Sales ({selectedLeadIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Bulk Actions Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedLeadIds.length} leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignSalesModal(true)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Gán Sales nhanh
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công ty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => handleToggleSelectLead(lead.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                      lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(lead.value / 1000000).toFixed(0)}M VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Sales Modal */}
      {showAssignSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gán Sales cho {selectedLeadIds.length} leads đã chọn
                </h3>
                <button
                  onClick={() => setShowAssignSalesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salesTeam.map((sales) => (
                  <div 
                    key={sales.id}
                    onClick={() => confirmAssignSales(sales)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{sales.avatar}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">{sales.name}</h4>
                        <p className="text-sm text-gray-600">{sales.title}</p>
                        <p className="text-xs text-gray-500">{sales.department}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">Leads hiện tại: </span>
                          <span className="text-xs font-medium ml-1 text-green-600">
                            {sales.activeLeads}
                          </span>
                        </div>
                      </div>
                      <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAssignSalesModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}