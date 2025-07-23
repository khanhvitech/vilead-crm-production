'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone,
  Mail, 
  Eye, 
  Calendar, 
  DollarSign, 
  User, 
  Building2,
  TrendingUp,
  Target,
  Users,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  Bot,
  Table,
  LayoutGrid,
  HelpCircle,
  Download,
  Trash2,
  Edit,
  MessageSquarePlus,
  Send
} from 'lucide-react'

import AISuggestionsTab from './AISuggestionsTab'

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
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost'
  stage: string
  notes: string
  assignedTo: string
  value: number
  lastContactedAt: string | null
  createdAt: string
  updatedAt: string
  type: 'lead'
  company?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  nextAction: string
  nextActionDate: string
  careCount?: number // Số lần chăm sóc
  quickNotes?: Array<{
    content: string
    timestamp: string
    author: string
  }> // Danh sách ghi chú nhanh
}

interface MetricData {
  id: string
  title: string
  value: number
  previousValue: number
  percentageChange: number
  icon: React.ReactNode
  color: string
  bgColor: string
  trend?: 'up' | 'down' | 'neutral'
  clickAction: () => void
}

export default function SalesManagement() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'ai-suggestions'>('pipeline')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false)
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [showAutoAssignTooltip, setShowAutoAssignTooltip] = useState<string | null>(null)
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [showEditLeadModal, setShowEditLeadModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [quickNote, setQuickNote] = useState('')
  const [isAddingQuickNote, setIsAddingQuickNote] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    jobTitle: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    source: 'website',
    sourceDetail: '',
    region: 'hanoi',
    product: '',
    budget: '',
    timeline: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    content: '',
    notes: '',
    assignedTo: '',
    leadScore: 50,
    referrerName: '',
    referrerContact: '',
    socialMedia: {
      linkedin: '',
      facebook: '',
      twitter: ''
    },
    preferredContact: 'email' as 'email' | 'phone' | 'whatsapp' | 'meeting',
    bestTimeToContact: 'morning' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    tags: [] as string[]
  })
  
  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    
    if (draggedLead && draggedLead.status !== targetStatus) {
      // Update lead status
      const updatedLeads = leads.map(lead => 
        lead.id === draggedLead.id 
          ? { ...lead, status: targetStatus as Lead['status'], updatedAt: new Date().toISOString() }
          : lead
      )
      
      setLeads(updatedLeads)
      
      // Show success notification
      setNotification({
        message: `Đã chuyển "${draggedLead.name}" sang "${getStatusName(targetStatus)}"`,
        type: 'success'
      })
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    }
    
    setDraggedLead(null)
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
  }

  const handleQuickAssign = (leadId: number, assignedTo: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedTo: assignedTo || '', updatedAt: new Date().toISOString() }
        : lead
    )
    
    setLeads(updatedLeads)
    
    // Show success notification
    const message = assignedTo 
      ? `Đã phân công lead cho "${assignedTo}"` 
      : 'Đã hủy phân công lead'
    
    setNotification({
      message,
      type: 'success'
    })
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000)
  }

  // Action handlers for buttons

  const handleViewLeadDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setShowLeadDetailModal(true)
    setIsAddingQuickNote(false)
    setQuickNote('')
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setShowEditLeadModal(true)
  }

  const handleUpdateLead = (updatedLead: Lead) => {
    const updatedLeads = leads.map(lead => 
      lead.id === updatedLead.id ? { ...updatedLead, updatedAt: new Date().toISOString() } : lead
    )
    setLeads(updatedLeads)
    setShowEditLeadModal(false)
    setEditingLead(null)
    setNotification({
      message: `Lead "${updatedLead.name}" đã được cập nhật thành công!`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAddQuickNote = () => {
    if (!quickNote.trim() || !selectedLead) return

    const updatedLead = {
      ...selectedLead,
      quickNotes: [...(selectedLead.quickNotes || []), {
        content: quickNote.trim(),
        timestamp: new Date().toISOString(),
        author: 'Current User' // Trong thực tế sẽ lấy từ user hiện tại
      }],
      careCount: (selectedLead.careCount || 0) + 1,
      lastContactedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedLeads = leads.map(lead => 
      lead.id === selectedLead.id ? updatedLead : lead
    )
    
    setLeads(updatedLeads)
    setSelectedLead(updatedLead)
    setQuickNote('')
    setIsAddingQuickNote(false)
    
    setNotification({
      message: 'Đã thêm ghi chú nhanh và cập nhật số lần chăm sóc!',
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead)
    setSelectedProduct('') // Reset product selection
    setShowConvertModal(true)
  }

  const handleExportLead = (lead: Lead) => {
    const leadData = JSON.stringify(lead, null, 2)
    const blob = new Blob([leadData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lead_${lead.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setNotification({
      message: `Đã xuất dữ liệu lead "${lead.name}"`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDeleteLead = (lead: Lead) => {
    if (window.confirm(`Bạn có chắc muốn xóa lead "${lead.name}"?`)) {
      setLeads(prevLeads => prevLeads.filter(l => l.id !== lead.id))
      setNotification({
        message: `Đã xóa lead "${lead.name}"`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const confirmConvertLead = () => {
    if (!selectedProduct) {
      setNotification({
        message: 'Vui lòng chọn sản phẩm khách hàng mua trước khi chuyển đổi',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (selectedLead) {
      const updatedLeads = leads.map(l => 
        l.id === selectedLead.id 
          ? { 
              ...l, 
              status: 'converted' as Lead['status'], 
              stage: 'deal_created',
              product: selectedProduct, // Update with selected product
              updatedAt: new Date().toISOString(),
              nextAction: 'Bắt đầu thực hiện dự án'
            }
          : l
      )
      setLeads(updatedLeads)
      
      setNotification({
        message: `${selectedLead.name} đã được chuyển thành khách hàng với sản phẩm "${selectedProduct}"!`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
    }
    setShowConvertModal(false)
    setSelectedLead(null)
    setSelectedProduct('')
  }

  // Auto assignment logic
  const getAvailableSalesPersons = () => {
    return [
      { id: 'nguyen-van-a', name: 'Nguyễn Văn A', expertise: ['technology', 'software'], performance: 85, currentLeads: 12 },
      { id: 'tran-thi-b', name: 'Trần Thị B', expertise: ['real-estate', 'construction'], performance: 92, currentLeads: 8 },
      { id: 'le-van-c', name: 'Lê Văn C', expertise: ['retail', 'consumer'], performance: 78, currentLeads: 15 },
      { id: 'pham-thi-d', name: 'Phạm Thị D', expertise: ['healthcare', 'education'], performance: 88, currentLeads: 10 },
      { id: 'hoang-van-e', name: 'Hoàng Văn E', expertise: ['finance', 'banking'], performance: 90, currentLeads: 6 },
      { id: 'do-thi-f', name: 'Đỗ Thị F', expertise: ['technology', 'fintech'], performance: 82, currentLeads: 9 }
    ]
  }

  const autoAssignLeads = (strategy: string, filters: any) => {
    const salesPersons = getAvailableSalesPersons()
    const unassignedLeads = leads.filter(lead => !lead.assignedTo || lead.assignedTo === '')
    
    let updatedLeads = [...leads]
    let assignmentCount = 0
    
    switch (strategy) {
      case 'balanced':
        // Phân bổ đều
        unassignedLeads.forEach((lead, index) => {
          const salesPerson = salesPersons[index % salesPersons.length]
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id)
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              assignedTo: salesPerson.name,
              updatedAt: new Date().toISOString()
            }
            assignmentCount++
          }
        })
        break
        
      case 'skill-based':
        // Dựa trên kỹ năng
        unassignedLeads.forEach(lead => {
          const productCategory = lead.product?.toLowerCase() || ''
          const bestMatch = salesPersons.find(sp => 
            sp.expertise.some(exp => productCategory.includes(exp))
          ) || salesPersons[0]
          
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id)
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              assignedTo: bestMatch.name,
              updatedAt: new Date().toISOString()
            }
            assignmentCount++
          }
        })
        break
        
      case 'performance':
        // Dựa trên hiệu suất - ưu tiên người có performance cao
        const sortedByPerformance = [...salesPersons].sort((a, b) => b.performance - a.performance)
        unassignedLeads.forEach((lead, index) => {
          const salesPerson = sortedByPerformance[index % sortedByPerformance.length]
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id)
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              assignedTo: salesPerson.name,
              updatedAt: new Date().toISOString()
            }
            assignmentCount++
          }
        })
        break
        
      case 'workload':
        // Dựa trên khối lượng công việc - ưu tiên người có ít leads nhất
        const sortedByWorkload = [...salesPersons].sort((a, b) => a.currentLeads - b.currentLeads)
        unassignedLeads.forEach((lead, index) => {
          const salesPerson = sortedByWorkload[index % sortedByWorkload.length]
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id)
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              assignedTo: salesPerson.name,
              updatedAt: new Date().toISOString()
            }
            assignmentCount++
          }
        })
        break
        
      default:
        // Default to balanced
        unassignedLeads.forEach((lead, index) => {
          const salesPerson = salesPersons[index % salesPersons.length]
          const leadIndex = updatedLeads.findIndex(l => l.id === lead.id)
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              assignedTo: salesPerson.name,
              updatedAt: new Date().toISOString()
            }
            assignmentCount++
          }
        })
    }
    
    setLeads(updatedLeads)
    return assignmentCount
  }

  // Function to add new lead
  const handleAddLead = () => {
    // Validation
    if (!newLead.name.trim() || !newLead.email.trim() || !newLead.phone.trim()) {
      setNotification({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Email, Số điện thoại)',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newLead.email)) {
      setNotification({
        message: 'Email không hợp lệ',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Phone validation
    const phoneRegex = /^[0-9+\-\s\(\)]{8,15}$/
    if (!phoneRegex.test(newLead.phone)) {
      setNotification({
        message: 'Số điện thoại không hợp lệ (8-15 ký tự, chỉ số và ký tự đặc biệt)',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Create new lead
    const leadToAdd: Lead = {
      id: Date.now(), // Simple ID generation
      name: newLead.name.trim(),
      phone: newLead.phone.trim(),
      email: newLead.email.trim().toLowerCase(),
      company: newLead.company.trim(),
      source: newLead.source,
      region: newLead.region,
      product: newLead.product.trim(),
      tags: newLead.tags,
      content: newLead.content.trim(),
      status: 'new',
      stage: 'Mới',
      notes: newLead.notes.trim(),
      assignedTo: newLead.assignedTo,
      value: parseInt(newLead.budget) || 0,
      lastContactedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'lead',
      priority: newLead.priority,
      nextAction: 'Liên hệ lần đầu',
      nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
    }

    // Add to leads list
    setLeads(prevLeads => [leadToAdd, ...prevLeads])

    // Reset form
    setNewLead({
      name: '',
      phone: '',
      email: '',
      company: '',
      jobTitle: '',
      industry: '',
      companySize: '',
      website: '',
      address: '',
      source: 'website',
      sourceDetail: '',
      region: 'hanoi',
      product: '',
      budget: '',
      timeline: '',
      priority: 'medium',
      content: '',
      notes: '',
      assignedTo: '',
      leadScore: 50,
      referrerName: '',
      referrerContact: '',
      socialMedia: {
        linkedin: '',
        facebook: '',
        twitter: ''
      },
      preferredContact: 'email',
      bestTimeToContact: 'morning',
      tags: []
    })

    // Close modal and show success message
    setShowAddLeadModal(false)
    setNotification({
      message: `Lead "${leadToAdd.name}" đã được thêm thành công!`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }
  
  // Calculate preview data for auto assignment
  const getPreviewData = () => {
    const unassignedLeads = leads.filter(lead => !lead.assignedTo || lead.assignedTo === '')
    const salesPersons = getAvailableSalesPersons()
    const avgLeadsPerPerson = Math.ceil(unassignedLeads.length / salesPersons.length)
    
    return {
      totalLeads: leads.length,
      unassignedLeads: unassignedLeads.length,
      activeSalesPeople: salesPersons.length,
      avgLeadsPerPerson: avgLeadsPerPerson
    }
  }
  
  const getStatusName = (status: string) => {
    switch(status) {
      case 'new': return 'Mới';
      case 'contacted': return 'Đã liên hệ';
      case 'qualified': return 'Đã xác định';
      case 'proposal': return 'Báo giá';
      case 'negotiation': return 'Đàm phán';
      case 'converted': return 'Đã chuyển đổi';
      default: return status;
    }
  }
  
  // Search and filter states for leads
  const [leadSearchTerm, setLeadSearchTerm] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [leadRegionFilter, setLeadRegionFilter] = useState('all')
  const [leadSourceFilter, setLeadSourceFilter] = useState('all')
  
  // Filter states
  const [filters, setFilters] = useState({
    timeRange: 'thisMonth',
    team: '',
    product: '',
    owner: '',
    leadStatus: '',
    advancedFilters: false
  })
  // Sample data với liên kết
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
      careCount: 8,
      quickNotes: [
        { content: 'Gọi điện tư vấn ban đầu', timestamp: '2024-01-15T10:00:00', author: 'Minh Expert' },
        { content: 'Gửi brochure và báo giá sơ bộ', timestamp: '2024-01-16T14:00:00', author: 'Minh Expert' },
        { content: 'Họp demo sản phẩm với team kỹ thuật', timestamp: '2024-01-18T09:30:00', author: 'Minh Expert' },
        { content: 'Thảo luận về customization và integration', timestamp: '2024-01-19T15:00:00', author: 'Minh Expert' },
        { content: 'Gửi proposal chi tiết và timeline', timestamp: '2024-01-20T11:00:00', author: 'Minh Expert' }
      ]
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
      careCount: 5,
      quickNotes: [
        { content: 'Cuộc gọi đầu tiên - tìm hiểu nhu cầu', timestamp: '2024-01-16T13:00:00', author: 'An Expert' },
        { content: 'Gửi case study của các startup tương tự', timestamp: '2024-01-17T10:30:00', author: 'An Expert' },
        { content: 'Demo tính năng automation workflow', timestamp: '2024-01-18T14:00:00', author: 'An Expert' },
        { content: 'Thảo luận pricing và package phù hợp', timestamp: '2024-01-19T11:15:00', author: 'An Expert' }
      ]
    },
    {
      id: 3,
      name: 'Lê Văn C',
      phone: '0923456789',
      email: 'levanc@email.com',
      source: 'google',
      region: 'da_nang',
      product: 'Sales Management',
      tags: ['hot', 'follow_up'],
      content: 'Quản lý bán hàng cho công ty xuất nhập khẩu',
      status: 'negotiation',
      stage: 'contract_review',
      notes: 'Đang thương lượng về giá và điều khoản',
      assignedTo: 'An Sales',
      value: 80000000,
      lastContactedAt: '2024-01-19T10:15:00',
      createdAt: '2024-01-12T13:20:00',
      updatedAt: '2024-01-19T10:15:00',
      type: 'lead',
      company: 'DEF Export',
      priority: 'urgent',
      nextAction: 'Cuộc họp ký hợp đồng',
      nextActionDate: '2024-01-23T14:00:00',
      careCount: 12,
      quickNotes: [
        { content: 'Tìm hiểu quy trình hiện tại của công ty', timestamp: '2024-01-12T14:00:00', author: 'An Sales' },
        { content: 'Demo module quản lý đơn hàng xuất khẩu', timestamp: '2024-01-13T10:30:00', author: 'An Sales' },
        { content: 'Khách hàng quan tâm tính năng tracking container', timestamp: '2024-01-14T15:45:00', author: 'An Sales' },
        { content: 'Gửi báo giá cho module bổ sung', timestamp: '2024-01-15T09:00:00', author: 'An Sales' },
        { content: 'Họp với team IT để đánh giá integration', timestamp: '2024-01-16T14:30:00', author: 'An Sales' },
        { content: 'Thảo luận về training plan cho user', timestamp: '2024-01-17T11:15:00', author: 'An Sales' },
        { content: 'Đàm phán giảm giá 10% cho gói enterprise', timestamp: '2024-01-18T16:00:00', author: 'An Sales' },
        { content: 'Khách đồng ý mức giá, đang review contract', timestamp: '2024-01-19T10:15:00', author: 'An Sales' }
      ]
    },
    {
      id: 4,
      name: 'Hoàng Thị D',
      phone: '0934567890',
      email: 'hoangthid@email.com',
      source: 'zalo',
      region: 'can_tho',
      product: 'Customer Service',
      tags: ['warm', 'sme'],
      content: 'Cải thiện chất lượng dịch vụ khách hàng',
      status: 'contacted',
      stage: 'follow_up',
      notes: 'Đã liên hệ lần đầu, cần follow up',
      assignedTo: 'Trần Văn Support',
      value: 30000000,
      lastContactedAt: '2024-01-18T09:30:00',
      createdAt: '2024-01-18T09:00:00',
      updatedAt: '2024-01-18T09:30:00',
      type: 'lead',
      company: 'JKL Services',
      priority: 'medium',
      nextAction: 'Gọi lại cho khách hàng',
      nextActionDate: '2024-01-20T15:00:00'
    },
    {
      id: 5,
      name: 'Vũ Minh E',
      phone: '0945678901',
      email: 'vuminhe@email.com',
      source: 'referral',
      region: 'hai_phong',
      product: 'Analytics Dashboard',
      tags: ['cold', 'enterprise'],
      content: 'Phân tích dữ liệu bán hàng chi tiết',
      status: 'new',
      stage: 'initial_contact',
      notes: 'Lead mới từ referral, chưa liên hệ',
      assignedTo: 'Đỗ Thị Analytics',
      value: 40000000,
      lastContactedAt: null,
      createdAt: '2024-01-22T16:00:00',
      updatedAt: '2024-01-22T16:00:00',
      type: 'lead',
      company: 'MNO Analytics',
      priority: 'low',
      nextAction: 'Liên hệ qua email',
      nextActionDate: '2024-01-24T10:00:00',
      careCount: 0,
      quickNotes: []
    },
    {
      id: 6,
      name: 'Ngô Thị F',
      phone: '0956789012',
      email: 'ngothif@email.com',
      source: 'website',
      region: 'ha_noi',
      product: 'E-commerce Platform',
      tags: ['hot', 'sme'],
      content: 'Xây dựng platform bán hàng online',
      status: 'proposal',
      stage: 'proposal_sent',
      notes: 'Đã gửi proposal chi tiết, chờ quyết định',
      assignedTo: 'Minh Expert',
      value: 85000000,
      lastContactedAt: '2024-01-20T11:45:00',
      createdAt: '2024-01-14T13:30:00',
      updatedAt: '2024-01-20T11:45:00',
      type: 'lead',
      company: 'PQR Commerce',
      priority: 'high',
      nextAction: 'Theo dõi phản hồi khách hàng',
      nextActionDate: '2024-01-21T09:00:00'
    },
    {
      id: 7,
      name: 'Phạm Văn G',
      phone: '0967890123',
      email: 'phamvang@email.com',
      source: 'linkedin',
      region: 'ho_chi_minh',
      product: 'Inventory Management',
      tags: ['warm', 'enterprise'],
      content: 'Quản lý kho hàng thông minh cho chuỗi cửa hàng',
      status: 'qualified',
      stage: 'demo_completed',
      notes: 'Demo thành công, rất hài lòng với tính năng',
      assignedTo: 'Lê Thị Inventory',
      value: 60000000,
      lastContactedAt: '2024-06-28T15:20:00',
      createdAt: '2024-06-20T10:00:00',
      updatedAt: '2024-06-28T15:20:00',
      type: 'lead',
      company: 'RST Retail Chain',
      priority: 'medium',
      nextAction: 'Gửi hợp đồng mẫu',
      nextActionDate: '2024-07-01T10:00:00'
    },
    {
      id: 8,
      name: 'Đỗ Thị H',
      phone: '0978901234',
      email: 'dothih@email.com',
      source: 'facebook',
      region: 'da_nang',
      product: 'HR Management',
      tags: ['hot', 'sme'],
      content: 'Số hóa quy trình nhân sự và tuyển dụng',
      status: 'negotiation',
      stage: 'contract_review',
      notes: 'Đang review hợp đồng, sẽ ký trong tuần này',
      assignedTo: 'Nguyễn Văn HR',
      value: 35000000,
      lastContactedAt: '2024-06-30T11:30:00',
      createdAt: '2024-06-15T14:00:00',
      updatedAt: '2024-06-30T11:30:00',
      type: 'lead',
      company: 'UVW Solutions',
      priority: 'urgent',
      nextAction: 'Ký hợp đồng',
      nextActionDate: '2024-07-03T10:00:00'
    },
    {
      id: 9,
      name: 'Bùi Văn I',
      phone: '0989012345',
      email: 'buivani@email.com',
      source: 'google',
      region: 'ha_noi',
      product: 'Financial Management',
      tags: ['warm', 'enterprise'],
      content: 'Quản lý tài chính và kế toán tự động',
      status: 'contacted',
      stage: 'needs_assessment',
      notes: 'Đã tìm hiểu nhu cầu, chuẩn bị demo',
      assignedTo: 'Trần Thị Finance',
      value: 45000000,
      lastContactedAt: '2024-06-29T14:45:00',
      createdAt: '2024-06-25T09:30:00',
      updatedAt: '2024-06-29T14:45:00',
      type: 'lead',
      company: 'XYZ Finance',
      priority: 'medium',
      nextAction: 'Gửi tài liệu tham khảo',
      nextActionDate: '2024-07-02T10:00:00'
    },
    {
      id: 10,
      name: 'Lý Thị K',
      phone: '0990123456',
      email: 'lythik@email.com',
      source: 'website',
      region: 'can_tho',
      product: 'Project Management',
      tags: ['cold', 'sme'],
      content: 'Quản lý dự án và phân công công việc',
      status: 'new',
      stage: 'initial_contact',
      notes: 'Lead mới đăng ký, chưa liên hệ',
      assignedTo: 'Võ Văn Project',
      value: 20000000,
      lastContactedAt: null,
      createdAt: '2024-07-01T08:00:00',
      updatedAt: '2024-07-01T08:00:00',
      type: 'lead',
      company: 'ABC Project Co',
      priority: 'low',
      nextAction: 'Gửi email chào mừng',
      nextActionDate: '2024-07-03T10:00:00'
    },
    {
      id: 11,
      name: 'Hoàng Văn L',
      phone: '0901234568',
      email: 'hoangvanl@email.com',
      source: 'referral',
      region: 'hai_phong',
      product: 'Supply Chain',
      tags: ['hot', 'enterprise'],
      content: 'Tối ưu hóa chuỗi cung ứng và logistics',
      status: 'proposal',
      stage: 'proposal_review',
      notes: 'Proposal đang được xem xét bởi board',
      assignedTo: 'Đặng Thị Supply',
      value: 120000000,
      lastContactedAt: '2024-06-27T16:00:00',
      createdAt: '2024-06-18T11:15:00',
      updatedAt: '2024-06-27T16:00:00',
      type: 'lead',
      company: 'DEF Logistics',
      priority: 'urgent',
      nextAction: 'Theo dõi phản hồi từ board',
      nextActionDate: '2024-07-01T10:00:00'
    },
    {
      id: 12,
      name: 'Trương Thị M',
      phone: '0912345679',
      email: 'truongthim@email.com',
      source: 'zalo',
      region: 'ho_chi_minh',
      product: 'Customer Analytics',
      tags: ['warm', 'sme'],
      content: 'Phân tích hành vi và xu hướng khách hàng',
      status: 'qualified',
      stage: 'demo_scheduled',
      notes: 'Đã book demo cho tuần sau',
      assignedTo: 'Phan Văn Analytics',
      value: 38000000,
      lastContactedAt: '2024-06-28T10:20:00',
      createdAt: '2024-06-22T13:45:00',
      updatedAt: '2024-06-28T10:20:00',
      type: 'lead',
      company: 'GHI Analytics',
      priority: 'medium',
      nextAction: 'Chuẩn bị tài liệu demo',
      nextActionDate: '2024-07-04T10:00:00'
    },
    {
      id: 13,
      name: 'Đinh Văn N',
      phone: '0923456780',
      email: 'dinhvann@email.com',
      source: 'linkedin',
      region: 'da_nang',
      product: 'Quality Management',
      tags: ['hot', 'enterprise'],
      content: 'Hệ thống quản lý chất lượng ISO',
      status: 'negotiation',
      stage: 'pricing_negotiation',
      notes: 'Đang thương lượng package và pricing',
      assignedTo: 'Lê Văn Quality',
      value: 55000000,
      lastContactedAt: '2024-06-30T09:15:00',
      createdAt: '2024-06-12T15:30:00',
      updatedAt: '2024-06-30T09:15:00',
      type: 'lead',
      company: 'JKL Manufacturing',
      priority: 'urgent',
      nextAction: 'Đàm phán lại về giá',
      nextActionDate: '2024-07-05T10:00:00'
    },
    {
      id: 14,
      name: 'Châu Thị O',
      phone: '0934567891',
      email: 'chauthio@email.com',
      source: 'facebook',
      region: 'can_tho',
      product: 'Education Platform',
      tags: ['warm', 'sme'],
      content: 'Nền tảng giáo dục trực tuyến',
      status: 'contacted',
      stage: 'demo_requested',
      notes: 'Yêu cầu demo chi tiết về tính năng',
      assignedTo: 'Huỳnh Thị Edu',
      value: 28000000,
      lastContactedAt: '2024-06-29T11:00:00',
      createdAt: '2024-06-24T16:20:00',
      updatedAt: '2024-06-29T11:00:00',
      type: 'lead',
      company: 'MNO Education',
      priority: 'medium',
      nextAction: 'Gửi thông tin khóa học',
      nextActionDate: '2024-07-06T10:00:00'
    },
    {
      id: 15,
      name: 'Mai Văn P',
      phone: '0945678902',
      email: 'maivanp@email.com',
      source: 'google',
      region: 'ha_noi',
      product: 'Security System',
      tags: ['hot', 'enterprise'],
      content: 'Hệ thống bảo mật và giám sát toàn diện',
      status: 'converted',
      stage: 'deal_created',
      notes: 'Đã chuyển thành deal, bắt đầu implementation',
      assignedTo: 'Vũ Thị Security',
      value: 90000000,
      lastContactedAt: '2024-06-26T14:30:00',
      createdAt: '2024-06-10T12:00:00',
      updatedAt: '2024-06-26T14:30:00',
      type: 'lead',
      company: 'PQR Security',
      priority: 'urgent',
      nextAction: 'Triển khai hệ thống bảo mật',
      nextActionDate: '2024-07-07T10:00:00'
    },
    {
      id: 16,
      name: 'Dương Thị Q',
      phone: '0956789013',
      email: 'duongthiq@email.com',
      source: 'referral',
      region: 'ho_chi_minh',
      product: 'Mobile App Development',
      tags: ['warm', 'sme'],
      content: 'Phát triển ứng dụng mobile cho doanh nghiệp',
      status: 'qualified',
      stage: 'requirements_gathering',
      notes: 'Đang thu thập yêu cầu chi tiết',
      assignedTo: 'Cao Văn Mobile',
      value: 42000000,
      lastContactedAt: '2024-06-28T13:45:00',
      createdAt: '2024-06-19T10:30:00',
      updatedAt: '2024-06-28T13:45:00',
      type: 'lead',
      company: 'STU Mobile',
      priority: 'medium',
      nextAction: 'Lên danh sách tính năng yêu cầu',
      nextActionDate: '2024-07-08T10:00:00'
    },
    {
      id: 17,
      name: 'Kiều Văn R',
      phone: '0967890124',
      email: 'kieuvanr@email.com',
      source: 'website',
      region: 'hai_phong',
      product: 'Cloud Infrastructure',
      tags: ['cold', 'enterprise'],
      content: 'Migration lên cloud và quản lý hạ tầng',
      status: 'new',
      stage: 'lead_qualification',
      notes: 'Lead mới, cần qualify budget và timeline',
      assignedTo: 'Bùi Thị Cloud',
      value: 75000000,
      lastContactedAt: null,
      createdAt: '2024-06-30T17:00:00',
      updatedAt: '2024-06-30T17:00:00',
      type: 'lead',
      company: 'VWX Cloud Corp',
      priority: 'low',
      nextAction: 'Gửi khảo sát nhu cầu',
      nextActionDate: '2024-07-09T10:00:00'
    },
    {
      id: 18,
      name: 'Tô Thị S',
      phone: '0978901235',
      email: 'tothis@email.com',
      source: 'zalo',
      region: 'da_nang',
      product: 'IoT Solutions',
      tags: ['hot', 'enterprise'],
      content: 'Giải pháp IoT cho smart city và nhà máy',
      status: 'proposal',
      stage: 'technical_review',
      notes: 'Proposal đang được review về mặt kỹ thuật',
      assignedTo: 'Lương Văn IoT',
      value: 150000000,
      lastContactedAt: '2024-06-29T15:30:00',
      createdAt: '2024-06-08T14:45:00',
      updatedAt: '2024-06-29T15:30:00',
      type: 'lead',
      company: 'YZA Smart Tech',
      priority: 'urgent',
      nextAction: 'Đợi phản hồi kỹ thuật',
      nextActionDate: '2024-07-10T10:00:00'
    }
  ])

  // Calculate metrics with realistic previous month data
  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Calculate AI Suggestions count
    const calculateAISuggestions = () => {
      let suggestionsCount = 0
      
      // Count high-value leads needing follow-up
      leads.forEach(lead => {
        const daysSinceLastContact = lead.lastContactedAt 
          ? Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        
        // High-value leads need attention
        if (lead.value > 80000000 && daysSinceLastContact > 2 && lead.status !== 'converted') {
          suggestionsCount++
        }
        // Qualified leads without follow-up for over 5 days
        if (lead.status === 'qualified' && daysSinceLastContact > 5) {
          suggestionsCount++
        }
        // New leads created today
        if (lead.status === 'new' && daysSinceLastContact <= 1) {
          suggestionsCount++
        }
        // Proposals pending for more than 3 days
        if (lead.status === 'proposal' && daysSinceLastContact > 3) {
          suggestionsCount++
        }
        // Negotiation stage leads need push
        if (lead.status === 'negotiation' && daysSinceLastContact > 2) {
          suggestionsCount++
        }
      })
      
      // Strategic insights
      const hotLeads = leads.filter(lead => lead.tags.includes('hot'))
      const enterpriseLeads = leads.filter(lead => lead.tags.includes('enterprise'))
      const newLeadsCount = leads.filter(lead => lead.status === 'new').length
      
      // Hot leads cluster suggestion
      if (hotLeads.length >= 3) {
        suggestionsCount += 2
      }
      
      // Enterprise deals pattern
      if (enterpriseLeads.length >= 5) {
        suggestionsCount++
      }
      
      // Regional opportunity
      const regions = ['ha_noi', 'ho_chi_minh', 'da_nang']
      regions.forEach(region => {
        const regionLeads = leads.filter(lead => lead.region === region && lead.status !== 'converted')
        if (regionLeads.length >= 3) {
          suggestionsCount++
        }
      })
      
      // Product cross-sell opportunities
      const products = Array.from(new Set(leads.map(lead => lead.product)))
      if (products.length >= 8) {
        suggestionsCount += 2
      }
      
      return Math.min(suggestionsCount, 12) // Cap at 12 suggestions
    }
    
    // Simulate previous month data (in real app, this would come from API)
    const previousMonthData = {
      totalLeads: 12, // Tháng trước có 12 leads
      conversionRate: 15, // Tỷ lệ chuyển đổi tháng trước 15%
      aiSuggestions: 6, // Tháng trước có 6 gợi ý AI
      totalValue: 850000000 // Tổng giá trị dự kiến tháng trước: 850M VND
    }
    
    const currentData = {
      totalLeads: leads.length,
      conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
      aiSuggestions: calculateAISuggestions(),
      totalValue: leads.reduce((sum, lead) => sum + lead.value, 0)
    }
    
    const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
      if (current > previous) return 'up'
      if (current < previous) return 'down'
      return 'neutral'
    }
    
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }
    
    return [
      {
        id: 'leads',
        title: 'Tổng Leads',
        value: currentData.totalLeads,
        previousValue: previousMonthData.totalLeads,
        percentageChange: calculatePercentageChange(currentData.totalLeads, previousMonthData.totalLeads),
        icon: <Users className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        trend: calculateTrend(currentData.totalLeads, previousMonthData.totalLeads),        clickAction: () => {
          setActiveTab('pipeline')
          setSelectedMetric('leads')
          setNotification({
            message: `Đang hiển thị chi tiết ${currentData.totalLeads} leads trong Pipeline`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 3000)
        }
      },
      {
        id: 'conversion',
        title: 'Tỷ Lệ Chuyển Đổi',
        value: currentData.conversionRate,
        previousValue: previousMonthData.conversionRate,
        percentageChange: calculatePercentageChange(currentData.conversionRate, previousMonthData.conversionRate),
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        trend: calculateTrend(currentData.conversionRate, previousMonthData.conversionRate),        clickAction: () => {
          setActiveTab('pipeline')
          setSelectedMetric('conversion')
          setNotification({
            message: `Tỷ lệ chuyển đổi hiện tại: ${currentData.conversionRate}%`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 3000)
        }
      },
      {
        id: 'ai-suggestions',
        title: 'Gợi ý AI',
        value: currentData.aiSuggestions,
        previousValue: previousMonthData.aiSuggestions,
        percentageChange: calculatePercentageChange(currentData.aiSuggestions, previousMonthData.aiSuggestions),
        icon: <Bot className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        trend: calculateTrend(currentData.aiSuggestions, previousMonthData.aiSuggestions),
        clickAction: () => {
          setActiveTab('ai-suggestions')
          setSelectedMetric('ai-suggestions')
          setNotification({
            message: `Hiển thị ${currentData.aiSuggestions} gợi ý AI thông minh`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 3000)
        }
      },
      {
        id: 'total-value',
        title: 'Tổng Giá Trị Dự Kiến',
        value: Math.round(currentData.totalValue / 1000000), // Convert to millions
        previousValue: Math.round(previousMonthData.totalValue / 1000000),
        percentageChange: calculatePercentageChange(currentData.totalValue, previousMonthData.totalValue),
        icon: <DollarSign className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        trend: calculateTrend(currentData.totalValue, previousMonthData.totalValue),
        clickAction: () => {
          setActiveTab('pipeline')
          setSelectedMetric('total-value')
          setNotification({
            message: `Tổng giá trị dự kiến: ${Math.round(currentData.totalValue / 1000000)}M VND`,
            type: 'success'
          })
          setTimeout(() => setNotification(null), 3000)
        }
      }
    ]
  }
  
  const metrics = calculateMetrics()

  // Handle AI suggestions
  const handleAISuggestion = (suggestionId: string, action: string) => {
    switch (action) {
      case 'accept':
        setNotification({
          message: 'Đã thực hiện theo gợi ý AI',
          type: 'success'
        })
        break
      case 'dismiss':
        // Just mark as dismissed
        break
      case 'like':
        // Track positive feedback
        break
      case 'dislike':
        // Track negative feedback
        break
    }
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000)
  }

  const renderPipeline = () => {
    // Filtered leads based on search and filters
    const filteredLeads = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                           lead.phone.includes(leadSearchTerm) ||
                           lead.company?.toLowerCase().includes(leadSearchTerm.toLowerCase())
      
      const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter
      const matchesRegion = leadRegionFilter === 'all' || lead.region === leadRegionFilter
      const matchesSource = leadSourceFilter === 'all' || lead.source === leadSourceFilter
      
      return matchesSearch && matchesStatus && matchesRegion && matchesSource
    })

    // Pipeline statistics
    const pipelineStats = {
      newLeads: leads.filter(l => l.status === 'new').length,
      contactedLeads: leads.filter(l => l.status === 'contacted').length,
      qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
      proposalLeads: leads.filter(l => l.status === 'proposal').length,
      negotiationLeads: leads.filter(l => l.status === 'negotiation').length,
      convertedLeads: leads.filter(l => l.status === 'converted').length,
      totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
      hotLeads: leads.filter(l => l.tags.includes('hot')).length,
      avgDealSize: leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.value, 0) / leads.length) : 0
    }

    return (
      <div className="space-y-6">
        {/* Pipeline Flow - Only show in table view */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">Quy trình Bán hàng</h3>
                <div 
                  className="relative"
                  onMouseEnter={() => setShowTooltip('pipeline-overview')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  {showTooltip === 'pipeline-overview' && (
                    <div className="absolute left-0 top-6 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                      <div className="max-w-xs">
                        <p className="font-medium mb-1">Quy trình Bán hàng</p>
                        <p>Theo dõi toàn bộ hành trình khách hàng từ lead mới đến chuyển đổi thành công.</p>
                        <p className="mt-1 text-gray-300">Nhấp vào từng giai đoạn để xem chi tiết leads.</p>
                      </div>
                      <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pipeline Cards in horizontal layout */}
            <div className="flex flex-wrap gap-2 justify-between">
              {/* Mới */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'new' 
                    ? 'border-gray-400 shadow-md ring-2 ring-gray-200' 
                    : 'border-gray-200'
                }`}
                onClick={() => handlePipelineStageClick('new')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-new')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showTooltip === 'stage-new' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Mới</p>
                          <p>Leads vừa được tạo, chưa có tương tác nào.</p>
                          <p className="mt-1 text-gray-300">Cần liên hệ ngay để xác định mức độ quan tâm.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Mới</p>
                  <p className="text-lg font-bold text-gray-900">{pipelineStats.newLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">T.trước: 1</p>
                    <p className="text-xs text-green-600 font-medium">+200%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* Đã liên hệ */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'contacted' 
                    ? 'border-blue-400 shadow-md ring-2 ring-blue-200' 
                    : 'border-blue-200'
                }`}
                onClick={() => handlePipelineStageClick('contacted')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-contacted')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-blue-400 hover:text-blue-600 cursor-help" />
                    {showTooltip === 'stage-contacted' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Đã liên hệ</p>
                          <p>Đã có tương tác đầu tiên với khách hàng.</p>
                          <p className="mt-1 text-gray-300">Cần đánh giá nhu cầu và khả năng mua của khách hàng.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <Phone className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Đã liên hệ</p>
                  <p className="text-lg font-bold text-blue-900">{pipelineStats.contactedLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-blue-500">T.trước: 2</p>
                    <p className="text-xs text-green-600 font-medium">+50%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* Đã xác định */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'qualified' 
                    ? 'border-green-400 shadow-md ring-2 ring-green-200' 
                    : 'border-green-200'
                }`}
                onClick={() => handlePipelineStageClick('qualified')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-qualified')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-green-400 hover:text-green-600 cursor-help" />
                    {showTooltip === 'stage-qualified' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Đã xác định</p>
                          <p>Khách hàng đã được xác định có nhu cầu thực sự và khả năng mua.</p>
                          <p className="mt-1 text-gray-300">Có thể tiến hành chuẩn bị báo giá.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Đã xác định</p>
                  <p className="text-lg font-bold text-green-900">{pipelineStats.qualifiedLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-green-500">T.trước: 2</p>
                    <p className="text-xs text-green-600 font-medium">+100%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* Báo giá */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'proposal' 
                    ? 'border-yellow-400 shadow-md ring-2 ring-yellow-200' 
                    : 'border-yellow-200'
                }`}
                onClick={() => handlePipelineStageClick('proposal')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-proposal')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-yellow-500 hover:text-yellow-600 cursor-help" />
                    {showTooltip === 'stage-proposal' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Báo giá</p>
                          <p>Đã gửi báo giá chính thức cho khách hàng.</p>
                          <p className="mt-1 text-gray-300">Cần theo dõi phản hồi và sẵn sàng điều chỉnh.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <Calendar className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-yellow-600 mb-1">Báo giá</p>
                  <p className="text-lg font-bold text-yellow-900">{pipelineStats.proposalLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-yellow-500">T.trước: 2</p>
                    <p className="text-xs text-green-600 font-medium">+50%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* Đàm phán */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'negotiation' 
                    ? 'border-orange-400 shadow-md ring-2 ring-orange-200' 
                    : 'border-orange-200'
                }`}
                onClick={() => handlePipelineStageClick('negotiation')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-negotiation')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-orange-500 hover:text-orange-600 cursor-help" />
                    {showTooltip === 'stage-negotiation' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Đàm phán</p>
                          <p>Đang thảo luận về giá cả, điều khoản và điều kiện.</p>
                          <p className="mt-1 text-gray-300">Giai đoạn quan trọng quyết định thành công deal.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <Briefcase className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 mb-1">Đàm phán</p>
                  <p className="text-lg font-bold text-orange-900">{pipelineStats.negotiationLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-orange-500">T.trước: 4</p>
                    <p className="text-xs text-red-600 font-medium">-25%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* Đã chuyển đổi */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'converted' 
                    ? 'border-purple-400 shadow-md ring-2 ring-purple-200' 
                    : 'border-purple-200'
                }`}
                onClick={() => handlePipelineStageClick('converted')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-converted')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-purple-500 hover:text-purple-600 cursor-help" />
                    {showTooltip === 'stage-converted' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Giai đoạn Đã chuyển đổi</p>
                          <p>Deal đã thành công, khách hàng đã ký hợp đồng/mua hàng.</p>
                          <p className="mt-1 text-gray-300">Cần chuyển sang chăm sóc khách hàng dài hạn.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Đã chuyển đổi</p>
                  <p className="text-lg font-bold text-purple-900">{pipelineStats.convertedLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-purple-500">T.trước: 1</p>
                    <p className="text-xs text-green-600 font-medium">+100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Progress Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-2">
                  <span>Tiến độ Pipeline</span>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('progress-bar')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showTooltip === 'progress-bar' && (
                      <div className="absolute left-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Tiến độ Pipeline</p>
                          <p>Tỷ lệ phần trăm leads đã chuyển đổi thành công so với tổng số leads.</p>
                          <p className="mt-1 text-gray-300">Công thức: (Số leads đã chuyển đổi / Tổng số leads) × 100%</p>
                        </div>
                        <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span>{Math.round((pipelineStats.convertedLeads / leads.length) * 100)}% hoàn thành</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((pipelineStats.convertedLeads / leads.length) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Table className="w-4 h-4" />
                Bảng
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, phone, công ty..."
                  value={leadSearchTerm}
                  onChange={(e) => setLeadSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-3">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">Mới</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="qualified">Đã xác định</option>
                <option value="proposal">Báo giá</option>
                <option value="negotiation">Đàm phán</option>
                <option value="converted">Đã chuyển đổi</option>
              </select>
              
              <select
                value={leadRegionFilter}
                onChange={(e) => setLeadRegionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả khu vực</option>
                <option value="ha_noi">Hà Nội</option>
                <option value="ho_chi_minh">TP.HCM</option>
                <option value="da_nang">Đà Nẵng</option>
                <option value="can_tho">Cần Thơ</option>
                <option value="hai_phong">Hải Phòng</option>
              </select>
              
              <select
                value={leadSourceFilter}
                onChange={(e) => setLeadSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả nguồn</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="website">Website</option>
                <option value="zalo">Zalo</option>
                <option value="referral">Referral</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </button>
              
              <button 
                onClick={() => setShowAutoAssignModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Bot className="w-4 h-4" />
                Phân leads tự động
              </button>
              
              <button 
                onClick={() => setShowAddLeadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Thêm Lead
              </button>
            </div>
          </div>
          
          {/* Filter Summary */}
          {(leadSearchTerm || leadStatusFilter !== 'all' || leadRegionFilter !== 'all' || leadSourceFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Hiển thị {filteredLeads.length} / {leads.length} leads</span>
              <button 
                onClick={() => {
                  setLeadSearchTerm('');
                  setLeadStatusFilter('all');
                  setLeadRegionFilter('all');
                  setLeadSourceFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Leads View - Table or Kanban */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto relative">
              <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border-r border-gray-200">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Khu vực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Sản phẩm/Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Nguồn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Giá trị dự kiến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Giai đoạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Phụ trách
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Lần cuối liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Độ ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Hành động tiếp theo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-[140px] bg-gray-50 shadow-md z-20 border-r border-gray-300">
                    Phân công
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-lg z-20">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className="group hover:bg-gray-50">
                    {/* STT */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                      {index + 1}
                    </td>
                    
                    {/* Khách hàng */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-32">{lead.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-32">{lead.company || 'Cá nhân'}</div>
                      </div>
                    </td>
                    
                    {/* Liên hệ */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900 truncate max-w-28">{lead.phone}</div>
                      <div className="text-sm text-gray-500 truncate max-w-32">{lead.email}</div>
                    </td>
                    
                    {/* Khu vực */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900">
                        {lead.region === 'ha_noi' ? 'Hà Nội' : 
                         lead.region === 'ho_chi_minh' ? 'TP.HCM' : 
                         lead.region === 'da_nang' ? 'Đà Nẵng' : 
                         lead.region === 'can_tho' ? 'Cần Thơ' : 
                         lead.region === 'hai_phong' ? 'Hải Phòng' : lead.region}
                      </div>
                    </td>
                    
                    {/* Sản phẩm */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900 truncate max-w-36">{lead.product}</div>
                      <div className="text-xs text-gray-500 truncate max-w-36" title={lead.content}>
                        {lead.content.length > 30 ? `${lead.content.substring(0, 30)}...` : lead.content}
                      </div>
                    </td>
                    
                    {/* Nguồn */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          lead.source === 'facebook' ? 'bg-blue-500' :
                          lead.source === 'google' ? 'bg-red-500' :
                          lead.source === 'website' ? 'bg-green-500' :
                          lead.source === 'zalo' ? 'bg-blue-600' :
                          lead.source === 'linkedin' ? 'bg-blue-700' :
                          lead.source === 'referral' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-900 capitalize">
                          {lead.source === 'facebook' ? 'Facebook' :
                           lead.source === 'google' ? 'Google' :
                           lead.source === 'website' ? 'Website' :
                           lead.source === 'zalo' ? 'Zalo' :
                           lead.source === 'linkedin' ? 'LinkedIn' :
                           lead.source === 'referral' ? 'Referral' : lead.source}
                        </span>
                      </div>
                    </td>
                    
                    {/* Giá trị dự kiến */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {(lead.value / 1000000).toFixed(0)}M VND
                      </div>
                    </td>
                    
                    {/* Trạng thái */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                        lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status === 'converted' ? 'Đã chuyển đổi' :
                         lead.status === 'qualified' ? 'Đã xác định' :
                         lead.status === 'contacted' ? 'Đã liên hệ' :
                         lead.status === 'negotiation' ? 'Đàm phán' :
                         lead.status === 'proposal' ? 'Báo giá' :
                         lead.status === 'lost' ? 'Thất bại' : 'Mới'}
                      </span>
                    </td>
                    
                    {/* Giai đoạn */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border truncate ${
                        lead.stage.includes('initial') ? 'bg-gray-50 text-gray-700 border-gray-200' :
                        lead.stage.includes('demo') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        lead.stage.includes('proposal') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        lead.stage.includes('negotiation') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        lead.stage.includes('contract') ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {(() => {
                          switch(lead.stage) {
                            case 'deal_created': return 'Đã tạo deal';
                            case 'proposal_sent': return 'Đã gửi báo giá';
                            case 'contract_review': return 'Đang xem xét hợp đồng';
                            case 'follow_up': return 'Theo dõi';
                            case 'initial_contact': return 'Liên hệ ban đầu';
                            case 'demo_completed': return 'Đã hoàn thành demo';
                            case 'demo_scheduled': return 'Đã lên lịch demo';
                            case 'needs_assessment': return 'Đánh giá nhu cầu';
                            case 'proposal_review': return 'Đang xem xét báo giá';
                            case 'pricing_negotiation': return 'Đàm phán giá';
                            case 'demo_requested': return 'Yêu cầu demo';
                            case 'requirements_gathering': return 'Thu thập yêu cầu';
                            case 'lead_qualification': return 'Xác định lead';
                            case 'technical_review': return 'Đánh giá kỹ thuật';
                            case 'budget_confirmation': return 'Xác nhận ngân sách';
                            case 'contract_terms': return 'Điều khoản hợp đồng';
                            case 'requirement_analysis': return 'Phân tích yêu cầu';
                            case 'contract_signed': return 'Đã ký hợp đồng';
                            case 'scope_definition': return 'Xác định phạm vi';
                            case 'pricing_discussion': return 'Thảo luận giá';
                            case 'information_gathering': return 'Thu thập thông tin';
                            case 'initial_meeting': return 'Cuộc họp đầu tiên';
                            default: return lead.stage.replace(/_/g, ' ');
                          }
                        })()}
                      </span>
                    </td>
                    
                    {/* Phụ trách */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm text-gray-900 truncate max-w-24">{lead.assignedTo}</div>
                      </div>
                    </td>
                    
                    {/* Tags */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              tag === 'hot' ? 'bg-red-100 text-red-800' :
                              tag === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                              tag === 'cold' ? 'bg-blue-100 text-blue-800' :
                              tag === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              tag === 'sme' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {lead.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{lead.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Ngày tạo */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900">
                        {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    
                    {/* Lần cuối liên hệ */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      {lead.lastContactedAt ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(lead.lastContactedAt).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa liên hệ</span>
                      )}
                    </td>
                    
                    {/* Độ ưu tiên */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.priority === 'urgent' ? 'Khẩn cấp' :
                         lead.priority === 'high' ? 'Cao' :
                         lead.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </td>
                    
                    {/* Hành động tiếp theo */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900 truncate max-w-32">{lead.nextAction}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(lead.nextActionDate).toLocaleDateString('vi-VN')} - {new Date(lead.nextActionDate).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    
                    {/* Phân công nhanh */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300 sticky right-[140px] bg-white group-hover:bg-gray-50 shadow-md z-10">
                      <select
                        value={lead.assignedTo || ""}
                        onChange={(e) => handleQuickAssign(lead.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[150px]"
                        title={lead.assignedTo || "Chưa phân công"}
                      >
                        <option value="">Chưa phân công</option>
                        {getAvailableSalesPersons().map(person => (
                          <option key={person.id} value={person.name}>
                            {person.name} ({person.currentLeads} leads)
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    {/* Hành động */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white group-hover:bg-gray-50 shadow-lg z-10">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewLeadDetail(lead)}
                          className="p-2 text-slate-600 hover:text-white hover:bg-purple-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditLead(lead)}
                          className="p-2 text-slate-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                          title="Chỉnh sửa lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleExportLead(lead)}
                          className="p-2 text-slate-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                          title="Xuất dữ liệu"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleConvertLead(lead)}
                          className="p-2 text-slate-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                          title="Chuyển thành khách hàng"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead)}
                          className="p-2 text-slate-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                          title="Xóa lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md">
                Trước
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md">
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredLeads.length}</span> của{' '}
                  <span className="font-medium">{filteredLeads.length}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <span className="sr-only">Trước</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="bg-blue-600 border-blue-600 text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium shadow-md hover:bg-blue-700 transition-all duration-200">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <span className="sr-only">Sau</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* Kanban View */
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 h-[calc(100vh-400px)]">
              {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted'].map((status) => {
                const statusLeads = filteredLeads.filter(lead => lead.status === status);
                
                return (
                  <div 
                    key={status} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    {/* Column Header */}
                    <div className={`p-4 border-b border-gray-200 flex items-center justify-between transition-colors ${
                      draggedLead && draggedLead.status !== status ? 'bg-blue-50 border-blue-200' : ''
                    }`}>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'new' ? 'bg-gray-500' :
                          status === 'contacted' ? 'bg-yellow-500' :
                          status === 'qualified' ? 'bg-blue-500' :
                          status === 'proposal' ? 'bg-purple-500' :
                          status === 'negotiation' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}></span>
                        <h3 className="font-medium text-gray-900">{getStatusName(status)}</h3>
                      </div>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {statusLeads.length}
                      </span>
                    </div>
                    
                    {/* Cards Container */}
                                       <div className="flex-1 p-2 overflow-y-auto">
                        {statusLeads.length === 0 ? (
                          <div className={`text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg transition-colors ${
                            draggedLead && draggedLead.status !== status ? 'border-blue-400 bg-blue-50 text-blue-600' : ''
                          }`}>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                              </div>
                              <p className="text-sm">
                                {draggedLead && draggedLead.status !== status ? 'Thả vào đây' : 'Chưa có lead'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          statusLeads.map((lead) => (
                            <div 
                              key={lead.id} 
                              className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move ${
                                draggedLead?.id === lead.id ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-102'
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="space-y-2">
                                {/* Lead Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                                    <p className="text-xs text-gray-500">{lead.company || 'Cá nhân'}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {lead.priority === 'urgent' ? 'Khẩn cấp' :
                                     lead.priority === 'high' ? 'Cao' :
                                     lead.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                  </span>
                                </div>
                                
                                {/* Product & Value */}
                                <div>
                                  <p className="text-sm text-gray-900 font-medium">{lead.product}</p>
                                  <p className="text-lg font-bold text-green-600">{(lead.value / 1000000).toFixed(0)}M VND</p>
                                </div>
                                
                                {/* Contact Info */}
                                <div className="text-xs text-gray-500">
                                  <p>{lead.phone}</p>
                                  <p>{lead.email}</p>
                                </div>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                  {lead.tags.slice(0, 2).map((tag, index) => (
                                    <span key={index} className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      tag === 'hot' ? 'bg-red-100 text-red-800' :
                                      tag === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                                      tag === 'cold' ? 'bg-blue-100 text-blue-800' :
                                      tag === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                
                                {/* Assigned To */}
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-500" />
                                  </div>
                                  <span className="text-xs text-gray-600">{lead.assignedTo}</span>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => handleViewLeadDetail(lead)}
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Xem chi tiết"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleEditLead(lead)}
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Chỉnh sửa lead"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleExportLead(lead)}
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-indigo-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Xuất dữ liệu"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleConvertLead(lead)}
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Chuyển thành khách hàng"
                                    >
                                      <User className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteLead(lead)}
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-red-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Xóa lead"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Handle pipeline stage click
  const handlePipelineStageClick = (stage: string) => {
    setSelectedPipelineStage(selectedPipelineStage === stage ? null : stage)
    
    // Filter leads based on selected stage
    let statusFilter = 'all'
    switch(stage) {
      case 'new':
        statusFilter = 'new'
        break
      case 'contacted':
        statusFilter = 'contacted'
        break
      case 'qualified':
        statusFilter = 'qualified'
        break
      case 'proposal':
        statusFilter = 'proposal'
        break
      case 'negotiation':
        statusFilter = 'negotiation'
        break
      case 'converted':
        statusFilter = 'converted'
        break
    }
    
    // Update lead status filter to show relevant data
    setLeadStatusFilter(statusFilter)
    
    // Show notification
    const stageNames = {
      'new': 'Mới',
      'contacted': 'Đã liên hệ', 
      'qualified': 'Đã xác định',
      'proposal': 'Báo giá',
      'negotiation': 'Đàm phán',
      'converted': 'Đã chuyển đổi'
    }
    
    setNotification({
      message: `Đang hiển thị ${leads.filter(l => l.status === stage).length} leads ở giai đoạn "${stageNames[stage as keyof typeof stageNames]}"`,
      type: 'success'
    })
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
      </div>      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{metrics.map((metric) => (
          <div 
            key={metric.id} 
            className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
              selectedMetric === metric.id 
                ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={metric.clickAction}
            title={`Click để xem chi tiết ${metric.title.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  {metric.id === 'conversion' ? '%' : ''}
                  {metric.id === 'total-value' ? 'M' : ''}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : metric.trend === 'down' ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                )}
                <span className={`text-sm ml-1 font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'neutral' ? '0%' : 
                   metric.trend === 'up' ? `+${metric.percentageChange}%` : 
                   `${metric.percentageChange}%`}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                vs tháng trước
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Tháng trước: {metric.previousValue}{metric.id === 'conversion' ? '%' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions for Lead Management */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gợi ý từ AI</h3>
              <p className="text-sm text-gray-600">Phân tích thông minh cho chăm sóc leads</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>Smart</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="font-medium text-red-800 mb-2">Leads ưu tiên cao</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Nguyễn Văn A (Enterprise) - Chưa liên hệ 3 ngày</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Công ty XYZ (Hot lead) - Cần gọi lại hôm nay</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Trần Thị B - Lead từ Zalo OA, quan tâm cao</span>
              </li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">Hành động tối ưu</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Phone className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Gọi điện cho 5 leads &quot;Đã liên hệ&quot; trong khung 9-11h</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Gửi email follow-up cho 8 leads đã báo giá</span>
              </li>
              <li className="flex items-start">
                <Calendar className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Lên lịch demo cho 3 leads &quot;Đã xác định&quot;</span>
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Cải thiện hiệu quả</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Target className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Tỷ lệ chuyển đổi từ &quot;Báo giá&quot; sang &quot;Đàm phán&quot; thấp (40%)</span>
              </li>
              <li className="flex items-start">
                <Users className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Phân bổ lại 4 leads cho nhân viên ít việc hơn</span>
              </li>
              <li className="flex items-start">
                <Clock className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">Thời gian phản hồi trung bình: 6h (nên &lt; 2h)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-4">            {[
                { id: 'pipeline', name: 'Leads & Pipeline', count: leads.length, icon: <Activity className="w-4 h-4" /> },
                { id: 'ai-suggestions', name: 'Gợi ý AI', count: calculateMetrics().find(m => m.id === 'ai-suggestions')?.value || 0, icon: <Bot className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setSelectedMetric(null) // Reset selected metric when manually changing tabs
                  }}
                  className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
        </div>        {/* Tab Content */}
        <div className="p-4">          {activeTab === 'pipeline' && renderPipeline()}
          {activeTab === 'ai-suggestions' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900">AI Gợi ý thông minh</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      AI phân tích dữ liệu leads và deals để đưa ra những gợi ý hành động tối ưu cho đội sales của bạn.
                    </p>
                  </div>
                </div>
              </div>
              <AISuggestionsTab 
                leads={leads}
                deals={[]}
                onSuggestionAction={handleAISuggestion}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Thêm Lead mới</h3>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('add-lead-title')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showTooltip === 'add-lead-title' && (
                      <div className="absolute left-0 top-7 z-50 bg-black text-white text-sm rounded-lg py-3 px-4 shadow-lg">
                        <div className="max-w-sm">
                          <p className="font-medium mb-2">📝 Tạo lead mới</p>
                          <p className="mb-2">Nhập thông tin khách hàng tiềm năng mới:</p>
                          <ul className="text-xs space-y-1 text-gray-300">
                            <li>• Thông tin bắt buộc: Tên, Email, Số ĐT</li>
                            <li>• Lead sẽ tự động có trạng thái "Mới"</li>
                            <li>• Có thể phân công sau bằng hệ thống tự động</li>
                          </ul>
                        </div>
                        <div className="absolute top-[-6px] left-4 w-3 h-3 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Required Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Thông tin bắt buộc
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập tên khách hàng..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0901234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@domain.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Thông tin công ty
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Công ty</label>
                    <input
                      type="text"
                      value={newLead.company}
                      onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Tên công ty..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chức vụ</label>
                    <input
                      type="text"
                      value={newLead.jobTitle}
                      onChange={(e) => setNewLead(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="CEO, Manager, Developer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ngành nghề</label>
                    <select
                      value={newLead.industry}
                      onChange={(e) => setNewLead(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn ngành nghề...</option>
                      <option value="technology">Công nghệ thông tin</option>
                      <option value="finance">Tài chính - Ngân hàng</option>
                      <option value="healthcare">Y tế - Sức khỏe</option>
                      <option value="education">Giáo dục</option>
                      <option value="retail">Bán lẻ</option>
                      <option value="manufacturing">Sản xuất</option>
                      <option value="real-estate">Bất động sản</option>
                      <option value="consulting">Tư vấn</option>
                      <option value="marketing">Marketing</option>
                      <option value="logistics">Vận chuyển - Logistics</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quy mô công ty</label>
                    <select
                      value={newLead.companySize}
                      onChange={(e) => setNewLead(prev => ({ ...prev, companySize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn quy mô...</option>
                      <option value="1-10">1-10 nhân viên</option>
                      <option value="11-50">11-50 nhân viên</option>
                      <option value="51-200">51-200 nhân viên</option>
                      <option value="201-500">201-500 nhân viên</option>
                      <option value="501-1000">501-1000 nhân viên</option>
                      <option value="1000+">1000+ nhân viên</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={newLead.website}
                      onChange={(e) => setNewLead(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://domain.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      value={newLead.address}
                      onChange={(e) => setNewLead(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Địa chỉ công ty..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Source & Assignment */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  Nguồn lead & Phân công
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nguồn</label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="website">Website</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google Ads</option>
                      <option value="referral">Giới thiệu</option>
                      <option value="cold-call">Cold Call</option>
                      <option value="exhibition">Triển lãm</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="email-marketing">Email Marketing</option>
                      <option value="webinar">Webinar</option>
                      <option value="partner">Đối tác</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chi tiết nguồn</label>
                    <input
                      type="text"
                      value={newLead.sourceDetail}
                      onChange={(e) => setNewLead(prev => ({ ...prev, sourceDetail: e.target.value }))}
                      placeholder="Landing page cụ thể, campaign..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Khu vực</label>
                    <select
                      value={newLead.region}
                      onChange={(e) => setNewLead(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="haiphong">Hải Phòng</option>
                      <option value="cantho">Cần Thơ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phân công cho
                      <div 
                        className="inline-block ml-1 relative"
                        onMouseEnter={() => setShowTooltip('assign-to')}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        {showTooltip === 'assign-to' && (
                          <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                            <div className="max-w-xs">
                              <p className="text-gray-300">Bỏ trống để phân công tự động sau, hoặc chọn người phụ trách ngay.</p>
                            </div>
                            <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </label>
                    <select
                      value={newLead.assignedTo}
                      onChange={(e) => setNewLead(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chưa phân công</option>
                      {getAvailableSalesPersons().map(person => (
                        <option key={person.id} value={person.name}>
                          {person.name} ({person.currentLeads} leads hiện tại)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product & Sales Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  Thông tin sản phẩm & Bán hàng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sản phẩm quan tâm</label>
                    <input
                      type="text"
                      value={newLead.product}
                      onChange={(e) => setNewLead(prev => ({ ...prev, product: e.target.value }))}
                      placeholder="CRM, ERP, Website..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ngân sách ước tính (VND)</label>
                    <input
                      type="number"
                      value={newLead.budget}
                      onChange={(e) => setNewLead(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="50000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Timeline dự kiến</label>
                    <select
                      value={newLead.timeline}
                      onChange={(e) => setNewLead(prev => ({ ...prev, timeline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn timeline...</option>
                      <option value="immediate">Ngay lập tức</option>
                      <option value="1-month">Trong 1 tháng</option>
                      <option value="1-3-months">1-3 tháng</option>
                      <option value="3-6-months">3-6 tháng</option>
                      <option value="6-12-months">6-12 tháng</option>
                      <option value="12+ months">Trên 12 tháng</option>
                      <option value="undefined">Chưa xác định</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Độ ưu tiên</label>
                    <select
                      value={newLead.priority}
                      onChange={(e) => setNewLead(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">🔵 Thấp</option>
                      <option value="medium">🟡 Trung bình</option>
                      <option value="high">🟠 Cao</option>
                      <option value="urgent">🔴 Khẩn cấp</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Score (0-100)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newLead.leadScore}
                        onChange={(e) => setNewLead(prev => ({ ...prev, leadScore: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-700 w-12">{newLead.leadScore}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Đánh giá tiềm năng của lead (0: thấp, 100: rất cao)
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Thông tin giới thiệu
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tên người giới thiệu</label>
                    <input
                      type="text"
                      value={newLead.referrerName}
                      onChange={(e) => setNewLead(prev => ({ ...prev, referrerName: e.target.value }))}
                      placeholder="Tên người giới thiệu..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Liên hệ người giới thiệu</label>
                    <input
                      type="text"
                      value={newLead.referrerContact}
                      onChange={(e) => setNewLead(prev => ({ ...prev, referrerContact: e.target.value }))}
                      placeholder="Email hoặc số điện thoại..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media & Contact Preferences */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  Mạng xã hội & Tùy chọn liên hệ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={newLead.socialMedia.linkedin}
                      onChange={(e) => setNewLead(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                      }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={newLead.socialMedia.facebook}
                      onChange={(e) => setNewLead(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                      }))}
                      placeholder="https://facebook.com/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phương thức liên hệ ưa thích</label>
                    <select
                      value={newLead.preferredContact}
                      onChange={(e) => setNewLead(prev => ({ ...prev, preferredContact: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">📧 Email</option>
                      <option value="phone">📞 Điện thoại</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="meeting">🤝 Gặp trực tiếp</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian liên hệ tốt nhất</label>
                    <select
                      value={newLead.bestTimeToContact}
                      onChange={(e) => setNewLead(prev => ({ ...prev, bestTimeToContact: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="morning">🌅 Buổi sáng (8-12h)</option>
                      <option value="afternoon">☀️ Buổi chiều (13-17h)</option>
                      <option value="evening">🌆 Buổi tối (18-20h)</option>
                      <option value="anytime">🕐 Bất cứ lúc nào</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Mô tả chi tiết
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung quan tâm</label>
                    <textarea
                      value={newLead.content}
                      onChange={(e) => setNewLead(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Mô tả nhu cầu, yêu cầu của khách hàng..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={newLead.notes}
                      onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú thêm về lead này..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Xem trước Lead
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Tên:</strong> {newLead.name || 'Chưa nhập'} {newLead.jobTitle && `- ${newLead.jobTitle}`}</div>
                  <div><strong>Email:</strong> {newLead.email || 'Chưa nhập'}</div>
                  <div><strong>SĐT:</strong> {newLead.phone || 'Chưa nhập'}</div>
                  {newLead.company && <div><strong>Công ty:</strong> {newLead.company} {newLead.companySize && `(${newLead.companySize})`}</div>}
                  {newLead.industry && <div><strong>Ngành:</strong> {
                    newLead.industry === 'technology' ? 'Công nghệ thông tin' :
                    newLead.industry === 'finance' ? 'Tài chính - Ngân hàng' :
                    newLead.industry === 'healthcare' ? 'Y tế - Sức khỏe' :
                    newLead.industry === 'education' ? 'Giáo dục' :
                    newLead.industry === 'retail' ? 'Bán lẻ' :
                    newLead.industry === 'manufacturing' ? 'Sản xuất' :
                    newLead.industry === 'real-estate' ? 'Bất động sản' :
                    newLead.industry === 'consulting' ? 'Tư vấn' :
                    newLead.industry === 'marketing' ? 'Marketing' :
                    newLead.industry === 'logistics' ? 'Vận chuyển - Logistics' : 'Khác'
                  }</div>}
                  <div><strong>Nguồn:</strong> {
                    newLead.source === 'website' ? 'Website' :
                    newLead.source === 'facebook' ? 'Facebook' :
                    newLead.source === 'google' ? 'Google Ads' :
                    newLead.source === 'referral' ? 'Giới thiệu' :
                    newLead.source === 'cold-call' ? 'Cold Call' :
                    newLead.source === 'exhibition' ? 'Triển lãm' :
                    newLead.source === 'linkedin' ? 'LinkedIn' :
                    newLead.source === 'email-marketing' ? 'Email Marketing' :
                    newLead.source === 'webinar' ? 'Webinar' :
                    newLead.source === 'partner' ? 'Đối tác' : 'Khác'
                  } {newLead.sourceDetail && `- ${newLead.sourceDetail}`}</div>
                  <div><strong>Độ ưu tiên:</strong> {
                    newLead.priority === 'low' ? '🔵 Thấp' :
                    newLead.priority === 'medium' ? '🟡 Trung bình' :
                    newLead.priority === 'high' ? '🟠 Cao' : '🔴 Khẩn cấp'
                  }</div>
                  <div><strong>Lead Score:</strong> {newLead.leadScore}/100</div>
                  {newLead.budget && <div><strong>Ngân sách:</strong> {parseInt(newLead.budget).toLocaleString('vi-VN')} VND</div>}
                  {newLead.timeline && <div><strong>Timeline:</strong> {
                    newLead.timeline === 'immediate' ? 'Ngay lập tức' :
                    newLead.timeline === '1-month' ? 'Trong 1 tháng' :
                    newLead.timeline === '1-3-months' ? '1-3 tháng' :
                    newLead.timeline === '3-6-months' ? '3-6 tháng' :
                    newLead.timeline === '6-12-months' ? '6-12 tháng' :
                    newLead.timeline === '12+ months' ? 'Trên 12 tháng' : 'Chưa xác định'
                  }</div>}
                  {newLead.assignedTo && <div><strong>Phân công cho:</strong> {newLead.assignedTo}</div>}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={handleAddLead}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Thêm Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Assign Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Phân leads tự động</h3>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAutoAssignTooltip('main-title')}
                    onMouseLeave={() => setShowAutoAssignTooltip(null)}
                  >
                    <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showAutoAssignTooltip === 'main-title' && (
                      <div className="absolute left-0 top-7 z-50 bg-black text-white text-sm rounded-lg py-3 px-4 shadow-lg">
                        <div className="max-w-sm">
                          <p className="font-medium mb-2">🤖 Hệ thống phân leads tự động</p>
                          <p className="mb-2">Tự động phân công leads cho đội ngũ sales dựa trên:</p>
                          <ul className="text-xs space-y-1 text-gray-300">
                            <li>• Chiến lược phân công phù hợp</li>
                            <li>• Kỹ năng và chuyên môn của từng người</li>
                            <li>• Khối lượng công việc hiện tại</li>
                            <li>• Hiệu suất làm việc</li>
                          </ul>
                          <p className="text-xs text-gray-300 mt-2">Giúp tối ưu hóa tỷ lệ chuyển đổi và cân bằng workload.</p>
                        </div>
                        <div className="absolute top-[-6px] left-4 w-3 h-3 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowAutoAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Strategy Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Chiến lược phân công</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAutoAssignTooltip('strategy-section')}
                    onMouseLeave={() => setShowAutoAssignTooltip(null)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showAutoAssignTooltip === 'strategy-section' && (
                      <div className="absolute left-0 top-6 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">📋 Chọn phương pháp phân công phù hợp</p>
                          <p className="text-gray-300">Mỗi chiến lược có ưu điểm riêng, hãy chọn dựa trên tình hình thực tế của đội nhóm.</p>
                        </div>
                        <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">💡 Gợi ý lựa chọn:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• <strong>Đội mới/cùng trình độ:</strong> Chọn "Phân bổ đều"</li>
                        <li>• <strong>Có chuyên gia từng lĩnh vực:</strong> Chọn "Dựa trên kỹ năng"</li>
                        <li>• <strong>Muốn khen thưởng người giỏi:</strong> Chọn "Dựa trên hiệu suất"</li>
                        <li>• <strong>Cân bằng khối lượng:</strong> Chọn "Dựa trên công việc"</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="strategy" value="balanced" className="mt-1" defaultChecked />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900">⚖️ Phân bổ đều</div>
                        <div 
                          className="relative"
                          onMouseEnter={() => setShowAutoAssignTooltip('strategy-balanced')}
                          onMouseLeave={() => setShowAutoAssignTooltip(null)}
                        >
                          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          {showAutoAssignTooltip === 'strategy-balanced' && (
                            <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              <div className="max-w-xs">
                                <p className="font-medium mb-1">⚖️ Phân bổ đều (Round Robin)</p>
                                <p className="mb-1">Phân leads theo thứ tự vòng tròn cho tất cả nhân viên.</p>
                                <div className="text-gray-300">
                                  <p><strong>Ưu điểm:</strong> Công bằng, đơn giản</p>
                                  <p><strong>Phù hợp:</strong> Team có trình độ tương đương</p>
                                  <p><strong>Ví dụ:</strong> Lead 1→A, Lead 2→B, Lead 3→C, Lead 4→A...</p>
                                </div>
                              </div>
                              <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Phân leads đều cho tất cả nhân viên sales</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="strategy" value="skill-based" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900">🎯 Dựa trên kỹ năng</div>
                        <div 
                          className="relative"
                          onMouseEnter={() => setShowAutoAssignTooltip('strategy-skill')}
                          onMouseLeave={() => setShowAutoAssignTooltip(null)}
                        >
                          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          {showAutoAssignTooltip === 'strategy-skill' && (
                            <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              <div className="max-w-xs">
                                <p className="font-medium mb-1">🎯 Phân công theo chuyên môn</p>
                                <p className="mb-1">Ghép leads với nhân viên có chuyên môn phù hợp.</p>
                                <div className="text-gray-300">
                                  <p><strong>Ưu điểm:</strong> Tăng tỷ lệ chuyển đổi</p>
                                  <p><strong>Phù hợp:</strong> Team có chuyên gia từng lĩnh vực</p>
                                  <p><strong>Ví dụ:</strong> Lead IT → Chuyên gia Tech, Lead BĐS → Chuyên gia Real Estate</p>
                                </div>
                              </div>
                              <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Phân leads theo chuyên môn và kinh nghiệm</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="strategy" value="performance" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900">🏆 Dựa trên hiệu suất</div>
                        <div 
                          className="relative"
                          onMouseEnter={() => setShowAutoAssignTooltip('strategy-performance')}
                          onMouseLeave={() => setShowAutoAssignTooltip(null)}
                        >
                          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          {showAutoAssignTooltip === 'strategy-performance' && (
                            <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              <div className="max-w-xs">
                                <p className="font-medium mb-1">🏆 Ưu tiên người có hiệu suất cao</p>
                                <p className="mb-1">Phân leads cho nhân viên có tỷ lệ chuyển đổi tốt nhất.</p>
                                <div className="text-gray-300">
                                  <p><strong>Ưu điểm:</strong> Tối đa hóa doanh số</p>
                                  <p><strong>Phù hợp:</strong> Khi muốn khen thưởng top performer</p>
                                  <p><strong>Lưu ý:</strong> Có thể tạo áp lực cho nhân viên yếu hơn</p>
                                </div>
                              </div>
                              <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Ưu tiên nhân viên có tỷ lệ chuyển đổi cao</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="strategy" value="workload" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-gray-900">📊 Dựa trên khối lượng công việc</div>
                        <div 
                          className="relative"
                          onMouseEnter={() => setShowAutoAssignTooltip('strategy-workload')}
                          onMouseLeave={() => setShowAutoAssignTooltip(null)}
                        >
                          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          {showAutoAssignTooltip === 'strategy-workload' && (
                            <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              <div className="max-w-xs">
                                <p className="font-medium mb-1">📊 Cân bằng khối lượng công việc</p>
                                <p className="mb-1">Phân leads cho nhân viên đang có ít việc nhất.</p>
                                <div className="text-gray-300">
                                  <p><strong>Ưu điểm:</strong> Tránh quá tải, tăng hiệu suất</p>
                                  <p><strong>Phù hợp:</strong> Khi muốn cân bằng workload</p>
                                  <p><strong>Logic:</strong> A: 5 leads, B: 8 leads → Ưu tiên A</p>
                                </div>
                              </div>
                              <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Phân leads cho nhân viên có ít công việc nhất</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Bộ lọc leads</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAutoAssignTooltip('filters-section')}
                    onMouseLeave={() => setShowAutoAssignTooltip(null)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showAutoAssignTooltip === 'filters-section' && (
                      <div className="absolute left-0 top-6 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">🔍 Lọc leads trước khi phân công</p>
                          <p className="text-gray-300">Chỉ phân công những leads phù hợp với điều kiện đã chọn. Bỏ trống để áp dụng cho tất cả leads.</p>
                        </div>
                        <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-yellow-700">
                      <p className="font-medium">⚠️ Lưu ý khi sử dụng bộ lọc:</p>
                      <p>Chỉ những leads thỏa mãn TẤT CẢ điều kiện được chọn mới được phân công. Bỏ trống các trường không cần lọc.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tất cả trạng thái</option>
                      <option value="new">Mới</option>
                      <option value="contacted">Đã liên hệ</option>
                      <option value="qualified">Đã đánh giá</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Độ ưu tiên</label>
                    <select name="priority" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tất cả mức độ</option>
                      <option value="urgent">Khẩn cấp</option>
                      <option value="high">Cao</option>
                      <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nguồn</label>
                    <select name="source" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tất cả nguồn</option>
                      <option value="website">Website</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google Ads</option>
                      <option value="referral">Giới thiệu</option>
                      <option value="cold-call">Cold Call</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Khu vực</label>
                    <select name="region" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tất cả khu vực</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP.HCM</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment Rules */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Quy tắc phân công</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAutoAssignTooltip('rules-section')}
                    onMouseLeave={() => setShowAutoAssignTooltip(null)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showAutoAssignTooltip === 'rules-section' && (
                      <div className="absolute left-0 top-6 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">⚙️ Tùy chỉnh cách thức phân công</p>
                          <p className="text-gray-300">Các quy tắc bổ sung để điều chỉnh hành vi của hệ thống phân công tự động.</p>
                        </div>
                        <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xs text-green-700">
                        <p className="font-medium">✅ Quy tắc được khuyến nghị:</p>
                        <p>Nên bật "Chỉ phân leads chưa được phân công" và "Gửi thông báo" để đảm bảo hoạt động hiệu quả.</p>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Chỉ phân leads chưa được phân công</span>
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowAutoAssignTooltip('rule-unassigned')}
                      onMouseLeave={() => setShowAutoAssignTooltip(null)}
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                      {showAutoAssignTooltip === 'rule-unassigned' && (
                        <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                          <div className="max-w-xs">
                            <p className="font-medium mb-1">🔒 Bảo vệ leads đã có người phụ trách</p>
                            <p className="text-gray-300">Chỉ phân công những leads chưa có ai đảm nhận, tránh làm gián đoạn công việc đang diễn ra.</p>
                          </div>
                          <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Ghi đè phân công hiện tại</span>
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowAutoAssignTooltip('rule-override')}
                      onMouseLeave={() => setShowAutoAssignTooltip(null)}
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                      {showAutoAssignTooltip === 'rule-override' && (
                        <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                          <div className="max-w-xs">
                            <p className="font-medium mb-1">⚠️ Thay đổi người phụ trách</p>
                            <p className="text-gray-300">Phân công lại tất cả leads, bao gồm cả những leads đã có người đảm nhận. <strong>Cẩn thận khi sử dụng!</strong></p>
                          </div>
                          <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Gửi thông báo cho nhân viên được phân công</span>
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowAutoAssignTooltip('rule-notification')}
                      onMouseLeave={() => setShowAutoAssignTooltip(null)}
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                      {showAutoAssignTooltip === 'rule-notification' && (
                        <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                          <div className="max-w-xs">
                            <p className="font-medium mb-1">📧 Thông báo tự động</p>
                            <p className="text-gray-300">Gửi email/SMS thông báo cho nhân viên về leads mới được phân công, kèm thông tin chi tiết.</p>
                          </div>
                          <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Tự động tạo tác vụ follow-up</span>
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowAutoAssignTooltip('rule-followup')}
                      onMouseLeave={() => setShowAutoAssignTooltip(null)}
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                      {showAutoAssignTooltip === 'rule-followup' && (
                        <div className="absolute left-0 top-5 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                          <div className="max-w-xs">
                            <p className="font-medium mb-1">📅 Tạo lời nhắc tự động</p>
                            <p className="text-gray-300">Tự động tạo task nhắc nhở liên hệ lead trong 24-48h, đảm bảo không bỏ sót cơ hội.</p>
                          </div>
                          <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900">Xem trước kết quả</h4>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAutoAssignTooltip('preview-section')}
                    onMouseLeave={() => setShowAutoAssignTooltip(null)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    {showAutoAssignTooltip === 'preview-section' && (
                      <div className="absolute left-0 top-6 z-50 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">👁️ Kiểm tra trước khi thực hiện</p>
                          <p className="text-gray-300">Xem thông tin tổng quan về số lượng leads sẽ được phân công và phân bổ dự kiến.</p>
                        </div>
                        <div className="absolute top-[-4px] left-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Tổng số leads: <span className="font-medium text-gray-900">{getPreviewData().totalLeads} leads</span></div>
                  <div>• Leads chưa phân công: <span className="font-medium text-gray-900">{getPreviewData().unassignedLeads} leads</span></div>
                  <div>• Nhân viên sales hoạt động: <span className="font-medium text-gray-900">{getPreviewData().activeSalesPeople} người</span></div>
                  <div>• Trung bình mỗi người: <span className="font-medium text-gray-900">{getPreviewData().avgLeadsPerPerson} leads</span></div>
                </div>
                
                {getPreviewData().unassignedLeads === 0 && (
                  <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-yellow-700 font-medium">Không có leads nào cần phân công!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAutoAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Get selected strategy from radio buttons
                  const strategyRadio = document.querySelector('input[name="strategy"]:checked') as HTMLInputElement
                  const strategy = strategyRadio?.value || 'balanced'
                  
                  // Get filter values
                  const filters = {
                    status: (document.querySelector('select[name="status"]') as HTMLSelectElement)?.value || '',
                    priority: (document.querySelector('select[name="priority"]') as HTMLSelectElement)?.value || '',
                    source: (document.querySelector('select[name="source"]') as HTMLSelectElement)?.value || '',
                    region: (document.querySelector('select[name="region"]') as HTMLSelectElement)?.value || ''
                  }
                  
                  // Perform auto assignment
                  const assignedCount = autoAssignLeads(strategy, filters)
                  
                  // Show success notification
                  setNotification({
                    message: `Đã phân công tự động ${assignedCount} leads thành công!`,
                    type: 'success'
                  })
                  setTimeout(() => setNotification(null), 3000)
                  setShowAutoAssignModal(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Thực hiện phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Chi tiết Lead - {selectedLead.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedLead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    selectedLead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                    selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    selectedLead.status === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                    selectedLead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                    selectedLead.status === 'lost' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusName(selectedLead.status)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowLeadDetailModal(false)
                    setIsAddingQuickNote(false)
                    setQuickNote('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin liên hệ */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Thông tin liên hệ</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedLead.name}</p>
                        <p className="text-xs text-gray-500">{selectedLead.company || 'Cá nhân'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{selectedLead.email}</p>
                        <p className="text-xs text-gray-500">Email</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin bán hàng */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Thông tin bán hàng</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{(selectedLead.value / 1000000).toFixed(1)}M VND</p>
                        <p className="text-xs text-gray-500">Giá trị dự kiến</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-900">{selectedLead.product}</p>
                        <p className="text-xs text-gray-500">Sản phẩm quan tâm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-900">{selectedLead.assignedTo || 'Chưa phân công'}</p>
                        <p className="text-xs text-gray-500">Người phụ trách</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin thời gian */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Thông tin thời gian & Chăm sóc</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{new Date(selectedLead.createdAt).toLocaleString('vi-VN')}</p>
                        <p className="text-xs text-gray-500">Ngày tạo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {selectedLead.lastContactedAt 
                            ? new Date(selectedLead.lastContactedAt).toLocaleString('vi-VN')
                            : 'Chưa liên hệ'
                          }
                        </p>
                        <p className="text-xs text-gray-500">Lần liên hệ cuối</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">{selectedLead.careCount || 0} lần</p>
                        <p className="text-xs text-gray-500">Số lần chăm sóc</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin khác */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Tags & Nguồn</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedLead.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tag === 'hot' ? 'bg-red-100 text-red-800' :
                            tag === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                            tag === 'cold' ? 'bg-blue-100 text-blue-800' :
                            tag === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nguồn: <span className="text-gray-900 font-medium">{selectedLead.source}</span></p>
                      <p className="text-xs text-gray-500">Khu vực: <span className="text-gray-900 font-medium">{selectedLead.region}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Ghi chú & Nội dung</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedLead.content || 'Không có nội dung'}</p>
                </div>
                {selectedLead.notes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-1">Ghi chú:</p>
                    <p className="text-sm text-blue-800">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Quick Notes */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 flex-1">Ghi chú nhanh</h4>
                  <button
                    onClick={() => setIsAddingQuickNote(true)}
                    className="ml-4 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 flex items-center gap-1"
                  >
                    <MessageSquarePlus className="w-3 h-3" />
                    Thêm ghi chú
                  </button>
                </div>

                {isAddingQuickNote && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <textarea
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="Nhập ghi chú nhanh về cuộc liên hệ, tình trạng khách hàng..."
                        className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleAddQuickNote}
                          disabled={!quickNote.trim()}
                          className="px-3 py-2 text-xs font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingQuickNote(false)
                            setQuickNote('')
                          }}
                          className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLead.quickNotes && selectedLead.quickNotes.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedLead.quickNotes.slice().reverse().map((note, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{note.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{new Date(note.timestamp).toLocaleString('vi-VN')}</span>
                              <span>•</span>
                              <span className="font-medium">{note.author}</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <MessageSquarePlus className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <MessageSquarePlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chưa có ghi chú nhanh nào</p>
                    <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm ghi chú" để bắt đầu theo dõi cuộc liên hệ</p>
                  </div>
                )}
              </div>

              {/* Next Action */}
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Hành động tiếp theo</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-900 font-medium">{selectedLead.nextAction}</p>
                  <p className="text-xs text-green-700 mt-1">
                    Dự kiến: {new Date(selectedLead.nextActionDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLeadDetailModal(false)
                  setIsAddingQuickNote(false)
                  setQuickNote('')
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowLeadDetailModal(false)
                  setIsAddingQuickNote(false)
                  setQuickNote('')
                  handleConvertLead(selectedLead)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Chuyển đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditLeadModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa Lead</h3>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault()
                handleUpdateLead(editingLead)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingLead.name}
                      onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={editingLead.email}
                      onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editingLead.phone}
                      onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Công ty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Công ty
                    </label>
                    <input
                      type="text"
                      value={editingLead.company || ''}
                      onChange={(e) => setEditingLead({...editingLead, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Nguồn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nguồn
                    </label>
                    <select
                      value={editingLead.source}
                      onChange={(e) => setEditingLead({...editingLead, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="website">Website</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google</option>
                      <option value="zalo">Zalo</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referral">Giới thiệu</option>
                    </select>
                  </div>

                  {/* Khu vực */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khu vực
                    </label>
                    <select
                      value={editingLead.region}
                      onChange={(e) => setEditingLead({...editingLead, region: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ha_noi">Hà Nội</option>
                      <option value="ho_chi_minh">TP. Hồ Chí Minh</option>
                      <option value="da_nang">Đà Nẵng</option>
                      <option value="hai_phong">Hải Phòng</option>
                      <option value="can_tho">Cần Thơ</option>
                    </select>
                  </div>

                  {/* Sản phẩm */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sản phẩm quan tâm
                    </label>
                    <input
                      type="text"
                      value={editingLead.product}
                      onChange={(e) => setEditingLead({...editingLead, product: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Độ ưu tiên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ ưu tiên
                    </label>
                    <select
                      value={editingLead.priority}
                      onChange={(e) => setEditingLead({...editingLead, priority: e.target.value as Lead['priority']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  {/* Giá trị dự kiến */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá trị dự kiến (VND)
                    </label>
                    <input
                      type="number"
                      value={editingLead.value}
                      onChange={(e) => setEditingLead({...editingLead, value: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Người phụ trách */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Người phụ trách
                    </label>
                    <select
                      value={editingLead.assignedTo}
                      onChange={(e) => setEditingLead({...editingLead, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chưa phân công</option>
                      {getAvailableSalesPersons().map(person => (
                        <option key={person.id} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nội dung */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <textarea
                    value={editingLead.content}
                    onChange={(e) => setEditingLead({...editingLead, content: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Ghi chú */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={editingLead.notes}
                    onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditLeadModal(false)
                      setEditingLead(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Cập nhật Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead Confirmation Modal */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận chuyển đổi</h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedLead.name}</h4>
                  <p className="text-sm text-gray-500">{selectedLead.company || 'Cá nhân'}</p>
                  <p className="text-lg font-semibold text-green-600">{(selectedLead.value / 1000000).toFixed(1)}M VND</p>
                </div>
              </div>

              {/* Product Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sản phẩm khách hàng mua <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  <option value="CRM Solution">CRM Solution</option>
                  <option value="Marketing Automation">Marketing Automation</option>
                  <option value="Sales Management">Sales Management</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Analytics Dashboard">Analytics Dashboard</option>
                  <option value="E-commerce Platform">E-commerce Platform</option>
                  <option value="Inventory Management">Inventory Management</option>
                  <option value="HR Management">HR Management</option>
                  <option value="Financial Management">Financial Management</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Customer Analytics">Customer Analytics</option>
                  <option value="Quality Management">Quality Management</option>
                  <option value="Education Platform">Education Platform</option>
                  <option value="Security System">Security System</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="IoT Solutions">IoT Solutions</option>
                </select>
                {!selectedProduct && (
                  <p className="mt-1 text-xs text-red-500">Vui lòng chọn sản phẩm trước khi chuyển đổi</p>
                )}
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-medium text-green-900 mb-2">Điều gì sẽ xảy ra:</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Lead được chuyển thành trạng thái "Đã chuyển đổi"</li>
                  <li>• Deal mới sẽ được tạo trong hệ thống</li>
                  <li>• Bắt đầu quy trình thực hiện dự án</li>
                  {selectedProduct && <li>• Sản phẩm: <span className="font-medium">{selectedProduct}</span></li>}
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn chuyển lead này thành khách hàng không?
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConvertModal(false)
                  setSelectedProduct('') // Reset product when closing modal
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmConvertLead}
                disabled={!selectedProduct}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2 ${
                  selectedProduct
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedProduct ? 'Xác nhận chuyển đổi' : 'Chọn sản phẩm để tiếp tục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
