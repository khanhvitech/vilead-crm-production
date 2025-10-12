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
  Brain, BarChart, Package
} from 'lucide-react'
import CustomerFilters, { CustomerFilters as FilterType } from './CustomerFilters'
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

export default function CustomersManagement() {
  const [selectedView, setSelectedView] = useState<'list' | 'analytics' | 'events' | 'insights'>('list')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'interactions' | 'orders' | 'notes' | 'ai-suggestions'>('details')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterCustomerType, setFilterCustomerType] = useState('')
  const [filterPurchasedProduct, setFilterPurchasedProduct] = useState('')
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    company: true,
    customerType: true,
    status: true,
    products: true,
    lastInteraction: true,
    value: true,
    birthday: true,
    firstPurchaseDate: true,
    lastPurchaseDate: true,
    phone: true,
    address: true,
    actions: true
  })
  const [sortBy, setSortBy] = useState('name')
  const [advancedFilters, setAdvancedFilters] = useState<FilterType>({})
  const [showRemarketingModal, setShowRemarketingModal] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showRankingDefinitionModal, setShowRankingDefinitionModal] = useState(false)
  
  // AI Action States
  const [showCallHighRiskModal, setShowCallHighRiskModal] = useState(false)
  const [showEmailFollowUpModal, setShowEmailFollowUpModal] = useState(false)
  const [showUpsellCampaignModal, setShowUpsellCampaignModal] = useState(false)
  const [showAIReportModal, setShowAIReportModal] = useState(false)
  const [selectedCustomersForAction, setSelectedCustomersForAction] = useState<Customer[]>([])
  
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

  const handleApplyFilters = (filters: FilterType) => {
    setAdvancedFilters(filters)
  }

  const handleClearFilters = () => {
    setAdvancedFilters({})
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

      let matchesAdvanced = true

      // Range filters with null safety
      const { 
        engagementScore: engagementFilter, 
        churnRisk: churnFilter, 
        totalValue: valueFilter,
        ...booleanFilters 
      } = advancedFilters

      if (engagementFilter) {
        if (engagementFilter.min !== undefined && customer.engagementScore < engagementFilter.min) matchesAdvanced = false
        if (engagementFilter.max !== undefined && customer.engagementScore > engagementFilter.max) matchesAdvanced = false
      }
      if (churnFilter) {
        if (churnFilter.min !== undefined && customer.churnRisk < churnFilter.min) matchesAdvanced = false
        if (churnFilter.max !== undefined && customer.churnRisk > churnFilter.max) matchesAdvanced = false
      }
      if (valueFilter) {
        const customerValue = parseInt(customer.totalValue.replace(/,/g, ''))
        if (valueFilter.min !== undefined && customerValue < valueFilter.min) matchesAdvanced = false
        if (valueFilter.max !== undefined && customerValue > valueFilter.max) matchesAdvanced = false
      }

      // Boolean filters
      Object.entries(booleanFilters).forEach(([key, filterValue]) => {
        if (filterValue) {
          if (key === 'isVip') {
            if (filterValue === true && customer.status !== 'vip') {
              matchesAdvanced = false
            }
          } else if (key === 'isAtRisk') {
            if (filterValue === true && customer.status !== 'at-risk' && customer.churnRisk < 60) {
              matchesAdvanced = false
            }
          } else if (key === 'needsRemarketing') {
            if (filterValue === true && customer.daysSinceLastInteraction <= 30 && customer.churnRisk <= 50) {
              matchesAdvanced = false
            }
          }
        }
      })

      return matchesSearch && matchesStatus && matchesIndustry && matchesTag && 
             matchesCustomerType && matchesPurchasedProduct && matchesAdvanced
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
  }, [customers, searchTerm, filterStatus, filterIndustry, filterTag, filterCustomerType, filterPurchasedProduct, sortBy, advancedFilters])

  const remarketingCustomers = customers.filter(c => 
    c.remarketing.eligible && (c.status === 'at-risk' || c.churnRisk >= 50)
  )

  // AI Action Handlers
  const handleCallHighRiskCustomers = () => {
    const highRiskCustomers = filteredCustomers.filter(c => c.churnRisk >= 70 || c.daysSinceLastInteraction > 30)
    setSelectedCustomersForAction(highRiskCustomers)
    setShowCallHighRiskModal(true)
  }

  const handleEmailFollowUp = () => {
    const followUpCustomers = filteredCustomers.filter(c => c.daysSinceLastInteraction >= 14)
    setSelectedCustomersForAction(followUpCustomers)
    setShowEmailFollowUpModal(true)
  }

  const handleUpsellCampaign = () => {
    const upsellCustomers = filteredCustomers.filter(c => c.engagementScore >= 70 && c.churnRisk <= 30)
    setSelectedCustomersForAction(upsellCustomers)
    setShowUpsellCampaignModal(true)
  }

  const handleAIReport = () => {
    setShowAIReportModal(true)
  }

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

      {/* AI Suggestions - Urgent Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">🤖 Gợi ý AI - Cần hành động ngay</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High Priority - Need Immediate Care */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h4 className="font-medium text-red-800">🚨 Ưu tiên cao</h4>
            </div>
            <div className="space-y-2">
              {(() => {
                const highRiskCustomers = filteredCustomers
                  .filter(c => c.churnRisk >= 70 || c.daysSinceLastInteraction > 30)
                  .slice(0, 3)
                return highRiskCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between text-sm">
                    <span className="text-red-700 truncate">{customer.name}</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full whitespace-nowrap">
                      {customer.daysSinceLastInteraction > 30 ? `${customer.daysSinceLastInteraction} ngày` : `${customer.churnRisk}% rủi ro`}
                    </span>
                  </div>
                ))
              })()}
            </div>
            <button className="mt-3 text-xs text-red-600 hover:text-red-800 underline">
              Xem tất cả ({filteredCustomers.filter(c => c.churnRisk >= 70 || c.daysSinceLastInteraction > 30).length})
            </button>
          </div>

          {/* Medium Priority - Follow up needed */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h4 className="font-medium text-yellow-800">⚠️ Cần theo dõi</h4>
            </div>
            <div className="space-y-2">
              {(() => {
                const followUpCustomers = filteredCustomers
                  .filter(c => c.daysSinceLastInteraction >= 14 && c.daysSinceLastInteraction <= 30 && c.churnRisk < 70)
                  .slice(0, 3)
                return followUpCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 truncate">{customer.name}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full whitespace-nowrap">
                      {customer.daysSinceLastInteraction} ngày
                    </span>
                  </div>
                ))
              })()}
            </div>
            <button className="mt-3 text-xs text-yellow-600 hover:text-yellow-800 underline">
              Xem tất cả ({filteredCustomers.filter(c => c.daysSinceLastInteraction >= 14 && c.daysSinceLastInteraction <= 30 && c.churnRisk < 70).length})
            </button>
          </div>

          {/* Opportunities - Upsell potential */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="font-medium text-green-800">💰 Cơ hội bán thêm</h4>
            </div>
            <div className="space-y-2">
              {(() => {
                const upsellCustomers = filteredCustomers
                  .filter(c => c.engagementScore >= 70 && c.churnRisk <= 30 && c.customerType !== 'diamond')
                  .slice(0, 3)
                return upsellCustomers.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between text-sm">
                    <span className="text-green-700 truncate">{customer.name}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                      {customer.engagementScore} điểm
                    </span>
                  </div>
                ))
              })()}
            </div>
            <button className="mt-3 text-xs text-green-600 hover:text-green-800 underline">
              Xem tất cả ({filteredCustomers.filter(c => c.engagementScore >= 70 && c.churnRisk <= 30 && c.customerType !== 'diamond').length})
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleCallHighRiskCustomers}
              className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors"
            >
              📞 Gọi khách hàng rủi ro cao ({filteredCustomers.filter(c => c.churnRisk >= 70).length})
            </button>
            <button 
              onClick={handleEmailFollowUp}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full hover:bg-yellow-200 transition-colors"
            >
              ✉️ Email theo dõi ({filteredCustomers.filter(c => c.daysSinceLastInteraction >= 14).length})
            </button>
            <button 
              onClick={handleUpsellCampaign}
              className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
            >
              🎯 Tạo chiến dịch upsell ({filteredCustomers.filter(c => c.engagementScore >= 70).length})
            </button>
            <button 
              onClick={handleAIReport}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
            >
              📊 Báo cáo chi tiết
            </button>
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
            <button
              onClick={() => setSelectedView('insights')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedView === 'insights' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
              }`}
            >
              🤖 AI Insights
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {(Object.keys(advancedFilters).length > 0 || searchTerm || filterStatus || filterIndustry || filterTag || filterCustomerType) && (
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
                {Object.keys(advancedFilters).length > 0 && "Bộ lọc nâng cao ✓"}
                {(searchTerm || filterStatus || filterIndustry || filterTag || filterCustomerType) && " Bộ lọc cơ bản ✓"}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('')
                  setFilterIndustry('')
                  setFilterTag('')
                  setFilterCustomerType('')
                  setAdvancedFilters({})
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <CustomerFilters 
        onFilterChange={handleApplyFilters}
        initialFilters={advancedFilters}
      />

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
                            { key: 'customer', label: 'Khách hàng' },
                            { key: 'company', label: 'Công ty' },
                            { key: 'customerType', label: 'Hạng KH' },
                            { key: 'status', label: 'Trạng thái' },
                            { key: 'products', label: 'Sản phẩm' },
                            { key: 'lastInteraction', label: 'Tương tác cuối' },
                            { key: 'value', label: 'Giá trị' },
                            { key: 'birthday', label: 'Sinh nhật' },
                            { key: 'firstPurchaseDate', label: 'Mua đầu tiên' },
                            { key: 'lastPurchaseDate', label: 'Mua gần nhất' },
                            { key: 'phone', label: 'Điện thoại' },
                            { key: 'address', label: 'Địa chỉ' },
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
                              customer: true,
                              company: true,
                              customerType: true,
                              status: true,
                              products: true,
                              lastInteraction: true,
                              value: true,
                              birthday: true,
                              firstPurchaseDate: true,
                              lastPurchaseDate: true,
                              phone: true,
                              address: true,
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

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-300">
                    {visibleColumns.customer && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Khách hàng</th>
                    )}
                    {visibleColumns.company && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Công ty</th>
                    )}
                    {visibleColumns.customerType && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Hạng KH</th>
                    )}
                    {visibleColumns.status && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Trạng thái</th>
                    )}
                    {visibleColumns.products && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Sản phẩm đã mua</th>
                    )}
                    {visibleColumns.lastInteraction && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Tương tác cuối</th>
                    )}
                    {visibleColumns.value && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Giá trị</th>
                    )}
                    {visibleColumns.birthday && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Sinh nhật</th>
                    )}
                    {visibleColumns.firstPurchaseDate && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Mua đầu tiên</th>
                    )}
                    {visibleColumns.lastPurchaseDate && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Mua gần nhất</th>
                    )}
                    {visibleColumns.phone && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Điện thoại</th>
                    )}
                    {visibleColumns.address && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-fit">Địa chỉ</th>
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
                      {visibleColumns.customer && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              customer.status === 'vip' ? 'bg-purple-600' :
                              customer.status === 'active' ? 'bg-green-600' :
                              customer.status === 'at-risk' ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.company && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.company}</div>
                          <div className="text-xs text-gray-500">{customer.industry}</div>
                        </td>
                      )}
                      {visibleColumns.customerType && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.customerType === 'diamond' ? 'bg-yellow-100 text-yellow-800' :
                            customer.customerType === 'gold' ? 'bg-amber-100 text-amber-800' :
                            customer.customerType === 'silver' ? 'bg-gray-100 text-gray-800' :
                            customer.customerType === 'bronze' ? 'bg-orange-100 text-orange-800' :
                            customer.customerType === 'new' ? 'bg-blue-100 text-blue-800' :
                            customer.customerType === 'returning' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {customer.customerType === 'diamond' ? '💎 Kim cương' :
                             customer.customerType === 'gold' ? '🥇 Vàng' :
                             customer.customerType === 'silver' ? '🥈 Bạc' :
                             customer.customerType === 'bronze' ? '🥉 Đồng' :
                             customer.customerType === 'new' ? '🆕 Mới' :
                             customer.customerType === 'returning' ? '🔄 Quay lại' : '❌ Không hoạt động'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            customer.status === 'vip' ? 'bg-purple-100 text-purple-800' :
                            customer.status === 'active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                            customer.status === 'churned' ? 'bg-orange-100 text-orange-800' :
                            customer.status === 'dormant' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.status === 'vip' ? 'VIP' :
                             customer.status === 'active' ? 'Hoạt động' :
                             customer.status === 'at-risk' ? 'Có nguy cơ' :
                             customer.status === 'churned' ? 'Đã churn' :
                             customer.status === 'dormant' ? 'Tạm ngưng' : 'Không hoạt động'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.products && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="max-w-xs">
                            {customer.products && customer.products.length > 0 ? (
                              <div className="space-y-1">
                                {customer.products.slice(0, 2).map((product, index) => (
                                  <div key={product.id} className="flex items-center justify-between">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                                      product.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {product.name}
                                    </span>
                                  </div>
                                ))}
                                {customer.products.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{customer.products.length - 2} sản phẩm khác
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Chưa mua sản phẩm</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.lastInteraction && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.lastInteraction || 'Chưa có'}</div>
                          <div className="text-xs text-gray-500">{customer.daysSinceLastInteraction} ngày</div>
                        </td>
                      )}
                      {visibleColumns.value && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-medium text-gray-900">{formatCurrency(customer.totalValue)} VNĐ</div>
                        </td>
                      )}
                      {visibleColumns.birthday && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatBirthday(customer.dateOfBirth)}</div>
                          {customer.dateOfBirth && (
                            <div className="text-xs text-gray-500">
                              {new Date().getFullYear() - new Date(customer.dateOfBirth).getFullYear()} tuổi
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.firstPurchaseDate && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatDate(customer.firstPurchaseDate)}</div>
                          {customer.firstPurchaseDate && (
                            <div className="text-xs text-gray-500">
                              {Math.floor((new Date().getTime() - new Date(customer.firstPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.lastPurchaseDate && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{formatDate(customer.lastPurchaseDate)}</div>
                          {customer.lastPurchaseDate && (
                            <div className="text-xs text-gray-500">
                              {Math.floor((new Date().getTime() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} ngày trước
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.phone && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900">{customer.contact}</div>
                          {customer.phone2 && (
                            <div className="text-xs text-gray-500">{customer.phone2}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.address && (
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={`${customer.address}, ${customer.city}`}>
                            {customer.address}
                          </div>
                          <div className="text-xs text-gray-500">{customer.city}, {customer.country}</div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Gọi điện"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                              title="Gửi email"
                            >
                              <Mail className="w-4 h-4" />
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

      {selectedView === 'insights' && (
        <div className="space-y-6">
          {/* AI Insights Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Insights - Phân tích thông minh</h3>
                  <p className="text-sm text-gray-600">Tự động phân tích và dự đoán xu hướng khách hàng</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Cập nhật lần cuối</div>
                <div className="text-sm font-medium text-purple-600">
                  {new Date().toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Độ chính xác AI</p>
                    <p className="text-2xl font-bold text-green-600">94.5%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Độ chính xác dự đoán trong 30 ngày qua</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Khách hàng rủi ro</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredCustomers.filter(c => c.churnRisk >= 70).length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cần can thiệp ngay</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Cơ hội upsell</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredCustomers.filter(c => c.engagementScore >= 80 && c.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Khách hàng tiềm năng</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Doanh thu dự kiến</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${filteredCustomers.reduce((sum, c) => sum + calculatePredictedRevenue(c), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Trong 3 tháng tới</p>
              </div>
            </div>
          </div>

          {/* AI Analysis Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Cảnh báo khẩn cấp</h4>
              </div>

              <div className="space-y-4">
                {/* High-risk customers */}
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-red-800">🚨 Khách hàng rủi ro cao</h5>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {filteredCustomers.filter(c => c.churnRisk >= 70).length} khách hàng
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredCustomers
                      .filter(c => c.churnRisk >= 70)
                      .slice(0, 3)
                      .map(customer => (
                        <div key={customer.id} className="flex items-center justify-between bg-white p-2 rounded">
                          <div>
                            <span className="text-sm font-medium text-red-700">{customer.name}</span>
                            <p className="text-xs text-red-600">
                              {customer.daysSinceLastInteraction} ngày không tương tác
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              {customer.churnRisk}% rủi ro
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-700 mb-2">
                      💡 Gợi ý AI: Liên hệ ngay trong 24h để giữ chân khách hàng
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                        Gọi ngay
                      </button>
                      <button className="text-xs border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-50">
                        Tạo chiến dịch
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dormant customers */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-orange-800">😴 Khách hàng không hoạt động</h5>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {filteredCustomers.filter(c => c.daysSinceLastInteraction > 60).length} khách hàng
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mb-2">
                    💡 Gợi ý AI: Tạo email tự động để tái kích hoạt
                  </p>
                  <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
                    Thiết lập email tự động
                  </button>
                </div>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Cơ hội tăng trưởng</h4>
              </div>

              <div className="space-y-4">
                {/* Upsell opportunities */}
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-green-800">📈 Cơ hội nâng cấp</h5>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {filteredCustomers.filter(c => c.engagementScore >= 80 && c.status === 'active').length} khách hàng
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredCustomers
                      .filter(c => c.engagementScore >= 80 && c.status === 'active')
                      .slice(0, 3)
                      .map(customer => (
                        <div key={customer.id} className="flex items-center justify-between bg-white p-2 rounded">
                          <div>
                            <span className="text-sm font-medium text-green-700">{customer.name}</span>
                            <p className="text-xs text-green-600">
                              Điểm tương tác: {customer.engagementScore}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              +${calculatePredictedRevenue(customer).toLocaleString()} tiềm năng
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 mb-2">
                      💡 Gợi ý AI: Đề xuất gói premium hoặc dịch vụ bổ sung
                    </p>
                    <div className="flex space-x-2">
                      <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Tạo đề xuất
                      </button>
                      <button className="text-xs border border-green-600 text-green-600 px-3 py-1 rounded hover:bg-green-50">
                        Lên lịch gọi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cross-sell opportunities */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-800">🎯 Cơ hội bán chéo</h5>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {filteredCustomers.filter(c => c.totalOrders >= 3 && parseFloat(c.averageOrderValue.replace(/[$,]/g, '')) > 500).length} khách hàng
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">
                    💡 Gợi ý AI: Khách hàng này thường mua nhiều lần, có thể quan tâm đến sản phẩm bổ sung
                  </p>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Xem sản phẩm liên quan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Dự đoán xu hướng</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue Prediction */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-medium text-green-800 mb-3">💰 Dự báo doanh thu</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Tháng này</span>
                    <span className="text-sm font-medium">
                      ${filteredCustomers.reduce((sum, c) => sum + calculatePredictedRevenue(c) * 0.3, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">3 tháng tới</span>
                    <span className="text-sm font-medium">
                      ${filteredCustomers.reduce((sum, c) => sum + calculatePredictedRevenue(c), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2">
                    <span className="text-sm font-medium text-green-800">Tăng trưởng dự kiến</span>
                    <span className="text-sm font-bold text-green-600">+24%</span>
                  </div>
                </div>
                <div className="mt-3 bg-green-100 rounded p-2">
                  <p className="text-xs text-green-700">
                    🎯 AI tin tưởng 87% vào dự báo này dựa trên lịch sử giao dịch
                  </p>
                </div>
              </div>

              {/* Churn Prediction */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                <h5 className="font-medium text-red-800 mb-3">📉 Dự báo churn</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Rủi ro cao</span>
                    <span className="text-sm font-medium">
                      {filteredCustomers.filter(c => c.churnRisk >= 70).length} khách hàng
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Rủi ro trung bình</span>
                    <span className="text-sm font-medium">
                      {filteredCustomers.filter(c => c.churnRisk >= 40 && c.churnRisk < 70).length} khách hàng
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-red-200 pt-2">
                    <span className="text-sm font-medium text-red-800">Tỷ lệ churn dự kiến</span>
                    <span className="text-sm font-bold text-red-600">8.2%</span>
                  </div>
                </div>
                <div className="mt-3 bg-red-100 rounded p-2">
                  <p className="text-xs text-red-700">
                    🎯 Can thiệp kịp thời có thể giảm 60% khách hàng rời bỏ
                  </p>
                </div>
              </div>

              {/* Engagement Trend */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-3">📊 Xu hướng tương tác</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Điểm TB hiện tại</span>
                    <span className="text-sm font-medium">
                      {Math.round(filteredCustomers.reduce((sum, c) => sum + c.engagementScore, 0) / filteredCustomers.length)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Dự báo sau 30 ngày</span>
                    <span className="text-sm font-medium">
                      {Math.round(filteredCustomers.reduce((sum, c) => sum + c.engagementScore, 0) / filteredCustomers.length * 1.05)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-sm font-medium text-blue-800">Cải thiện dự kiến</span>
                    <span className="text-sm font-bold text-blue-600">+5%</span>
                  </div>
                </div>
                <div className="mt-3 bg-blue-100 rounded p-2">
                  <p className="text-xs text-blue-700">
                    🎯 Chiến dịch remarketing sẽ tăng 15% tương tác
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Industry & Segment Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <BarChart className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Phân tích phân khúc</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry Analysis */}
              <div>
                <h5 className="font-medium text-gray-800 mb-4">🏢 Phân tích theo ngành</h5>
                <div className="space-y-3">
                  {Array.from(new Set(filteredCustomers.map(c => c.industry)))
                    .map(industry => {
                      const customers = filteredCustomers.filter(c => c.industry === industry)
                      const avgRevenue = customers.reduce((sum, c) => sum + calculatePredictedRevenue(c), 0) / customers.length
                      const avgEngagement = customers.reduce((sum, c) => sum + c.engagementScore, 0) / customers.length
                      const highRisk = customers.filter(c => c.churnRisk >= 70).length
                      
                      return (
                        <div key={industry} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">{industry}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {customers.length} khách hàng
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-gray-500">Doanh thu TB</div>
                              <div className="font-medium">${avgRevenue.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Tương tác TB</div>
                              <div className="font-medium">{Math.round(avgEngagement)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Rủi ro cao</div>
                              <div className="font-medium text-red-600">{highRisk}</div>
                            </div>
                          </div>
                          {highRisk > 0 && (
                            <div className="mt-2 p-2 bg-red-50 rounded">
                              <p className="text-xs text-red-700">
                                💡 Gợi ý: Ngành {industry} đang có xu hướng churn cao, cần chú ý
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Customer Lifecycle */}
              <div>
                <h5 className="font-medium text-gray-800 mb-4">🔄 Phân tích vòng đời khách hàng</h5>
                <div className="space-y-3">
                  {['new', 'active', 'vip', 'at-risk', 'churned', 'dormant'].map(status => {
                    const customers = filteredCustomers.filter(c => c.status === status)
                    const percentage = (customers.length / filteredCustomers.length * 100).toFixed(1)
                    
                    return (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'vip' ? 'bg-purple-500' :
                            status === 'active' ? 'bg-green-500' :
                            status === 'at-risk' ? 'bg-yellow-500' :
                            status === 'churned' ? 'bg-red-500' :
                            status === 'dormant' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium capitalize">
                            {status === 'new' ? 'Mới' :
                             status === 'active' ? 'Hoạt động' :
                             status === 'vip' ? 'VIP' :
                             status === 'at-risk' ? 'Rủi ro' :
                             status === 'churned' ? 'Đã rời' :
                             status === 'dormant' ? 'Không hoạt động' : status}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{customers.length}</div>
                          <div className="text-xs text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-700 mb-2">
                    🎯 Khuyến nghị AI cho tối ưu vòng đời:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Chuyển đổi 75% khách hàng &apos;new&apos; thành &apos;active&apos; trong 30 ngày</li>
                    <li>• Giảm 50% khách hàng &apos;at-risk&apos; thông qua chăm sóc tích cực</li>
                    <li>• Tái kích hoạt 30% khách hàng &apos;dormant&apos; qua email marketing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Trung tâm hành động AI</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">Xử lý khẩn cấp</h5>
                <p className="text-xs text-gray-600 mb-2">Liên hệ {filteredCustomers.filter(c => c.churnRisk >= 70).length} khách hàng rủi ro cao</p>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Ưu tiên cao</span>
              </button>

              <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">Khai thác cơ hội</h5>
                <p className="text-xs text-gray-600 mb-2">Tạo đề xuất cho {filteredCustomers.filter(c => c.engagementScore >= 80).length} khách hàng tiềm năng</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Cơ hội tốt</span>
              </button>

              <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">Email tự động</h5>
                <p className="text-xs text-gray-600 mb-2">Thiết lập cho {filteredCustomers.filter(c => c.daysSinceLastInteraction > 30).length} khách hàng lâu không tương tác</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Tự động hóa</span>
              </button>

              <button className="p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart className="w-4 h-4 text-purple-600" />
                </div>
                <h5 className="font-medium text-gray-900 mb-1">Báo cáo chi tiết</h5>
                <p className="text-xs text-gray-600 mb-2">Tạo báo cáo phân tích cho management</p>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Báo cáo</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
              <h5 className="font-medium text-gray-900 mb-2">💡 Giá trị AI mang lại:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Tiết kiệm 75% thời gian phân tích</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Tăng 40% tỷ lệ giữ chân khách hàng</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Dự đoán chính xác 94.5% xu hướng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết khách hàng</h3>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Customer Header */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium ${
                selectedCustomer.status === 'vip' ? 'bg-purple-600' :
                selectedCustomer.status === 'active' ? 'bg-green-600' :
                selectedCustomer.status === 'at-risk' ? 'bg-red-600' :
                selectedCustomer.status === 'churned' ? 'bg-orange-600' :
                selectedCustomer.status === 'dormant' ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {selectedCustomer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold">{selectedCustomer.name}</h4>
                <p className="text-gray-600">{selectedCustomer.position} tại {selectedCustomer.company}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedCustomer.status === 'vip' ? 'bg-purple-100 text-purple-800' :
                    selectedCustomer.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedCustomer.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                    selectedCustomer.status === 'churned' ? 'bg-orange-100 text-orange-800' :
                    selectedCustomer.status === 'dormant' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCustomer.status === 'vip' ? 'VIP' :
                     selectedCustomer.status === 'active' ? 'Hoạt động' :
                     selectedCustomer.status === 'at-risk' ? 'Có nguy cơ' :
                     selectedCustomer.status === 'churned' ? 'Đã churn' :
                     selectedCustomer.status === 'dormant' ? 'Tạm ngưng' : 'Không hoạt động'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedCustomer.customerType === 'diamond' ? 'bg-purple-100 text-purple-800' :
                    selectedCustomer.customerType === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    selectedCustomer.customerType === 'silver' ? 'bg-gray-100 text-gray-800' :
                    selectedCustomer.customerType === 'bronze' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedCustomer.customerType === 'diamond' ? '💎 Kim cương' :
                     selectedCustomer.customerType === 'gold' ? '🥇 Vàng' :
                     selectedCustomer.customerType === 'silver' ? '🥈 Bạc' :
                     selectedCustomer.customerType === 'bronze' ? '🥉 Đồng' :
                     selectedCustomer.customerType === 'new' ? '🌟 Mới' :
                     selectedCustomer.customerType === 'returning' ? '🔄 Quay lại' : '😴 Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Chi tiết khách hàng</span>
                </button>
                <button
                  onClick={() => setActiveTab('interactions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'interactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Lịch sử tương tác</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Lịch sử mua hàng</span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Ghi chú</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-suggestions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'ai-suggestions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>AI gợi ý</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Thông tin liên hệ */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-300">📞 Thông tin liên hệ</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border-b border-gray-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email chính</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                        </div>
                        {selectedCustomer.secondaryEmail && (
                          <div className="border-b border-gray-200 pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email phụ</label>
                            <p className="text-sm text-gray-900">{selectedCustomer.secondaryEmail}</p>
                          </div>
                        )}
                        <div className="border-b border-gray-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.contact}</p>
                        </div>
                        {selectedCustomer.phone2 && (
                          <div className="border-b border-gray-200 pb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại 2</label>
                            <p className="text-sm text-gray-900">{selectedCustomer.phone2}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                          <p className="text-sm text-gray-500">{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.postalCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin công ty */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-4 pb-2 border-b border-blue-300">🏢 Thông tin công ty</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border-b border-blue-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.company}</p>
                        </div>
                        <div className="border-b border-blue-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.position}</p>
                        </div>
                        <div className="border-b border-blue-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.department}</p>
                        </div>
                        <div className="border-b border-blue-200 pb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngành</label>
                          <p className="text-sm text-gray-900">{selectedCustomer.industry}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quy mô công ty</label>
                          <p className="text-sm text-gray-900">
                            {selectedCustomer.companySize === 'small' ? 'Nhỏ (< 50 nhân viên)' :
                             selectedCustomer.companySize === 'medium' ? 'Trung bình (50-200 nhân viên)' :
                             selectedCustomer.companySize === 'large' ? 'Lớn (200-1000 nhân viên)' :
                             'Doanh nghiệp (> 1000 nhân viên)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thống kê khách hàng với đường kẻ phân cách */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200 mt-6">
                    <h5 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-300">📊 Thống kê khách hàng</h5>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.totalValue)}</div>
                        <div className="text-sm text-green-700 mt-1">Tổng giá trị đã mua (VNĐ)</div>
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.dateOfBirth && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mt-6">
                      <h5 className="font-medium text-gray-900 mb-4 pb-2 border-b border-yellow-300">👤 Thông tin cá nhân</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-r border-yellow-300 pr-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sinh nhật</label>
                          <p className="text-sm text-gray-900">{formatBirthday(selectedCustomer.dateOfBirth)}</p>
                        </div>
                        {selectedCustomer.gender && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <p className="text-sm text-gray-900">
                              {selectedCustomer.gender === 'male' ? 'Nam' :
                               selectedCustomer.gender === 'female' ? 'Nữ' : 'Khác'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mt-6">
                    <h5 className="font-medium text-gray-900 mb-4 pb-2 border-b border-purple-300">🏷️ Tags khách hàng</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`px-3 py-1 text-xs rounded-full border ${tag.color} shadow-sm`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'interactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-gray-900 flex items-center">
                      <History className="w-5 h-5 mr-2 text-blue-600" />
                      Lịch sử tương tác ({selectedCustomer.interactions.length})
                    </h5>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Thêm tương tác</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCustomer.interactions.map((interaction, index) => (
                      <div key={interaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                              interaction.type === 'email' ? 'bg-blue-100 border border-blue-200' :
                              interaction.type === 'call' ? 'bg-green-100 border border-green-200' :
                              interaction.type === 'meeting' ? 'bg-purple-100 border border-purple-200' :
                              interaction.type === 'sms' ? 'bg-yellow-100 border border-yellow-200' :
                              interaction.type === 'chat' ? 'bg-indigo-100 border border-indigo-200' : 'bg-red-100 border border-red-200'
                            }`}>
                              {interaction.type === 'email' ? <Mail className="w-5 h-5 text-blue-600" /> :
                               interaction.type === 'call' ? <Phone className="w-5 h-5 text-green-600" /> :
                               interaction.type === 'meeting' ? <Calendar className="w-5 h-5 text-purple-600" /> :
                               interaction.type === 'sms' ? <MessageSquare className="w-5 h-5 text-yellow-600" /> :
                               interaction.type === 'chat' ? <MessageCircle className="w-5 h-5 text-indigo-600" /> :
                               <Info className="w-5 h-5 text-red-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h6 className="font-medium text-gray-900">{interaction.title}</h6>
                                <span className={`px-2 py-1 text-xs rounded-full border ${
                                  interaction.status === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
                                  interaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                  {interaction.status === 'success' ? '✅ Thành công' :
                                   interaction.status === 'pending' ? '⏳ Đang chờ' : '❌ Thất bại'}
                                </span>
                              </div>
                              <div className="border-l-2 border-gray-200 pl-3 mb-3">
                                <p className="text-sm text-gray-600">{interaction.summary}</p>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border-t border-gray-100">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(interaction.date)}
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {interaction.channel}
                                </span>
                              </div>
                              {interaction.aiSummary && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
                                  <div className="flex items-start space-x-2">
                                    <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <div>
                                      <strong className="text-xs text-blue-800">AI Tóm tắt:</strong>
                                      <p className="text-xs text-blue-700 mt-1">{interaction.aiSummary}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Đường kẻ phân cách giữa các tương tác */}
                        {index < selectedCustomer.interactions.length - 1 && (
                          <div className="mt-4 border-b border-gray-100"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-gray-900 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      Lịch sử mua hàng
                    </h5>
                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-green-200">
                      Tổng giá trị: <span className="font-medium text-green-600">{formatCurrency(selectedCustomer.lifetimeValue)}</span>
                    </div>
                  </div>

                  {/* Thống kê tổng quan với đường kẻ phân cách */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h6 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">📈 Thống kê mua hàng</h6>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(selectedCustomer.lifetimeValue)}</div>
                        <div className="text-xs text-green-700 mt-1">Giá trị trọn đời</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedCustomer.averageOrderValue)}</div>
                        <div className="text-xs text-blue-700 mt-1">Giá trị đơn hàng TB</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-lg font-bold text-purple-600">{selectedCustomer.products.length}</div>
                        <div className="text-xs text-purple-700 mt-1">Sản phẩm đã mua</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Danh sách sản phẩm với đường kẻ phân cách */}
                  <div className="space-y-3">
                    <h6 className="font-medium text-gray-900 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-gray-600" />
                      Chi tiết sản phẩm đã mua
                    </h6>
                    {selectedCustomer.products.map((product, index) => (
                      <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900">{product.name}</h6>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${
                            product.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            product.status === 'expired' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {product.status === 'active' ? '✅ Đang hoạt động' :
                             product.status === 'expired' ? '⏰ Hết hạn' : '❌ Ngưng sử dụng'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price.toString())}</div>
                            <div className="text-xs text-gray-500">Giá</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{product.quantity}</div>
                            <div className="text-xs text-gray-500">Số lượng</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{product.purchaseDate}</div>
                            <div className="text-xs text-gray-500">Ngày mua</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">{formatCurrency((product.price * product.quantity).toString())}</div>
                            <div className="text-xs text-gray-500">Tổng tiền</div>
                          </div>
                        </div>
                        
                        {/* Đường kẻ phân cách giữa các sản phẩm */}
                        {index < selectedCustomer.products.length - 1 && (
                          <div className="mt-4 border-b border-gray-100"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {selectedCustomer.notes ? (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">Ghi chú chung</span>
                              <p className="text-xs text-gray-500">Cập nhật lần cuối: {formatDate(selectedCustomer.lastInteraction)}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">
                            Đã lưu
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedCustomer.notes}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h6 className="font-medium text-gray-900 mb-2">Chưa có ghi chú</h6>
                      <p className="text-gray-500 mb-4">Chưa có ghi chú nào cho khách hàng này</p>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto">
                        <Plus className="w-4 h-4" />
                        <span>Thêm ghi chú đầu tiên</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Form tạo ghi chú mới với đường kẻ phân cách */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <h6 className="font-medium text-gray-900 flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-blue-600" />
                        Tạo ghi chú mới
                      </h6>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung ghi chú</label>
                        <textarea
                          placeholder="Nhập ghi chú về khách hàng..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                        />
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                              <span className="text-sm text-gray-600">Đánh dấu quan trọng</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-sm text-gray-600">Thông báo cho team</span>
                            </label>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Lưu ghi chú</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai-suggestions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">AI Gợi ý cho khách hàng</h5>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>Làm mới gợi ý</span>
                    </button>
                  </div>

                  {/* AI Risk Assessment */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-blue-900">Đánh giá tổng thể</h6>
                        <p className="text-sm text-blue-700 mt-1">
                          Khách hàng {selectedCustomer.churnRisk > 70 ? 'có rủi ro cao' : selectedCustomer.churnRisk > 40 ? 'có rủi ro trung bình' : 'ổn định'} 
                          với điểm churn risk {selectedCustomer.churnRisk}%. 
                          {selectedCustomer.daysSinceLastInteraction > 30 && ' Đã lâu không tương tác.'}
                          {selectedCustomer.engagementScore < 50 && ' Mức độ tương tác thấp.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Explanation */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-gray-600" />
                      </div>
                      <h6 className="font-medium text-gray-900">📊 Giải thích các chỉ số</h6>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Days Since Last Interaction */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-900 text-sm">Ngày Không Tương Tác ({selectedCustomer.daysSinceLastInteraction})</span>
                        </div>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                          <strong>Ý nghĩa:</strong> Số ngày kể từ lần tương tác cuối cùng.<br/>
                          <strong>Tính toán:</strong> Thời gian từ lần cuối gọi điện, email, chat, hoặc gặp mặt.<br/>
                          <strong>Ngưỡng cảnh báo:</strong> 
                          <span className={selectedCustomer.daysSinceLastInteraction > 60 ? 'text-red-800 font-medium' : ''}>Nguy hiểm (&gt;60 ngày)</span>, 
                          <span className={selectedCustomer.daysSinceLastInteraction > 30 && selectedCustomer.daysSinceLastInteraction <= 60 ? 'text-orange-800 font-medium' : ''}>Cần chú ý (30-60 ngày)</span>, 
                          <span className={selectedCustomer.daysSinceLastInteraction <= 30 ? 'text-green-800 font-medium' : ''}>Bình thường (&lt;30 ngày)</span>
                        </p>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h6 className="font-medium text-gray-900 mb-3 text-sm">🎯 Chỉ số bổ sung</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-green-900 text-sm">Tổng Giá Trị Đã Mua</span>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(selectedCustomer.totalValue)}</span>
                          </div>
                          <p className="text-xs text-green-700">
                            Tổng số tiền khách hàng đã chi tiêu cho sản phẩm/dịch vụ của công ty từ trước đến nay.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-purple-900 text-sm">Hạng Khách Hàng</span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              selectedCustomer.customerType === 'diamond' ? 'bg-purple-100 text-purple-800' :
                              selectedCustomer.customerType === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                              selectedCustomer.customerType === 'silver' ? 'bg-gray-100 text-gray-800' :
                              selectedCustomer.customerType === 'bronze' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedCustomer.customerType === 'diamond' ? '💎 Kim cương' :
                               selectedCustomer.customerType === 'gold' ? '🥇 Vàng' :
                               selectedCustomer.customerType === 'silver' ? '🥈 Bạc' :
                               selectedCustomer.customerType === 'bronze' ? '🥉 Đồng' :
                               selectedCustomer.customerType === 'new' ? '🌟 Mới' : '🔄 Quay lại'}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700">
                            Phân hạng dựa trên giá trị mua hàng, thời gian là khách hàng, và mức độ tương tác.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Recommendations */}
                  <div className="space-y-3">
                    <h6 className="font-medium text-gray-900">Gợi ý hành động</h6>
                    
                    {selectedCustomer.churnRisk > 60 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-red-900">Ưu tiên cao - Nguy cơ churn</h6>
                            <p className="text-sm text-red-700 mt-1">
                              Liên hệ ngay để giữ chân khách hàng. Đề xuất ưu đãi đặc biệt hoặc lịch tư vấn.
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                                Gọi ngay
                              </button>
                              <button className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">
                                Gửi ưu đãi
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedCustomer.daysSinceLastInteraction > 30 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-yellow-900">Ưu tiên trung bình - Tái kết nối</h6>
                            <p className="text-sm text-yellow-700 mt-1">
                              Đã {selectedCustomer.daysSinceLastInteraction} ngày không tương tác. Gửi email follow-up hoặc thông tin sản phẩm mới.
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">
                                Gửi email
                              </button>
                              <button className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200">
                                Chia sẻ tin tức
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedCustomer.customerType === 'gold' || selectedCustomer.customerType === 'diamond' ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-green-900">Cơ hội upsell - Khách hàng VIP</h6>
                            <p className="text-sm text-green-700 mt-1">
                              Khách hàng có giá trị cao, phù hợp để giới thiệu sản phẩm/dịch vụ premium.
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                Tư vấn upsell
                              </button>
                              <button className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                                Gửi catalog VIP
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Target className="w-3 h-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-medium text-blue-900">Cơ hội phát triển</h6>
                            <p className="text-sm text-blue-700 mt-1">
                              Khách hàng có tiềm năng. Đề xuất các gói dịch vụ phù hợp để nâng cấp hạng.
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                Đề xuất nâng cấp
                              </button>
                              <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">
                                Chia sẻ case study
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Insights */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-purple-900">Phân tích hành vi</h6>
                        <div className="text-sm text-purple-700 mt-1 space-y-1">
                          <p>• Kênh tương tác ưa thích: {
                            selectedCustomer.preferredChannel === 'email' ? 'Email' :
                            selectedCustomer.preferredChannel === 'phone' ? 'Điện thoại' :
                            selectedCustomer.preferredChannel === 'chat' ? 'Chat' :
                            selectedCustomer.preferredChannel === 'in-person' ? 'Trực tiếp' : 'Mạng xã hội'
                          }</p>
                          <p>• Thời gian mua hàng gần nhất: {formatDate(selectedCustomer.lastOrderDate)}</p>
                          <p>• Xu hướng: {selectedCustomer.engagementScore > 70 ? 'Tích cực tương tác' : 
                                              selectedCustomer.engagementScore > 40 ? 'Tương tác vừa phải' : 'Ít tương tác'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
