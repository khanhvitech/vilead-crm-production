'use client'

import React, { useState } from 'react'
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  Download,
  Filter,
  Search,
  MoreVertical,
  X,
  Building,
  User
} from 'lucide-react'

interface KPITarget {
  id: number
  name: string
  description: string
  category: 'revenue' | 'leads' | 'conversion' | 'activity' | 'custom'
  targetValue: number
  currentValue: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  assignedTo: string[]
  assignmentLevel: 'individual' | 'team' | 'department' | 'company'
  status: 'active' | 'paused' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progressPercentage: number
  lastUpdated: string
  createdAt: string
  tags: string[]
  parentKPI?: number // ID của KPI cha (nếu là KPI con)
  childKPIs?: number[] // Danh sách ID KPI con
  rollupMethod: 'sum' | 'average' | 'max' | 'min' // Cách tính tổng hợp
  isAutoCalculated: boolean // Có tự động tính từ KPI con không
}

export default function KPIManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'reports' | 'settings'>('targets')
  const [activeTargetTab, setActiveTargetTab] = useState<'company' | 'department' | 'team' | 'individual'>('company')
  const [showAddKPIModal, setShowAddKPIModal] = useState(false)
  const [showEditKPIModal, setShowEditKPIModal] = useState(false)
  const [selectedKPI, setSelectedKPI] = useState<KPITarget | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [assignmentLevelFilter, setAssignmentLevelFilter] = useState('all')
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    category: 'revenue' as KPITarget['category'],
    targetValue: 0,
    unit: 'VND',
    period: 'monthly' as KPITarget['period'],
    assignedTo: [] as string[],
    assignmentLevel: 'individual' as KPITarget['assignmentLevel'],
    priority: 'medium' as KPITarget['priority'],
    startDate: '',
    endDate: '',
    tags: [] as string[],
    rollupMethod: 'sum' as KPITarget['rollupMethod'],
    isAutoCalculated: false
  })

  // Sample KPI data with hierarchical structure
  const [kpiTargets, setKpiTargets] = useState<KPITarget[]>([
    // Company level KPI
    {
      id: 1,
      name: "Doanh thu tháng - Công ty",
      description: "Mục tiêu doanh thu hàng tháng của toàn công ty",
      category: 'revenue',
      targetValue: 5000000000,
      currentValue: 3100000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Toàn công ty'],
      assignmentLevel: 'company',
      status: 'active',
      priority: 'critical',
      progressPercentage: 62,
      lastUpdated: '2024-11-05T10:00:00',
      createdAt: '2024-11-01T08:00:00',
      tags: ['doanh thu', 'tháng 11'],
      childKPIs: [6, 7], // KPI của các phòng ban
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    // Department level KPIs
    {
      id: 6,
      name: "Doanh thu tháng - Phòng Sales",
      description: "Mục tiêu doanh thu hàng tháng của phòng Sales",
      category: 'revenue',
      targetValue: 3000000000,
      currentValue: 1900000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Phòng Sales'],
      assignmentLevel: 'department',
      status: 'active',
      priority: 'high',
      progressPercentage: 63,
      lastUpdated: '2024-11-05T10:00:00',
      createdAt: '2024-11-01T08:00:00',
      tags: ['doanh thu', 'phòng sales'],
      parentKPI: 1,
      childKPIs: [8, 9], // KPI của các team trong phòng
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    {
      id: 7,
      name: "Doanh thu tháng - Phòng Marketing",
      description: "Mục tiêu doanh thu hàng tháng của phòng Marketing",
      category: 'revenue',
      targetValue: 2000000000,
      currentValue: 1200000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Phòng Marketing'],
      assignmentLevel: 'department',
      status: 'active',
      priority: 'high',
      progressPercentage: 60,
      lastUpdated: '2024-11-05T10:00:00',
      createdAt: '2024-11-01T08:00:00',
      tags: ['doanh thu', 'phòng marketing'],
      parentKPI: 1,
      childKPIs: [10], // KPI của team marketing
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    // Team level KPIs
    {
      id: 8,
      name: "Doanh thu tháng - Team A (Sales)",
      description: "Mục tiêu doanh thu hàng tháng của Team A phòng Sales",
      category: 'revenue',
      targetValue: 1800000000,
      currentValue: 1200000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Team A Sales'],
      assignmentLevel: 'team',
      status: 'active',
      priority: 'high',
      progressPercentage: 67,
      lastUpdated: '2024-11-05T10:00:00',
      createdAt: '2024-11-01T08:00:00',
      tags: ['doanh thu', 'team a'],
      parentKPI: 6,
      childKPIs: [11, 12], // KPI của các cá nhân trong team
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    {
      id: 9,
      name: "Doanh thu tháng - Team B (Sales)",
      description: "Mục tiêu doanh thu hàng tháng của Team B phòng Sales",
      category: 'revenue',
      targetValue: 1200000000,
      currentValue: 700000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Team B Sales'],
      assignmentLevel: 'team',
      status: 'active',
      priority: 'medium',
      progressPercentage: 58,
      lastUpdated: '2024-11-05T10:00:00',
      createdAt: '2024-11-01T08:00:00',
      tags: ['doanh thu', 'team b'],
      parentKPI: 6,
      childKPIs: [13, 14], // KPI của các cá nhân trong team
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    {
      id: 10,
      name: "Leads mới tháng - Team Marketing",
      description: "Số lượng leads mới cần tạo ra mỗi tháng",
      category: 'leads',
      targetValue: 200,
      currentValue: 128,
      unit: 'leads',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Team Marketing'],
      assignmentLevel: 'team',
      status: 'active',
      priority: 'high',
      progressPercentage: 64,
      lastUpdated: '2024-11-05T15:30:00',
      createdAt: '2024-11-01T09:00:00',
      tags: ['leads', 'marketing'],
      parentKPI: 7,
      childKPIs: [15, 16], // KPI của các cá nhân trong team
      rollupMethod: 'sum',
      isAutoCalculated: true
    },
    // Individual level KPIs
    {
      id: 11,
      name: "Doanh thu tháng - Nguyễn Văn A",
      description: "Mục tiêu doanh thu cá nhân của Nguyễn Văn A",
      category: 'revenue',
      targetValue: 900000000,
      currentValue: 650000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Nguyễn Văn A'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'high',
      progressPercentage: 72,
      lastUpdated: '2024-11-05T16:45:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['doanh thu', 'cá nhân'],
      parentKPI: 8,
      rollupMethod: 'sum',
      isAutoCalculated: false
    },
    {
      id: 12,
      name: "Doanh thu tháng - Trần Thị B",
      description: "Mục tiêu doanh thu cá nhân của Trần Thị B",
      category: 'revenue',
      targetValue: 900000000,
      currentValue: 550000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Trần Thị B'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'high',
      progressPercentage: 61,
      lastUpdated: '2024-11-05T16:30:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['doanh thu', 'cá nhân'],
      parentKPI: 8,
      rollupMethod: 'sum',
      isAutoCalculated: false
    },
    {
      id: 13,
      name: "Doanh thu tháng - Lê Văn C",
      description: "Mục tiêu doanh thu cá nhân của Lê Văn C",
      category: 'revenue',
      targetValue: 600000000,
      currentValue: 400000000,
      unit: 'VND',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Lê Văn C'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'medium',
      progressPercentage: 67,
      lastUpdated: '2024-11-05T15:15:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['doanh thu', 'cá nhân'],
      parentKPI: 9,
      rollupMethod: 'sum',
      isAutoCalculated: false
    },
    {
      id: 14,
      name: "Số cuộc gọi hàng ngày - Phạm Thị D",
      description: "Số cuộc gọi tối thiểu mỗi ngày của Phạm Thị D",
      category: 'activity',
      targetValue: 25,
      currentValue: 18,
      unit: 'cuộc gọi',
      period: 'daily',
      startDate: '2024-11-05',
      endDate: '2024-11-05',
      assignedTo: ['Phạm Thị D'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'medium',
      progressPercentage: 72,
      lastUpdated: '2024-11-05T16:45:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['hoạt động', 'gọi điện', 'cá nhân'],
      parentKPI: 9,
      rollupMethod: 'average',
      isAutoCalculated: false
    },
    {
      id: 15,
      name: "Leads từ Social Media - Hoàng Văn E",
      description: "Số leads từ social media của Hoàng Văn E",
      category: 'leads',
      targetValue: 80,
      currentValue: 52,
      unit: 'leads',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Hoàng Văn E'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'medium',
      progressPercentage: 65,
      lastUpdated: '2024-11-05T14:20:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['leads', 'social media', 'cá nhân'],
      parentKPI: 10,
      rollupMethod: 'sum',
      isAutoCalculated: false
    },
    {
      id: 16,
      name: "Leads từ Content Marketing - Đỗ Thị F",
      description: "Số leads từ content marketing của Đỗ Thị F",
      category: 'leads',
      targetValue: 120,
      currentValue: 76,
      unit: 'leads',
      period: 'monthly',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      assignedTo: ['Đỗ Thị F'],
      assignmentLevel: 'individual',
      status: 'active',
      priority: 'high',
      progressPercentage: 63,
      lastUpdated: '2024-11-05T13:45:00',
      createdAt: '2024-11-01T10:00:00',
      tags: ['leads', 'content marketing', 'cá nhân'],
      parentKPI: 10,
      rollupMethod: 'sum',
      isAutoCalculated: false
    }
  ])

  // Available organizational structure
  const organizationStructure = {
    company: ['Toàn công ty'],
    departments: [
      { id: 'sales', name: 'Phòng Sales', teams: ['Team A Sales', 'Team B Sales'] },
      { id: 'marketing', name: 'Phòng Marketing', teams: ['Team Marketing'] },
      { id: 'support', name: 'Phòng Hỗ trợ', teams: ['Team Support'] }
    ],
    teams: [
      { id: 'team-a-sales', name: 'Team A Sales', department: 'sales', members: ['Nguyễn Văn A', 'Trần Thị B'] },
      { id: 'team-b-sales', name: 'Team B Sales', department: 'sales', members: ['Lê Văn C', 'Phạm Thị D'] },
      { id: 'team-marketing', name: 'Team Marketing', department: 'marketing', members: ['Hoàng Văn E', 'Đỗ Thị F'] },
      { id: 'team-support', name: 'Team Support', department: 'support', members: ['Vũ Văn G', 'Mai Thị H'] }
    ],
    individuals: [
      'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D',
      'Hoàng Văn E', 'Đỗ Thị F', 'Vũ Văn G', 'Mai Thị H'
    ]
  }

  // Get available targets based on assignment level
  const getAvailableTargets = (level: KPITarget['assignmentLevel']) => {
    switch (level) {
      case 'company':
        return organizationStructure.company
      case 'department':
        return organizationStructure.departments.map(d => d.name)
      case 'team':
        return organizationStructure.teams.map(t => t.name)
      case 'individual':
        return organizationStructure.individuals
      default:
        return []
    }
  }

  // Calculate rollup values for parent KPIs
  const calculateRollupValue = (parentKPI: KPITarget, childKPIs: KPITarget[]) => {
    if (!childKPIs.length) return parentKPI.currentValue

    switch (parentKPI.rollupMethod) {
      case 'sum':
        return childKPIs.reduce((sum, child) => sum + child.currentValue, 0)
      case 'average':
        return childKPIs.reduce((sum, child) => sum + child.currentValue, 0) / childKPIs.length
      case 'max':
        return Math.max(...childKPIs.map(child => child.currentValue))
      case 'min':
        return Math.min(...childKPIs.map(child => child.currentValue))
      default:
        return parentKPI.currentValue
    }
  }

  // Get assignment level display name
  const getAssignmentLevelName = (level: KPITarget['assignmentLevel']) => {
    switch (level) {
      case 'individual': return 'Cá nhân'
      case 'team': return 'Team'
      case 'department': return 'Phòng ban'
      case 'company': return 'Công ty'
      default: return level
    }
  }

  // Filter KPIs
  const filteredKPIs = kpiTargets.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.assignedTo.some(person => person.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || kpi.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || kpi.status === statusFilter
    const matchesAssignmentLevel = assignmentLevelFilter === 'all' || kpi.assignmentLevel === assignmentLevelFilter
    
    // Date filtering
    const matchesStartDate = !startDateFilter || new Date(kpi.startDate) >= new Date(startDateFilter)
    const matchesEndDate = !endDateFilter || new Date(kpi.endDate) <= new Date(endDateFilter)
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAssignmentLevel && matchesStartDate && matchesEndDate
  })

  // Filter KPIs by level for specific tabs
  const getFilteredKPIsByLevel = (level: string) => {
    return filteredKPIs.filter(kpi => kpi.assignmentLevel === level)
  }

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setAssignmentLevelFilter('all')
    setStartDateFilter('')
    setEndDateFilter('')
  }

  // Calculate overview metrics
  const overviewMetrics = {
    totalKPIs: kpiTargets.length,
    activeKPIs: kpiTargets.filter(k => k.status === 'active').length,
    achievedKPIs: kpiTargets.filter(k => k.progressPercentage >= 100).length,
    avgProgress: Math.round(kpiTargets.reduce((sum, k) => sum + k.progressPercentage, 0) / kpiTargets.length),
    criticalKPIs: kpiTargets.filter(k => k.priority === 'critical' && k.progressPercentage < 80).length,
    overdueKPIs: kpiTargets.filter(k => k.status === 'overdue').length
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="w-4 h-4" />
      case 'leads': return <Users className="w-4 h-4" />
      case 'conversion': return <TrendingUp className="w-4 h-4" />
      case 'activity': return <Clock className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600 bg-green-100'
      case 'leads': return 'text-blue-600 bg-blue-100'
      case 'conversion': return 'text-purple-600 bg-purple-100'
      case 'activity': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paused': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'completed': return <Award className="w-4 h-4 text-blue-500" />
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(value) + ' VND'
    }
    return `${value} ${unit}`
  }

  const formatPeriod = (period: string) => {
    switch (period) {
      case 'daily': return 'Hàng ngày'
      case 'weekly': return 'Hàng tuần'
      case 'monthly': return 'Hàng tháng'
      case 'quarterly': return 'Hàng quý'
      case 'yearly': return 'Hàng năm'
      default: return period
    }
  }

  const handleAddKPI = () => {
    const newKPIData: KPITarget = {
      id: Date.now(),
      name: newKPI.name,
      description: newKPI.description,
      category: newKPI.category,
      targetValue: newKPI.targetValue,
      currentValue: 0,
      unit: newKPI.unit,
      period: newKPI.period,
      startDate: newKPI.startDate,
      endDate: newKPI.endDate,
      assignedTo: newKPI.assignedTo,
      assignmentLevel: newKPI.assignmentLevel,
      status: 'active',
      priority: newKPI.priority,
      progressPercentage: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      tags: newKPI.tags,
      rollupMethod: newKPI.rollupMethod,
      isAutoCalculated: newKPI.isAutoCalculated
    }

    setKpiTargets([...kpiTargets, newKPIData])
    setShowAddKPIModal(false)
    setNewKPI({
      name: '',
      description: '',
      category: 'revenue',
      targetValue: 0,
      unit: 'VND',
      period: 'monthly',
      assignedTo: [],
      assignmentLevel: 'individual',
      priority: 'medium',
      startDate: '',
      endDate: '',
      tags: [],
      rollupMethod: 'sum',
      isAutoCalculated: false
    })
  }

  const handleEditKPI = (kpi: KPITarget) => {
    setSelectedKPI(kpi)
    setShowEditKPIModal(true)
  }

  const handleDeleteKPI = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa KPI này?')) {
      setKpiTargets(kpiTargets.filter(k => k.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý KPI</h1>
          <p className="text-gray-600">Thiết lập và theo dõi các chỉ số hiệu suất quan trọng</p>
        </div>
        <button
          onClick={() => setShowAddKPIModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm KPI</span>
        </button>
      </div>

      {/* Tabs */}
      {false && (
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            // { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
            { id: 'targets', label: 'Mục tiêu KPI', icon: Target },
            // { id: 'reports', label: 'Báo cáo', icon: TrendingUp },
            // { id: 'settings', label: 'Cài đặt', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      )}

      {/* Overview Tab */}
      {false && activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng KPIs</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewMetrics.totalKPIs}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">{overviewMetrics.activeKPIs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-blue-600">{overviewMetrics.achievedKPIs}</p>
                </div>
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiến độ TB</p>
                  <p className="text-2xl font-bold text-purple-600">{overviewMetrics.avgProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cần chú ý</p>
                  <p className="text-2xl font-bold text-red-600">{overviewMetrics.criticalKPIs}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                  <p className="text-2xl font-bold text-orange-600">{overviewMetrics.overdueKPIs}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Quick KPI Status */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái KPI quan trọng</h3>
              <div className="space-y-4">
                {kpiTargets.filter(k => k.priority === 'critical' || k.priority === 'high').slice(0, 3).map(kpi => (
                  <div key={kpi.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getCategoryColor(kpi.category)}`}>
                        {getCategoryIcon(kpi.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                        <p className="text-sm text-gray-600">{formatPeriod(kpi.period)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatValue(kpi.currentValue, kpi.unit)} / {formatValue(kpi.targetValue, kpi.unit)}
                        </p>
                        <p className="text-sm text-gray-600">{kpi.progressPercentage}% hoàn thành</p>
                      </div>
                      <div className="w-20">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              kpi.progressPercentage >= 100 ? 'bg-green-500' :
                              kpi.progressPercentage >= 80 ? 'bg-blue-500' :
                              kpi.progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Targets Tab */}
      {/* Always show targets content */}
      <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'company', label: 'Toàn công ty', icon: Building },
                { id: 'department', label: 'Phòng ban', icon: Users },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'individual', label: 'Cá nhân', icon: User }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTargetTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTargetTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Company Level Tab */}
          {activeTargetTab === 'company' && (
            <div className="space-y-6">
              {/* Filters for Company */}
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm KPI công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="revenue">Doanh thu</option>
                    <option value="leads">Leads</option>
                    <option value="conversion">Chuyển đổi</option>
                    <option value="activity">Hoạt động</option>
                    <option value="custom">Tùy chỉnh</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="overdue">Quá hạn</option>
                  </select>

                  <input
                    type="date"
                    placeholder="Từ ngày"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="date"
                    placeholder="Đến ngày"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Xóa bộ lọc</span>
                  </button>
                </div>
              </div>

              {getFilteredKPIsByLevel('company').length === 0 ? (
                <div className="bg-white rounded-lg shadow border p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy KPI công ty</h3>
                  <p className="text-gray-500 mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                getFilteredKPIsByLevel('company').map(kpi => (
                <div key={kpi.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getCategoryColor(kpi.category)}`}>
                          {getCategoryIcon(kpi.category)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(kpi.priority)}`} />
                          </div>
                          <p className="text-gray-600 mb-2">{kpi.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatPeriod(kpi.period)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(kpi.status)}
                              <span className="capitalize">{kpi.status}</span>
                            </span>
                            {kpi.isAutoCalculated && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Tự động tính
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditKPI(kpi)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKPI(kpi.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                          <span className="text-sm font-bold text-gray-900">{kpi.progressPercentage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              kpi.progressPercentage >= 100 ? 'bg-green-500' :
                              kpi.progressPercentage >= 80 ? 'bg-blue-500' :
                              kpi.progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Values */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Giá trị hiện tại</p>
                          <p className="text-lg font-bold text-gray-900">{formatValue(kpi.currentValue, kpi.unit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mục tiêu</p>
                          <p className="text-lg font-bold text-blue-600">{formatValue(kpi.targetValue, kpi.unit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Còn thiếu</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatValue(Math.max(0, kpi.targetValue - kpi.currentValue), kpi.unit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          )}

          {/* Department Level Tab */}
          {activeTargetTab === 'department' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                {/* Filters for Department */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm KPI phòng ban..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả danh mục</option>
                      <option value="revenue">Doanh thu</option>
                      <option value="leads">Leads</option>
                      <option value="conversion">Chuyển đổi</option>
                      <option value="activity">Hoạt động</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="overdue">Quá hạn</option>
                    </select>

                    <input
                      type="date"
                      placeholder="Từ ngày"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="date"
                      placeholder="Đến ngày"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Phòng ban</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng ban
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mục tiêu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredKPIsByLevel('department').length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium mb-2">Không tìm thấy KPI phòng ban</p>
                              <p className="text-sm">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getFilteredKPIsByLevel('department').map(kpi => (
                        <tr key={kpi.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${getCategoryColor(kpi.category)} mr-3`}>
                                {getCategoryIcon(kpi.category)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                                <div className="text-sm text-gray-500">{formatPeriod(kpi.period)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {kpi.assignedTo.map((dept, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{kpi.startDate} - {kpi.endDate}</div>
                              <div className="text-xs text-gray-500">{formatPeriod(kpi.period)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{new Date().toLocaleDateString('vi-VN')}</div>
                              <div className="text-xs text-gray-500">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.targetValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.currentValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    kpi.progressPercentage >= 100 ? 'bg-green-500' :
                                    kpi.progressPercentage >= 80 ? 'bg-blue-500' :
                                    kpi.progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-900 min-w-[2.5rem]">
                                {kpi.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              kpi.status === 'active' ? 'bg-green-100 text-green-800' :
                              kpi.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              kpi.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {kpi.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditKPI(kpi)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKPI(kpi.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Team Level Tab */}
          {activeTargetTab === 'team' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                {/* Filters for Team */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm KPI team..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả danh mục</option>
                      <option value="revenue">Doanh thu</option>
                      <option value="leads">Leads</option>
                      <option value="conversion">Chuyển đổi</option>
                      <option value="activity">Hoạt động</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="overdue">Quá hạn</option>
                    </select>

                    <input
                      type="date"
                      placeholder="Từ ngày"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="date"
                      placeholder="Đến ngày"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Team</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mục tiêu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredKPIsByLevel('team').length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium mb-2">Không tìm thấy KPI team</p>
                              <p className="text-sm">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getFilteredKPIsByLevel('team').map(kpi => (
                        <tr key={kpi.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${getCategoryColor(kpi.category)} mr-3`}>
                                {getCategoryIcon(kpi.category)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                                <div className="text-sm text-gray-500">{formatPeriod(kpi.period)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {kpi.assignedTo.map((team, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {team}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{kpi.startDate} - {kpi.endDate}</div>
                              <div className="text-xs text-gray-500">{formatPeriod(kpi.period)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{new Date().toLocaleDateString('vi-VN')}</div>
                              <div className="text-xs text-gray-500">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.targetValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.currentValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    kpi.progressPercentage >= 100 ? 'bg-green-500' :
                                    kpi.progressPercentage >= 80 ? 'bg-blue-500' :
                                    kpi.progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-900 min-w-[2.5rem]">
                                {kpi.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              kpi.status === 'active' ? 'bg-green-100 text-green-800' :
                              kpi.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              kpi.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {kpi.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditKPI(kpi)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKPI(kpi.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Individual Level Tab */}
          {activeTargetTab === 'individual' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                {/* Filters for Individual */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm KPI cá nhân..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả danh mục</option>
                      <option value="revenue">Doanh thu</option>
                      <option value="leads">Leads</option>
                      <option value="conversion">Chuyển đổi</option>
                      <option value="activity">Hoạt động</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="paused">Tạm dừng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="overdue">Quá hạn</option>
                    </select>

                    <input
                      type="date"
                      placeholder="Từ ngày"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="date"
                      placeholder="Đến ngày"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Xóa bộ lọc</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Cá nhân</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nhân viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian KPI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mục tiêu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hiện tại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredKPIsByLevel('individual').length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium mb-2">Không tìm thấy KPI cá nhân</p>
                              <p className="text-sm">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        getFilteredKPIsByLevel('individual').map(kpi => (
                        <tr key={kpi.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${getCategoryColor(kpi.category)} mr-3`}>
                                {getCategoryIcon(kpi.category)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                                <div className="text-sm text-gray-500">{formatPeriod(kpi.period)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {kpi.assignedTo.map((person, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {person}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{kpi.startDate} - {kpi.endDate}</div>
                              <div className="text-xs text-gray-500">{formatPeriod(kpi.period)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{new Date().toLocaleDateString('vi-VN')}</div>
                              <div className="text-xs text-gray-500">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.targetValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(kpi.currentValue, kpi.unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    kpi.progressPercentage >= 100 ? 'bg-green-500' :
                                    kpi.progressPercentage >= 80 ? 'bg-blue-500' :
                                    kpi.progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-900 min-w-[2.5rem]">
                                {kpi.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              kpi.status === 'active' ? 'bg-green-100 text-green-800' :
                              kpi.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              kpi.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {kpi.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditKPI(kpi)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKPI(kpi.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Reports Tab */}
      {false && activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg shadow border text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Báo cáo KPI</h3>
            <p className="text-gray-600 mb-4">Tính năng báo cáo chi tiết sẽ được phát triển trong phiên bản tiếp theo</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Xem báo cáo mẫu
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {false && activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg shadow border text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cài đặt KPI</h3>
            <p className="text-gray-600 mb-4">Tính năng cài đặt nâng cao sẽ được phát triển trong phiên bản tiếp theo</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Xem cài đặt hiện tại
            </button>
          </div>
        </div>
      )}

      {/* Add KPI Modal */}
      {showAddKPIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thêm KPI mới</h2>
                <button
                  onClick={() => setShowAddKPIModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên KPI</label>
                  <input
                    type="text"
                    value={newKPI.name}
                    onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên KPI..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={newKPI.description}
                    onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Mô tả chi tiết về KPI..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                    <select
                      value={newKPI.category}
                      onChange={(e) => setNewKPI({...newKPI, category: e.target.value as KPITarget['category']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="revenue">Doanh thu</option>
                      <option value="leads">Leads</option>
                      <option value="conversion">Chuyển đổi</option>
                      <option value="activity">Hoạt động</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ phân công</label>
                    <select
                      value={newKPI.assignmentLevel}
                      onChange={(e) => setNewKPI({
                        ...newKPI, 
                        assignmentLevel: e.target.value as KPITarget['assignmentLevel'],
                        assignedTo: [] // Reset assigned targets when level changes
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="individual">Cá nhân</option>
                      <option value="team">Team</option>
                      <option value="department">Phòng ban</option>
                      <option value="company">Công ty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phân công cho {getAssignmentLevelName(newKPI.assignmentLevel)}
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {getAvailableTargets(newKPI.assignmentLevel).map((target, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newKPI.assignedTo.includes(target)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKPI({...newKPI, assignedTo: [...newKPI.assignedTo, target]})
                            } else {
                              setNewKPI({...newKPI, assignedTo: newKPI.assignedTo.filter(t => t !== target)})
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{target}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chu kỳ</label>
                    <select
                      value={newKPI.period}
                      onChange={(e) => setNewKPI({...newKPI, period: e.target.value as KPITarget['period']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                      <option value="monthly">Hàng tháng</option>
                      <option value="quarterly">Hàng quý</option>
                      <option value="yearly">Hàng năm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
                    <select
                      value={newKPI.priority}
                      onChange={(e) => setNewKPI({...newKPI, priority: e.target.value as KPITarget['priority']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="critical">Cực kỳ quan trọng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu</label>
                    <input
                      type="number"
                      value={newKPI.targetValue}
                      onChange={(e) => setNewKPI({...newKPI, targetValue: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị</label>
                    <input
                      type="text"
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VND, %, leads, cuộc gọi..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={newKPI.startDate}
                      onChange={(e) => setNewKPI({...newKPI, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={newKPI.endDate}
                      onChange={(e) => setNewKPI({...newKPI, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCalculated"
                    checked={newKPI.isAutoCalculated || false}
                    onChange={(e) => setNewKPI({...newKPI, isAutoCalculated: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoCalculated" className="text-sm text-gray-700">
                    Tự động tính từ KPI con
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddKPIModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddKPI}
                  disabled={!newKPI.name || !newKPI.targetValue || !newKPI.startDate || !newKPI.endDate || newKPI.assignedTo.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm KPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}