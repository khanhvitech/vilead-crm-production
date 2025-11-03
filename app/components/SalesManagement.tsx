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
  XCircle,
  Activity,
  Bot,
  Table,
  LayoutGrid,
  HelpCircle,
  Download,
  Settings,
  X,
  Trash2,
  Edit,
  MessageSquarePlus,
  Send,
  Save,
  Columns,
  MapPin,
  Percent
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
  nextAction: string
  nextActionDate: string
  careCount?: number
  quickNotes?: Array<{
    content: string
    timestamp: string
    author: string
  }>
  // New fields for 23-column display
  address?: string
  customerType: 'individual' | 'business'
  winProbability?: number
  interactionCount: number
  lastInteractionAt: string | null
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
  const [activeTab, setActiveTab] = useState<'pipeline'>('pipeline')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false)
  const [isAutoAssignEnabled, setIsAutoAssignEnabled] = useState(false)
  const [autoAssignStrategy, setAutoAssignStrategy] = useState('round_robin')
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [showAutoAssignTooltip, setShowAutoAssignTooltip] = useState<string | null>(null)
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedPackages, setSelectedPackages] = useState<{[productId: string]: string}>({}) // Track package for each product
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedLead, setEditedLead] = useState<Lead | null>(null)
  const [showDragConvertModal, setShowDragConvertModal] = useState(false)
  const [dragTargetStatus, setDragTargetStatus] = useState<string>('')
  const [originalTargetStatus, setOriginalTargetStatus] = useState<string>('') // Track trạng thái gốc user kéo vào
  const [pendingDragLead, setPendingDragLead] = useState<Lead | null>(null)
  
  // Column visibility state
  // Sales team data
  const salesTeam = [
    { id: 1, name: 'Minh Expert', department: 'CRM Solutions', title: 'Senior Sales Expert', avatar: '👨‍💼', activeLeads: 12 },
    { id: 2, name: 'An Expert', department: 'Marketing Automation', title: 'Marketing Specialist', avatar: '👩‍💼', activeLeads: 8 },
    { id: 3, name: 'An Sales', department: 'Enterprise Sales', title: 'Enterprise Account Manager', avatar: '👨‍💼', activeLeads: 15 },
    { id: 4, name: 'Trần Văn Support', department: 'Customer Service', title: 'Customer Success Manager', avatar: '👩‍💼', activeLeads: 5 },
    { id: 5, name: 'Đỗ Thị Analytics', department: 'Data Analytics', title: 'Data Analyst', avatar: '👨‍💼', activeLeads: 7 },
    { id: 6, name: 'Lê Thị Inventory', department: 'Supply Chain', title: 'Supply Chain Manager', avatar: '👩‍💼', activeLeads: 6 },
    { id: 7, name: 'Nguyễn Văn HR', department: 'HR Solutions', title: 'HR Business Partner', avatar: '👨‍💼', activeLeads: 4 },
    { id: 8, name: 'Trần Thị Finance', department: 'Financial Services', title: 'Financial Consultant', avatar: '👩‍💼', activeLeads: 9 },
    { id: 9, name: 'Võ Văn Project', department: 'Project Management', title: 'Project Manager', avatar: '👨‍💼', activeLeads: 11 }
  ]

  // Task types for bulk creation
  const taskTypes = [
    { id: 'call', name: 'Gọi điện', icon: '📞', description: 'Liên hệ qua điện thoại', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'email', name: 'Gửi email', icon: '✉️', description: 'Gửi email tư vấn', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'zalo', name: 'Nhắn tin Zalo', icon: '💬', description: 'Liên hệ qua Zalo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'facebook', name: 'Nhắn Facebook', icon: '👥', description: 'Nhắn tin qua Facebook', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'followup', name: 'Follow-up', icon: '🔄', description: 'Theo dõi tình hình khách hàng', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'quote', name: 'Gửi báo giá', icon: '📄', description: 'Chuẩn bị và gửi báo giá', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'demo', name: 'Demo sản phẩm', icon: '🎯', description: 'Trình diễn sản phẩm', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'meeting', name: 'Hẹn gặp mặt', icon: '🤝', description: 'Sắp xếp cuộc hẹn trực tiếp', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { id: 'online', name: 'Meeting online', icon: '📹', description: 'Cuộc họp trực tuyến', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { id: 'contract', name: 'Chuẩn bị hợp đồng', icon: '📋', description: 'Soạn thảo hợp đồng', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'invoice', name: 'Gửi hóa đơn', icon: '💰', description: 'Xuất và gửi hóa đơn', color: 'bg-green-100 text-green-700 border-green-200' }
  ]

  // Available products and packages list (same as CustomersManagement)
  const availableProducts = [
    // Main Products
    { id: 'crm-basic', name: 'CRM Basic', category: 'Sản phẩm', price: 500000, description: 'Hệ thống CRM cơ bản cho doanh nghiệp nhỏ' },
    { id: 'crm-professional', name: 'CRM Professional', category: 'Sản phẩm', price: 1200000, description: 'Hệ thống CRM chuyên nghiệp với nhiều tính năng nâng cao' },
    { id: 'crm-enterprise', name: 'CRM Enterprise', category: 'Sản phẩm', price: 2500000, description: 'Hệ thống CRM doanh nghiệp với đầy đủ tính năng' },
    { id: 'ai-analytics', name: 'AI Analytics Module', category: 'Sản phẩm', price: 800000, description: 'Module phân tích dữ liệu với AI' },
    { id: 'marketing-automation', name: 'Marketing Automation', category: 'Sản phẩm', price: 600000, description: 'Tự động hóa marketing và email campaigns' },
    { id: 'sales-dashboard', name: 'Sales Dashboard Pro', category: 'Sản phẩm', price: 400000, description: 'Dashboard bán hàng chuyên nghiệp' },
    { id: 'mobile-app', name: 'Mobile App License', category: 'Sản phẩm', price: 300000, description: 'Giấy phép sử dụng ứng dụng di động' }
  ]

  // Available packages for each product
  const availablePackages = {
    'crm-basic': [
      { id: 'basic-standard', name: 'Gói Standard', price: 0, description: 'Sản phẩm cơ bản' },
      { id: 'basic-plus', name: 'Gói Plus', price: 200000, description: 'Thêm training cơ bản + support 3 tháng' },
      { id: 'basic-premium', name: 'Gói Premium', price: 500000, description: 'Thêm training + support 6 tháng + customization' }
    ],
    'crm-professional': [
      { id: 'pro-standard', name: 'Gói Standard', price: 0, description: 'Sản phẩm cơ bản' },
      { id: 'pro-plus', name: 'Gói Plus', price: 400000, description: 'Thêm AI Analytics + training nâng cao' },
      { id: 'pro-premium', name: 'Gói Premium', price: 800000, description: 'Thêm full modules + premium support 1 năm' }
    ],
    'crm-enterprise': [
      { id: 'ent-standard', name: 'Gói Standard', price: 0, description: 'Sản phẩm cơ bản' },
      { id: 'ent-plus', name: 'Gói Plus', price: 1000000, description: 'Thêm full training + migration service' },
      { id: 'ent-premium', name: 'Gói Premium', price: 2000000, description: 'Thêm custom development + premium support 2 năm' }
    ],
    'ai-analytics': [
      { id: 'ai-standard', name: 'Gói Standard', price: 0, description: 'Module cơ bản' },
      { id: 'ai-advanced', name: 'Gói Advanced', price: 300000, description: 'Thêm custom reports + training' }
    ],
    'marketing-automation': [
      { id: 'marketing-standard', name: 'Gói Standard', price: 0, description: 'Module cơ bản' },
      { id: 'marketing-pro', name: 'Gói Pro', price: 250000, description: 'Thêm email templates + analytics' }
    ],
    'sales-dashboard': [
      { id: 'dashboard-standard', name: 'Gói Standard', price: 0, description: 'Dashboard cơ bản' },
      { id: 'dashboard-pro', name: 'Gói Pro', price: 200000, description: 'Thêm custom widgets + real-time data' }
    ],
    'mobile-app': [
      { id: 'mobile-standard', name: 'Gói Standard', price: 0, description: 'License cơ bản' },
      { id: 'mobile-unlimited', name: 'Gói Unlimited', price: 150000, description: 'Unlimited users + premium features' }
    ]
  }

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('vi-VN').format(numAmount)
  }

  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    stt: true,
    customerName: true,
    phone: true,
    email: true,
    company: false,
    address: false,
    source: true,
    region: false,
    stage: true,
    product: false,
    customerType: false,
    salesOwner: true,
    tags: true,
    notes: false,
    createdDate: true,
    lastModified: false,
    interactionCount: false,
    lastInteraction: false,
    actions: true
  })
  
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [showEditLeadModal, setShowEditLeadModal] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [showAssignSalesModal, setShowAssignSalesModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [selectedTaskType, setSelectedTaskType] = useState('')
  const [selectedTaskObj, setSelectedTaskObj] = useState<any | null>(null)
  
  // Import states
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [importAutoAssign, setImportAutoAssign] = useState(false)
  const [importPreviewData, setImportPreviewData] = useState<any[]>([])
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [taskDeadlineDate, setTaskDeadlineDate] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0,10)
  })
  const [taskDeadlineTime, setTaskDeadlineTime] = useState<string>('09:00')
  const [taskExtraNote, setTaskExtraNote] = useState<string>('')
  const [salesSearchTerm, setSalesSearchTerm] = useState('')
  const [salesCurrentPage, setSalesCurrentPage] = useState(1)
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
    region: 'hanoi',
    product: '',
    content: '',
    notes: '',
    assignedTo: '',
    tags: [] as string[],
    customerType: 'individual' as 'individual' | 'business'
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
      // Ngăn không cho kéo từ trạng thái "Chuyển đổi thành công" 
      if (draggedLead.status === 'converted') {
        setNotification({
          message: `"${draggedLead.name}" đã hoàn tất chuyển đổi thành công, không thể di chuyển sang trạng thái khác!`,
          type: 'error'
        })
        setTimeout(() => setNotification(null), 3000)
        setDraggedLead(null)
        return
      }

      // Xử lý logic đặc biệt khi kéo vào "Chuyển đổi thành công"
      if (targetStatus === 'converted') {
        // Tự động chuyển về "Chờ thanh toán" thay vì "Chuyển đổi thành công"
        setPendingDragLead(draggedLead)
        setOriginalTargetStatus('converted') // Lưu trạng thái gốc
        setDragTargetStatus('payment_pending') // Tự động đặt về payment_pending
        setSelectedProducts([]) // Reset selected products
        setSelectedPackages({}) // Reset selected packages
        setShowDragConvertModal(true)
        return
      }

      // Kiểm tra xem có cần hiển thị popup chọn sản phẩm không
      const needProductSelection = (
        // Từ "Chờ thanh toán" kéo sang trạng thái khác (trừ lost)
        ((draggedLead.status as string) === 'payment_pending' && targetStatus !== 'lost') ||
        // Kéo vào "Chờ thanh toán" từ các trạng thái khác
        (targetStatus as string === 'payment_pending')
      )

      if (needProductSelection) {
        // Hiển thị popup chọn sản phẩm
        setPendingDragLead(draggedLead)
        setOriginalTargetStatus(targetStatus) // Lưu trạng thái gốc
        setDragTargetStatus(targetStatus)
        setSelectedProducts([]) // Reset selected products
        setSelectedPackages({}) // Reset selected packages
        setShowDragConvertModal(true)
      } else {
        // Chuyển trạng thái thông thường
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
    setEditedLead({...lead}) // Tạo bản copy để edit
    setShowLeadDetailModal(true)
    setIsAddingQuickNote(false)
    setQuickNote('')
    setIsEditMode(false) // Bắt đầu ở view mode
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
    setSelectedProduct('') // Reset single product selection
    setSelectedProducts([]) // Reset multiple products selection
    setSelectedPackages({}) // Reset package selection
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
    if (selectedProducts.length === 0) {
      setNotification({
        message: 'Vui lòng chọn ít nhất một sản phẩm khách hàng quan tâm trước khi chuyển đổi',
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
              status: 'payment_pending' as Lead['status'], // Chuyển vào chờ thanh toán
              stage: 'payment_pending',
              product: selectedProducts.join(', '), // Combine multiple products
              updatedAt: new Date().toISOString(),
              nextAction: 'Theo dõi thanh toán từ khách hàng'
            }
          : l
      )
      setLeads(updatedLeads)
      
      setNotification({
        message: `${selectedLead.name} đã chuyển vào "Chuyển đổi - chờ thanh toán" với ${selectedProducts.length} sản phẩm: "${selectedProducts.join(', ')}"!`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
    }
    setShowConvertModal(false)
    setSelectedLead(null)
    setSelectedProduct('')
    setSelectedProducts([]) // Reset multiple products selection
    setSelectedPackages({}) // Reset package selection
  }

  // Payment success handler
  const handlePaymentSuccess = (lead: Lead) => {
    const updatedLeads = leads.map(l => 
      l.id === lead.id 
        ? { 
            ...l, 
            status: 'converted' as Lead['status'],
            stage: 'deal_closed',
            updatedAt: new Date().toISOString(),
            nextAction: 'Bắt đầu thực hiện dự án'
          }
        : l
    )
    setLeads(updatedLeads)
    
    setNotification({
      message: `${lead.name} đã thanh toán thành công! Tự động chuyển sang "Chuyển đổi thành công".`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // Payment failed handler
  const handlePaymentFailed = (lead: Lead) => {
    const updatedLeads = leads.map(l => 
      l.id === lead.id 
        ? { 
            ...l, 
            status: 'lost' as Lead['status'],
            stage: 'payment_failed',
            updatedAt: new Date().toISOString(),
            nextAction: 'Phân tích nguyên nhân thất bại'
          }
        : l
    )
    setLeads(updatedLeads)
    
    setNotification({
      message: `${lead.name} thanh toán thất bại. Deal chuyển vào "Thất bại".`,
      type: 'error'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // Drag convert confirmation handler
  const confirmDragConvert = () => {
    if (selectedProducts.length === 0) {
      setNotification({
        message: 'Vui lòng chọn ít nhất một sản phẩm trước khi chuyển đổi',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (pendingDragLead) {
      let nextAction = 'Tiếp tục theo dõi'
      let stage = dragTargetStatus

      // Xác định next action và stage dựa vào target status
      if (dragTargetStatus === 'payment_pending') {
        nextAction = 'Theo dõi thanh toán từ khách hàng'
        stage = 'payment_pending'
      } else if (dragTargetStatus === 'converted') {
        nextAction = 'Bắt đầu thực hiện dự án'
        stage = 'deal_closed'
      }

      const updatedLeads = leads.map(l => 
        l.id === pendingDragLead.id 
          ? { 
              ...l, 
              status: dragTargetStatus as Lead['status'],
              stage: stage,
              product: selectedProducts.join(', '),
              updatedAt: new Date().toISOString(),
              nextAction: nextAction
            }
          : l
      )
      setLeads(updatedLeads)
      
      setNotification({
        message: `Đã chuyển "${pendingDragLead.name}" sang "${getStatusName(dragTargetStatus)}" với ${selectedProducts.length} sản phẩm!`,
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
    }

    // Reset states
    setShowDragConvertModal(false)
    setPendingDragLead(null)
    setDragTargetStatus('')
    setOriginalTargetStatus('')
    setSelectedProducts([])
    setSelectedPackages({})
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
      assignedTo: newLead.assignedTo || 'Minh Expert', // Mặc định cho người tạo nếu không chọn
      value: 0, // Bỏ ngân sách ước tính
      lastContactedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'lead',
      nextAction: 'Liên hệ lần đầu',
      nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      address: newLead.address?.trim() || '',
      customerType: 'business',
      winProbability: 50,
      interactionCount: 0,
      lastInteractionAt: null
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
      region: 'hanoi',
      product: '',

      content: '',
      notes: '',
      assignedTo: '', // Sẽ được set thành 'Minh Expert' khi submit
      tags: [],
      customerType: 'individual'
    })

    // Close modal and show success message
    setShowAddLeadModal(false)
    setNotification({
      message: `Lead "${leadToAdd.name}" đã được thêm thành công!`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }
  
  // Import Excel functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportError(null)
      setImportSuccess(null)
      setImportPreviewData([])
      setShowImportPreview(false)
      
      // Parse file để preview data
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          // Simulate parsing CSV data - trong thực tế sẽ dùng library như papaparse
          const csvContent = e.target?.result as string
          const lines = csvContent.split('\n')
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
            const previewRows = lines.slice(1, 6).map(line => { // Chỉ lấy 5 dòng đầu để preview
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
              const row: any = {}
              headers.forEach((header, index) => {
                row[header] = values[index] || ''
              })
              return row
            }).filter(row => Object.values(row).some(val => val !== ''))
            
            setImportPreviewData(previewRows)
          }
        } catch (error) {
          console.error('Error parsing file:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImportExcel = async () => {
    if (!importFile) {
      setImportError('Vui lòng chọn file Excel để import')
      return
    }

    // Check if preview data exists and validate field mapping
    if (importPreviewData.length === 0) {
      setImportError('Không có dữ liệu để import. Vui lòng kiểm tra file.')
      return
    }

    // Validate required fields in the data
    const requiredFields = ['Tên', 'Số điện thoại', 'Email']
    const headers = importPreviewData[0] || []
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      setImportError(`Thiếu các cột bắt buộc: ${missingFields.join(', ')}`)
      return
    }

    setImportProgress(0)
    setImportError(null)
    setImportSuccess(null)

    try {
      setImportProgress(30)
      
      setTimeout(() => {
        setImportProgress(60)
        
        // Process the actual preview data
        const dataRows = importPreviewData.slice(1) // Skip header row
        const validLeads: any[] = []
        
        dataRows.forEach((row, index) => {
          const leadData: any = {}
          headers.forEach((header: string, colIndex: number) => {
            leadData[header] = row[colIndex] || ''
          })
          
          // Validate required fields for each row
          if (leadData['Tên'] && leadData['Số điện thoại'] && leadData['Email']) {
            validLeads.push({
              name: leadData['Tên'],
              phone: leadData['Số điện thoại'],
              email: leadData['Email'].toLowerCase(),
              company: leadData['Công ty'] || '',
              source: 'excel_import',
              region: leadData['Khu vực'] || 'hanoi',
              product: leadData['Sản phẩm quan tâm'] || '',
              content: leadData['Nội dung'] || 'Import từ file Excel',
              position: leadData['Chức vụ'] || '',
              industry: leadData['Ngành nghề'] || '',
              companySize: leadData['Quy mô công ty'] || '',
              website: leadData['Website'] || '',
              address: leadData['Địa chỉ'] || '',
              customerType: leadData['Loại khách hàng'] || 'business',
              notes: leadData['Ghi chú'] || ''
            })
          }
        })
        
        if (validLeads.length === 0) {
          setImportError('Không có dữ liệu hợp lệ để import')
          setImportProgress(0)
          return
        }
        
        setImportProgress(90)
        
        // Convert to Lead format and add to leads list
        setTimeout(() => {
          // Determine who to assign leads to
          const defaultAssignee = importAutoAssign ? '' : 'Minh Expert' // Default to current user if not auto-assigning
          
          const newLeads: Lead[] = validLeads.map((leadData, index) => ({
            id: Date.now() + index,
            name: leadData.name,
            phone: leadData.phone,
            email: leadData.email,
            company: leadData.company,
            source: leadData.source,
            region: leadData.region,
            product: leadData.product,
            content: leadData.content,
            status: 'new',
            stage: 'Mới',
            notes: leadData.notes,
            assignedTo: defaultAssignee,
            value: 0,
            lastContactedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'lead',
            nextAction: 'Liên hệ lần đầu',
            nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            address: leadData.address,
            customerType: leadData.customerType,
            winProbability: 50,
            interactionCount: 0,
            lastInteractionAt: null,
            tags: ['excel-import']
          }))

          setLeads(prevLeads => [...newLeads, ...prevLeads])
          
          // Auto assign if selected
          if (importAutoAssign) {
            const assignmentCount = autoAssignLeads(autoAssignStrategy, {
              leadIds: newLeads.map(lead => lead.id)
            })
            setImportSuccess(`Đã import thành công ${newLeads.length} leads và phân công ${assignmentCount} leads tự động!`)
          } else {
            setImportSuccess(`Đã import thành công ${newLeads.length} leads và phân công cho Minh Expert!`)
          }
          
          setImportProgress(100)
          
          setTimeout(() => {
            setShowImportModal(false)
            setImportFile(null)
            setImportProgress(0)
            setImportSuccess(null)
            setImportAutoAssign(false)
            setImportPreviewData([])
            setShowImportPreview(false)
            const message = importAutoAssign 
              ? `Import thành công ${newLeads.length} leads từ Excel và đã phân công tự động!`
              : `Import thành công ${newLeads.length} leads từ Excel và phân công cho Minh Expert!`
            setNotification({
              message,
              type: 'success'
            })
            setTimeout(() => setNotification(null), 3000)
          }, 1500)
        }, 500)
      }, 1000)
    } catch (error) {
      setImportError('Đã xảy ra lỗi khi import file Excel')
      setImportProgress(0)
    }
  }

  const downloadTemplate = () => {
    // Template CSV khớp với các trường trong phần mềm
    const csvContent = [
      'Tên,Số điện thoại,Email,Công ty,Loại khách hàng,Chức vụ,Ngành nghề,Quy mô công ty,Website,Địa chỉ,Nguồn,Khu vực,Sản phẩm quan tâm,Nội dung,Ghi chú',
      'Nguyễn Văn A,0901234567,nguyenvana@email.com,Công ty ABC,business,CEO,technology,51-200,https://congtyabc.com,Hà Nội,website,hanoi,CRM Solution,Quan tâm giải pháp CRM,Khách hàng tiềm năng cao',
      'Trần Thị B,0907654321,tranthib@email.com,Công ty XYZ,business,Marketing Manager,marketing,11-50,https://companyxyz.vn,TP HCM,facebook,hcm,Marketing Automation,Cần tự động hóa marketing,Liên hệ trong tuần này',
      'Lê Văn C,0909876543,levanc@personal.com,,individual,,,,,Đà Nẵng,referral,danang,Website Development,Cần làm website cá nhân,Giới thiệu từ bạn bè'
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'lead_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
  
  // Bulk action handlers
  const confirmAssignSales = (salesPerson: { name: string }) => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, assignedTo: salesPerson.name } : l))
    setNotification({ message: `Đã gán ${salesPerson.name} cho ${selectedLeadIds.length} leads`, type: 'success' })
    setSelectedLeadIds([])
    setSelectAllChecked(false)
    setShowAssignSalesModal(false)
    setSalesSearchTerm('')
    setSalesCurrentPage(1)
    setTimeout(() => setNotification(null), 3000)
  }

  const confirmCreateTask = (
    taskType: { id: string, name: string, icon: string },
    deadlineDate?: string,
    deadlineTime?: string,
    extraNote?: string
  ) => {
    const now = new Date().toISOString()
    let deadlineText = ''
    if (deadlineDate) {
      const dt = deadlineTime ? `${deadlineDate}T${deadlineTime}:00` : `${deadlineDate}T09:00:00`
      try {
        const dd = new Date(dt)
        deadlineText = ` - Hạn: ${dd.toLocaleString('vi-VN')}`
      } catch (e) {
        deadlineText = ` - Hạn: ${deadlineDate} ${deadlineTime || ''}`
      }
    }

    setLeads(prev => prev.map(l => {
      if (!selectedLeadIds.includes(l.id)) return l
      const notes = Array.isArray(l.quickNotes) ? l.quickNotes : (l.quickNotes ? [l.quickNotes] : [])
      const noteContent = `${taskType.icon} ${taskType.name}${deadlineText}${extraNote ? ' - ' + extraNote : ''}`
      return {
        ...l,
        quickNotes: [...notes, { content: noteContent, timestamp: now, author: 'System' }],
        interactionCount: (l.interactionCount || 0) + 1,
        lastInteractionAt: now
      }
    }))
    setNotification({ message: `Đã tạo task "${taskType.name}" cho ${selectedLeadIds.length} leads`, type: 'success' })
    // reset selection and modal state
    setSelectedLeadIds([])
    setSelectAllChecked(false)
    setShowCreateTaskModal(false)
    setSelectedTaskType('')
    setSelectedTaskObj(null)
    setTaskExtraNote('')
    // reset deadline to default next day
    const nd = new Date(); nd.setDate(nd.getDate() + 1)
    setTaskDeadlineDate(nd.toISOString().slice(0,10))
    setTaskDeadlineTime('09:00')
    setTimeout(() => setNotification(null), 3000)
  }

  // Sales filtering and pagination
  const SALES_PER_PAGE = 6
  const filteredSalesTeam = salesTeam.filter(sales => 
    sales.name.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    sales.department.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    sales.title.toLowerCase().includes(salesSearchTerm.toLowerCase())
  )
  const totalSalesPages = Math.ceil(filteredSalesTeam.length / SALES_PER_PAGE)
  const paginatedSalesTeam = filteredSalesTeam.slice(
    (salesCurrentPage - 1) * SALES_PER_PAGE,
    salesCurrentPage * SALES_PER_PAGE
  )

  const getStatusName = (status: string) => {
    switch(status) {
      case 'new': return 'Lead mới';
      case 'contacted': return 'Đang tư vấn';
      case 'qualified': return 'Đã gửi ĐX';
      case 'negotiation': return 'Đàm phán';
      case 'payment_pending': return 'Chuyển đổi - chờ thanh toán';
      case 'converted': return 'Chuyển đổi thành công';
      case 'lost': return 'Thất bại';
      default: return status;
    }
  }

  const getStrategyName = (strategy: string) => {
    switch(strategy) {
      case 'round_robin': return 'Round-Robin (Phân đều)';
      case 'workload_based': return 'Theo khối lượng công việc';
      case 'territory_based': return 'Theo khu vực địa lý';
      case 'source_based': return 'Theo nguồn lead';
      case 'shift_based': return 'Theo ca làm việc';
      default: return strategy;
    }
  }
  
  // Search and filter states for leads
  const [leadSearchTerm, setLeadSearchTerm] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [leadRegionFilter, setLeadRegionFilter] = useState('all')
  const [leadSourceFilter, setLeadSourceFilter] = useState('all')
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  
  // Column labels for selector
  const columnLabels = {
    checkbox: '☐ Checkbox',
    stt: '# STT',
    customerName: '👤 Tên khách hàng',
    phone: '📱 Số điện thoại',
    email: '✉️ Email',
    company: '🏢 Công ty',
    address: '📍 Địa chỉ',
    source: '🌐 Nguồn',
    region: '🗺️ Khu vực',
    stage: '🎯 Giai đoạn',
    product: '🛍️ Sản phẩm quan tâm',
    customerType: '👥 Loại khách hàng',
    salesOwner: '👨‍💼 Sales phụ trách',
    tags: '🏷️ Tags/Nhãn',
    notes: '📝 Ghi chú',
    createdDate: '📅 Ngày tạo',
    lastModified: '🕐 Ngày cập nhật',
    interactionCount: '🔄 Số lần tương tác',
    lastInteraction: '⏰ Lần tương tác cuối',
    actions: '⚙️ Hành động'
  }
  
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

      nextAction: 'Ký hợp đồng',
      nextActionDate: '2024-01-25T10:00:00',
      careCount: 8,
      quickNotes: [
        { content: 'Gọi điện tư vấn ban đầu', timestamp: '2024-01-15T10:00:00', author: 'Minh Expert' },
        { content: 'Gửi brochure và báo giá sơ bộ', timestamp: '2024-01-16T14:00:00', author: 'Minh Expert' },
        { content: 'Họp demo sản phẩm với team kỹ thuật', timestamp: '2024-01-18T09:30:00', author: 'Minh Expert' },
        { content: 'Thảo luận về customization và integration', timestamp: '2024-01-19T15:00:00', author: 'Minh Expert' },
        { content: 'Gửi proposal chi tiết và timeline', timestamp: '2024-01-20T11:00:00', author: 'Minh Expert' }
      ],
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

      nextAction: 'Gửi báo giá chi tiết',
      nextActionDate: '2024-01-22T09:30:00',
      careCount: 5,
      quickNotes: [
        { content: 'Cuộc gọi đầu tiên - tìm hiểu nhu cầu', timestamp: '2024-01-16T13:00:00', author: 'An Expert' },
        { content: 'Gửi case study của các startup tương tự', timestamp: '2024-01-17T10:30:00', author: 'An Expert' },
        { content: 'Demo tính năng automation workflow', timestamp: '2024-01-18T14:00:00', author: 'An Expert' },
        { content: 'Thảo luận pricing và package phù hợp', timestamp: '2024-01-19T11:15:00', author: 'An Expert' }
      ],
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      customerType: 'business',
      winProbability: 60,
      interactionCount: 5,
      lastInteractionAt: '2024-01-19T16:45:00'
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
      ],
      address: '789 Trần Phú, Hải Châu, Đà Nẵng',
      customerType: 'business',
      winProbability: 90,
      interactionCount: 12,
      lastInteractionAt: '2024-01-19T10:15:00'
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

      nextAction: 'Gọi lại cho khách hàng',
      nextActionDate: '2024-01-20T15:00:00',
      address: '321 Cần Thơ, Ninh Kiều, Cần Thơ',
      customerType: 'business',
      winProbability: 45,
      interactionCount: 2,
      lastInteractionAt: '2024-01-18T09:30:00'
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

      nextAction: 'Liên hệ qua email',
      nextActionDate: '2024-01-24T10:00:00',
      careCount: 0,
      quickNotes: [],
      address: '555 Lê Duẩn, Hồng Bàng, Hải Phòng',
      customerType: 'business',
      winProbability: 25,
      interactionCount: 0,
      lastInteractionAt: null
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

      nextAction: 'Theo dõi phản hồi khách hàng',
      nextActionDate: '2024-01-21T09:00:00',
      address: '200 Lý Tự Trọng, Quận 1, TP.HCM',
      customerType: 'business',
      winProbability: 75,
      interactionCount: 6,
      lastInteractionAt: '2024-01-20T11:45:00'
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

      nextAction: 'Gửi hợp đồng mẫu',
      nextActionDate: '2024-07-01T10:00:00',
      address: '888 Nguyễn Văn Linh, Quận 7, TP.HCM',
      customerType: 'business',
      winProbability: 55,
      interactionCount: 4,
      lastInteractionAt: '2024-06-28T15:20:00'
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

      nextAction: 'Ký hợp đồng',
      nextActionDate: '2024-07-03T10:00:00',
      address: '99 Bạch Đằng, Hải Châu, Đà Nẵng',
      customerType: 'business',
      winProbability: 95,
      interactionCount: 7,
      lastInteractionAt: '2024-06-30T11:30:00'
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

      nextAction: 'Gửi tài liệu tham khảo',
      nextActionDate: '2024-07-02T10:00:00',
      address: '777 Giải Phóng, Đống Đa, Hà Nội',
      customerType: 'business',
      winProbability: 50,
      interactionCount: 3,
      lastInteractionAt: '2024-06-29T14:45:00'
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

      nextAction: 'Gửi email chào mừng',
      nextActionDate: '2024-07-03T10:00:00',
      address: '111 Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
      customerType: 'business',
      winProbability: 20,
      interactionCount: 0,
      lastInteractionAt: null
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

      nextAction: 'Theo dõi phản hồi từ board',
      nextActionDate: '2024-07-01T10:00:00',
      address: '456 Dien Bien Phu, Le Chan, Hai Phong',
      customerType: 'business',
      winProbability: 80,
      interactionCount: 9,
      lastInteractionAt: '2024-06-27T16:00:00'
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

      nextAction: 'Chuẩn bị tài liệu demo',
      nextActionDate: '2024-07-04T10:00:00',
      address: '789 Nguyen Hue, District 1, Ho Chi Minh City',
      customerType: 'business',
      winProbability: 65,
      interactionCount: 4,
      lastInteractionAt: '2024-06-28T10:20:00'
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

      nextAction: 'Đàm phán lại về giá',
      nextActionDate: '2024-07-05T10:00:00',
      address: '321 Bach Dang, Hai Chau, Da Nang',
      customerType: 'business',
      winProbability: 85,
      interactionCount: 11,
      lastInteractionAt: '2024-06-30T09:15:00'
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

      nextAction: 'Gửi thông tin khóa học',
      nextActionDate: '2024-07-06T10:00:00',
      address: '654 Tran Hung Dao, Ninh Kieu, Can Tho',
      customerType: 'business',
      winProbability: 40,
      interactionCount: 3,
      lastInteractionAt: '2024-06-29T11:00:00'
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

      nextAction: 'Triển khai hệ thống bảo mật',
      nextActionDate: '2024-07-07T10:00:00',
      address: '987 Kim Ma, Ba Dinh, Ha Noi',
      customerType: 'business',
      winProbability: 100,
      interactionCount: 15,
      lastInteractionAt: '2024-06-26T14:30:00'
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

      nextAction: 'Lên danh sách tính năng yêu cầu',
      nextActionDate: '2024-07-08T10:00:00',
      address: '123 Le Loi, District 1, Ho Chi Minh City',
      customerType: 'business',
      winProbability: 55,
      interactionCount: 6,
      lastInteractionAt: '2024-06-27T13:45:00'
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

      nextAction: 'Gửi khảo sát nhu cầu',
      nextActionDate: '2024-07-09T10:00:00',
      address: '456 Le Duan, Hong Bang, Hai Phong',
      customerType: 'business',
      winProbability: 35,
      interactionCount: 1,
      lastInteractionAt: '2024-06-30T08:00:00'
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

      nextAction: 'Đợi phản hồi kỹ thuật',
      nextActionDate: '2024-07-10T10:00:00',
      address: '789 Bach Dang, Hai Chau, Da Nang',
      customerType: 'business',
      winProbability: 70,
      interactionCount: 8,
      lastInteractionAt: '2024-06-28T16:30:00'
    },
    {
      id: 19,
      name: 'Nguyễn Văn T',
      phone: '0989012346',
      email: 'nguyenvant@email.com',
      source: 'website',
      region: 'ha_noi',
      product: 'CRM Solution',
      tags: ['cold', 'sme'],
      content: 'Tìm hiểu giải pháp CRM cho công ty nhỏ',
      status: 'lost',
      stage: 'lost_competitor',
      notes: 'Khách hàng chọn đối thủ cạnh tranh do giá rẻ hơn',
      assignedTo: 'Minh Expert',
      value: 15000000,
      lastContactedAt: '2024-06-25T14:00:00',
      createdAt: '2024-06-01T09:00:00',
      updatedAt: '2024-06-25T14:00:00',
      type: 'lead',
      company: 'ABC Small Co',

      nextAction: '',
      nextActionDate: '',
      address: '456 Cau Giay, Cau Giay, Ha Noi',
      customerType: 'business',
      winProbability: 0,
      interactionCount: 4,
      lastInteractionAt: '2024-06-25T14:00:00'
    },
    {
      id: 20,
      name: 'Phạm Thị Payment',
      phone: '0912345678',
      email: 'phamthipayment@email.com',
      source: 'google',
      region: 'ha_noi',
      product: 'CRM Premium',
      tags: ['hot', 'enterprise'],
      content: 'Đã ký hợp đồng, đang chờ thanh toán',
      status: 'negotiation',
      stage: 'waiting_payment',
      notes: 'Hợp đồng đã ký, khách hàng xác nhận thanh toán trong tuần',
      assignedTo: 'An Expert',
      value: 85000000,
      lastContactedAt: '2024-07-01T10:00:00',
      createdAt: '2024-05-15T08:30:00',
      updatedAt: '2024-07-01T10:00:00',
      type: 'lead',
      company: 'Premium Corp',
      nextAction: 'Theo dõi thanh toán',
      nextActionDate: '2024-07-05T09:00:00',
      address: '789 Ba Dinh, Ba Dinh, Ha Noi',
      customerType: 'business',
      winProbability: 95,
      interactionCount: 12,
      lastInteractionAt: '2024-07-01T10:00:00',
      quickNotes: [
        {
          content: 'Khách hàng đã ký hợp đồng và xác nhận thanh toán',
          timestamp: '2024-07-01T10:00:00',
          author: 'An Expert'
        }
      ]
    }
  ])

  // Calculate metrics with realistic previous month data
  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Calculate AI Suggestions count (hidden but kept for consistency)
    const calculateAISuggestions = () => {
      return 0 // Hidden feature
    }
    
    // Simulate previous month data (in real app, this would come from API)
    const previousMonthData = {
      totalLeads: 12, // Tháng trước có 12 leads
      conversionRate: 15, // Tỷ lệ chuyển đổi tháng trước 15%
      totalValue: 850000000 // Tổng giá trị dự kiến tháng trước: 850M VND
    }
    
    const currentData = {
      totalLeads: leads.length,
      conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
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
      negotiationLeads: leads.filter(l => l.status === 'negotiation').length,
      paymentPendingLeads: leads.filter(l => (l.status as string) === 'payment_pending').length,
      convertedLeads: leads.filter(l => l.status === 'converted').length,
      lostLeads: leads.filter(l => l.status === 'lost').length,
      totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
      hotLeads: leads.filter(l => l.tags.includes('hot')).length,
      avgDealSize: leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.value, 0) / leads.length) : 0
    }

    // Selection handlers for bulk actions (available while table is rendered)
    const handleToggleSelectLead = (id: number) => {
      setSelectedLeadIds(prev => {
        const exists = prev.includes(id)
        const next = exists ? prev.filter(x => x !== id) : [...prev, id]
        // update select-all checkbox state
        setSelectAllChecked(filteredLeads.length > 0 && next.length === filteredLeads.length)
        return next
      })
    }

    const handleToggleSelectAll = (checked: boolean) => {
      setSelectAllChecked(checked)
      if (checked) {
        setSelectedLeadIds(filteredLeads.map(l => l.id))
      } else {
        setSelectedLeadIds([])
      }
    }

    const handleAssignSalesQuick = () => {
      setShowAssignSalesModal(true)
    }

    const handleCreateTaskQuick = () => {
      setShowCreateTaskModal(true)
    }

    return (
      <div className="space-y-6">
        {/* Pipeline Flow - Show in both table and kanban view */}
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
              {/* 1. Lead mới - BẮT BUỘC */}
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
                          <p className="font-medium mb-1">🆕 Lead mới [BẮT BUỘC]</p>
                          <p>Giai đoạn bắt đầu - không thể xóa hay đổi tên.</p>
                          <p className="mt-1 text-gray-300">Tất cả lead mới sẽ vào đây.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">🆕</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Lead mới</p>
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

              {/* 2. Đang tư vấn - LINH ĐỘNG */}
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
                          <p className="font-medium mb-1">💬 Đang tư vấn [LINH ĐỘNG]</p>
                          <p>Có thể tùy chỉnh tên, màu sắc, xóa hoặc thêm giai đoạn.</p>
                          <p className="mt-1 text-gray-300">Đang tư vấn và tìm hiểu nhu cầu khách hàng.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">💬</span>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Đang tư vấn</p>
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

              {/* 3. Đã gửi ĐX - LINH ĐỘNG */}
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
                          <p className="font-medium mb-1">📄 Đã gửi ĐX [LINH ĐỘNG]</p>
                          <p>Có thể tùy chỉnh tên, màu sắc, xóa hoặc thêm giai đoạn.</p>
                          <p className="mt-1 text-gray-300">Đã gửi đề xuất/báo giá cho khách hàng.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">📄</span>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Đã gửi ĐX</p>
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

              {/* 4. Đàm phán - LINH ĐỘNG */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'negotiation' 
                    ? 'border-yellow-400 shadow-md ring-2 ring-yellow-200' 
                    : 'border-yellow-200'
                }`}
                onClick={() => handlePipelineStageClick('negotiation')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-negotiation')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-yellow-500 hover:text-yellow-600 cursor-help" />
                    {showTooltip === 'stage-negotiation' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">🤝 Đàm phán [LINH ĐỘNG]</p>
                          <p>Có thể tùy chỉnh tên, màu sắc, xóa hoặc thêm giai đoạn.</p>
                          <p className="mt-1 text-gray-300">Đang thảo luận về giá cả và điều kiện.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">🤝</span>
                </div>
                <div>
                  <p className="text-xs text-yellow-600 mb-1">Đàm phán</p>
                  <p className="text-lg font-bold text-yellow-900">{pipelineStats.negotiationLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-yellow-500">T.trước: 4</p>
                    <p className="text-xs text-red-600 font-medium">-25%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* 5. Chờ thanh toán - BẮT BUỘC */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'payment_pending' 
                    ? 'border-purple-400 shadow-md ring-2 ring-purple-200' 
                    : 'border-purple-200'
                }`}
                onClick={() => handlePipelineStageClick('payment_pending')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-payment')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-purple-500 hover:text-purple-600 cursor-help" />
                    {showTooltip === 'stage-payment' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">💳 Chuyển đổi - chờ thanh toán [BẮT BUỘC]</p>
                          <p>Quan trọng cho báo cáo dòng tiền - không thể xóa.</p>
                          <p className="mt-1 text-gray-300">Khách hàng đã đồng ý, đang chờ thanh toán.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">💳</span>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">Chuyển đổi - chờ thanh toán</p>
                  <p className="text-lg font-bold text-purple-900">{pipelineStats.paymentPendingLeads || 0}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-purple-500">T.trước: 1</p>
                    <p className="text-xs text-green-600 font-medium">+0%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* 6. Đã chốt - BẮT BUỘC */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'converted' 
                    ? 'border-green-400 shadow-md ring-2 ring-green-200' 
                    : 'border-green-200'
                }`}
                onClick={() => handlePipelineStageClick('converted')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-converted')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-green-500 hover:text-green-600 cursor-help" />
                    {showTooltip === 'stage-converted' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">✅ Chuyển đổi thành công [BẮT BUỘC]</p>
                          <p>Giai đoạn kết thúc thành công - không thể xóa.</p>
                          <p className="mt-1 text-gray-300">Deal thành công, đã nhận thanh toán.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">✅</span>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Chuyển đổi thành công</p>
                  <p className="text-lg font-bold text-green-900">{pipelineStats.convertedLeads}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-green-500">T.trước: 1</p>
                    <p className="text-xs text-green-600 font-medium">+100%</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>

              {/* 7. Thất bại - BẮT BUỘC */}
              <div 
                className={`flex-1 min-w-[110px] bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipelineStage === 'lost' 
                    ? 'border-red-400 shadow-md ring-2 ring-red-200' 
                    : 'border-red-200'
                }`}
                onClick={() => handlePipelineStageClick('lost')}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('stage-lost')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <HelpCircle className="w-3 h-3 text-red-500 hover:text-red-600 cursor-help" />
                    {showTooltip === 'stage-lost' && (
                      <div className="absolute right-0 top-5 z-10 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">❌ Thất bại [BẮT BUỘC]</p>
                          <p>Giai đoạn kết thúc không thành công - không thể xóa.</p>
                          <p className="mt-1 text-gray-300">Deal không thành công, phân tích nguyên nhân.</p>
                        </div>
                        <div className="absolute top-[-4px] right-3 w-2 h-2 bg-black transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-sm">❌</span>
                </div>
                <div>
                  <p className="text-xs text-red-600 mb-1">Thất bại</p>
                  <p className="text-lg font-bold text-red-900">{pipelineStats.lostLeads || 1}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-red-500">T.trước: 2</p>
                    <p className="text-xs text-green-600 font-medium">-50%</p>
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
                          <p>Tỷ lệ phần trăm leads đã chốt thành công trong pipeline 7 giai đoạn.</p>
                          <p className="mt-1 text-gray-300">Pipeline: Lead mới → Đang tư vấn → Đã gửi ĐX → Đàm phán → Chờ TT → Đã chốt → Thất bại</p>
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
                <option value="new">🆕 Lead mới</option>
                <option value="contacted">💬 Đang tư vấn</option>
                <option value="qualified">📄 Đã gửi ĐX</option>
                <option value="negotiation">🤝 Đàm phán</option>
                <option value="payment_pending">💳 Chuyển đổi - chờ thanh toán</option>
                <option value="converted">✅ Chuyển đổi thành công</option>
                <option value="lost">❌ Thất bại</option>
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
              
              
              <div className="relative">
                <button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 hover:text-indigo-800 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Columns className="w-4 h-4" />
                  Hiển thị cột
                </button>
                
                {showColumnSelector && (
                  <div className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]">
                    <h4 className="font-medium text-gray-900 mb-3">Chọn cột hiển thị</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                      {Object.entries(columnLabels).map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={visibleColumns[key as keyof typeof visibleColumns]}
                            onChange={(e) => setVisibleColumns(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="rounded border-gray-300"
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const allEnabled = Object.keys(visibleColumns).reduce((acc, key) => {
                              acc[key as keyof typeof visibleColumns] = true;
                              return acc;
                            }, {} as typeof visibleColumns);
                            setVisibleColumns(allEnabled);
                          }}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          ✅ Tất cả
                        </button>
                        <button
                          onClick={() => setVisibleColumns({
                            checkbox: true, stt: true, customerName: true, phone: true, email: true,
                            company: false, address: false, source: true, region: false, stage: true,
                            product: false,
                            customerType: false, salesOwner: true, tags: true, notes: false,
                            createdDate: true, lastModified: false, interactionCount: false,
                            lastInteraction: false, actions: true
                          })}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mặc định
                        </button>
                      </div>
                      <button
                        onClick={() => setShowColumnSelector(false)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setShowAutoAssignModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Bot className="w-4 h-4" />
                Phân leads tự động
              </button>
              
              <button 
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Import Excel
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
            {/* Bulk Actions Bar - Show when leads are selected */}
            {selectedLeadIds.length > 0 && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      Đã chọn {selectedLeadIds.length} leads
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLeadIds([])
                        setSelectAllChecked(false)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAssignSalesQuick}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <User className="w-4 h-4" />
                      Gán Sales nhanh
                    </button>
                    <button
                      onClick={handleCreateTaskQuick}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Tạo task nhanh
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto relative">
              <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {/* 1. Checkbox */}
                  {visibleColumns.checkbox && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 border-r border-gray-200">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectAllChecked}
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      />
                    </th>
                  )}
                  
                  {/* 2. STT */}
                  {visibleColumns.stt && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border-r border-gray-200">
                      STT
                    </th>
                  )}
                  
                  {/* 3. Tên khách hàng */}
                  {visibleColumns.customerName && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] border-r border-gray-200">
                      👤 Tên khách hàng
                    </th>
                  )}
                  
                  {/* 4. Số điện thoại */}
                  {visibleColumns.phone && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200">
                      📱 Số điện thoại
                    </th>
                  )}
                  
                  {/* 5. Email */}
                  {visibleColumns.email && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] border-r border-gray-200">
                      ✉️ Email
                    </th>
                  )}
                  
                  {/* 6. Công ty */}
                  {visibleColumns.company && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44 border-r border-gray-200">
                      🏢 Công ty
                    </th>
                  )}
                  
                  {/* 7. Địa chỉ */}
                  {visibleColumns.address && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] border-r border-gray-200">
                      📍 Địa chỉ
                    </th>
                  )}
                  
                  {/* 8. Nguồn */}
                  {visibleColumns.source && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200">
                      🌐 Nguồn
                    </th>
                  )}
                  
                  {/* 9. Khu vực */}
                  {visibleColumns.region && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200">
                      🗺️ Khu vực
                    </th>
                  )}
                  
                  {/* 10. Giai đoạn */}
                  {visibleColumns.stage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 border-r border-gray-200">
                      🎯 Giai đoạn
                    </th>
                  )}
                  
                  
                  {/* 14. Sản phẩm quan tâm */}
                  {visibleColumns.product && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">
                      🛍️ Sản phẩm quan tâm
                    </th>
                  )}
                  
                  {/* 15. Loại khách hàng */}
                  {visibleColumns.customerType && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200">
                      👥 Loại KH
                    </th>
                  )}
                  
                  {/* 16. Sales phụ trách */}
                  {visibleColumns.salesOwner && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">
                      👨‍💼 Sales phụ trách
                    </th>
                  )}
                  
                  {/* 17. Tags/Nhãn */}
                  {visibleColumns.tags && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">
                      🏷️ Tags
                    </th>
                  )}
                  
                  {/* 18. Ghi chú */}
                  {visibleColumns.notes && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] border-r border-gray-200">
                      📝 Ghi chú
                    </th>
                  )}
                  
                  {/* 19. Ngày tạo */}
                  {visibleColumns.createdDate && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 border-r border-gray-200">
                      📅 Ngày tạo
                    </th>
                  )}
                  
                  {/* 20. Ngày cập nhật */}
                  {visibleColumns.lastModified && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">
                      🕐 Cập nhật cuối
                    </th>
                  )}
                  
                  {/* 21. Số lần tương tác */}
                  {visibleColumns.interactionCount && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 border-r border-gray-200">
                      🔄 Tương tác
                    </th>
                  )}
                  
                  {/* 22. Lần tương tác cuối */}
                  {visibleColumns.lastInteraction && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">
                      ⏰ TT cuối cùng
                    </th>
                  )}
                  
                  {/* 23. Hành động */}
                  {visibleColumns.actions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-lg z-20 w-28">
                      ⚙️ Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className="group hover:bg-gray-50">
                    {/* 1. Checkbox */}
                    {visibleColumns.checkbox && (
                      <td className="px-3 py-4 whitespace-nowrap border-r border-gray-200">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={() => handleToggleSelectLead(lead.id)}
                        />
                      </td>
                    )}
                    
                    {/* 2. STT */}
                    {visibleColumns.stt && (
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200 text-center">
                        {index + 1}
                      </td>
                    )}
                    
                    {/* 3. Tên khách hàng */}
                    {visibleColumns.customerName && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="cursor-pointer" onClick={() => handleViewLeadDetail(lead)}>
                          <div className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">
                            {lead.name}
                          </div>
                        </div>
                      </td>
                    )}
                    
                    {/* 4. Số điện thoại */}
                    {visibleColumns.phone && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                      </td>
                    )}
                    
                    {/* 5. Email */}
                    {visibleColumns.email && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900 truncate max-w-48" title={lead.email}>
                          {lead.email}
                        </div>
                      </td>
                    )}
                    
                    {/* 6. Công ty */}
                    {visibleColumns.company && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900 truncate max-w-44" title={lead.company}>
                          {lead.company || '-'}
                        </div>
                      </td>
                    )}
                    
                    {/* 7. Địa chỉ */}
                    {visibleColumns.address && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900 truncate max-w-48" title={lead.address}>
                          {lead.address || '-'}
                        </div>
                      </td>
                    )}
                    
                    {/* 8. Nguồn */}
                    {visibleColumns.source && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          lead.source === 'facebook' ? 'bg-blue-100 text-blue-800' :
                          lead.source === 'google' ? 'bg-red-100 text-red-800' :
                          lead.source === 'website' ? 'bg-green-100 text-green-800' :
                          lead.source === 'zalo' ? 'bg-blue-100 text-blue-800' :
                          lead.source === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                          lead.source === 'referral' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.source === 'facebook' ? '👥 Facebook' :
                           lead.source === 'google' ? '🔍 Google' :
                           lead.source === 'website' ? '🌐 Website' :
                           lead.source === 'zalo' ? '💬 Zalo' :
                           lead.source === 'linkedin' ? '💼 LinkedIn' :
                           lead.source === 'referral' ? '👤 Referral' : 
                           '👆 ' + lead.source}
                        </span>
                      </td>
                    )}
                    
                    {/* 9. Khu vực */}
                    {visibleColumns.region && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900">
                          {lead.region === 'ha_noi' ? 'Hà Nội' : 
                           lead.region === 'ho_chi_minh' ? 'TP.HCM' : 
                           lead.region === 'da_nang' ? 'Đà Nẵng' : 
                           lead.region === 'can_tho' ? 'Cần Thơ' : 
                           lead.region === 'hai_phong' ? 'Hải Phòng' : lead.region}
                        </div>
                      </td>
                    )}
                    
                    {/* 10. Giai đoạn */}
                    {visibleColumns.stage && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'proposal' ? 'bg-orange-100 text-orange-800' :
                          lead.status === 'negotiation' ? 'bg-indigo-100 text-indigo-800' :
                          lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                          lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status === 'new' ? '🆕 Lead mới' :
                           lead.status === 'contacted' ? '� Đang tư vấn' :
                           lead.status === 'qualified' ? '� Đã gửi ĐX' :
                           lead.status === 'proposal' ? '🤝 Đàm phán' :
                           lead.status === 'negotiation' ? '� Chờ thanh toán' :
                           lead.status === 'converted' ? '✅ Đã chốt' :
                           lead.status === 'lost' ? '❌ Thất bại' : '📋 Khác'}
                        </span>
                      </td>
                    )}
                    
                    {/* 14. Sản phẩm quan tâm */}
                    {visibleColumns.product && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900 truncate max-w-40" title={lead.product}>
                          {lead.product}
                        </div>
                      </td>
                    )}
                    
                    {/* 15. Loại khách hàng */}
                    {visibleColumns.customerType && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          lead.customerType === 'business' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.customerType === 'business' ? '🏢 Doanh nghiệp' : '👤 Cá nhân'}
                        </span>
                      </td>
                    )}
                    
                    {/* 16. Sales phụ trách */}
                    {visibleColumns.salesOwner && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          <div className="text-sm text-gray-900 truncate max-w-32">
                            {lead.assignedTo || 'Chưa phân công'}
                          </div>
                        </div>
                      </td>
                    )}
                    
                    {/* 17. Tags/Nhãn */}
                    {visibleColumns.tags && (
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
                              {tag === 'hot' ? '🔴 Hot' :
                               tag === 'warm' ? 'Warm' :
                               tag === 'cold' ? 'Cold' :
                               tag === 'enterprise' ? '👑 Enterprise' :
                               tag === 'sme' ? '⭐ SME' : tag}
                            </span>
                          ))}
                          {lead.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{lead.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                    )}
                    
                    {/* 18. Ghi chú */}
                    {visibleColumns.notes && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900 truncate max-w-48" title={lead.content}>
                          {lead.content.length > 50 ? `${lead.content.substring(0, 50)}...` : lead.content}
                        </div>
                      </td>
                    )}
                    
                    {/* 19. Ngày tạo */}
                    {visibleColumns.createdDate && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900">
                          {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                    )}
                    
                    {/* 20. Ngày cập nhật */}
                    {visibleColumns.lastModified && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="text-sm text-gray-900">
                          {new Date(lead.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(lead.updatedAt).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                    )}
                    
                    {/* 21. Số lần tương tác */}
                    {visibleColumns.interactionCount && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.interactionCount}
                        </div>
                      </td>
                    )}
                    
                    {/* 22. Lần tương tác cuối */}
                    {visibleColumns.lastInteraction && (
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        {lead.lastInteractionAt ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(lead.lastInteractionAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className={`text-xs ${
                              Math.floor((Date.now() - new Date(lead.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24)) > 7
                                ? 'text-red-500' : 
                              Math.floor((Date.now() - new Date(lead.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24)) > 3
                                ? 'text-orange-500' : 'text-green-500'
                            }`}>
                              {Math.floor((Date.now() - new Date(lead.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Chưa tương tác</span>
                        )}
                      </td>
                    )}
                    
                    {/* 23. Hành động */}
                    {visibleColumns.actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white group-hover:bg-gray-50 shadow-lg z-10">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleViewLeadDetail(lead)}
                            className="p-2 text-slate-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                            title="Xem chi tiết & Chỉnh sửa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleConvertLead(lead)}
                            className="p-2 text-slate-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                            title="Chuyển đổi thành khách hàng"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 h-[calc(100vh-400px)]">
              {['new', 'contacted', 'qualified', 'negotiation', 'payment_pending', 'converted', 'lost'].map((status) => {
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
                      draggedLead && draggedLead.status !== status ? 
                        (status === 'converted' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200') 
                        : ''
                    }`}>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'new' ? 'bg-gray-500' :
                          status === 'contacted' ? 'bg-blue-500' :
                          status === 'qualified' ? 'bg-green-500' :
                          status === 'negotiation' ? 'bg-yellow-500' :
                          status === 'payment_pending' ? 'bg-purple-500' :
                          status === 'converted' ? 'bg-green-600' :
                          'bg-red-500'
                        }`}></span>
                        <h3 className="font-medium text-gray-900">
                          {getStatusName(status)}
                          {status === 'converted' && (
                            <span className="text-xs text-gray-500 ml-1">(Tự động)</span>
                          )}
                        </h3>
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
                              className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                                lead.status === 'converted' 
                                  ? 'cursor-not-allowed border-green-300 bg-green-50' 
                                  : 'cursor-move'
                              } ${
                                draggedLead?.id === lead.id ? 'opacity-50 rotate-2 scale-105' : 'hover:scale-102'
                              }`}
                              draggable={lead.status !== 'converted'}
                              title={lead.status === 'converted' ? 'Lead đã chuyển đổi thành công, không thể di chuyển' : ''}
                              onDragStart={(e) => {
                                if (lead.status === 'converted') {
                                  e.preventDefault()
                                  return
                                }
                                handleDragStart(e, lead)
                              }}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="space-y-2">
                                {/* Lead Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                                    {lead.company && (
                                      <p className="text-xs text-gray-500">{lead.company}</p>
                                    )}
                                  </div>
                                  {lead.status === 'converted' && (
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Hoàn tất
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Sản phẩm quan tâm */}
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Sản phẩm quan tâm:</p>
                                  <p className="text-sm text-gray-900 font-medium">{lead.product}</p>
                                </div>
                                
                                {/* Contact Info */}
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </p>
                                </div>
                                
                                {/* Source & Region */}
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p><span className="font-medium">Nguồn:</span> {lead.source}</p>
                                  <p><span className="font-medium">Khu vực:</span> {lead.region}</p>
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
                                      className="p-1.5 text-slate-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                      title="Xem chi tiết & Chỉnh sửa"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    {/* Hiển thị buttons khác nhau tùy theo status */}
                                    {(lead.status as string) === 'payment_pending' ? (
                                      <>
                                        <button 
                                          onClick={() => handlePaymentSuccess(lead)}
                                          className="p-1.5 text-slate-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                          title="Thanh toán thành công"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handlePaymentFailed(lead)}
                                          className="p-1.5 text-slate-600 hover:text-white hover:bg-red-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                          title="Thanh toán thất bại"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : lead.status !== 'converted' && lead.status !== 'lost' ? (
                                      <button 
                                        onClick={() => handleConvertLead(lead)}
                                        className="p-1.5 text-slate-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                                        title="Chuyển đổi thành khách hàng"
                                      >
                                        <User className="w-3.5 h-3.5" />
                                      </button>
                                    ) : null}
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
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-4">            {[
                { id: 'pipeline', name: 'Leads & Pipeline', count: leads.length, icon: <Activity className="w-4 h-4" /> }
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
        <div className="p-4">
          {renderPipeline()}
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
                            <li>• Tự động phân công cho người tạo</li>
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
              {/* Customer Type Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Loại khách hàng
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="customerType"
                      value="individual"
                      checked={newLead.customerType === 'individual'}
                      onChange={(e) => setNewLead(prev => ({ 
                        ...prev, 
                        customerType: e.target.value as 'individual' | 'business',
                        company: '', // Clear company info when switching to individual
                        industry: '',
                        companySize: '',
                        website: ''
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">👤 Cá nhân</div>
                      <div className="text-xs text-gray-500">Khách hàng cá nhân</div>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="customerType"
                      value="business"
                      checked={newLead.customerType === 'business'}
                      onChange={(e) => setNewLead(prev => ({ ...prev, customerType: e.target.value as 'individual' | 'business' }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">🏢 Công ty</div>
                      <div className="text-xs text-gray-500">Khách hàng doanh nghiệp</div>
                    </div>
                  </label>
                </div>
              </div>

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

              {/* Company Information - Only show for business customers */}
              {newLead.customerType === 'business' && (
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
              )}

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
                  
                  <div className="md:col-span-2">
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
                              <p className="text-gray-300">Mặc định phân công cho người tạo. Có thể chọn người khác hoặc để trống để phân công tự động sau.</p>
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
                      <option value="">Mặc định (Minh Expert - người tạo)</option>
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
                    <select
                      value={newLead.product}
                      onChange={(e) => setNewLead(prev => ({ ...prev, product: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn sản phẩm...</option>
                      <option value="CRM Solution">CRM Solution - Quản lý khách hàng</option>
                      <option value="ERP System">ERP System - Quản lý tài nguyên doanh nghiệp</option>
                      <option value="Website Development">Website Development - Phát triển website</option>
                      <option value="E-commerce Platform">E-commerce Platform - Nền tảng thương mại điện tử</option>
                      <option value="Mobile Application">Mobile Application - Ứng dụng di động</option>
                      <option value="Marketing Automation">Marketing Automation - Tự động hóa marketing</option>
                      <option value="Data Analytics">Data Analytics - Phân tích dữ liệu</option>
                      <option value="Cloud Services">Cloud Services - Dịch vụ đám mây</option>
                      <option value="AI/ML Solutions">AI/ML Solutions - Giải pháp trí tuệ nhân tạo</option>
                      <option value="Cybersecurity">Cybersecurity - An ninh mạng</option>
                      <option value="Digital Transformation">Digital Transformation - Chuyển đổi số</option>
                      <option value="Custom Software">Custom Software - Phần mềm tùy chỉnh</option>
                      <option value="Consulting Services">Consulting Services - Dịch vụ tư vấn</option>
                      <option value="Training & Support">Training & Support - Đào tạo và hỗ trợ</option>
                      <option value="Other">Khác</option>
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
                  }</div>
                  <div><strong>Phân công cho:</strong> {newLead.assignedTo || 'Minh Expert (người tạo)'}</div>
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
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[95vw] mx-4 max-h-[90vh] overflow-y-auto">
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
              {/* Auto-assign Toggle */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Trạng thái hệ thống</h4>
                    <p className="text-xs text-gray-600 mt-1">Bật/tắt chế độ phân leads tự động</p>
                  </div>
                  <button
                    onClick={() => setIsAutoAssignEnabled(!isAutoAssignEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isAutoAssignEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isAutoAssignEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className={`text-sm ${isAutoAssignEnabled ? 'text-green-700' : 'text-gray-600'}`}>
                  {isAutoAssignEnabled ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>🟢 Đang hoạt động - Leads mới sẽ được phân tự động</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>⭕ Đã tạm dừng - Leads mới sẽ chờ phân thủ công</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategy Selection - Only show when enabled */}
              {isAutoAssignEnabled && (
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
                        <p className="font-medium">💡 Gợi ý chọn strategy:</p>
                        <ul className="mt-1 space-y-1">
                          <li>• <strong>Team mới:</strong> Round-Robin (phân đều)</li>
                          <li>• <strong>Có chuyên gia:</strong> Territory/Source-based</li>
                          <li>• <strong>Cân bằng workload:</strong> Workload-based</li>
                          <li>• <strong>Leads chất lượng cao:</strong> Score-based</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Round-Robin Strategy */}
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="round_robin" 
                        className="mt-1"
                        checked={autoAssignStrategy === 'round_robin'}
                        onChange={(e) => setAutoAssignStrategy(e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">🔄 Round-Robin (Phân đều theo vòng tròn)</div>
                        <p className="text-xs text-gray-600 mt-1">Phân leads lần lượt cho từng sales theo thứ tự, đảm bảo công bằng</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Ưu điểm:</strong> Công bằng, đơn giản | <strong>Nhược điểm:</strong> Không xét kỹ năng
                        </div>
                      </div>
                    </label>

                    {/* Workload-based Strategy */}
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="workload_based" 
                        className="mt-1"
                        checked={autoAssignStrategy === 'workload_based'}
                        onChange={(e) => setAutoAssignStrategy(e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">⚖️ Workload-based (Theo khối lượng công việc)</div>
                        <p className="text-xs text-gray-600 mt-1">Ưu tiên gán cho sales đang xử lý ít leads nhất</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Ưu điểm:</strong> Cân bằng workload | <strong>Nhược điểm:</strong> Phức tạp hơn
                        </div>
                      </div>
                    </label>

                    {/* Territory-based Strategy */}
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="territory_based" 
                        className="mt-1"
                        checked={autoAssignStrategy === 'territory_based'}
                        onChange={(e) => setAutoAssignStrategy(e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">🗺️ Territory-based (Theo khu vực địa lý)</div>
                        <p className="text-xs text-gray-600 mt-1">Phân theo tỉnh/thành phố mà sales phụ trách</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Ưu điểm:</strong> Chuyên môn khu vực | <strong>Nhược điểm:</strong> Cần setup territory
                        </div>
                      </div>
                    </label>

                    {/* Source-based Strategy */}
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="source_based" 
                        className="mt-1"
                        checked={autoAssignStrategy === 'source_based'}
                        onChange={(e) => setAutoAssignStrategy(e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">🌐 Source-based (Theo nguồn lead)</div>
                        <p className="text-xs text-gray-600 mt-1">Phân theo kênh/nguồn mà lead đến (Facebook, Google, Website...)</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Ưu điểm:</strong> Chuyên môn kênh | <strong>Nhược điểm:</strong> Cần sales chuyên biệt
                        </div>
                      </div>
                    </label>

                    {/* Shift-based Strategy */}
                    <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strategy" 
                        value="shift_based" 
                        className="mt-1"
                        checked={autoAssignStrategy === 'shift_based'}
                        onChange={(e) => setAutoAssignStrategy(e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">⏰ Shift-based (Theo ca làm việc)</div>
                        <p className="text-xs text-gray-600 mt-1">Chỉ phân cho sales đang trong ca, queue ngoài giờ</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Ưu điểm:</strong> Response nhanh | <strong>Nhược điểm:</strong> Queue ngoài giờ
                        </div>
                      </div>
                    </label>

                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <h4 className="text-sm font-medium text-yellow-800">Trạng thái hiện tại</h4>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>• Hệ thống: <strong>{isAutoAssignEnabled ? 'ĐANG HOẠT ĐỘNG' : 'TẠM DỪNG'}</strong></div>
                  <div>• Chiến lược: <strong>{getStrategyName(autoAssignStrategy)}</strong></div>
                  <div>• Leads đang chờ phân: <strong>{leads.filter(l => !l.assignedTo).length} leads</strong></div>
                  <div>• Sales có sẵn: <strong>{getAvailableSalesPersons().filter(s => s.currentLeads < 20).length}/{getAvailableSalesPersons().length} người</strong></div>
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Chỉnh sửa Lead' : 'Chi tiết Lead'} - {selectedLead.name}
                  </h3>
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
                <div className="flex items-center gap-2">
                  {!isEditMode ? (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Save changes logic here
                          setIsEditMode(false)
                        }}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setEditedLead({...selectedLead}) // Reset về giá trị ban đầu
                          setIsEditMode(false)
                        }}
                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowLeadDetailModal(false)
                      setIsAddingQuickNote(false)
                      setQuickNote('')
                      setIsEditMode(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selectedLead.name}</p>
                        <p className="text-xs text-gray-500">{selectedLead.company || 'Cá nhân'}</p>
                        {isEditMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Tên không thể thay đổi
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        {isEditMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Số điện thoại không thể thay đổi
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{selectedLead.email}</p>
                        <p className="text-xs text-gray-500">Email</p>
                        {isEditMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Email không thể thay đổi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin bán hàng */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Thông tin bán hàng</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        {isEditMode ? (
                          <select
                            value={editedLead?.product || ''}
                            onChange={(e) => setEditedLead(prev => prev ? {...prev, product: e.target.value} : null)}
                            className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          >
                            <option value="">Chọn sản phẩm</option>
                            <option value="CRM Premium">CRM Premium</option>
                            <option value="CRM Enterprise">CRM Enterprise</option>
                            <option value="Marketing Automation">Marketing Automation</option>
                            <option value="Sales Analytics">Sales Analytics</option>
                            <option value="Custom Solution">Custom Solution</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{selectedLead.product}</p>
                        )}
                        <p className="text-xs text-gray-500">Sản phẩm quan tâm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-500" />
                      <div className="flex-1">
                        {isEditMode ? (
                          <select
                            value={editedLead?.assignedTo || ''}
                            onChange={(e) => setEditedLead(prev => prev ? {...prev, assignedTo: e.target.value} : null)}
                            className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          >
                            <option value="">Chưa phân công</option>
                            {salesTeam.map(member => (
                              <option key={member.id} value={member.name}>{member.name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{selectedLead.assignedTo || 'Chưa phân công'}</p>
                        )}
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
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Tags, Nguồn & Khu vực</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Tags</p>
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {['hot', 'warm', 'cold', 'enterprise', 'potential', 'follow-up'].map((tag) => (
                              <label key={tag} className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editedLead?.tags?.includes(tag) || false}
                                  onChange={(e) => {
                                    if (!editedLead) return;
                                    const currentTags = editedLead.tags || [];
                                    const newTags = e.target.checked 
                                      ? [...currentTags, tag]
                                      : currentTags.filter(t => t !== tag);
                                    setEditedLead({...editedLead, tags: newTags});
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  tag === 'hot' ? 'bg-red-100 text-red-800' :
                                  tag === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                                  tag === 'cold' ? 'bg-blue-100 text-blue-800' :
                                  tag === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {tag}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nguồn</p>
                      {isEditMode ? (
                        <select
                          value={editedLead?.source || ''}
                          onChange={(e) => setEditedLead(prev => prev ? {...prev, source: e.target.value} : null)}
                          className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        >
                          <option value="">Chọn nguồn</option>
                          <option value="Website">Website</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Google Ads">Google Ads</option>
                          <option value="Referral">Referral</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Event">Event</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="text-gray-900 font-medium">{selectedLead.source}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Khu vực</p>
                      {isEditMode ? (
                        <select
                          value={editedLead?.region || ''}
                          onChange={(e) => setEditedLead(prev => prev ? {...prev, region: e.target.value} : null)}
                          className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        >
                          <option value="">Chọn khu vực</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="TP.HCM">TP.HCM</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Hải Phòng">Hải Phòng</option>
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <span className="text-gray-900 font-medium">{selectedLead.region}</span>
                      )}
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

              {/* Interaction History */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 flex-1">Lịch sử tương tác</h4>
                  <button
                    onClick={() => setIsAddingQuickNote(true)}
                    className="ml-4 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 flex items-center gap-1"
                  >
                    <MessageSquarePlus className="w-3 h-3" />
                    Thêm tương tác
                  </button>
                </div>

                {isAddingQuickNote && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <textarea
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="Ghi lại nội dung tương tác với khách hàng (cuộc gọi, email, meeting...)..."
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                    <p className="text-sm text-gray-500">Chưa có lịch sử tương tác nào</p>
                    <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm tương tác" để ghi lại cuộc liên hệ với khách hàng</p>
                  </div>
                )}
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

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Import Leads từ Excel</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportError(null)
                    setImportSuccess(null)
                    setImportProgress(0)
                    setImportAutoAssign(false)
                    setImportPreviewData([])
                    setShowImportPreview(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">Tải template Excel</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Tải file mẫu để đảm bảo định dạng đúng cho việc import leads
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                    >
                      Tải template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file Excel (.xlsx, .xls, .csv)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {importFile && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      Đã chọn: {importFile.name}
                    </p>
                    {importPreviewData.length > 0 && (
                      <button
                        onClick={() => setShowImportPreview(!showImportPreview)}
                        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {showImportPreview ? 'Ẩn dữ liệu' : 'Xem dữ liệu'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Data Preview */}
              {showImportPreview && importPreviewData.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview dữ liệu ({importPreviewData.length} dòng đầu)
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {Object.keys(importPreviewData[0] || {}).map(header => (
                            <th key={header} className="px-2 py-1 text-left font-medium text-gray-700 border">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreviewData.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.values(row).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 border text-gray-600">
                                {value || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    💡 <strong>Lưu ý:</strong> Đảm bảo các cột trong file Excel khớp với template để import thành công.
                  </div>
                </div>
              )}

              {/* Auto Assignment Option */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="importAutoAssign"
                    checked={importAutoAssign}
                    onChange={(e) => setImportAutoAssign(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <label htmlFor="importAutoAssign" className="font-medium text-purple-900 cursor-pointer">
                      Phân công tự động sau khi import
                    </label>
                    <p className="text-sm text-purple-700 mt-1">
                      Leads sẽ được phân công tự động cho sales team theo chiến lược đã chọn ({autoAssignStrategy === 'round_robin' ? 'Luân phiên' : 
                      autoAssignStrategy === 'workload_based' ? 'Theo khối lượng công việc' :
                      autoAssignStrategy === 'territory_based' ? 'Theo vùng địa lý' :
                      autoAssignStrategy === 'source_based' ? 'Theo nguồn lead' :
                      autoAssignStrategy === 'shift_based' ? 'Theo ca làm việc' : 'Luân phiên'})
                    </p>
                    <p className="text-sm text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded">
                      💡 <strong>Lưu ý:</strong> Nếu không chọn, tất cả leads sẽ được phân công mặc định cho người thực hiện import
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {importProgress > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Đang import...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{importError}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {importSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{importSuccess}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn import:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• File phải có các cột: Tên, Số điện thoại, Email, Công ty</li>
                  <li>• Định dạng file hỗ trợ: .xlsx, .xls, .csv</li>
                  <li>• Dòng đầu tiên là tiêu đề cột</li>
                  <li>• Email phải có định dạng hợp lệ</li>
                  <li>• Số điện thoại phải từ 8-15 ký tự</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportError(null)
                  setImportSuccess(null)
                  setImportProgress(0)
                  setImportAutoAssign(false)
                  setImportPreviewData([])
                  setShowImportPreview(false)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleImportExcel}
                disabled={!importFile || importProgress > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importProgress > 0 ? 'Đang import...' : 'Import'}
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
              <h3 className="text-lg font-semibold text-gray-900">Chuyển vào chuyển đổi - chờ thanh toán</h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedLead.name}</h4>
                  <p className="text-sm text-gray-500">{selectedLead.company || 'Cá nhân'}</p>
                </div>
              </div>

              {/* Product Selection - with Packages */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn sản phẩm & gói sản phẩm <span className="text-red-500">*</span>
                </label>
                <div className="max-h-80 overflow-y-auto space-y-3 border border-gray-300 rounded-lg p-3">
                  {availableProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      {/* Product Selection */}
                      <label className="flex items-start space-x-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => [...prev, product.id])
                              // Set default package to standard
                              setSelectedPackages(prev => ({
                                ...prev,
                                [product.id]: availablePackages[product.id as keyof typeof availablePackages]?.[0]?.id || ''
                              }))
                            } else {
                              setSelectedProducts(prev => prev.filter(id => id !== product.id))
                              // Remove package selection
                              setSelectedPackages(prev => {
                                const newPackages = { ...prev }
                                delete newPackages[product.id]
                                return newPackages
                              })
                            }
                          }}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium text-gray-900">{product.name}</h6>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <span className="font-medium text-green-600">
                              {formatCurrency(product.price.toString())} VNĐ
                            </span>
                          </div>
                        </div>
                      </label>

                      {/* Package Selection Dropdown */}
                      {selectedProducts.includes(product.id) && (
                        <div className="ml-7 border-t border-gray-100 pt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn gói sản phẩm:
                          </label>
                          <select
                            value={selectedPackages[product.id] || ''}
                            onChange={(e) => setSelectedPackages(prev => ({
                              ...prev,
                              [product.id]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          >
                            {availablePackages[product.id as keyof typeof availablePackages]?.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {pkg.price > 0 ? `+${formatCurrency(pkg.price.toString())} VNĐ` : 'Miễn phí'} 
                                {pkg.description && ` - ${pkg.description}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Selected Products Summary */}
                {selectedProducts.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Đã chọn {selectedProducts.length} sản phẩm:</p>
                    <div className="space-y-1">
                      {selectedProducts.map(productId => {
                        const product = availableProducts.find(p => p.id === productId)
                        const selectedPackageId = selectedPackages[productId]
                        const selectedPackage = availablePackages[productId as keyof typeof availablePackages]?.find(pkg => pkg.id === selectedPackageId)
                        const totalPrice = (product?.price || 0) + (selectedPackage?.price || 0)
                        
                        return product ? (
                          <div key={productId} className="flex justify-between text-sm">
                            <span>
                              {product.name} ({selectedPackage?.name || 'Standard'})
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(totalPrice.toString())} VNĐ
                            </span>
                          </div>
                        ) : null
                      })}
                      <div className="border-t border-green-200 pt-1 mt-2">
                        <div className="flex justify-between font-medium text-green-800">
                          <span>Tổng cộng:</span>
                          <span>
                            {formatCurrency(
                              selectedProducts.reduce((sum, productId) => {
                                const product = availableProducts.find(p => p.id === productId)
                                const selectedPackageId = selectedPackages[productId]
                                const selectedPackage = availablePackages[productId as keyof typeof availablePackages]?.find(pkg => pkg.id === selectedPackageId)
                                return sum + (product?.price || 0) + (selectedPackage?.price || 0)
                              }, 0).toString()
                            )} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedProducts.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Vui lòng chọn ít nhất một sản phẩm trước khi chuyển đổi</p>
                )}
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-medium text-green-900 mb-2">Điều gì sẽ xảy ra:</h5>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Lead được chuyển thành trạng thái "Chuyển đổi - chờ thanh toán"</li>
                  <li>• Deal mới sẽ được tạo trong hệ thống</li>
                  <li>• Bắt đầu quy trình theo dõi thanh toán</li>
                  {selectedProducts.length > 0 && (
                    <li>• Tổng giá trị đơn hàng: <span className="font-medium">
                      {formatCurrency(
                        selectedProducts.reduce((sum, productId) => {
                          const product = availableProducts.find(p => p.id === productId)
                          const selectedPackageId = selectedPackages[productId]
                          const selectedPackage = availablePackages[productId as keyof typeof availablePackages]?.find(pkg => pkg.id === selectedPackageId)
                          return sum + (product?.price || 0) + (selectedPackage?.price || 0)
                        }, 0).toString()
                      )} VNĐ
                    </span></li>
                  )}
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                Khách hàng đã đồng ý mua sản phẩm. Lead sẽ chuyển vào "Chuyển đổi - chờ thanh toán" để theo dõi việc thanh toán.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConvertModal(false)
                  setSelectedProduct('') // Reset single product when closing modal
                  setSelectedProducts([]) // Reset multiple products when closing modal
                  setSelectedPackages({}) // Reset packages when closing modal
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmConvertLead}
                disabled={selectedProducts.length === 0}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2 ${
                  selectedProducts.length > 0
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedProducts.length > 0 ? `Chuyển vào chuyển đổi - chờ thanh toán (${selectedProducts.length} sản phẩm)` : 'Chọn sản phẩm để tiếp tục'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag Convert Modal */}
      {showDragConvertModal && pendingDragLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Chuyển sang "{getStatusName(dragTargetStatus)}"
              </h3>
              {originalTargetStatus === 'converted' && dragTargetStatus === 'payment_pending' && (
                <p className="text-sm text-amber-600 mt-1">
                  ℹ️ Bạn đã kéo vào "Chuyển đổi thành công", nhưng lead sẽ được chuyển về "Chờ thanh toán" để xác nhận thanh toán trước.
                </p>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{pendingDragLead.name}</h4>
                  <p className="text-sm text-gray-500">{pendingDragLead.company || 'Cá nhân'}</p>
                </div>
              </div>

              {/* Product Selection - with Packages */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {dragTargetStatus === 'converted' ? 
                    'Chọn sản phẩm đã bán' : 
                    'Chọn sản phẩm chuyển đổi'
                  } <span className="text-red-500">*</span>
                </label>
                <div className="max-h-64 overflow-y-auto space-y-3 border border-gray-300 rounded-lg p-3">
                  {availableProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      {/* Product Selection */}
                      <label className="flex items-start space-x-3 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => [...prev, product.id])
                              // Set default package to standard
                              setSelectedPackages(prev => ({
                                ...prev,
                                [product.id]: availablePackages[product.id as keyof typeof availablePackages]?.[0]?.id || ''
                              }))
                            } else {
                              setSelectedProducts(prev => prev.filter(id => id !== product.id))
                              // Remove package selection
                              setSelectedPackages(prev => {
                                const newPackages = { ...prev }
                                delete newPackages[product.id]
                                return newPackages
                              })
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium text-gray-900">{product.name}</h6>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(product.price.toString())} VNĐ
                            </span>
                          </div>
                        </div>
                      </label>

                      {/* Package Selection Dropdown */}
                      {selectedProducts.includes(product.id) && (
                        <div className="ml-7 border-t border-gray-100 pt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn gói:
                          </label>
                          <select
                            value={selectedPackages[product.id] || ''}
                            onChange={(e) => setSelectedPackages(prev => ({
                              ...prev,
                              [product.id]: e.target.value
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {availablePackages[product.id as keyof typeof availablePackages]?.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {pkg.price > 0 ? `+${formatCurrency(pkg.price.toString())} VNĐ` : 'Miễn phí'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Selected Products Summary */}
                {selectedProducts.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-800 font-medium mb-1">Đã chọn {selectedProducts.length} sản phẩm:</p>
                    <div className="space-y-1">
                      {selectedProducts.map(productId => {
                        const product = availableProducts.find(p => p.id === productId)
                        const selectedPackageId = selectedPackages[productId]
                        const selectedPackage = availablePackages[productId as keyof typeof availablePackages]?.find(pkg => pkg.id === selectedPackageId)
                        const totalPrice = (product?.price || 0) + (selectedPackage?.price || 0)
                        
                        return product ? (
                          <div key={productId} className="flex justify-between text-xs">
                            <span>{product.name} ({selectedPackage?.name || 'Standard'})</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(totalPrice.toString())} VNĐ
                            </span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                {selectedProducts.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Vui lòng chọn ít nhất một sản phẩm</p>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {dragTargetStatus === 'converted' ? 
                  `Xác nhận lead đã thanh toán thành công và hoàn tất giao dịch với các sản phẩm đã chọn.` :
                  dragTargetStatus === 'payment_pending' ? 
                  `Lead sẽ được chuyển sang trạng thái "${getStatusName(dragTargetStatus)}" với các sản phẩm đã chọn. Sau khi xác nhận thanh toán thành công, sẽ tự động chuyển sang "Chuyển đổi thành công".` :
                  `Lead sẽ được chuyển sang trạng thái "${getStatusName(dragTargetStatus)}" với các sản phẩm đã chọn.`
                }
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDragConvertModal(false)
                  setPendingDragLead(null)
                  setDragTargetStatus('')
                  setOriginalTargetStatus('')
                  setSelectedProducts([])
                  setSelectedPackages({})
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmDragConvert}
                disabled={selectedProducts.length === 0}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center gap-2 ${
                  selectedProducts.length > 0
                    ? dragTargetStatus === 'converted' 
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedProducts.length > 0 ? 
                  dragTargetStatus === 'converted' 
                    ? `Xác nhận hoàn tất (${selectedProducts.length} sản phẩm)` 
                    : `Xác nhận chuyển (${selectedProducts.length} sản phẩm)`
                  : 'Chọn sản phẩm để tiếp tục'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tạo Task cho {selectedLeadIds.length} leads đã chọn
                </h3>
                <button
                  onClick={() => {
                    setShowCreateTaskModal(false)
                    setSelectedTaskType('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Chọn loại task để thêm cho các leads đã chọn</p>
            </div>
            
            {/* Task Types Grid */}
            <div className="px-6 py-4 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {taskTypes.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskType(task.id)
                      setSelectedTaskObj(task)
                      setTaskExtraNote('')
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTaskType === task.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : `border-gray-200 hover:border-gray-300 ${task.color}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{task.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center">
                        {selectedTaskType === task.id ? (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadline & confirm area (appears after selecting a task) */}
            {selectedTaskObj && (
              <div className="px-6 py-4 border-t border-gray-100 bg-white">
                <h4 className="font-medium">Xác nhận: {selectedTaskObj.icon} {selectedTaskObj.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{selectedTaskObj.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-xs text-gray-600">Hạn hoàn thành</label>
                    <input
                      type="date"
                      value={taskDeadlineDate}
                      onChange={(e) => setTaskDeadlineDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Giờ</label>
                    <input
                      type="time"
                      value={taskDeadlineTime}
                      onChange={(e) => setTaskDeadlineTime(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs text-gray-600">Ghi chú thêm (tuỳ chọn)</label>
                    <input
                      type="text"
                      value={taskExtraNote}
                      onChange={(e) => setTaskExtraNote(e.target.value)}
                      placeholder="Ví dụ: Chuẩn bị tài liệu, gửi trước 1 ngày..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedTaskObj(null)
                      setSelectedTaskType('')
                      setTaskExtraNote('')
                    }}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Bỏ chọn
                  </button>
                  <button
                    onClick={() => confirmCreateTask(selectedTaskObj, taskDeadlineDate, taskDeadlineTime, taskExtraNote)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Tạo task
                  </button>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  💡 Mẹo: Task sẽ được thêm vào lịch sử tương tác của từng lead
                </div>
                <button
                  onClick={() => {
                    setShowCreateTaskModal(false)
                    setSelectedTaskType('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Sales Modal */}
      {showAssignSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gán Sales cho {selectedLeadIds.length} leads đã chọn
                </h3>
                <button
                  onClick={() => {
                    setShowAssignSalesModal(false)
                    setSalesSearchTerm('')
                    setSalesCurrentPage(1)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Chọn Sales để gán cho các leads đã chọn</p>
            </div>
            
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, phòng ban hoặc chức vụ..."
                  value={salesSearchTerm}
                  onChange={(e) => {
                    setSalesSearchTerm(e.target.value)
                    setSalesCurrentPage(1) // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {salesSearchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  Tìm thấy {filteredSalesTeam.length} sales phù hợp
                </div>
              )}
            </div>
            
            {/* Sales List */}
            <div className="px-6 py-4 overflow-y-auto max-h-96">
              {paginatedSalesTeam.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedSalesTeam.map((sales) => (
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
                            <span className={`text-xs font-medium ml-1 ${
                              sales.activeLeads > 10 ? 'text-red-600' : 
                              sales.activeLeads > 5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
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
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">Không tìm thấy sales nào phù hợp</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalSalesPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {Math.min((salesCurrentPage - 1) * SALES_PER_PAGE + 1, filteredSalesTeam.length)}-{Math.min(salesCurrentPage * SALES_PER_PAGE, filteredSalesTeam.length)} trong {filteredSalesTeam.length} sales
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSalesCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={salesCurrentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setSalesCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            page === salesCurrentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSalesCurrentPage(prev => Math.min(totalSalesPages, prev + 1))}
                      disabled={salesCurrentPage === totalSalesPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignSalesModal(false)
                  setSalesSearchTerm('')
                  setSalesCurrentPage(1)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Management Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý hiển thị cột</h3>
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Chọn các cột bạn muốn hiển thị trong bảng</p>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Thao tác nhanh:</span>
                <button
                  onClick={() => {
                    const allEnabled = Object.keys(visibleColumns).reduce((acc, key) => {
                      acc[key as keyof typeof visibleColumns] = true;
                      return acc;
                    }, {} as typeof visibleColumns);
                    setVisibleColumns(allEnabled);
                  }}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  ✅ Hiển thị tất cả
                </button>
                <button
                  onClick={() => {
                    const essential = {
                      ...Object.keys(visibleColumns).reduce((acc, key) => {
                        acc[key as keyof typeof visibleColumns] = false;
                        return acc;
                      }, {} as typeof visibleColumns),
                      checkbox: true,
                      stt: true,
                      customerName: true,
                      phone: true,
                      stage: true,
                      salesOwner: true,
                      actions: true
                    };
                    setVisibleColumns(essential);
                  }}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  🎯 Chỉ cột thiết yếu
                </button>
                <button
                  onClick={() => {
                    const allDisabled = Object.keys(visibleColumns).reduce((acc, key) => {
                      acc[key as keyof typeof visibleColumns] = false;
                      return acc;
                    }, {} as typeof visibleColumns);
                    setVisibleColumns({...allDisabled, customerName: true, actions: true});
                  }}
                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  ❌ Ẩn tất cả
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              {Object.entries({
                checkbox: '☑️ Checkbox',
                stt: '🔢 STT',
                customerName: '👤 Tên khách hàng',
                phone: '📱 Số điện thoại',
                email: '✉️ Email',
                company: '🏢 Công ty',
                address: '📍 Địa chỉ',
                source: '🌐 Nguồn',
                region: '🗺️ Khu vực',
                stage: '🎯 Giai đoạn',
                product: '🛍️ Sản phẩm quan tâm',
                customerType: '👥 Loại khách hàng',
                salesOwner: '👨‍💼 Sales phụ trách',
                tags: '🏷️ Tags/Nhãn',
                notes: '📝 Ghi chú',
                createdDate: '📅 Ngày tạo',
                lastModified: '🕐 Ngày cập nhật',
                interactionCount: '🔄 Số lần tương tác',
                lastInteraction: '⏰ Lần tương tác cuối',
                actions: '⚙️ Hành động'
              } as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[key as keyof typeof visibleColumns]}
                      onChange={(e) => {
                        setVisibleColumns(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => {
                      acc[key as keyof typeof visibleColumns] = true
                      return acc
                    }, {} as typeof visibleColumns))
                  }}
                  className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => {
                    setVisibleColumns(Object.keys(visibleColumns).reduce((acc, key) => {
                      acc[key as keyof typeof visibleColumns] = key === 'customerName' || key === 'actions'
                      return acc
                    }, {} as typeof visibleColumns))
                  }}
                  className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Mặc định
                </button>
              </div>
              <button
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
