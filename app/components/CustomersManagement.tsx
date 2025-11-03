'use client'

import { useState, useMemo } from 'react'
import { 
  Plus, Search, Filter, MoreVertical, Phone, Mail, Eye, Building2, 
  User, Calendar, Tag, Clock, TrendingUp, TrendingDown, AlertTriangle,
  Star, Heart, DollarSign, MessageCircle, Activity, Target, Gift,
  MapPin, Briefcase, CreditCard, UserCheck, UserX, Users, ChevronDown,
  Bell, RefreshCw, Zap, BarChart3, PieChart, CheckCircle, XCircle,
  FileText, History, Send, Settings, Download, Crown, Award, UserPlus,
  Info, ArrowUpRight, ArrowDownRight, X, MessageSquare, Columns,
  Brain, BarChart, Package, Edit
} from 'lucide-react'
import CustomerEventsManager from './CustomerEventsManager'
import CustomerAnalytics from './CustomerAnalytics'

interface CustomerTag {
  id: string
  name: string
  color: string
  category: 'behavior' | 'value' | 'engagement' | 'risk'
}

interface CustomerInteraction {
  id: string
  type: 'email' | 'call' | 'meeting' | 'sms' | 'chat' | 'support'
  channel: string
  title: string
  summary: string
  date: string
  status: 'success' | 'pending' | 'failed'
  aiSummary?: string
}

interface CustomerProduct {
  id: string
  name: string
  category: string
  purchaseDate: string
  quantity: number
  price: number
  status: 'active' | 'expired' | 'cancelled'
}

interface Customer {
  id: number
  name: string
  firstName: string
  lastName: string
  contact: string
  email: string
  secondaryEmail?: string
  company: string
  companySize: 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  position: string
  department: string
  status: 'active' | 'inactive' | 'at-risk' | 'vip' | 'churned' | 'dormant'
  customerType: 'diamond' | 'gold' | 'silver' | 'bronze' | 'new' | 'returning' | 'inactive'
  tags: CustomerTag[]
  totalValue: string
  lifetimeValue: string
  averageOrderValue: string
  lastOrderDate: string
  lastInteraction: string
  daysSinceLastInteraction: number
  engagementScore: number
  churnRisk: number
  loyaltyPoints: number
  preferredChannel: 'email' | 'phone' | 'chat' | 'in-person' | 'social'
  interactions: CustomerInteraction[]
  products: CustomerProduct[]
  
  // Personal Information
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  
  // Contact Information
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phone2?: string
  fax?: string
  website?: string
  
  // Social Media
  socialMedia?: {
    facebook?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  
  // Business Information
  taxId?: string
  registrationNumber?: string
  businessLicense?: string
  
  // Financial Information
  creditLimit: number
  paymentTerms: string
  currency: string
  taxExempt: boolean
  
  // Preferences
  preferences: {
    communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    marketingConsent: boolean
    newsletter: boolean
    smsConsent: boolean
    language: string
    timezone: string
    communicationHours: {
      start: string
      end: string
    }
  }
  
  // Relationship Information
  assignedSalesRep?: string
  accountManager?: string
  customerSince: string
  referredBy?: string
  referralCode?: string
  
  // Purchase History
  firstPurchaseDate?: string
  lastPurchaseDate?: string
  totalOrders: number
  totalSpent: number
  averageOrderFrequency: number
  predictedRevenue?: number
  
  // Support Information
  supportTickets: number
  supportPriority: 'low' | 'medium' | 'high' | 'critical'
  customFields?: Record<string, any>
  
  // Metadata
  notes: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  isDeleted: boolean
  deletedAt?: string
  
  // Marketing & Campaigns
  remarketing: {
    eligible: boolean
    priority: 'low' | 'medium' | 'high'
    lastCampaign: string
    suggestedActions?: string[]
    bestTimeToContact?: string
    campaigns: Array<{
      id: string
      name: string
      type: string
      status: string
      sentAt: string
      openRate?: number
      clickRate?: number
    }>
  }
}

/**
 * CustomersManagement Component
 * 
 * Quản lý danh sách khách hàng đã chuyển đổi thành công từ lead.
 * - Dữ liệu được đồng bộ từ Sales Management khi lead chuyển trạng thái thành "Đã bán"
 * - Tags được đồng bộ trực tiếp từ Sales Management (không thêm tag chuyển đổi)
 * - Thông tin nguồn gốc và lifecycle được tính toán dựa trên dữ liệu sales
 * - Hiển thị đầy đủ 25 trường thông tin khách hàng theo đặc tả
 */
export default function CustomersManagement() {
  const [selectedView, setSelectedView] = useState<'list' | 'analytics' | 'events' | 'insights'>('list')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'interactions' | 'orders' | 'notes'>('details')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterCustomerType, setFilterCustomerType] = useState('')
  const [filterPurchasedProduct, setFilterPurchasedProduct] = useState('')
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    no: true,
    customerName: true,
    phoneNumber: true,
    email: true,
    company: true,
    address: false,
    region: true,
    customerType: true,
    segment: true,
    tags: true,
    source: true,
    accountManager: true,
    status: true,
    lifecycleStage: true,
    totalOrderValue: true,
    orderCount: true,
    lastOrderDate: true,
    averageOrderValue: true,
    lastContactDate: true,
    interactionCount: true,
    createdDate: true,
    customerScore: false,
    npsScore: false,
    actions: true
  })
  const [sortBy, setSortBy] = useState('name')
  const [showRemarketingModal, setShowRemarketingModal] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showRankingDefinitionModal, setShowRankingDefinitionModal] = useState(false)
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false)
  const [quickTaskData, setQuickTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  })
  
  // Helper function to calculate predicted revenue for customers without it
  const calculatePredictedRevenue = (customer: Customer): number => {
    if (customer.predictedRevenue) return customer.predictedRevenue;
    
    // Simple prediction based on customer data
    const baseRevenue = customer.totalSpent / customer.totalOrders || 0;
    const frequencyMultiplier = Math.max(customer.averageOrderFrequency, 0.1);
    const engagementMultiplier = customer.engagementScore / 100;
    const churnRiskPenalty = (100 - customer.churnRisk) / 100;
    
    return Math.round(baseRevenue * frequencyMultiplier * engagementMultiplier * churnRiskPenalty * 3);
  };

  // Handle checkbox selection functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomerIds([])
      setSelectAll(false)
    } else {
      setSelectedCustomerIds(filteredCustomers.map(customer => customer.id.toString()))
      setSelectAll(true)
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    if (selectedCustomerIds.includes(customerId)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(id => id !== customerId))
      setSelectAll(false)
    } else {
      const newSelected = [...selectedCustomerIds, customerId]
      setSelectedCustomerIds(newSelected)
      if (newSelected.length === filteredCustomers.length) {
        setSelectAll(true)
      }
    }
  }

  // Bulk Actions Functions
  const handleCreateQuickTask = () => {
    const selectedCustomers = customers.filter(customer => 
      selectedCustomerIds.includes(customer.id.toString())
    )
    
    if (selectedCustomers.length === 0) {
      alert('Vui lòng chọn ít nhất một khách hàng')
      return
    }
    
    setShowQuickTaskModal(true)
  }

  const handleSubmitQuickTask = () => {
    const selectedCustomers = customers.filter(customer => 
      selectedCustomerIds.includes(customer.id.toString())
    )
    
    console.log('Tạo task:', {
      ...quickTaskData,
      customerIds: selectedCustomerIds,
      customers: selectedCustomers.map(c => ({ id: c.id, name: c.name, email: c.email }))
    })
    
    alert(`Đã tạo task "${quickTaskData.title}" cho ${selectedCustomers.length} khách hàng`)
    
    // Reset data
    setQuickTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: ''
    })
    setSelectedCustomerIds([])
    setSelectAll(false)
    setShowQuickTaskModal(false)
  }

  const handleBulkEmail = () => {
    const selectedCustomers = customers.filter(customer => 
      selectedCustomerIds.includes(customer.id.toString())
    )
    
    console.log('Gửi email hàng loạt cho:', selectedCustomers.map(c => c.email))
    alert(`Gửi email hàng loạt cho ${selectedCustomers.length} khách hàng`)
    
    // Reset selection after action
    setSelectedCustomerIds([])
    setSelectAll(false)
  }
  
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    industry: '',
    companySize: 'small',
    customerType: 'bronze',
    status: 'active',
    preferredChannel: 'email',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    marketingConsent: false,
    smsConsent: false
  })
  // Sample customer data
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: 'Nguyễn Văn An',
      firstName: 'An',
      lastName: 'Nguyễn Văn',
      contact: '0901234567',
      email: 'nguyen.van.an@company.com',
      secondaryEmail: 'an.nguyen@personal.com',
      company: 'Tech Solutions Ltd',
      companySize: 'large',
      industry: 'Công nghệ',
      position: 'CEO',
      department: 'Điều hành',
      status: 'vip',
      customerType: 'diamond',
      tags: [
        { id: '1', name: 'VIP', color: 'bg-purple-100 text-purple-800', category: 'value' },
        { id: '2', name: 'Khách hàng lâu năm', color: 'bg-blue-100 text-blue-800', category: 'engagement' }
      ],
      totalValue: '2,500,000',
      lifetimeValue: '15,000,000',
      averageOrderValue: '500,000',
      lastOrderDate: '2024-01-20',
      lastInteraction: '2024-01-22',
      daysSinceLastInteraction: 2,
      engagementScore: 95,
      churnRisk: 5,
      loyaltyPoints: 2500,
      preferredChannel: 'email',
      dateOfBirth: '1985-07-15',
      gender: 'male',
      maritalStatus: 'married',
      address: '123 Đường Nguyễn Huệ',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      postalCode: '100000',
      phone2: '0901234568',
      website: 'https://techsolutions.com',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/nguyen-van-an',
        facebook: 'https://facebook.com/nguyenvanan'
      },
      taxId: '0123456789',
      creditLimit: 5000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '18:00'
        }
      },
      assignedSalesRep: 'Lê Thị Mai',
      accountManager: 'Trần Văn Hùng',
      customerSince: '2023-01-15',
      firstPurchaseDate: '2023-01-20',
      lastPurchaseDate: '2024-01-20',
      totalOrders: 25,
      totalSpent: 15000000,
      averageOrderFrequency: 2,
      predictedRevenue: 3500000,
      supportTickets: 3,
      supportPriority: 'high',
      notes: 'Khách hàng VIP, luôn đánh giá cao dịch vụ',
      internalNotes: 'Có thể nâng cấp lên gói Enterprise',
      createdAt: '2023-01-15',
      updatedAt: '2024-01-22',
      createdBy: 'admin',
      updatedBy: 'sales_manager',
      isDeleted: false,
      interactions: [
        {
          id: '1',
          type: 'call',
          channel: 'Phone',
          title: 'Tư vấn nâng cấp hệ thống',
          summary: 'Khách hàng quan tâm đến package Enterprise',
          date: '2024-01-22',
          status: 'success'
        }
      ],
      products: [
        {
          id: '1',
          name: 'CRM Enterprise',
          category: 'Software',
          purchaseDate: '2024-01-20',
          quantity: 1,
          price: 2500000,
          status: 'active'
        },
        {
          id: '2',
          name: 'AI Analytics Module',
          category: 'Add-on',
          purchaseDate: '2023-12-15',
          quantity: 1,
          price: 1200000,
          status: 'active'
        },
        {
          id: '3',
          name: 'Marketing Automation',
          category: 'Software',
          purchaseDate: '2023-11-10',
          quantity: 1,
          price: 800000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '2024-01-01',
        campaigns: []
      }
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      firstName: 'Bình',
      lastName: 'Trần Thị',
      contact: '0912345678',
      email: 'tran.thi.binh@startup.vn',
      company: 'Startup Innovation',
      companySize: 'medium',
      industry: 'IT Services',
      position: 'CTO',
      department: 'Công nghệ',
      status: 'active',
      customerType: 'gold',
      tags: [
        { id: '3', name: 'Tiềm năng cao', color: 'bg-green-100 text-green-800', category: 'value' },
        { id: '4', name: 'Startup', color: 'bg-orange-100 text-orange-800', category: 'behavior' }
      ],
      totalValue: '1,200,000',
      lifetimeValue: '3,600,000',
      averageOrderValue: '300,000',
      lastOrderDate: '2024-01-18',
      lastInteraction: '2024-01-20',
      daysSinceLastInteraction: 4,
      engagementScore: 78,
      churnRisk: 15,
      loyaltyPoints: 1200,
      preferredChannel: 'chat',
      dateOfBirth: '1990-07-22',
      gender: 'female',
      maritalStatus: 'single',
      address: '456 Đường Lê Lợi',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      website: 'https://startupinnovation.vn',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/tran-thi-binh',
        twitter: 'https://twitter.com/tranthibibh'
      },
      creditLimit: 2000000,
      paymentTerms: '15 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '09:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Phạm Minh Tuấn',
      customerSince: '2023-06-10',
      firstPurchaseDate: '2023-06-15',
      lastPurchaseDate: '2024-01-18',
      totalOrders: 12,
      totalSpent: 3600000,
      averageOrderFrequency: 1,
      predictedRevenue: 800000,
      supportTickets: 1,
      supportPriority: 'medium',
      notes: 'Quan tâm đến công nghệ AI, thường yêu cầu demo',
      createdAt: '2023-06-10',
      updatedAt: '2024-01-20',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '2',
          type: 'email',
          channel: 'Email',
          title: 'Proposal mới về AI Solutions',
          summary: 'Gửi proposal tích hợp AI vào sản phẩm hiện tại',
          date: '2024-01-20',
          status: 'pending'
        }
      ],
      products: [
        {
          id: '4',
          name: 'CRM Startup',
          category: 'Software',
          purchaseDate: '2024-01-18',
          quantity: 1,
          price: 800000,
          status: 'active'
        },
        {
          id: '5',
          name: 'Lead Management',
          category: 'Module',
          purchaseDate: '2023-12-20',
          quantity: 1,
          price: 400000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'medium',
        lastCampaign: '2023-12-15',
        suggestedActions: [
          'Gửi email về sản phẩm AI mới với ưu đãi 15%',
          'Mời tham gia webinar về công nghệ mới',
          'Liên hệ qua điện thoại để tư vấn trực tiếp'
        ],
        bestTimeToContact: '9:00-11:00 AM (Thứ 2-5)',
        campaigns: [
          {
            id: 'c1',
            name: 'AI Solutions Campaign',
            type: 'email',
            status: 'sent',
            sentAt: '2023-12-15',
            openRate: 85,
            clickRate: 12
          }
        ]
      }
    },
    {
      id: 3,
      name: 'Lê Minh Cường',
      firstName: 'Cường',
      lastName: 'Lê Minh',
      contact: '0923456789',
      email: 'le.minh.cuong@manufacturing.com',
      company: 'Manufacturing Corp',
      companySize: 'enterprise',
      industry: 'Sản xuất',
      position: 'Giám đốc IT',
      department: 'IT',
      status: 'at-risk',
      customerType: 'silver',
      tags: [
        { id: '5', name: 'Rủi ro cao', color: 'bg-red-100 text-red-800', category: 'risk' },
        { id: '6', name: 'Khó liên lạc', color: 'bg-gray-100 text-gray-800', category: 'engagement' }
      ],
      totalValue: '800,000',
      lifetimeValue: '2,400,000',
      averageOrderValue: '400,000',
      lastOrderDate: '2023-11-15',
      lastInteraction: '2023-12-01',
      daysSinceLastInteraction: 54,
      engagementScore: 32,
      churnRisk: 75,
      loyaltyPoints: 400,
      preferredChannel: 'phone',
      dateOfBirth: '1978-07-25',
      gender: 'male',
      maritalStatus: 'married',
      address: '789 Đường Trần Phú',
      city: 'Đà Nẵng',
      state: 'Đà Nẵng',
      country: 'Việt Nam',
      postalCode: '550000',
      phone2: '0923456788',
      website: 'https://manufacturingcorp.vn',
      creditLimit: 1500000,
      paymentTerms: '45 ngày',
      currency: 'VND',
      taxExempt: true,
      preferences: {
        communicationFrequency: 'quarterly',
        marketingConsent: false,
        newsletter: false,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '07:00',
          end: '16:00'
        }
      },
      assignedSalesRep: 'Nguyễn Thị Lan',
      customerSince: '2023-03-20',
      firstPurchaseDate: '2023-04-01',
      lastPurchaseDate: '2023-11-15',
      totalOrders: 6,
      totalSpent: 2400000,
      averageOrderFrequency: 0.5,
      predictedRevenue: 600000,
      supportTickets: 8,
      supportPriority: 'high',
      notes: 'Khách hàng ít tương tác, cần chăm sóc đặc biệt',
      internalNotes: 'Có vấn đề về thanh toán, cần theo dõi',
      createdAt: '2023-03-20',
      updatedAt: '2023-12-01',
      createdBy: 'sales_rep',
      updatedBy: 'account_manager',
      isDeleted: false,
      interactions: [
        {
          id: '3',
          type: 'call',
          channel: 'Phone',
          title: 'Cuộc gọi chăm sóc khách hàng',
          summary: 'Không liên lạc được, để lại voicemail',
          date: '2023-12-01',
          status: 'failed'
        }
      ],
      products: [
        {
          id: '6',
          name: 'ERP Manufacturing',
          category: 'Software',
          purchaseDate: '2023-11-15',
          quantity: 1,
          price: 800000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'high',
        lastCampaign: '2024-01-10',
        suggestedActions: [
          'Gửi ưu đãi đặc biệt 20% cho đơn hàng tiếp theo',
          'Liên hệ trực tiếp để tìm hiểu nguyên nhân không hoạt động',
          'Gửi survey để thu thập feedback'
        ],
        bestTimeToContact: '2:00-4:00 PM (Thứ 3, 5)',
        campaigns: [
          {
            id: 'c2',
            name: 'Win-back Campaign',
            type: 'email',
            status: 'sent',
            sentAt: '2024-01-10',
            openRate: 45,
            clickRate: 3
          }
        ]
      }
    },
    {
      id: 4,
      name: 'Phạm Thanh Hoa',
      firstName: 'Hoa',
      lastName: 'Phạm Thanh',
      contact: '0934567890',
      email: 'pham.thanh.hoa@retail.com',
      company: 'Retail Solutions',
      companySize: 'small',
      industry: 'Bán lẻ',
      position: 'Chủ cửa hàng',
      department: 'Kinh doanh',
      status: 'active',
      customerType: 'bronze',
      tags: [
        { id: '7', name: 'Khách hàng mới', color: 'bg-blue-100 text-blue-800', category: 'value' }
      ],
      totalValue: '450,000',
      lifetimeValue: '450,000',
      averageOrderValue: '150,000',
      lastOrderDate: '2024-01-15',
      lastInteraction: '2024-01-16',
      daysSinceLastInteraction: 8,
      engagementScore: 65,
      churnRisk: 25,
      loyaltyPoints: 150,
      preferredChannel: 'phone',
      dateOfBirth: '1988-05-20',
      gender: 'female',
      maritalStatus: 'married',
      address: '321 Đường Hai Bà Trưng',
      city: 'Hải Phòng',
      state: 'Hải Phòng',
      country: 'Việt Nam',
      postalCode: '180000',
      creditLimit: 500000,
      paymentTerms: '7 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '20:00'
        }
      },
      assignedSalesRep: 'Vũ Thị Nga',
      customerSince: '2023-12-01',
      firstPurchaseDate: '2023-12-05',
      lastPurchaseDate: '2024-01-15',
      totalOrders: 3,
      totalSpent: 450000,
      averageOrderFrequency: 1,
      supportTickets: 0,
      supportPriority: 'low',      notes: 'Khách hàng mới, tiềm năng phát triển',
      createdAt: '2023-12-01',
      updatedAt: '2024-01-16',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [],
      products: [
        {
          id: '6',
          name: 'CRM Basic',
          category: 'Software',
          purchaseDate: '2024-01-15',
          quantity: 1,
          price: 450000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 5,
      name: 'Hoàng Minh Đức',
      firstName: 'Đức',
      lastName: 'Hoàng Minh',
      contact: '0945678901',
      email: 'hoang.minh.duc@finance.vn',
      company: 'Finance Group',
      companySize: 'large',
      industry: 'Tài chính',
      position: 'Giám đốc Tài chính',
      department: 'Tài chính',
      status: 'inactive',
      customerType: 'inactive',
      tags: [
        { id: '8', name: 'Không quay lại', color: 'bg-gray-100 text-gray-800', category: 'risk' }
      ],
      totalValue: '0',
      lifetimeValue: '5,200,000',
      averageOrderValue: '650,000',
      lastOrderDate: '2023-08-15',
      lastInteraction: '2023-09-10',
      daysSinceLastInteraction: 136,
      engagementScore: 15,
      churnRisk: 95,
      loyaltyPoints: 0,
      preferredChannel: 'email',
      dateOfBirth: '1975-11-30',
      gender: 'male',
      maritalStatus: 'divorced',
      address: '654 Đường Đồng Khởi',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      creditLimit: 0,
      paymentTerms: 'Thanh toán ngay',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: false,
        newsletter: false,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '09:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Đỗ Văn Minh',
      customerSince: '2022-05-10',
      firstPurchaseDate: '2022-05-15',
      lastPurchaseDate: '2023-08-15',
      totalOrders: 8,
      totalSpent: 5200000,
      averageOrderFrequency: 0.5,
      supportTickets: 2,
      supportPriority: 'low',
      notes: 'Khách hàng ngưng hoạt động từ Q3/2023',      internalNotes: 'Chuyển sang đối thủ cạnh tranh',
      createdAt: '2022-05-10',
      updatedAt: '2023-09-10',
      createdBy: 'sales_manager',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [],
      products: [
        {
          id: '7',
          name: 'CRM Enterprise',
          category: 'Software',
          purchaseDate: '2022-05-15',
          quantity: 1,
          price: 2000000,
          status: 'expired'
        },
        {
          id: '8',
          name: 'Financial Analytics',
          category: 'Module',
          purchaseDate: '2022-08-20',
          quantity: 1,
          price: 1500000,
          status: 'expired'
        },
        {
          id: '9',
          name: 'Reporting Dashboard',
          category: 'Add-on',
          purchaseDate: '2023-01-10',
          quantity: 1,
          price: 800000,
          status: 'expired'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'high',
        lastCampaign: '2023-11-01',
        suggestedActions: [
          'Gửi thông báo về gói dịch vụ mới với giá ưu đãi',
          'Mời thử nghiệm miễn phí trong 30 ngày',
          'Liên hệ để tư vấn nâng cấp gói dịch vụ'
        ],
        bestTimeToContact: '10:00 AM-12:00 PM (Thứ 2, 4, 6)',
        campaigns: [
          {
            id: 'c3',
            name: 'Reactivation Campaign',
            type: 'email',
            status: 'sent',
            sentAt: '2023-11-01',
            openRate: 25,
            clickRate: 0
          }
        ]
      }
    },
    {
      id: 5.5,
      name: 'Đặng Văn Minh',
      firstName: 'Minh',
      lastName: 'Đặng Văn',
      contact: '0945678901',
      email: 'dangvanminh@gmail.com',
      company: '', // Cá nhân - không có công ty
      companySize: 'individual',
      status: 'active',
      customerType: 'bronze',
      tags: [
        { id: '10', name: 'Cá nhân', color: 'bg-green-100 text-green-800', category: 'value' },
        { id: '11', name: 'Freelancer', color: 'bg-yellow-100 text-yellow-800', category: 'behavior' }
      ],
      totalValue: '750,000',
      lifetimeValue: '750,000',
      averageOrderValue: '250,000',
      lastOrderDate: '2024-01-10',
      lastInteraction: '2024-01-12',
      daysSinceLastInteraction: 12,
      engagementScore: 72,
      churnRisk: 20,
      loyaltyPoints: 200,
      preferredChannel: 'email',
      dateOfBirth: '1992-03-18',
      gender: 'male',
      maritalStatus: 'single',
      address: '789 Đường Cầu Giấy',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      postalCode: '100000',
      phone2: '',
      website: 'https://dangvanminh.dev',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/dangvanminh'
      },
      taxId: '',
      creditLimit: 1000000,
      paymentTerms: 'Thanh toán ngay',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '09:00',
          end: '21:00'
        }
      },
      assignedSalesRep: 'Nguyễn Thị Lan',
      customerSince: '2023-10-05',
      firstPurchaseDate: '2023-10-08',
      lastPurchaseDate: '2024-01-10',
      totalOrders: 3,
      totalSpent: 750000,
      averageOrderFrequency: 1.2,
      supportTickets: 0,
      supportPriority: 'medium',
      notes: 'Freelancer làm web design, quan tâm đến tools thiết kế',
      createdAt: '2023-10-05',
      updatedAt: '2024-01-12',
      createdBy: 'online_form',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '5',
          type: 'email',
          channel: 'Email',
          title: 'Hỏi về gói thiết kế web',
          summary: 'Quan tâm đến tools thiết kế website responsive',
          date: '2024-01-12',
          status: 'completed'
        }
      ],
      products: [
        {
          id: '10',
          name: 'Design Tools Basic',
          category: 'Software',
          purchaseDate: '2023-10-08',
          quantity: 1,
          price: 250000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'medium',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 5.6,
      name: 'Lý Thị Hương',
      firstName: 'Hương',
      lastName: 'Lý Thị',
      contact: '0987654321',
      email: 'lythihuong88@hotmail.com',
      company: '', // Cá nhân - không có công ty
      companySize: 'individual',
      status: 'active',
      customerType: 'silver',
      tags: [
        { id: '12', name: 'Giáo dục', color: 'bg-blue-100 text-blue-800', category: 'value' },
        { id: '13', name: 'Khách quen', color: 'bg-purple-100 text-purple-800', category: 'engagement' }
      ],
      totalValue: '1,200,000',
      lifetimeValue: '1,800,000',
      averageOrderValue: '300,000',
      lastOrderDate: '2024-01-05',
      lastInteraction: '2024-01-07',
      daysSinceLastInteraction: 17,
      engagementScore: 85,
      churnRisk: 10,
      loyaltyPoints: 600,
      preferredChannel: 'phone',
      dateOfBirth: '1988-11-25',
      gender: 'female',
      maritalStatus: 'married',
      address: '234 Đường Lý Thường Kiệt',
      city: 'Đà Nẵng',
      state: 'Đà Nẵng',
      country: 'Việt Nam',
      postalCode: '550000',
      phone2: '0234567890',
      socialMedia: {
        facebook: 'https://facebook.com/lythihuong88'
      },
      taxId: '',
      creditLimit: 2000000,
      paymentTerms: '15 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '07:00',
          end: '19:00'
        }
      },
      assignedSalesRep: 'Trần Văn Đức',
      customerSince: '2023-05-20',
      firstPurchaseDate: '2023-05-25',
      lastPurchaseDate: '2024-01-05',
      totalOrders: 6,
      totalSpent: 1800000,
      averageOrderFrequency: 2,
      supportTickets: 1,
      supportPriority: 'high',
      notes: 'Giáo viên tiểu học, mua phần mềm giáo dục cho lớp học',
      createdAt: '2023-05-20',
      updatedAt: '2024-01-07',
      createdBy: 'facebook_lead',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '6',
          type: 'phone',
          channel: 'Điện thoại',
          title: 'Tư vấn phần mềm học tập',
          summary: 'Hỏi về tính năng mới cho phần mềm toán học lớp 5',
          date: '2024-01-07',
          status: 'completed'
        }
      ],
      products: [
        {
          id: '13',
          name: 'Toán học tiểu học',
          category: 'Educational Software',
          purchaseDate: '2023-05-25',
          quantity: 1,
          price: 400000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 6,
      name: 'Ngô Thị Linh',
      firstName: 'Linh',
      lastName: 'Ngô Thị',
      contact: '0956789012',
      email: 'ngo.thi.linh@education.edu.vn',
      company: 'Education Institute',
      companySize: 'medium',
      industry: 'Giáo dục',
      position: 'Hiệu trưởng',
      department: 'Điều hành',
      status: 'active',
      customerType: 'returning',
      tags: [
        { id: '9', name: 'Khách hàng quay lại', color: 'bg-green-100 text-green-800', category: 'value' },
        { id: '10', name: 'Giáo dục', color: 'bg-indigo-100 text-indigo-800', category: 'behavior' }
      ],
      totalValue: '850,000',
      lifetimeValue: '1,700,000',
      averageOrderValue: '425,000',
      lastOrderDate: '2024-01-10',
      lastInteraction: '2024-01-23',
      daysSinceLastInteraction: 1,
      engagementScore: 85,
      churnRisk: 10,
      loyaltyPoints: 0,
      preferredChannel: 'email',
      dateOfBirth: '1982-09-12',
      gender: 'female',
      maritalStatus: 'married',
      address: '987 Đường Lý Thường Kiệt',
      city: 'Cần Thơ',
      state: 'Cần Thơ',
      country: 'Việt Nam',
      postalCode: '900000',
      creditLimit: 1000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: true,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Lý Hoàng Nam',
      customerSince: '2024-01-20',
      firstPurchaseDate: '',
      lastPurchaseDate: '',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderFrequency: 0,
      supportTickets: 0,
      supportPriority: 'medium',
      notes: 'Khách hàng giáo dục, mua sản phẩm định kỳ',
      createdAt: '2023-08-20',
      updatedAt: '2024-01-23',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '4',
          type: 'email',
          channel: 'Email',
          title: 'Gia hạn hợp đồng thành công',
          summary: 'Khách hàng đồng ý gia hạn thêm 1 năm',
          date: '2024-01-23',
          status: 'success'
        }
      ],
      products: [
        {
          id: '10',
          name: 'CRM Education',
          category: 'Software',
          purchaseDate: '2024-01-10',
          quantity: 1,
          price: 600000,
          status: 'active'
        },
        {
          id: '11',
          name: 'Student Management',
          category: 'Module',
          purchaseDate: '2023-12-15',
          quantity: 1,
          price: 250000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 7,
      name: 'Vũ Văn Khoa',
      firstName: 'Khoa',
      lastName: 'Vũ Văn',
      contact: '0967890123',
      email: 'vu.van.khoa@trading.com',
      company: 'Trading Company',
      companySize: 'medium',
      industry: 'Thương mại',
      position: 'Giám đốc Kinh doanh',
      department: 'Kinh doanh',
      status: 'churned',
      customerType: 'inactive',
      tags: [
        { id: '11', name: 'Đã churn', color: 'bg-red-100 text-red-800', category: 'risk' },
        { id: '12', name: 'Cạnh tranh', color: 'bg-orange-100 text-orange-800', category: 'risk' }
      ],
      totalValue: '0',
      lifetimeValue: '3,800,000',
      averageOrderValue: '475,000',
      lastOrderDate: '2023-07-20',
      lastInteraction: '2023-08-15',
      daysSinceLastInteraction: 162,
      engagementScore: 8,
      churnRisk: 100,
      loyaltyPoints: 0,
      preferredChannel: 'phone',
      dateOfBirth: '1980-07-02',
      gender: 'male',
      maritalStatus: 'married',
      address: '147 Đường Nguyễn Trãi',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      postalCode: '100000',
      creditLimit: 0,
      paymentTerms: 'Đã hủy',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: false,
        newsletter: false,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '09:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Nguyễn Thị Hương',
      customerSince: '2022-03-10',
      firstPurchaseDate: '2022-03-15',
      lastPurchaseDate: '2023-07-20',
      totalOrders: 8,
      totalSpent: 3800000,
      averageOrderFrequency: 0.5,
      supportTickets: 5,
      supportPriority: 'low',
      notes: 'Khách hàng đã chuyển sang đối thủ cạnh tranh',
      internalNotes: 'Không thể giữ chân, giá cả không cạnh tranh',
      createdAt: '2022-03-10',
      updatedAt: '2023-08-15',
      createdBy: 'sales_manager',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '5',
          type: 'call',
          channel: 'Phone',
          title: 'Cuộc gọi thông báo hủy',
          summary: 'Khách hàng thông báo chuyển sang nhà cung cấp khác',
          date: '2023-08-15',
          status: 'success'
        }
      ],
      products: [
        {
          id: '12',
          name: 'CRM Professional',
          category: 'Software',
          purchaseDate: '2022-03-15',
          quantity: 1,
          price: 1800000,
          status: 'cancelled'
        },
        {
          id: '13',
          name: 'Sales Analytics',
          category: 'Module',
          purchaseDate: '2022-08-10',
          quantity: 1,
          price: 1200000,
          status: 'cancelled'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'high',
        lastCampaign: '2023-10-01',
        campaigns: [
          {
            id: 'c4',
            name: 'Win-back Premium',
            type: 'email',
            status: 'sent',
            sentAt: '2023-10-01',
            openRate: 15,
            clickRate: 0
          }
        ]
      }
    },
    {
      id: 8,
      name: 'Đặng Thị Mai',
      firstName: 'Mai',
      lastName: 'Đặng Thị',
      contact: '0978901234',
      email: 'dang.thi.mai@logistics.vn',
      company: 'Logistics Solutions',
      companySize: 'large',
      industry: 'Vận tải',
      position: 'Giám đốc Vận hành',
      department: 'Vận hành',
      status: 'dormant',
      customerType: 'silver',
      tags: [
        { id: '13', name: 'Tạm ngưng', color: 'bg-gray-100 text-gray-800', category: 'risk' },
        { id: '14', name: 'Mùa vụ', color: 'bg-blue-100 text-blue-800', category: 'behavior' }
      ],
      totalValue: '0',
      lifetimeValue: '6,500,000',
      averageOrderValue: '1,300,000',
      lastOrderDate: '2023-10-30',
      lastInteraction: '2023-12-20',
      daysSinceLastInteraction: 35,
      engagementScore: 45,
      churnRisk: 55,
      loyaltyPoints: 650,
      preferredChannel: 'email',
      dateOfBirth: '1983-08-25',
      gender: 'female',
      maritalStatus: 'married',
      address: '258 Đường Cách Mang Tháng 8',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      creditLimit: 2000000,
      paymentTerms: '60 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '07:00',
          end: '18:00'
        }
      },
      assignedSalesRep: 'Bùi Văn Tấn',
      customerSince: '2022-01-20',
      firstPurchaseDate: '2022-02-10',
      lastPurchaseDate: '2023-10-30',
      totalOrders: 5,
      totalSpent: 6500000,
      averageOrderFrequency: 0.3,
      supportTickets: 2,
      supportPriority: 'medium',
      notes: 'Khách hàng theo mùa, thường mua cuối năm',
      internalNotes: 'Dự kiến sẽ quay lại Q1/2024',
      createdAt: '2022-01-20',
      updatedAt: '2023-12-20',
      createdBy: 'sales_rep',
      updatedBy: 'account_manager',
      isDeleted: false,
      interactions: [
        {
          id: '6',
          type: 'meeting',
          channel: 'In-person',
          title: 'Họp đánh giá năm 2023',
          summary: 'Khách hàng tạm ngưng do khó khăn tài chính',
          date: '2023-12-20',
          status: 'success'
        }
      ],
      products: [
        {
          id: '14',
          name: 'Logistics Management',
          category: 'Software',
          purchaseDate: '2023-10-30',
          quantity: 1,
          price: 2500000,
          status: 'active'
        },
        {
          id: '15',
          name: 'Fleet Tracking',
          category: 'Module',
          purchaseDate: '2023-03-20',
          quantity: 1,
          price: 1800000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'medium',
        lastCampaign: '2024-01-15',
        campaigns: [
          {
            id: 'c5',
            name: 'New Year Campaign',
            type: 'email',
            status: 'sent',
            sentAt: '2024-01-15',
            openRate: 68,
            clickRate: 8
          }
        ]
      }
    },
    {
      id: 9,
      name: 'Bùi Thị Lan',
      firstName: 'Lan',
      lastName: 'Bùi Thị',
      contact: '0989012345',
      email: 'bui.thi.lan@healthcare.vn',
      company: 'Healthcare Solutions',
      companySize: 'large',
      industry: 'Y tế',
      position: 'Giám đốc Y khoa',
      department: 'Y khoa',
      status: 'vip',
      customerType: 'diamond',
      tags: [
        { id: '15', name: 'VIP', color: 'bg-purple-100 text-purple-800', category: 'value' },
        { id: '16', name: 'Y tế', color: 'bg-green-100 text-green-800', category: 'behavior' }
      ],
      totalValue: '3,200,000',
      lifetimeValue: '18,500,000',
      averageOrderValue: '800,000',
      lastOrderDate: '2024-01-21',
      lastInteraction: '2024-01-24',
      daysSinceLastInteraction: 0,
      engagementScore: 98,
      churnRisk: 2,
      loyaltyPoints: 3200,
      preferredChannel: 'email',
      dateOfBirth: '1977-06-18',
      gender: 'female',
      maritalStatus: 'married',
      address: '159 Đường Pasteur',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      phone2: '0989012346',
      website: 'https://healthcaresolutions.vn',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/bui-thi-lan',
        facebook: 'https://facebook.com/buithilan'
      },
      taxId: '0987654321',
      creditLimit: 8000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '07:00',
          end: '19:00'
        }
      },
      assignedSalesRep: 'Hoàng Văn Dũng',
      accountManager: 'Nguyễn Thị Hồng',
      customerSince: '2022-08-10',
      firstPurchaseDate: '2022-08-15',
      lastPurchaseDate: '2024-01-21',
      totalOrders: 23,
      totalSpent: 18500000,
      averageOrderFrequency: 2.5,
      supportTickets: 1,
      supportPriority: 'high',
      notes: 'Khách hàng VIP trong lĩnh vực y tế, rất quan tâm đến bảo mật',
      internalNotes: 'Có thể mở rộng sang các bệnh viện khác',
      createdAt: '2022-08-10',
      updatedAt: '2024-01-24',
      createdBy: 'admin',
      updatedBy: 'sales_manager',
      isDeleted: false,
      interactions: [
        {
          id: '7',
          type: 'meeting',
          channel: 'In-person',
          title: 'Họp triển khai hệ thống mới',
          summary: 'Thảo luận về tích hợp AI vào hệ thống quản lý bệnh nhân',
          date: '2024-01-24',
          status: 'success'
        }
      ],
      products: [
        {
          id: '16',
          name: 'Healthcare CRM Enterprise',
          category: 'Software',
          purchaseDate: '2024-01-21',
          quantity: 1,
          price: 3200000,
          status: 'active'
        },
        {
          id: '17',
          name: 'Patient Management System',
          category: 'Software',
          purchaseDate: '2023-11-15',
          quantity: 1,
          price: 2500000,
          status: 'active'
        },
        {
          id: '18',
          name: 'Medical Analytics',
          category: 'Module',
          purchaseDate: '2023-08-20',
          quantity: 1,
          price: 1800000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '2024-01-01',
        campaigns: []
      }
    },
    {
      id: 10,
      name: 'Cao Minh Tâm',
      firstName: 'Tâm',
      lastName: 'Cao Minh',
      contact: '0990123456',
      email: 'cao.minh.tam@construction.com',
      company: 'Construction Corp',
      companySize: 'enterprise',
      industry: 'Xây dựng',
      position: 'Tổng Giám đốc',
      department: 'Điều hành',
      status: 'active',
      customerType: 'gold',
      tags: [
        { id: '17', name: 'Dự án lớn', color: 'bg-orange-100 text-orange-800', category: 'value' },
        { id: '18', name: 'Xây dựng', color: 'bg-brown-100 text-brown-800', category: 'behavior' }
      ],
      totalValue: '1,800,000',
      lifetimeValue: '7,200,000',
      averageOrderValue: '900,000',
      lastOrderDate: '2024-01-12',
      lastInteraction: '2024-01-19',
      daysSinceLastInteraction: 5,
      engagementScore: 82,
      churnRisk: 18,
      loyaltyPoints: 1800,
      preferredChannel: 'phone',
      dateOfBirth: '1973-02-28',
      gender: 'male',
      maritalStatus: 'married',
      address: '357 Đường Cộng Hòa',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      phone2: '0990123457',
      website: 'https://constructioncorp.vn',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/cao-minh-tam'
      },
      taxId: '1234567890',
      creditLimit: 5000000,
      paymentTerms: '45 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: false,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '06:00',
          end: '18:00'
        }
      },
      assignedSalesRep: 'Trần Thị Oanh',
      accountManager: 'Lê Văn Thành',
      customerSince: '2023-02-15',
      firstPurchaseDate: '2023-02-20',
      lastPurchaseDate: '2024-01-12',
      totalOrders: 8,
      totalSpent: 7200000,
      averageOrderFrequency: 0.8,
      supportTickets: 4,
      supportPriority: 'medium',
      notes: 'Chuyên về dự án xây dựng lớn, thường mua theo batch',
      internalNotes: 'Có tiềm năng mở rộng sang các tỉnh khác',
      createdAt: '2023-02-15',
      updatedAt: '2024-01-19',
      createdBy: 'sales_rep',
      updatedBy: 'account_manager',
      isDeleted: false,
      interactions: [
        {
          id: '8',
          type: 'call',
          channel: 'Phone',
          title: 'Tư vấn giải pháp cho dự án mới',
          summary: 'Khách hàng cần tư vấn cho dự án cao ốc 40 tầng',
          date: '2024-01-19',
          status: 'success'
        }
      ],

      products: [
        {
          id: '19',
          name: 'Construction Management Suite',
          category: 'Software',
          purchaseDate: '2024-01-12',
          quantity: 1,
          price: 1800000,
          status: 'active'
        },
        {
          id: '20',
          name: 'Project Tracking System',
          category: 'Software',
          purchaseDate: '2023-10-15',
          quantity: 1,
          price: 1500000,
          status: 'active'
        },
        {
          id: '21',
          name: 'Resource Planning Module',
          category: 'Module',
          purchaseDate: '2023-06-20',
          quantity: 1,
          price: 1200000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 11,
      name: 'Dương Thị Hạnh',
      firstName: 'Hạnh',
      lastName: 'Dương Thị',
      contact: '0901234567',
      email: 'duong.thi.hanh@fashion.com',
      company: 'Fashion Boutique',
      companySize: 'small',
      industry: 'Thời trang',
      position: 'Chủ cửa hàng',
      department: 'Kinh doanh',
      status: 'active',
      customerType: 'bronze',
      tags: [
        { id: '19', name: 'Thời trang', color: 'bg-pink-100 text-pink-800', category: 'behavior' },
        { id: '20', name: 'Khách hàng trung thành', color: 'bg-blue-100 text-blue-800', category: 'engagement' }
      ],
      totalValue: '680,000',
      lifetimeValue: '2,720,000',
      averageOrderValue: '170,000',
      lastOrderDate: '2024-01-17',
      lastInteraction: '2024-01-18',
      daysSinceLastInteraction: 6,
      engagementScore: 72,
      churnRisk: 22,
      loyaltyPoints: 680,
      preferredChannel: 'chat',
      dateOfBirth: '1992-11-14',
      gender: 'female',
      maritalStatus: 'single',
      address: '789 Đường Nguyễn Huệ',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      phone2: '0901234568',
      website: 'https://fashionboutique.vn',
      socialMedia: {
        instagram: 'https://instagram.com/fashionboutique',
        facebook: 'https://facebook.com/fashionboutique'
      },
      taxId: '2468135790',
      creditLimit: 1000000,
      paymentTerms: '15 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '09:00',
          end: '21:00'
        }
      },
      assignedSalesRep: 'Phạm Thị Linh',
      customerSince: '2023-05-20',
      firstPurchaseDate: '2023-05-25',
      lastPurchaseDate: '2024-01-17',
      totalOrders: 16,
      totalSpent: 2720000,
      averageOrderFrequency: 2,
      supportTickets: 2,
      supportPriority: 'low',
      notes: 'Chủ cửa hàng thời trang, quan tâm đến marketing online',
      internalNotes: 'Có thể upsell social media management tools',
      createdAt: '2023-05-20',
      updatedAt: '2024-01-18',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '9',
          type: 'chat',
          channel: 'LiveChat',
          title: 'Hỗ trợ setup campaign marketing',
          summary: 'Hướng dẫn thiết lập chiến dịch marketing cho mùa sale',
          date: '2024-01-18',
          status: 'success'
        }
      ],
      products: [
        {
          id: '22',
          name: 'Retail Management System',
          category: 'Software',
          purchaseDate: '2024-01-17',
          quantity: 1,
          price: 680000,
          status: 'active'
        },
        {
          id: '23',
          name: 'Inventory Tracker',
          category: 'Module',
          purchaseDate: '2023-12-10',
          quantity: 1,
          price: 320000,
          status: 'active'
        },
        {
          id: '24',
          name: 'Social Media Integration',
          category: 'Add-on',
          purchaseDate: '2023-11-05',
          quantity: 1,
          price: 180000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 12,
      name: 'Lý Văn Phong',
      firstName: 'Phong',
      lastName: 'Lý Văn',
      contact: '0912345678',
      email: 'ly.van.phong@restaurant.vn',
      company: 'Restaurant Chain',
      companySize: 'medium',
      industry: 'Nhà hàng',
      position: 'Chủ chuỗi nhà hàng',
      department: 'F&B',
      status: 'at-risk',
      customerType: 'silver',
      tags: [
        { id: '21', name: 'Nhà hàng', color: 'bg-yellow-100 text-yellow-800', category: 'behavior' },
        { id: '22', name: 'Cần chăm sóc', color: 'bg-red-100 text-red-800', category: 'risk' }
      ],
      totalValue: '950,000',
      lifetimeValue: '4,750,000',
      averageOrderValue: '475,000',
      lastOrderDate: '2023-12-20',
      lastInteraction: '2024-01-05',
      daysSinceLastInteraction: 19,
      engagementScore: 48,
      churnRisk: 65,
      loyaltyPoints: 475,
      preferredChannel: 'phone',
      dateOfBirth: '1981-09-03',
      gender: 'male',
      maritalStatus: 'married',
      address: '456 Đường Điện Biên Phủ',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      postalCode: '100000',
      phone2: '0912345679',
      website: 'https://restaurantchain.vn',
      socialMedia: {
        facebook: 'https://facebook.com/restaurantchain',
        instagram: 'https://instagram.com/restaurantchain'
      },
      taxId: '3691470258',
      creditLimit: 2000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: false,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '10:00',
          end: '22:00'
        }
      },
      assignedSalesRep: 'Võ Thị Mai',
      customerSince: '2023-01-10',
      firstPurchaseDate: '2023-01-15',
      lastPurchaseDate: '2023-12-20',
      totalOrders: 10,
      totalSpent: 4750000,
      averageOrderFrequency: 1,
      supportTickets: 6,
      supportPriority: 'high',
      notes: 'Chủ chuỗi nhà hàng, gần đây ít tương tác',
      internalNotes: 'Cần follow up gấp, có nguy cơ churn cao',
      createdAt: '2023-01-10',
      updatedAt: '2024-01-05',
      createdBy: 'sales_rep',
      updatedBy: 'account_manager',
      isDeleted: false,
      interactions: [
        {
          id: '10',
          type: 'call',
          channel: 'Phone',
          title: 'Cuộc gọi check-in',
          summary: 'Khách hàng bận, hẹn gọi lại tuần sau',
          date: '2024-01-05',
          status: 'pending'
        }
      ],

      products: [
        {
          id: '25',
          name: 'Restaurant Management System',
          category: 'Software',
          purchaseDate: '2023-12-20',
          quantity: 1,
          price: 950000,
          status: 'active'
        },
        {
          id: '26',
          name: 'Order Management',
          category: 'Module',
          purchaseDate: '2023-08-15',
          quantity: 1,
          price: 650000,
          status: 'active'
        },
        {
          id: '27',
          name: 'Kitchen Display System',
          category: 'Hardware',
          purchaseDate: '2023-06-10',
          quantity: 3,
          price: 1200000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'high',
        lastCampaign: '2024-01-10',
        campaigns: [
          {
            id: 'c6',
            name: 'Restaurant Retention Campaign',
            type: 'email',
            status: 'sent',
            sentAt: '2024-01-10',
            openRate: 55,
            clickRate: 8
          }
        ]
      }
    },
    {
      id: 13,
      name: 'Nguyễn Thị Uyên',
      firstName: 'Uyên',
      lastName: 'Nguyễn Thị',
      contact: '0923456789',
      email: 'nguyen.thi.uyen@bookstore.com',
      company: 'Bookstore Network',
      companySize: 'small',
      industry: 'Xuất bản',
      position: 'Chủ cửa hàng sách',
      department: 'Kinh doanh',
      status: 'active',
      customerType: 'new',
      tags: [
        { id: '23', name: 'Sách', color: 'bg-indigo-100 text-indigo-800', category: 'behavior' },
        { id: '24', name: 'Khách hàng mới', color: 'bg-green-100 text-green-800', category: 'value' }
      ],
      totalValue: '320,000',
      lifetimeValue: '320,000',
      averageOrderValue: '160,000',
      lastOrderDate: '2024-01-22',
      lastInteraction: '2024-01-23',
      daysSinceLastInteraction: 1,
      engagementScore: 88,
      churnRisk: 8,
      loyaltyPoints: 32,
      preferredChannel: 'email',
      dateOfBirth: '1989-04-12',
      gender: 'female',
      maritalStatus: 'single',
      address: '123 Đường Sách',
      city: 'Hà Nội',
      state: 'Hà Nội',
      country: 'Việt Nam',
      postalCode: '100000',
      website: 'https://bookstorenetwork.vn',
      socialMedia: {
        facebook: 'https://facebook.com/bookstorenetwork',
        instagram: 'https://instagram.com/bookstorenetwork'
      },
      taxId: '7410852963',
      creditLimit: 500000,
      paymentTerms: '7 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: true,
        newsletter: true,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '18:00'
        }
      },
      assignedSalesRep: 'Đặng Văn Hùng',
      customerSince: '2024-01-10',
      firstPurchaseDate: '2024-01-15',
      lastPurchaseDate: '2024-01-22',
      totalOrders: 2,
      totalSpent: 320000,
      averageOrderFrequency: 2,
      supportTickets: 0,
      supportPriority: 'low',
      notes: 'Khách hàng mới trong lĩnh vực sách, rất tích cực',
      internalNotes: 'Tiềm năng phát triển tốt, có thể mở rộng',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-23',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '11',
          type: 'email',
          channel: 'Email',
          title: 'Welcome email và onboarding',
          summary: 'Gửi email chào mừng và hướng dẫn sử dụng hệ thống',
          date: '2024-01-23',
          status: 'success'
        }
      ],
      products: [
        {
          id: '28',
          name: 'Bookstore POS System',
          category: 'Software',
          purchaseDate: '2024-01-22',
          quantity: 1,
          price: 320000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 14,
      name: 'Trịnh Văn Đạt',
      firstName: 'Đạt',
      lastName: 'Trịnh Văn',
      contact: '0934567890',
      email: 'trinh.van.dat@autoservice.com',
      company: 'Auto Service Center',
      companySize: 'medium',
      industry: 'Ô tô',
      position: 'Chủ xưởng',
      department: 'Dịch vụ',
      status: 'active',
      customerType: 'returning',
      tags: [
        { id: '25', name: 'Ô tô', color: 'bg-gray-100 text-gray-800', category: 'behavior' },
        { id: '26', name: 'Khách quay lại', color: 'bg-green-100 text-green-800', category: 'engagement' }
      ],
      totalValue: '1,200,000',
      lifetimeValue: '3,600,000',
      averageOrderValue: '600,000',
      lastOrderDate: '2024-01-16',
      lastInteraction: '2024-01-17',
      daysSinceLastInteraction: 7,
      engagementScore: 76,
      churnRisk: 15,
      loyaltyPoints: 1200,
      preferredChannel: 'phone',
      dateOfBirth: '1984-12-08',
      gender: 'male',
      maritalStatus: 'married',
      address: '987 Đường Xô Viết Nghệ Tĩnh',
      city: 'Đà Nẵng',
      state: 'Đà Nẵng',
      country: 'Việt Nam',
      postalCode: '550000',
      phone2: '0934567891',
      website: 'https://autoservicecenter.vn',
      taxId: '8520741963',
      creditLimit: 3000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: true,
        newsletter: false,
        smsConsent: true,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '07:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Huỳnh Thị Nga',
      customerSince: '2023-09-20',
      firstPurchaseDate: '2023-09-25',
      lastPurchaseDate: '2024-01-16',
      totalOrders: 6,
      totalSpent: 3600000,
      averageOrderFrequency: 1.5,
      supportTickets: 3,
      supportPriority: 'medium',
      notes: 'Chủ xưởng ô tô, đã quay lại sau khi tạm ngưng',
      internalNotes: 'Từng dừng hợp tác 2 tháng, nay đã quay lại',
      createdAt: '2023-09-20',
      updatedAt: '2024-01-17',
      createdBy: 'sales_rep',
      updatedBy: 'sales_rep',
      isDeleted: false,
      interactions: [
        {
          id: '12',
          type: 'call',
          channel: 'Phone',
          title: 'Tư vấn nâng cấp hệ thống',
          summary: 'Khách hàng muốn tích hợp thêm module quản lý phụ tùng',
          date: '2024-01-17',
          status: 'success'
        }
      ],

      products: [
        {
          id: '29',
          name: 'Auto Service Management',
          category: 'Software',
          purchaseDate: '2024-01-16',
          quantity: 1,
          price: 1200000,
          status: 'active'
        },
        {
          id: '30',
          name: 'Customer Appointment System',
          category: 'Module',
          purchaseDate: '2023-11-10',
          quantity: 1,
          price: 800000,
          status: 'active'
        },
        {
          id: '31',
          name: 'Parts Inventory Management',
          category: 'Module',
          purchaseDate: '2023-09-25',
          quantity: 1,
          price: 600000,
          status: 'active'
        }
      ],
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        campaigns: []
      }
    },
    {
      id: 15,
      name: 'Phùng Thị Hương',
      firstName: 'Hương',
      lastName: 'Phùng Thị',
      contact: '0945678901',
      email: 'phung.thi.huong@pharmacy.vn',
      company: 'Pharmacy Chain',
      companySize: 'large',
      industry: 'Dược phẩm',
      position: 'Giám đốc chuỗi',
      department: 'Điều hành',
      status: 'inactive',
      customerType: 'inactive',
      tags: [
        { id: '27', name: 'Dược phẩm', color: 'bg-green-100 text-green-800', category: 'behavior' },
        { id: '28', name: 'Tạm ngưng', color: 'bg-gray-100 text-gray-800', category: 'risk' }
      ],
      totalValue: '0',
      lifetimeValue: '8,500,000',
      averageOrderValue: '850,000',
      lastOrderDate: '2023-09-30',
      lastInteraction: '2023-11-15',
      daysSinceLastInteraction: 71,
      engagementScore: 25,
      churnRisk: 85,
      loyaltyPoints: 0,
      preferredChannel: 'email',
      dateOfBirth: '1979-01-25',
      gender: 'female',
      maritalStatus: 'divorced',
      address: '741 Đường Cách Mạng Tháng 8',
      city: 'TP.HCM',
      state: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      phone2: '0945678902',
      website: 'https://pharmacychain.vn',
      taxId: '9630741852',
      creditLimit: 0,
      paymentTerms: 'Đã tạm dừng',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'monthly',
        marketingConsent: false,
        newsletter: false,
        smsConsent: false,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '17:00'
        }
      },
      assignedSalesRep: 'Lê Thị Phương',
      customerSince: '2022-04-10',
      firstPurchaseDate: '2022-04-15',
      lastPurchaseDate: '2023-09-30',
      totalOrders: 10,
      totalSpent: 8500000,
      averageOrderFrequency: 0.6,
      supportTickets: 5,
      supportPriority: 'low',
      notes: 'Chuỗi nhà thuốc, tạm ngưng do thay đổi hệ thống nội bộ',
      internalNotes: 'Có thể quay lại trong Q2/2024',
      createdAt: '2022-04-10',
      updatedAt: '2023-11-15',
      createdBy: 'sales_manager',
      updatedBy: 'account_manager',
      isDeleted: false,
      interactions: [
        {
          id: '13',
          type: 'email',
          channel: 'Email',
          title: 'Email thông báo tạm ngưng',
          summary: 'Khách hàng thông báo tạm ngưng do thay đổi hệ thống',
          date: '2023-11-15',
          status: 'success'
        }
      ],
      products: [
        {
          id: '32',
          name: 'Pharmacy Management System',
          category: 'Software',
          purchaseDate: '2022-04-15',
          quantity: 1,
          price: 2500000,
          status: 'expired'
        },
        {
          id: '33',
          name: 'Drug Inventory Control',
          category: 'Module',
          purchaseDate: '2022-08-20',
          quantity: 1,
          price: 1800000,
          status: 'expired'
        },
        {
          id: '34',
          name: 'Prescription Management',
          category: 'Module',
          purchaseDate: '2023-02-10',
          quantity: 1,
          price: 1200000,
          status: 'expired'
        }
      ],
      remarketing: {
        eligible: true,
        priority: 'medium',
        lastCampaign: '2023-12-01',
        campaigns: [
          {
            id: 'c7',
            name: 'Pharmacy Reactivation',
            type: 'email',
            status: 'sent',
            sentAt: '2023-12-01',
            openRate: 35,
            clickRate: 2
          }
        ]
      }
    }
  ])

  // Helper functions
  const formatCurrency = (value: string) => {
    return parseInt(value.replace(/,/g, '')).toLocaleString()
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Chưa có'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Chưa có'
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    } catch {
      return 'Chưa có'
    }
  }

  const formatBirthday = (dateString?: string): string => {
    if (!dateString) return 'Chưa có'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Chưa có'
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    } catch {
      return 'Chưa có'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600'
    if (risk >= 40) return 'text-orange-600'
    return 'text-green-600'
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleExportData = (format: 'csv' | 'excel') => {
    console.log(`Exporting ${filteredCustomers.length} customers as ${format}`)
    // Implement export logic here
  }

  const handleRemarketingClick = () => {
    setShowRemarketingModal(true)
  }

  const handleAddCustomer = () => {
    // Validate required fields
    if (!newCustomerData.email || !newCustomerData.phone) {
      alert('Vui lòng điền email và số điện thoại')
      return
    }

    // Create new customer object
    const newCustomer: Customer = {
      id: Math.max(...customers.map(c => c.id)) + 1,
      name: `${newCustomerData.lastName} ${newCustomerData.firstName}`.trim() || 'Khách hàng mới',
      firstName: newCustomerData.firstName,
      lastName: newCustomerData.lastName,
      contact: newCustomerData.phone,
      email: newCustomerData.email,
      company: newCustomerData.company || 'Chưa cập nhật',
      companySize: newCustomerData.companySize as any,
      industry: newCustomerData.industry || 'Khác',
      position: newCustomerData.position || 'Chưa cập nhật',
      department: 'Chưa phân bổ',
      status: newCustomerData.status as any,
      customerType: newCustomerData.customerType as any,
      tags: [],
      totalValue: '0',
      lifetimeValue: '0',
      averageOrderValue: '0',
      lastOrderDate: '',
      lastInteraction: new Date().toISOString().split('T')[0],
      daysSinceLastInteraction: 0,
      engagementScore: 50,
      churnRisk: 20,
      loyaltyPoints: 0,
      preferredChannel: newCustomerData.preferredChannel as any,
      interactions: [],

      products: [],
      address: newCustomerData.address || '',
      city: newCustomerData.city || '',
      state: newCustomerData.state || '',
      country: 'Việt Nam',
      postalCode: newCustomerData.postalCode || '',
      creditLimit: 1000000,
      paymentTerms: '30 ngày',
      currency: 'VND',
      taxExempt: false,
      preferences: {
        communicationFrequency: 'weekly',
        marketingConsent: newCustomerData.marketingConsent,
        newsletter: newCustomerData.marketingConsent,
        smsConsent: newCustomerData.smsConsent,
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        communicationHours: {
          start: '08:00',
          end: '18:00'
        }
      },
      customerSince: new Date().toISOString().split('T')[0],
      firstPurchaseDate: '',
      lastPurchaseDate: '',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderFrequency: 0,
      supportTickets: 0,
      supportPriority: 'medium',
      notes: newCustomerData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      updatedBy: 'Admin',
      isDeleted: false,
      remarketing: {
        eligible: false,
        priority: 'low',
        lastCampaign: '',
        suggestedActions: [],
        campaigns: []
      }
    }

    // Here you would normally add to the customers array
    // For now, we'll just show a success message
    alert('Khách hàng mới đã được thêm thành công!')
    
    // Reset form and close modal
    setNewCustomerData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      industry: '',
      companySize: 'small',
      customerType: 'bronze',
      status: 'active',
      preferredChannel: 'email',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      notes: '',
      marketingConsent: false,
      smsConsent: false
    })
    setShowAddCustomerModal(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setNewCustomerData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('')
    setFilterIndustry('')
    setFilterTag('')
    setFilterCustomerType('')
    setFilterPurchasedProduct('')
  }

  const handleCustomerTypeFilter = (customerType: string) => {
    setFilterCustomerType(customerType)
    setSelectedView('list') // Automatically switch to list view when filtering
  }
  // Filter logic - Only show customers who have made purchases (existing customers)
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Only show customers who have purchase history (exclude prospects/leads)
      const hasValidPurchaseHistory = customer.products && customer.products.length > 0 && 
                                     customer.totalSpent > 0
      if (!hasValidPurchaseHistory) return false

      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !filterStatus || customer.status === filterStatus
      const matchesIndustry = !filterIndustry || customer.industry === filterIndustry
      const matchesTag = !filterTag || customer.tags.some(tag => tag.name === filterTag)
      const matchesCustomerType = !filterCustomerType || customer.customerType === filterCustomerType
      const matchesPurchasedProduct = !filterPurchasedProduct || 
        customer.products.some(product => 
          product.name.toLowerCase().includes(filterPurchasedProduct.toLowerCase())
        )

      return matchesSearch && matchesStatus && matchesIndustry && matchesTag && 
             matchesCustomerType && matchesPurchasedProduct
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'lastInteraction':
          return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
        case 'engagementScore':
          return b.engagementScore - a.engagementScore
        case 'churnRisk':
          return b.churnRisk - a.churnRisk
        case 'totalValue':
          return parseInt(b.totalValue.replace(/,/g, '')) - parseInt(a.totalValue.replace(/,/g, ''))
        default:
          return 0
      }
    })
  }, [customers, searchTerm, filterStatus, filterIndustry, filterTag, filterCustomerType, filterPurchasedProduct, sortBy])

  const remarketingCustomers = customers.filter(c => 
    c.remarketing.eligible && (c.status === 'at-risk' || c.churnRisk >= 50)
  )

  // AI Action Handlers
  // Additional state for new remarketing flow
  const [remarketingStep, setRemarketingStep] = useState(1)
  const [selectedRemarketingCustomers, setSelectedRemarketingCustomers] = useState<Customer[]>([])
  const [remarketingCampaignType, setRemarketingCampaignType] = useState('')
  const [remarketingFilters, setRemarketingFilters] = useState({
    riskLevel: '',
    daysSinceLastContact: '',
    customerType: '',
    engagementScore: '',
    birthdayPeriod: '',
    birthdayMonth: ''
  })

  const handleRemarketingCustomerToggle = (customer: Customer) => {
    setSelectedRemarketingCustomers(prev => {
      const isSelected = prev.find(c => c.id === customer.id)
      if (isSelected) {
        return prev.filter(c => c.id !== customer.id)
      } else {
        return [...prev, customer]
      }
    })
  }

  const handleSelectAllRemarketing = () => {
    const filteredForRemarketing = getFilteredRemarketingCustomers()
    if (selectedRemarketingCustomers.length === filteredForRemarketing.length) {
      setSelectedRemarketingCustomers([])
    } else {
      setSelectedRemarketingCustomers(filteredForRemarketing)
    }
  }

  const getFilteredRemarketingCustomers = () => {
    return customers.filter(customer => {
      // Special logic for birthday campaign
      if (remarketingCampaignType === 'birthday') {
        if (!customer.dateOfBirth) return false
        
        const customerBirthday = new Date(customer.dateOfBirth)
        const currentDate = new Date()
        const customerMonth = customerBirthday.getMonth()
        const customerDay = customerBirthday.getDate()
        
        // Apply birthday period filter
        if (remarketingFilters.birthdayPeriod) {
          const currentMonth = currentDate.getMonth()
          const currentYear = currentDate.getFullYear()
          
          if (remarketingFilters.birthdayPeriod === 'this_month') {
            return customerMonth === currentMonth
          } else if (remarketingFilters.birthdayPeriod === 'next_month') {
            const nextMonth = (currentMonth + 1) % 12
            return customerMonth === nextMonth
          } else if (remarketingFilters.birthdayPeriod === 'this_week') {
            const currentWeekStart = new Date(currentDate)
            currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay())
            const currentWeekEnd = new Date(currentWeekStart)
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
            
            const thisBirthday = new Date(currentYear, customerMonth, customerDay)
            return thisBirthday >= currentWeekStart && thisBirthday <= currentWeekEnd
          } else if (remarketingFilters.birthdayPeriod === 'next_week') {
            const nextWeekStart = new Date(currentDate)
            nextWeekStart.setDate(currentDate.getDate() + (7 - currentDate.getDay()))
            const nextWeekEnd = new Date(nextWeekStart)
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
            
            const thisBirthday = new Date(currentYear, customerMonth, customerDay)
            return thisBirthday >= nextWeekStart && thisBirthday <= nextWeekEnd
          } else if (remarketingFilters.birthdayPeriod === 'today') {
            return customerMonth === currentMonth && customerDay === currentDate.getDate()
          }
        }
        
        // Apply specific month filter
        if (remarketingFilters.birthdayMonth) {
          const selectedMonth = parseInt(remarketingFilters.birthdayMonth)
          return customerMonth === selectedMonth
        }
        
        // Default: current month or next month
        if (!remarketingFilters.birthdayPeriod && !remarketingFilters.birthdayMonth) {
          const currentMonth = currentDate.getMonth()
          const nextMonth = (currentMonth + 1) % 12
          return customerMonth === currentMonth || customerMonth === nextMonth
        }
        
        return true
      }

      // Base remarketing criteria for other campaigns
      let isEligible = customer.churnRisk >= 40 || customer.daysSinceLastInteraction >= 14

      // Apply additional filters
      if (remarketingFilters.riskLevel) {
        if (remarketingFilters.riskLevel === 'high' && customer.churnRisk < 70) isEligible = false
        if (remarketingFilters.riskLevel === 'medium' && (customer.churnRisk < 40 || customer.churnRisk >= 70)) isEligible = false
        if (remarketingFilters.riskLevel === 'low' && customer.churnRisk >= 40) isEligible = false
      }

      if (remarketingFilters.daysSinceLastContact) {
        const days = parseInt(remarketingFilters.daysSinceLastContact)
        if (customer.daysSinceLastInteraction < days) isEligible = false
      }

      if (remarketingFilters.customerType && customer.customerType !== remarketingFilters.customerType) {
        isEligible = false
      }

      if (remarketingFilters.engagementScore) {
        if (remarketingFilters.engagementScore === 'high' && customer.engagementScore < 70) isEligible = false
        if (remarketingFilters.engagementScore === 'medium' && (customer.engagementScore < 40 || customer.engagementScore >= 70)) isEligible = false
        if (remarketingFilters.engagementScore === 'low' && customer.engagementScore >= 40) isEligible = false
      }

      return isEligible
    })
  }

  return (
    <>
      {/* Remarketing Campaign Modal - Multi-step Flow */}
      {showRemarketingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header with Steps */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center space-x-4">
                <Target className="w-8 h-8 text-orange-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🎯 Tạo chiến dịch Remarketing</h2>
                  <p className="text-gray-600">Thiết lập chiến dịch tái kích hoạt khách hàng</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRemarketingModal(false)
                  setRemarketingStep(1)
                  setSelectedRemarketingCustomers([])
                  setRemarketingCampaignType('')
                  setRemarketingFilters({
                    riskLevel: '',
                    daysSinceLastContact: '',
                    customerType: '',
                    engagementScore: '',
                    birthdayPeriod: '',
                    birthdayMonth: ''
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Progress */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-center space-x-8">
                <div className={`flex items-center space-x-2 ${remarketingStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    remarketingStep >= 1 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                  }`}>1</div>
                  <span className="font-medium">Chọn loại chiến dịch</span>
                </div>
                <div className={`w-8 h-0.5 ${remarketingStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center space-x-2 ${remarketingStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    remarketingStep >= 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                  }`}>2</div>
                  <span className="font-medium">Lọc khách hàng</span>
                </div>
                <div className={`w-8 h-0.5 ${remarketingStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center space-x-2 ${remarketingStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    remarketingStep >= 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                  }`}>3</div>
                  <span className="font-medium">Thiết lập & Chạy</span>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
              {/* Step 1: Campaign Type Selection */}
              {remarketingStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 1: Chọn loại chiến dịch</h3>
                    <p className="text-gray-600">Chọn hình thức liên hệ phù hợp với khách hàng của bạn</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Email Campaign */}
                    <div 
                      onClick={() => setRemarketingCampaignType('email')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'email' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Email Campaign</h4>
                          <p className="text-sm text-gray-600">Gửi email tái kích hoạt</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ mở email: ~25%</div>
                        <div>• Chi phí: Thấp</div>
                        <div>• Thời gian thiết lập: 15 phút</div>
                        <div>• Phù hợp: Khách hàng có email hoạt động</div>
                      </div>
                    </div>

                    {/* SMS Campaign */}
                    <div 
                      onClick={() => setRemarketingCampaignType('sms')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'sms' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">SMS Campaign</h4>
                          <p className="text-sm text-gray-600">Tin nhắn ưu đãi đặc biệt</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ đọc: ~98%</div>
                        <div>• Chi phí: Trung bình</div>
                        <div>• Thời gian thiết lập: 10 phút</div>
                        <div>• Phù hợp: Ưu đãi khẩn cấp</div>
                      </div>
                    </div>

                    {/* Phone Campaign */}
                    <div 
                      onClick={() => setRemarketingCampaignType('phone')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'phone' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Phone Campaign</h4>
                          <p className="text-sm text-gray-600">Danh sách gọi trực tiếp</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ chuyển đổi: ~45%</div>
                        <div>• Chi phí: Cao</div>
                        <div>• Thời gian thiết lập: 30 phút</div>
                        <div>• Phù hợp: Khách hàng VIP</div>
                      </div>
                    </div>

                    {/* Multi-Channel */}
                    <div 
                      onClick={() => setRemarketingCampaignType('multi')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'multi' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Multi-Channel</h4>
                          <p className="text-sm text-gray-600">Kết hợp nhiều kênh</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ hiệu quả: ~65%</div>
                        <div>• Chi phí: Cao</div>
                        <div>• Thời gian thiết lập: 45 phút</div>
                        <div>• Phù hợp: Khách hàng quan trọng</div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div 
                      onClick={() => setRemarketingCampaignType('social')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'social' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Social Media</h4>
                          <p className="text-sm text-gray-600">Quảng cáo mạng xã hội</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ tương tác: ~35%</div>
                        <div>• Chi phí: Trung bình</div>
                        <div>• Thời gian thiết lập: 20 phút</div>
                        <div>• Phù hợp: Khách hàng trẻ</div>
                      </div>
                    </div>

                    {/* Promotion Campaign */}
                    <div 
                      onClick={() => setRemarketingCampaignType('promotion')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'promotion' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Promotion Campaign</h4>
                          <p className="text-sm text-gray-600">Ưu đãi đặc biệt</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ chuyển đổi: ~55%</div>
                        <div>• Chi phí: Trung bình</div>
                        <div>• Thời gian thiết lập: 25 phút</div>
                        <div>• Phù hợp: Khách hàng giá rẻ</div>
                      </div>
                    </div>

                    {/* Birthday Campaign */}
                    <div 
                      onClick={() => setRemarketingCampaignType('birthday')}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        remarketingCampaignType === 'birthday' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">🎂 Birthday Campaign</h4>
                          <p className="text-sm text-gray-600">Chúc mừng sinh nhật khách hàng</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Tỷ lệ mở email: ~85%</div>
                        <div>• Tỷ lệ chuyển đổi: ~45%</div>
                        <div>• Chi phí: Thấp</div>
                        <div>• Thời gian thiết lập: 15 phút</div>
                        <div>• Phù hợp: Tất cả khách hàng có sinh nhật</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Customer Filtering */}
              {remarketingStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 2: Lọc khách hàng mục tiêu</h3>
                    <p className="text-gray-600">Chọn các tiêu chí để lọc khách hàng cần remarketing</p>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ rủi ro</label>
                      <select
                        value={remarketingFilters.riskLevel}
                        onChange={(e) => setRemarketingFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="high">Cao (≥70%)</option>
                        <option value="medium">Trung bình (40-69%)</option>
                        <option value="low">Thấp (&lt;40%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày chưa liên hệ</label>
                      <select
                        value={remarketingFilters.daysSinceLastContact}
                        onChange={(e) => setRemarketingFilters(prev => ({ ...prev, daysSinceLastContact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="7">≥ 7 ngày</option>
                        <option value="14">≥ 14 ngày</option>
                        <option value="30">≥ 30 ngày</option>
                        <option value="60">≥ 60 ngày</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại khách hàng</label>
                      <select
                        value={remarketingFilters.customerType}
                        onChange={(e) => setRemarketingFilters(prev => ({ ...prev, customerType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="diamond">Kim cương</option>
                        <option value="gold">Vàng</option>
                        <option value="silver">Bạc</option>
                        <option value="bronze">Đồng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điểm tương tác</label>
                      <select
                        value={remarketingFilters.engagementScore}
                        onChange={(e) => setRemarketingFilters(prev => ({ ...prev, engagementScore: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="high">Cao (≥70)</option>
                        <option value="medium">Trung bình (40-69)</option>
                        <option value="low">Thấp (&lt;40)</option>
                      </select>
                    </div>
                  </div>

                  {/* Birthday Campaign Specific Filters */}
                  {remarketingCampaignType === 'birthday' && (
                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                      <h4 className="font-medium text-pink-800 mb-3 flex items-center">
                        🎂 Bộ lọc sinh nhật
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                          <select
                            value={remarketingFilters.birthdayPeriod}
                            onChange={(e) => setRemarketingFilters(prev => ({ ...prev, birthdayPeriod: e.target.value, birthdayMonth: '' }))}
                            className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="">Tháng này + tháng tới (mặc định)</option>
                            <option value="today">🎯 Hôm nay</option>
                            <option value="this_week">📅 Tuần này</option>
                            <option value="next_week">📅 Tuần tới</option>
                            <option value="this_month">📅 Tháng này</option>
                            <option value="next_month">📅 Tháng tới</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tháng cụ thể</label>
                          <select
                            value={remarketingFilters.birthdayMonth}
                            onChange={(e) => setRemarketingFilters(prev => ({ ...prev, birthdayMonth: e.target.value, birthdayPeriod: '' }))}
                            className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            disabled={remarketingFilters.birthdayPeriod !== ''}
                          >
                            <option value="">Chọn tháng sinh nhật</option>
                            <option value="0">Tháng 1</option>
                            <option value="1">Tháng 2</option>
                            <option value="2">Tháng 3</option>
                            <option value="3">Tháng 4</option>
                            <option value="4">Tháng 5</option>
                            <option value="5">Tháng 6</option>
                            <option value="6">Tháng 7</option>
                            <option value="7">Tháng 8</option>
                            <option value="8">Tháng 9</option>
                            <option value="9">Tháng 10</option>
                            <option value="10">Tháng 11</option>
                            <option value="11">Tháng 12</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-pink-700">
                        💡 <strong>Gợi ý:</strong> 
                        {remarketingFilters.birthdayPeriod === 'today' && ' Gửi lời chúc vào đúng ngày sinh nhật'}
                        {remarketingFilters.birthdayPeriod === 'this_week' && ' Gửi trước 1-2 ngày để chuẩn bị quà'}
                        {remarketingFilters.birthdayPeriod === 'next_week' && ' Lên kế hoạch chiến dịch trước'}
                        {remarketingFilters.birthdayPeriod === 'this_month' && ' Chiến dịch sinh nhật tháng hiện tại'}
                        {remarketingFilters.birthdayPeriod === 'next_month' && ' Chuẩn bị chiến dịch tháng sau'}
                        {remarketingFilters.birthdayMonth && ` Tất cả khách hàng sinh tháng ${parseInt(remarketingFilters.birthdayMonth) + 1}`}
                        {!remarketingFilters.birthdayPeriod && !remarketingFilters.birthdayMonth && ' Tự động lọc sinh nhật gần nhất (tháng này + tháng tới)'}
                      </div>
                    </div>
                  )}

                  {/* Customer List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Khách hàng phù hợp ({getFilteredRemarketingCustomers().length})
                      </h4>
                      <button
                        onClick={handleSelectAllRemarketing}
                        className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                      >
                        {selectedRemarketingCustomers.length === getFilteredRemarketingCustomers().length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {getFilteredRemarketingCustomers().map(customer => (
                        <div key={customer.id} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedRemarketingCustomers.find(c => c.id === customer.id) !== undefined}
                            onChange={() => handleRemarketingCustomerToggle(customer)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{customer.name}</h5>
                            <p className="text-sm text-gray-600">{customer.company}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              {remarketingCampaignType === 'birthday' ? (
                                <>
                                  <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                                    🎂 {formatBirthday(customer.dateOfBirth)}
                                  </span>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                    {customer.customerType === 'diamond' ? '💎 VIP' : 
                                     customer.customerType === 'gold' ? '🥇 Vàng' : 
                                     customer.customerType === 'silver' ? '🥈 Bạc' : '🥉 Đồng'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    {customer.churnRisk}% rủi ro
                                  </span>
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    {customer.daysSinceLastInteraction} ngày
                                  </span>
                                </>
                              )}
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {customer.engagementScore} điểm
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Campaign Setup */}
              {remarketingStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 3: Thiết lập chiến dịch</h3>
                    <p className="text-gray-600">Cấu hình chi tiết cho chiến dịch {
                      remarketingCampaignType === 'email' ? 'Email' :
                      remarketingCampaignType === 'sms' ? 'SMS' :
                      remarketingCampaignType === 'phone' ? 'Phone' :
                      remarketingCampaignType === 'multi' ? 'Multi-Channel' :
                      remarketingCampaignType === 'social' ? 'Social Media' : 
                      remarketingCampaignType === 'promotion' ? 'Promotion' :
                      remarketingCampaignType === 'birthday' ? '🎂 Birthday' : 'Remarketing'
                    }</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Chi tiết chiến dịch</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tên chiến dịch</label>
                          <input
                            type="text"
                            defaultValue={
                              remarketingCampaignType === 'birthday' 
                                ? `🎂 Chúc mừng sinh nhật - ${new Date().toLocaleDateString('vi-VN')}`
                                : `Remarketing ${remarketingCampaignType.toUpperCase()} - ${new Date().toLocaleDateString('vi-VN')}`
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        {remarketingCampaignType === 'promotion' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức giảm giá (%)</label>
                            <input
                              type="number"
                              defaultValue="20"
                              min="5"
                              max="50"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        )}
                        {remarketingCampaignType === 'birthday' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">🎁 Ưu đãi sinh nhật</label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                                <option value="discount">Giảm giá 15%</option>
                                <option value="gift">Quà tặng miễn phí</option>
                                <option value="voucher">Voucher 100k</option>
                                <option value="combo">Combo ưu đãi</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Gửi trước sinh nhật</label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                                <option value="0">Vào ngày sinh nhật</option>
                                <option value="1">1 ngày trước</option>
                                <option value="3">3 ngày trước</option>
                                <option value="7">1 tuần trước</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">💌 Template tin nhắn</label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                                <option value="formal">Lời chúc trang trọng</option>
                                <option value="friendly">Lời chúc thân thiện</option>
                                <option value="cute">Lời chúc dễ thương</option>
                                <option value="business">Lời chúc kinh doanh</option>
                              </select>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                          <textarea
                            rows={3}
                            placeholder="Ghi chú thêm về chiến dịch..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selected Customers Summary */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Khách hàng đã chọn ({selectedRemarketingCustomers.length})</h4>
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {selectedRemarketingCustomers.map(customer => (
                          <div key={customer.id} className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium text-sm">
                              {customer.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Preview */}
                  <div className={`border rounded-lg p-6 ${
                    remarketingCampaignType === 'birthday' 
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' 
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                  }`}>
                    <h4 className={`font-medium mb-4 ${
                      remarketingCampaignType === 'birthday' ? 'text-pink-800' : 'text-orange-800'
                    }`}>
                      {remarketingCampaignType === 'birthday' ? '🎂 Dự báo hiệu quả chúc mừng sinh nhật' : '📊 Dự báo hiệu quả chiến dịch'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          remarketingCampaignType === 'birthday' ? 'text-pink-600' : 'text-orange-600'
                        }`}>{selectedRemarketingCustomers.length}</p>
                        <p className={`text-sm ${
                          remarketingCampaignType === 'birthday' ? 'text-pink-800' : 'text-orange-800'
                        }`}>
                          {remarketingCampaignType === 'birthday' ? 'Khách có sinh nhật' : 'Khách hàng'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(selectedRemarketingCustomers.length * (
                            remarketingCampaignType === 'email' ? 0.25 :
                            remarketingCampaignType === 'sms' ? 0.98 :
                            remarketingCampaignType === 'phone' ? 0.45 :
                            remarketingCampaignType === 'multi' ? 0.65 :
                            remarketingCampaignType === 'social' ? 0.35 : 
                            remarketingCampaignType === 'birthday' ? 0.85 : 0.55
                          ) * 100) / 100}
                        </p>
                        <p className="text-sm text-green-800">
                          {remarketingCampaignType === 'birthday' ? 'Dự kiến mở email' : 'Dự kiến phản hồi'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(selectedRemarketingCustomers.length * (
                            remarketingCampaignType === 'birthday' ? 0.45 : 0.15
                          ))}
                        </p>
                        <p className="text-sm text-blue-800">Dự kiến chuyển đổi</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {remarketingCampaignType === 'birthday' ? '45%' : '15%'}
                        </p>
                        <p className="text-sm text-purple-800">Tỷ lệ thành công</p>
                      </div>
                    </div>
                    
                    {/* Birthday specific preview */}
                    {remarketingCampaignType === 'birthday' && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-pink-200">
                        <h5 className="font-medium text-pink-800 mb-2">💌 Preview tin nhắn sinh nhật:</h5>
                        <div className="text-sm text-gray-700 italic bg-pink-50 p-3 rounded border-l-4 border-pink-400">
                          &quot;🎉 Chúc mừng sinh nhật {selectedRemarketingCustomers[0]?.name || '[Tên khách hàng]'}! 🎂<br/>
                          Nhân dịp sinh nhật đặc biệt này, chúng tôi gửi tặng bạn ưu đãi 15% cho tất cả sản phẩm. 🎁<br/>
                          Cảm ơn bạn đã luôn đồng hành cùng chúng tôi!&quot;
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {remarketingStep === 1 && remarketingCampaignType && `Loại chiến dịch: ${remarketingCampaignType}`}
                {remarketingStep === 2 && `${selectedRemarketingCustomers.length} khách hàng đã chọn`}
                {remarketingStep === 3 && `Sẵn sàng chạy chiến dịch cho ${selectedRemarketingCustomers.length} khách hàng`}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (remarketingStep > 1) {
                      setRemarketingStep(remarketingStep - 1)
                    } else {
                      setShowRemarketingModal(false)
                      setRemarketingStep(1)
                      setSelectedRemarketingCustomers([])
                      setRemarketingCampaignType('')
                      setRemarketingFilters({
                        riskLevel: '',
                        daysSinceLastContact: '',
                        customerType: '',
                        engagementScore: '',
                        birthdayPeriod: '',
                        birthdayMonth: ''
                      })
                    }
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {remarketingStep > 1 ? 'Quay lại' : 'Đóng'}
                </button>
                <button
                  onClick={() => {
                    if (remarketingStep < 3) {
                      if (remarketingStep === 1 && !remarketingCampaignType) {
                        alert('Vui lòng chọn loại chiến dịch')
                        return
                      }
                      if (remarketingStep === 2 && selectedRemarketingCustomers.length === 0) {
                        alert('Vui lòng chọn ít nhất một khách hàng')
                        return
                      }
                      setRemarketingStep(remarketingStep + 1)
                    } else {
                      // Execute campaign
                      alert('Chiến dịch đã được tạo và sẽ chạy theo lịch trình!')
                      setShowRemarketingModal(false)
                      setRemarketingStep(1)
                      setSelectedRemarketingCustomers([])
                      setRemarketingCampaignType('')
                      setRemarketingFilters({
                        riskLevel: '',
                        daysSinceLastContact: '',
                        customerType: '',
                        engagementScore: '',
                        birthdayPeriod: '',
                        birthdayMonth: ''
                      })
                    }
                  }}
                  disabled={
                    (remarketingStep === 1 && !remarketingCampaignType) ||
                    (remarketingStep === 2 && selectedRemarketingCustomers.length === 0)
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {remarketingStep < 3 ? 'Tiếp tục' : 'Chạy chiến dịch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Thêm khách hàng mới</h2>
                  <p className="text-gray-600">Nhập thông tin chi tiết khách hàng</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">🏷️ Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                      <input
                        type="text"
                        value={newCustomerData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nguyễn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                      <input
                        type="text"
                        value={newCustomerData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Văn An"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={newCustomerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={newCustomerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0901234567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Công ty</label>
                    <input
                      type="text"
                      value={newCustomerData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tên công ty"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                    <input
                      type="text"
                      value={newCustomerData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CEO, Manager, ..."
                    />
                  </div>
                </div>
                
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">🏢 Thông tin doanh nghiệp</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngành nghề</label>
                    <select 
                      value={newCustomerData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn ngành nghề</option>
                      <option value="Công nghệ">Công nghệ</option>
                      <option value="Tài chính">Tài chính</option>
                      <option value="Y tế">Y tế</option>
                      <option value="Bán lẻ">Bán lẻ</option>
                      <option value="Sản xuất">Sản xuất</option>
                      <option value="Giáo dục">Giáo dục</option>
                      <option value="Bất động sản">Bất động sản</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quy mô công ty</label>
                    <select 
                      value={newCustomerData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="small">Nhỏ (1-50 nhân viên)</option>
                      <option value="medium">Trung bình (51-200 nhân viên)</option>
                      <option value="large">Lớn (201-1000 nhân viên)</option>
                      <option value="enterprise">Doanh nghiệp (1000+ nhân viên)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phân loại khách hàng</label>
                    <select 
                      value={newCustomerData.customerType}
                      onChange={(e) => handleInputChange('customerType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bronze">Đồng</option>
                      <option value="silver">Bạc</option>
                      <option value="gold">Vàng</option>
                      <option value="diamond">Kim cương</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select 
                      value={newCustomerData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="at-risk">Có rủi ro</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kênh liên lạc ưa thích</label>
                    <select 
                      value={newCustomerData.preferredChannel}
                      onChange={(e) => handleInputChange('preferredChannel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Điện thoại</option>
                      <option value="chat">Chat</option>
                      <option value="in-person">Trực tiếp</option>
                      <option value="social">Mạng xã hội</option>
                    </select>
                  </div>
                </div>
                
                {/* Address Information */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">📍 Thông tin địa chỉ</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      value={newCustomerData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Đường ABC, Phường XYZ"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                      <input
                        type="text"
                        value={newCustomerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        value={newCustomerData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mã bưu điện</label>
                      <input
                        type="text"
                        value={newCustomerData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">📝 Thông tin bổ sung</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                    <textarea
                      rows={3}
                      value={newCustomerData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ghi chú về khách hàng..."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={newCustomerData.marketingConsent}
                        onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Đồng ý nhận email marketing</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={newCustomerData.smsConsent}
                        onChange={(e) => handleInputChange('smsConsent', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">Đồng ý nhận SMS</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                * Các trường bắt buộc
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm khách hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Definition Modal */}
      {showRankingDefinitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Định nghĩa phân hạng khách hàng</h2>
                  <p className="text-gray-600">Tiêu chí và ngưỡng phân loại khách hàng</p>
                </div>
              </div>
              <button
                onClick={() => setShowRankingDefinitionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Ranking Tiers */}
              <div className="space-y-6">
                {/* Diamond */}
                <div className="border border-purple-200 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-800">💎 Kim Cương (Diamond)</h3>
                      <p className="text-purple-600">Khách hàng VIP cao cấp nhất</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-700">Tiêu chí chính:</h4>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• Tổng chi tiêu: ≥ 10,000,000 VND</li>
                        <li>• Số đơn hàng: ≥ 20 đơn</li>
                        <li>• Điểm engagement: ≥ 90/100</li>
                        <li>• Rủi ro churn: ≤ 10%</li>
                        <li>• Thời gian là khách hàng: ≥ 2 năm</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-700">Đặc quyền:</h4>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• Ưu đãi độc quyền 20-30%</li>
                        <li>• Account Manager riêng</li>
                        <li>• Hỗ trợ 24/7 ưu tiên cao</li>
                        <li>• Trải nghiệm cá nhân hóa</li>
                        <li>• Mời sự kiện VIP</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Gold */}
                <div className="border border-yellow-200 rounded-lg p-6 bg-gradient-to-r from-yellow-50 to-amber-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-800">🥇 Vàng (Gold)</h3>
                      <p className="text-yellow-600">Khách hàng trung thành cao</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-700">Tiêu chí chính:</h4>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        <li>• Tổng chi tiêu: 5,000,000 - 9,999,999 VND</li>
                        <li>• Số đơn hàng: 10-19 đơn</li>
                        <li>• Điểm engagement: 70-89/100</li>
                        <li>• Rủi ro churn: 11-25%</li>
                        <li>• Thời gian là khách hàng: ≥ 1 năm</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-700">Đặc quyền:</h4>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        <li>• Ưu đãi 15-20%</li>
                        <li>• Hỗ trợ ưu tiên</li>
                        <li>• Chương trình loyalty đặc biệt</li>
                        <li>• Early access sản phẩm mới</li>
                        <li>• Tư vấn chuyên sâu</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Silver */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">🥈 Bạc (Silver)</h3>
                      <p className="text-gray-600">Khách hàng ổn định</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Tiêu chí chính:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tổng chi tiêu: 2,000,000 - 4,999,999 VND</li>
                        <li>• Số đơn hàng: 5-9 đơn</li>
                        <li>• Điểm engagement: 50-69/100</li>
                        <li>• Rủi ro churn: 26-40%</li>
                        <li>• Thời gian là khách hàng: ≥ 6 tháng</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Đặc quyền:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Ưu đãi 10-15%</li>
                        <li>• Hỗ trợ tiêu chuẩn</li>
                        <li>• Newsletter chuyên biệt</li>
                        <li>• Khuyến mãi định kỳ</li>
                        <li>• Tích điểm thưởng</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bronze */}
                <div className="border border-orange-200 rounded-lg p-6 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-800">🥉 Đồng (Bronze)</h3>
                      <p className="text-orange-600">Khách hàng mới/cơ bản</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-700">Tiêu chí chính:</h4>
                      <ul className="text-sm text-orange-600 space-y-1">
                        <li>• Tổng chi tiêu: 500,000 - 1,999,999 VND</li>
                        <li>• Số đơn hàng: 1-4 đơn</li>
                        <li>• Điểm engagement: 30-49/100</li>
                        <li>• Rủi ro churn: 41-60%</li>
                        <li>• Thời gian là khách hàng: &lt; 6 tháng</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-700">Đặc quyền:</h4>
                      <ul className="text-sm text-orange-600 space-y-1">
                        <li>• Ưu đãi 5-10%</li>
                        <li>• Hỗ trợ cơ bản</li>
                        <li>• Welcome package</li>
                        <li>• Hướng dẫn sử dụng</li>
                        <li>• Chương trình giới thiệu</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Quy trình đánh giá</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Tần suất cập nhật:</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Tự động: Mỗi đơn hàng mới</li>
                        <li>• Định kỳ: Cuối mỗi tháng</li>
                        <li>• Thủ công: Khi có yêu cầu đặc biệt</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Yếu tố bổ sung:</h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Phản hồi khách hàng</li>
                        <li>• Mức độ tương tác</li>
                        <li>• Giới thiệu khách hàng mới</li>
                        <li>• Tham gia sự kiện</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Special Cases */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ Trường hợp đặc biệt</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-red-700">Khách hàng có rủi ro cao (At-risk):</h4>
                      <p className="text-sm text-red-600">Churn risk &gt; 60% - Cần chăm sóc đặc biệt và remarketing</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700">Khách hàng không hoạt động (Dormant):</h4>
                      <p className="text-sm text-red-600">Không có tương tác &gt; 6 tháng - Cần chiến dịch tái kích hoạt</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700">Khách hàng đã rời bỏ (Churned):</h4>
                      <p className="text-sm text-red-600">Không có hoạt động &gt; 12 tháng - Cần chiến dịch win-back</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowRankingDefinitionModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chăm sóc Khách hàng</h1>
          <p className="text-gray-600">Quản lý thông tin chi tiết và hành vi khách hàng</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" />
              <span>Xuất dữ liệu ({filteredCustomers.length})</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button
                  onClick={() => handleExportData('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Xuất CSV</span>
                </button>
                <button
                  onClick={() => handleExportData('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRemarketingClick}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Target className="w-4 h-4" />
            <span>Remarketing ({remarketingCustomers.length})</span>
          </button>
          <button 
            onClick={() => setShowAddCustomerModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Customer Classification Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Phân loại khách hàng</h2>
          <div className="flex items-center space-x-3">
            {filterCustomerType && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>Đang lọc: {
                  filterCustomerType === 'diamond' ? 'Kim cương' :
                  filterCustomerType === 'gold' ? 'Vàng' :
                  filterCustomerType === 'silver' ? 'Bạc' :
                  filterCustomerType === 'bronze' ? 'Đồng' :
                  filterCustomerType === 'new' ? 'Mới' :
                  filterCustomerType === 'returning' ? 'Quay lại' : filterCustomerType
                }</span>
                <button 
                  onClick={() => setFilterCustomerType('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              onClick={() => setFilterCustomerType('')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                !filterCustomerType 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ({customers.filter(c => c.products && c.products.length > 0 && c.totalSpent > 0).length})
            </button>
            <button 
              onClick={() => setShowRankingDefinitionModal(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Info className="w-4 h-4 mr-2" />
              <span>Định nghĩa phân hạng</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Diamond Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('diamond')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'diamond' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-yellow-500 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng Kim cương</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'diamond').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">8% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gold Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('gold')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'gold' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-yellow-400 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng Vàng</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'gold').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">5% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Silver Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('silver')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'silver' ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-gray-400 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-100 p-3 mr-4 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng Bạc</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'silver').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">12% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bronze Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('bronze')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'bronze' ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-orange-400 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-orange-100 p-3 mr-4 flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng Đồng</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'bronze').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">3% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('new')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'new' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-blue-500 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách hàng Mới</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'new').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">15% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Returning Customer */}
          <div 
            onClick={() => handleCustomerTypeFilter('returning')}
            className={`bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${
              filterCustomerType === 'returning' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
            }`}
          >
            <div className="h-2 bg-purple-500 rounded-t-lg"></div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khách quay lại</p>
                  <p className="text-2xl font-bold">
                    {filteredCustomers.filter(c => c.customerType === 'returning').length}
                  </p>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="ml-1">7% so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('list')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedView === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              🗂️ Danh sách
            </button>            <button
              onClick={() => setSelectedView('analytics')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedView === 'analytics' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              📊 Phân tích
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {(searchTerm || filterStatus || filterIndustry || filterTag || filterCustomerType) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Đang áp dụng bộ lọc - Hiển thị {filteredCustomers.length} trong tổng số {customers.filter(c => c.products && c.products.length > 0 && c.totalSpent > 0).length} khách hàng
              </span>
              {filterCustomerType && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Loại: {
                    filterCustomerType === 'diamond' ? 'Kim cương' :
                    filterCustomerType === 'gold' ? 'Vàng' :
                    filterCustomerType === 'silver' ? 'Bạc' :
                    filterCustomerType === 'bronze' ? 'Đồng' :
                    filterCustomerType === 'new' ? 'Mới' :
                    filterCustomerType === 'returning' ? 'Quay lại' : filterCustomerType
                  }
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-700">
                {(searchTerm || filterStatus || filterIndustry || filterTag || filterCustomerType) && " Bộ lọc cơ bản ✓"}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('')
                  setFilterIndustry('')
                  setFilterTag('')
                  setFilterCustomerType('')
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on selected view */}
      {selectedView === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="lastInteraction">Tương tác gần nhất</option>
                  <option value="totalValue">Giá trị</option>
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="at-risk">Có nguy cơ</option>
                  <option value="churned">Đã churn</option>
                  <option value="dormant">Tạm ngưng</option>
                </select>
                <select 
                  value={filterCustomerType} 
                  onChange={(e) => setFilterCustomerType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Tất cả hạng</option>
                  <option value="diamond">Kim cương</option>
                  <option value="gold">Vàng</option>
                  <option value="silver">Bạc</option>
                  <option value="bronze">Đồng</option>
                  <option value="new">Mới</option>
                  <option value="returning">Quay lại</option>
                </select>
                <select 
                  value={filterPurchasedProduct} 
                  onChange={(e) => setFilterPurchasedProduct(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Tất cả sản phẩm</option>
                  {Array.from(new Set(customers.flatMap(c => c.products?.map(p => p.name) || []))).map(productName => (
                    <option key={productName} value={productName}>
                      {productName}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Columns className="w-4 h-4" />
                    <span>Cột</span>
                  </button>
                  {showColumnSelector && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Hiển thị cột</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'checkbox', label: 'Checkbox' },
                            { key: 'no', label: 'STT' },
                            { key: 'customerName', label: 'Tên khách hàng' },
                            { key: 'phoneNumber', label: 'Số điện thoại' },
                            { key: 'email', label: 'Email' },
                            { key: 'company', label: 'Công ty' },
                            { key: 'address', label: 'Địa chỉ' },
                            { key: 'region', label: 'Khu vực' },
                            { key: 'customerType', label: 'Loại khách hàng' },
                            { key: 'segment', label: 'Phân loại' },
                            { key: 'tags', label: 'Tags' },
                            { key: 'source', label: 'Nguồn gốc' },
                            { key: 'accountManager', label: 'Sales phụ trách' },
                            { key: 'status', label: 'Trạng thái' },
                            { key: 'lifecycleStage', label: 'Lifecycle Stage' },
                            { key: 'totalOrderValue', label: 'Tổng giá trị đơn' },
                            { key: 'orderCount', label: 'Số đơn hàng' },
                            { key: 'lastOrderDate', label: 'Đơn hàng gần nhất' },
                            { key: 'averageOrderValue', label: 'Giá trị đơn TB' },
                            { key: 'lastContactDate', label: 'Lần liên hệ cuối' },
                            { key: 'interactionCount', label: 'Số lần tương tác' },
                            { key: 'createdDate', label: 'Ngày tạo' },
                            { key: 'npsScore', label: 'NPS Score' },
                            { key: 'actions', label: 'Hành động' }
                          ].map(column => (
                            <label key={column.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={visibleColumns[column.key as keyof typeof visibleColumns]}
                                onChange={(e) => setVisibleColumns(prev => ({
                                  ...prev,
                                  [column.key]: e.target.checked
                                }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{column.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => setVisibleColumns({
                              checkbox: true,
                              no: true,
                              customerName: true,
                              phoneNumber: true,
                              email: true,
                              company: true,
                              address: true,
                              region: true,
                              customerType: true,
                              segment: true,
                              tags: true,
                              source: true,
                              accountManager: true,
                              status: true,
                              lifecycleStage: true,
                              totalOrderValue: true,
                              orderCount: true,
                              lastOrderDate: true,
                              averageOrderValue: true,
                              lastContactDate: true,
                              interactionCount: true,
                              createdDate: true,
                              npsScore: true,
                              actions: true
                            })}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Hiện tất cả
                          </button>
                          <button
                            onClick={() => setShowColumnSelector(false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedCustomerIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-900">
                      Đã chọn {selectedCustomerIds.length} khách hàng
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCustomerIds([])
                        setSelectAll(false)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCreateQuickTask()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo task nhanh</span>
                    </button>
                    <button
                      onClick={() => handleBulkEmail()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Gửi email hàng loạt</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-300">
                    {visibleColumns.checkbox && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {visibleColumns.no && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">STT</th>
                    )}
                    {visibleColumns.customerName && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Tên khách hàng</th>
                    )}
                    {visibleColumns.phoneNumber && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Số điện thoại</th>
                    )}
                    {visibleColumns.email && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Email</th>
                    )}
                    {visibleColumns.company && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Công ty</th>
                    )}
                    {visibleColumns.address && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Địa chỉ</th>
                    )}
                    {visibleColumns.region && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Khu vực</th>
                    )}
                    {visibleColumns.customerType && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Loại khách hàng</th>
                    )}
                    {visibleColumns.segment && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Phân loại</th>
                    )}
                    {visibleColumns.tags && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Tags</th>
                    )}
                    {visibleColumns.source && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Nguồn gốc</th>
                    )}
                    {visibleColumns.accountManager && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Sales phụ trách</th>
                    )}
                    {visibleColumns.status && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Trạng thái</th>
                    )}
                    {visibleColumns.lifecycleStage && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Lifecycle Stage</th>
                    )}
                    {visibleColumns.totalOrderValue && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Tổng giá trị đơn</th>
                    )}
                    {visibleColumns.orderCount && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Số đơn hàng</th>
                    )}
                    {visibleColumns.lastOrderDate && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Đơn hàng gần nhất</th>
                    )}
                    {visibleColumns.averageOrderValue && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Giá trị đơn TB</th>
                    )}
                    {visibleColumns.lastContactDate && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Lần liên hệ cuối</th>
                    )}
                    {visibleColumns.interactionCount && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Số lần tương tác</th>
                    )}
                    {visibleColumns.createdDate && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Ngày tạo</th>
                    )}
                    {visibleColumns.customerScore && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Customer Score</th>
                    )}
                    {visibleColumns.npsScore && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">NPS Score</th>
                    )}
                    {visibleColumns.actions && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap min-w-fit">Hành động</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      {visibleColumns.checkbox && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={selectedCustomerIds.includes(customer.id.toString())}
                            onChange={() => handleSelectCustomer(customer.id.toString())}
                          />
                        </td>
                      )}
                      {visibleColumns.no && (
                        <td className="py-3 px-4 border-r border-gray-200 text-sm text-gray-700">
                          {index + 1}
                        </td>
                      )}
                      {visibleColumns.customerName && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <button 
                            onClick={() => handleCustomerSelect(customer)}
                            className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              customer.status === 'vip' ? 'bg-purple-600' :
                              customer.status === 'active' ? 'bg-green-600' :
                              customer.status === 'at-risk' ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {customer.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{customer.name}</div>
                            </div>
                          </button>
                        </td>
                      )}
                      {visibleColumns.phoneNumber && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.contact}</div>
                          {customer.phone2 && (
                            <div className="text-xs text-gray-500">{customer.phone2}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.email && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                        </td>
                      )}
                      {visibleColumns.company && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.company || '-'}</div>
                        </td>
                      )}
                      {visibleColumns.address && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={`${customer.address}, ${customer.city}`}>
                            {customer.address || '-'}
                          </div>
                          {customer.city && (
                            <div className="text-xs text-gray-500">{customer.city}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.region && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.city || '-'}</div>
                        </td>
                      )}
                      {visibleColumns.customerType && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.company ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {customer.company ? 'Doanh nghiệp' : 'Cá nhân'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.segment && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'vip' ? 'bg-purple-100 text-purple-800' :
                            (customer.totalSpent || 0) > 50000000 ? 'bg-yellow-100 text-yellow-800' :
                            (customer.totalSpent || 0) > 10000000 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.status === 'vip' ? 'VIP' :
                             (customer.totalSpent || 0) > 50000000 ? 'Tiềm năng' :
                             (customer.totalSpent || 0) > 10000000 ? 'Thường' : 'Mới'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.tags && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {/* Tags đồng bộ từ sales management */}
                            {customer.tags && customer.tags.length > 0 ? (
                              customer.tags.slice(0, 2).map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tag.color || 'bg-blue-100 text-blue-800'}`}
                                >
                                  {tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                            
                            {/* Hiển thị số tags còn lại */}
                            {customer.tags && customer.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.source && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className="text-sm text-gray-900">
                            {customer.source === 'facebook' ? '📱 Facebook' :
                             customer.source === 'zalo' ? '💬 Zalo' :
                             customer.source === 'website' ? '🌐 Website' :
                             customer.source === 'referral' ? '👥 Giới thiệu' :
                             customer.source === 'google' ? '🔍 Google' :
                             customer.source === 'email' ? '📧 Email' :
                             customer.source === 'phone' ? '📞 Điện thoại' :
                             '🌐 Website'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.accountManager && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.assignedSalesRep || customer.accountManager || '-'}</div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            customer.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                            customer.status === 'churned' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.status === 'active' ? 'Active' :
                             customer.status === 'inactive' ? 'Inactive' :
                             customer.status === 'at-risk' ? 'At Risk' :
                             customer.status === 'churned' ? 'Churned' : 'Active'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.lifecycleStage && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            (customer.totalOrders || 0) > 5 ? 'bg-purple-100 text-purple-800' :
                            (customer.totalOrders || 0) > 1 ? 'bg-green-100 text-green-800' :
                            customer.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                            customer.status === 'churned' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {(customer.totalOrders || 0) > 5 ? 'Loyal' :
                             (customer.totalOrders || 0) > 1 ? 'Active' :
                             customer.status === 'at-risk' ? 'At Risk' :
                             customer.status === 'churned' ? 'Churned' : 'New'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.totalOrderValue && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-medium text-gray-900">{formatCurrency((customer.totalSpent || 0).toString())}</div>
                        </td>
                      )}
                      {visibleColumns.orderCount && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.totalOrders || 0}</div>
                        </td>
                      )}
                      {visibleColumns.lastOrderDate && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatDate(customer.lastPurchaseDate)}</div>
                          {customer.lastPurchaseDate && (
                            <div className="text-xs text-gray-500">
                              {Math.floor((new Date().getTime() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.averageOrderValue && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">
                            {formatCurrency((customer.totalOrders ? (customer.totalSpent || 0) / customer.totalOrders : 0).toString())}
                          </div>
                        </td>
                      )}
                      {visibleColumns.lastContactDate && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatDate(customer.lastInteraction) || 'Chưa có'}</div>
                          {customer.daysSinceLastInteraction && (
                            <div className="text-xs text-gray-500">{customer.daysSinceLastInteraction} ngày trước</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.interactionCount && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.interactions?.length || 0}</div>
                        </td>
                      )}
                      {visibleColumns.createdDate && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatDate(customer.createdAt)}</div>
                          {customer.createdAt && (
                            <div className="text-xs text-gray-500">
                              {Math.floor((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.customerScore && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{customer.engagementScore || 0}</div>
                            <div className={`w-2 h-2 rounded-full ${
                              (customer.engagementScore || 0) >= 80 ? 'bg-green-400' :
                              (customer.engagementScore || 0) >= 60 ? 'bg-yellow-400' :
                              (customer.engagementScore || 0) >= 40 ? 'bg-orange-400' : 'bg-red-400'
                            }`}></div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.npsScore && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">-</div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="👁️ Xem"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button 
                              className="p-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              title="✏️ Sửa"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button 
                              className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="📞 Gọi"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                            <button 
                              className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                              title="✉️ Email"
                            >
                              <Mail className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}      {selectedView === 'analytics' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
                  <div className="flex items-center mt-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600">+12% so với tháng trước</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      filteredCustomers.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0).toString()
                    )} VNĐ
                  </p>
                  <div className="flex items-center mt-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600">+8.5% so với tháng trước</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doanh thu trung bình/KH</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredCustomers.length > 0 ? formatCurrency(
                      Math.round(filteredCustomers.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0) / filteredCustomers.length).toString()
                    ) : '0'} VNĐ
                  </p>
                  <div className="flex items-center mt-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600">+5.2% so với tháng trước</span>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tỷ lệ giữ chân</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((filteredCustomers.filter(c => c.status !== 'churned').length / filteredCustomers.length) * 100 || 0)}%
                  </p>
                  <div className="flex items-center mt-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600">+2.1% so với tháng trước</span>
                  </div>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo trạng thái</h3>
              <div className="space-y-3">
                {[
                  { status: 'active', label: 'Hoạt động', color: 'bg-green-500', textColor: 'text-green-600', icon: '✅' },
                  { status: 'at-risk', label: 'Có nguy cơ', color: 'bg-red-500', textColor: 'text-red-600', icon: '⚠️' },
                  { status: 'inactive', label: 'Không hoạt động', color: 'bg-gray-500', textColor: 'text-gray-600', icon: '⏸️' },
                  { status: 'churned', label: 'Đã rời bỏ', color: 'bg-orange-500', textColor: 'text-orange-600', icon: '❌' },
                  { status: 'dormant', label: 'Ngủ đông', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: '💤' }
                ].map(({ status, label, color, textColor, icon }) => {
                  const count = filteredCustomers.filter(c => c.status === status).length
                  const percentage = filteredCustomers.length > 0 ? (count / filteredCustomers.length * 100).toFixed(1) : 0
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">{icon}</span>
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                        <span className={`text-sm font-medium ${textColor}`}>({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo loại khách hàng</h3>
              <div className="space-y-3">
                {[
                  { type: 'diamond', label: 'Kim cương', color: 'bg-purple-500', textColor: 'text-purple-600', icon: '💎' },
                  { type: 'gold', label: 'Vàng', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: '🥇' },
                  { type: 'silver', label: 'Bạc', color: 'bg-gray-400', textColor: 'text-gray-600', icon: '🥈' },
                  { type: 'bronze', label: 'Đồng', color: 'bg-orange-600', textColor: 'text-orange-600', icon: '🥉' }
                ].map(({ type, label, color, textColor, icon }) => {
                  const count = filteredCustomers.filter(c => c.customerType === type).length
                  const percentage = filteredCustomers.length > 0 ? (count / filteredCustomers.length * 100).toFixed(1) : 0
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">{icon}</span>
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                        <span className={`text-sm font-medium ${textColor}`}>({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Điểm tương tác</h3>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(
                    filteredCustomers.reduce((sum, c) => sum + c.engagementScore, 0) / filteredCustomers.length || 0
                  )}
                </div>
                <p className="text-sm text-gray-500">điểm trung bình / 100</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Cao (80-100)</span>
                  <span>{filteredCustomers.filter(c => c.engagementScore >= 80).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Trung bình (50-79)</span>
                  <span>{filteredCustomers.filter(c => c.engagementScore >= 50 && c.engagementScore < 80).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Thấp (&lt;50)</span>
                  <span>{filteredCustomers.filter(c => c.engagementScore < 50).length} KH</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rủi ro Churn</h3>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {Math.round(
                    filteredCustomers.reduce((sum, c) => sum + c.churnRisk, 0) / filteredCustomers.length || 0
                  )}%
                </div>
                <p className="text-sm text-gray-500">rủi ro trung bình</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Cao (&gt;70%)</span>
                  <span>{filteredCustomers.filter(c => c.churnRisk > 70).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-orange-600">Trung bình (30-70%)</span>
                  <span>{filteredCustomers.filter(c => c.churnRisk >= 30 && c.churnRisk <= 70).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">Thấp (&lt;30%)</span>
                  <span>{filteredCustomers.filter(c => c.churnRisk < 30).length} KH</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Điểm trung thành</h3>
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {Math.round(
                    filteredCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / filteredCustomers.length || 0
                  )}
                </div>
                <p className="text-sm text-gray-500">điểm trung bình</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Platinum (&gt;2000)</span>
                  <span>{filteredCustomers.filter(c => c.loyaltyPoints > 2000).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Gold (1000-2000)</span>
                  <span>{filteredCustomers.filter(c => c.loyaltyPoints >= 1000 && c.loyaltyPoints <= 2000).length} KH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Silver (&lt;1000)</span>
                  <span>{filteredCustomers.filter(c => c.loyaltyPoints < 1000).length} KH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Industry & Geographic Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích theo ngành nghề</h3>
              <div className="space-y-3">
                {(() => {
                  const industriesSet = new Set(filteredCustomers.map(c => c.industry))
                  const industries = Array.from(industriesSet)
                  return industries.slice(0, 6).map(industry => {
                    const count = filteredCustomers.filter(c => c.industry === industry).length
                    const percentage = filteredCustomers.length > 0 ? (count / filteredCustomers.length * 100).toFixed(1) : 0
                    const avgRevenue = filteredCustomers
                      .filter(c => c.industry === industry)
                      .reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0) / count || 0
                    
                    return (
                      <div key={industry} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{industry}</span>
                          <span className="text-sm text-gray-600">{count} KH ({percentage}%)</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Doanh thu TB: {formatCurrency(Math.round(avgRevenue).toString())} VNĐ
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích theo khu vực</h3>
              <div className="space-y-3">
                {(() => {
                  const citiesSet = new Set(filteredCustomers.map(c => c.city))
                  const cities = Array.from(citiesSet)
                  return cities.slice(0, 6).map(city => {
                    const count = filteredCustomers.filter(c => c.city === city).length
                    const percentage = filteredCustomers.length > 0 ? (count / filteredCustomers.length * 100).toFixed(1) : 0
                    const avgRevenue = filteredCustomers
                      .filter(c => c.city === city)
                      .reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0) / count || 0
                    
                    return (
                      <div key={city} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{city}</span>
                          </div>
                          <span className="text-sm text-gray-600">{count} KH ({percentage}%)</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-6">
                          Doanh thu TB: {formatCurrency(Math.round(avgRevenue).toString())} VNĐ
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi và Tương tác</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredCustomers.filter(c => c.preferredChannel === 'email').length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Ưa thích Email
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredCustomers.filter(c => c.preferredChannel === 'phone').length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Ưa thích Điện thoại
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredCustomers.filter(c => c.preferredChannel === 'chat').length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Ưa thích Chat
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredCustomers.filter(c => c.daysSinceLastInteraction <= 7).length}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Tương tác gần đây
                </div>
              </div>
            </div>
          </div>

          {/* Remarketing Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Remarketing</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {remarketingCustomers.length}
                </div>
                <div className="text-sm text-orange-700 mt-1">Cần Remarketing</div>
                <div className="text-xs text-orange-600 mt-1">
                  {filteredCustomers.length > 0 ? ((remarketingCustomers.length / filteredCustomers.length) * 100).toFixed(1) : 0}% tổng KH
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {remarketingCustomers.filter(c => c.remarketing.priority === 'high').length}
                </div>
                <div className="text-sm text-red-700 mt-1">Ưu tiên cao</div>
                <div className="text-xs text-red-600 mt-1">Cần xử lý ngay</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {remarketingCustomers.filter(c => c.remarketing.priority === 'medium').length}
                </div>
                <div className="text-sm text-yellow-700 mt-1">Ưu tiên trung bình</div>
                <div className="text-xs text-yellow-600 mt-1">Theo dõi thường xuyên</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    remarketingCustomers
                      .filter(c => c.remarketing.campaigns.length > 0)
                      .reduce((sum, c) => {
                        const avgOpenRate = c.remarketing.campaigns.reduce((s, camp) => s + (camp.openRate || 0), 0) / c.remarketing.campaigns.length
                        return sum + avgOpenRate
                      }, 0) / remarketingCustomers.filter(c => c.remarketing.campaigns.length > 0).length || 0
                  )}%
                </div>
                <div className="text-sm text-blue-700 mt-1">Tỷ lệ mở TB</div>
                <div className="text-xs text-blue-600 mt-1">Campaigns gần đây</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Quick Task Modal */}
    {showQuickTaskModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tạo task nhanh</h3>
            <button
              onClick={() => setShowQuickTaskModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Tạo task cho {selectedCustomerIds.length} khách hàng đã chọn:
            </div>
            <div className="text-xs text-gray-500 max-h-20 overflow-y-auto bg-gray-50 p-2 rounded">
              {customers
                .filter(customer => selectedCustomerIds.includes(customer.id.toString()))
                .map(customer => customer.name)
                .join(', ')
              }
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề task *
              </label>
              <input
                type="text"
                value={quickTaskData.title}
                onChange={(e) => setQuickTaskData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Gọi điện tư vấn sản phẩm mới"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={quickTaskData.description}
                onChange={(e) => setQuickTaskData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Mô tả chi tiết về task..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={quickTaskData.priority}
                  onChange={(e) => setQuickTaskData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn hoàn thành
                </label>
                <input
                  type="date"
                  value={quickTaskData.dueDate}
                  onChange={(e) => setQuickTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giao cho
              </label>
              <select
                value={quickTaskData.assignedTo}
                onChange={(e) => setQuickTaskData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn người thực hiện</option>
                <option value="me">Tôi</option>
                <option value="nguyen_thi_lan">Nguyễn Thị Lan</option>
                <option value="tran_van_duc">Trần Văn Đức</option>
                <option value="pham_minh_tuan">Phạm Minh Tuấn</option>
                <option value="do_van_minh">Đỗ Văn Minh</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowQuickTaskModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitQuickTask}
              disabled={!quickTaskData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Tạo task
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
