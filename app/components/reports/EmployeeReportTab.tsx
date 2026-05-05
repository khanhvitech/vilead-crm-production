'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  ExternalLink,
  FileText,
  History,
  Info,
  Loader2,
  PenSquare,
  Phone,
  Plus,
  Target,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'

import type {
  EmployeeReportNote,
  EmployeeReportNoteScopeType,
  ReportCurrentUser,
} from '@/lib/employee-report-notes'
import {
  getDefaultReportCurrentUser,
  getScopeBounds,
  isManagerRole,
} from '@/lib/employee-report-notes'

interface OrgDepartment {
  id: string
  name: string
  teams: OrgTeam[]
}

interface OrgTeam {
  id: string
  name: string
  departmentId: string
  employees: OrgEmployee[]
}

interface OrgEmployee {
  id: string
  name: string
  teamId: string
  avatar: string
}

interface ComparisonRow {
  entityId: string
  name: string
  revenue: number
  leadsAssigned: number
  ordersClosed: number
  closeRate: number
  revenueKpiPct: number
}

interface RevenueOrder {
  id: string
  customer: string
  product: string
  value: number
  status: string
  date: string
}

interface PipelineStage {
  stage: string
  count: number
  conversionRate: number
  avgTime: number
  dropRate: number
}

interface LeadSourceRow {
  source: string
  count: number
  closedCount: number
  conversionRate: number
  revenue: number
}

interface CustomerTopRow {
  name: string
  type: 'DN' | 'CN'
  label: string
  orders: number
  revenue: number
  lastOrder: string
}

interface TaskRow {
  name: string
  relatedName: string
  relatedType: string
  relatedPhone: string
  type: 'Khách hàng' | 'Lead'
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn tất'
  deadline: string
  deadlineTime: string
  priority: 'Cao' | 'Trung bình' | 'Thấp'
  tags: string[]
  createdAt: string
  overdueDays: number
  note?: string
  description?: string
  assignee?: string
}

interface KpiRow {
  name: string
  current: number
  target: number
  pct: number
}

interface EmployeeDetail {
  revenue: {
    orders: RevenueOrder[]
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    cancelledOrders: number
    cancelledPct: number
  }
  performance: {
    leadsAssigned: number
    ordersClosed: number
    closeRate: number
    revenueClosed: number
  }
  pipeline: PipelineStage[]
  leadSource: LeadSourceRow[]
  customers: {
    total: number
    businessCount: number
    individualCount: number
    newInPeriod: number
    avgOrderValue: number
    topCustomers: CustomerTopRow[]
  }
  tasks: TaskRow[]
  kpi: KpiRow[]
}

type EmployeeRow = {
  id: string
  name: string
  avatar: string
  teamId: string
  teamName: string
  departmentId: string
  revenue: number
  leadsAssigned: number
  ordersClosed: number
  closeRate: number
  revenueKpiPct: number
  revenueKpiTarget: number
  completedTasks: number
}

type TaskDetailTab = 'overview' | 'reminders' | 'history'
type DetailSectionKey = 'revenue' | 'performance' | 'pipeline' | 'leadSource' | 'customers' | 'tasks'|'note'

const mockOrg: OrgDepartment = {
  id: 'dept_01',
  name: 'Phòng Sales',
  teams: [
    {
      id: 'team_01',
      name: 'Team A',
      departmentId: 'dept_01',
      employees: [
        { id: 'emp_01', name: 'Nguyễn Văn An', teamId: 'team_01', avatar: '👨‍💼' },
        { id: 'emp_02', name: 'Trần Thị Bình', teamId: 'team_01', avatar: '👩‍💼' },
        { id: 'emp_03', name: 'Lê Minh Chánh', teamId: 'team_01', avatar: '👨‍💼' },
      ],
    },
    {
      id: 'team_02',
      name: 'Team B',
      departmentId: 'dept_01',
      employees: [
        { id: 'emp_04', name: 'Phạm Thu Hà', teamId: 'team_02', avatar: '👩‍💼' },
        { id: 'emp_05', name: 'Hoàng Minh Tuấn', teamId: 'team_02', avatar: '👨‍💼' },
        { id: 'emp_06', name: 'Vũ Thị Mai', teamId: 'team_02', avatar: '👩‍💼' },
      ],
    },
    {
      id: 'team_03',
      name: 'Team C',
      departmentId: 'dept_01',
      employees: [
        { id: 'emp_07', name: 'Đặng Văn Hùng', teamId: 'team_03', avatar: '👨‍💼' },
        { id: 'emp_08', name: 'Ngô Thị Lan', teamId: 'team_03', avatar: '👩‍💼' },
        { id: 'emp_09', name: 'Bùi Quốc Đạt', teamId: 'team_03', avatar: '👨‍💼' },
      ],
    },
  ],
}

const teamSummaryData: Record<string, { comparison: ComparisonRow[]; topPerformer: string }> = {
  team_01: {
    comparison: [
      { entityId: 'emp_01', name: 'Nguyễn Văn An', revenue: 250000000, leadsAssigned: 95, ordersClosed: 55, closeRate: 57.9, revenueKpiPct: 83 },
      { entityId: 'emp_02', name: 'Trần Thị Bình', revenue: 230000000, leadsAssigned: 100, ordersClosed: 38, closeRate: 38.0, revenueKpiPct: 77 },
      { entityId: 'emp_03', name: 'Lê Minh Chánh', revenue: 200000000, leadsAssigned: 85, ordersClosed: 25, closeRate: 29.4, revenueKpiPct: 67 },
    ],
    topPerformer: 'Nguyễn Văn An',
  },
  team_02: {
    comparison: [
      { entityId: 'emp_05', name: 'Hoàng Minh Tuấn', revenue: 220000000, leadsAssigned: 55, ordersClosed: 35, closeRate: 63.6, revenueKpiPct: 88 },
      { entityId: 'emp_04', name: 'Phạm Thu Hà', revenue: 180000000, leadsAssigned: 50, ordersClosed: 25, closeRate: 50.0, revenueKpiPct: 72 },
      { entityId: 'emp_06', name: 'Vũ Thị Mai', revenue: 120000000, leadsAssigned: 45, ordersClosed: 19, closeRate: 42.2, revenueKpiPct: 60 },
    ],
    topPerformer: 'Hoàng Minh Tuấn',
  },
  team_03: {
    comparison: [
      { entityId: 'emp_07', name: 'Đặng Văn Hùng', revenue: 160000000, leadsAssigned: 35, ordersClosed: 22, closeRate: 62.9, revenueKpiPct: 75 },
      { entityId: 'emp_08', name: 'Ngô Thị Lan', revenue: 130000000, leadsAssigned: 30, ordersClosed: 20, closeRate: 66.7, revenueKpiPct: 63 },
      { entityId: 'emp_09', name: 'Bùi Quốc Đạt', revenue: 90000000, leadsAssigned: 25, ordersClosed: 16, closeRate: 64.0, revenueKpiPct: 55 },
    ],
    topPerformer: 'Đặng Văn Hùng',
  },
}

const baseEmployeeDetail: EmployeeDetail = {
  revenue: {
    orders: [
      { id: 'ORD-001', customer: 'Công ty ABC', product: 'CRM Enterprise', value: 45000000, status: 'Đã thanh toán', date: '15/03/2026' },
      { id: 'ORD-002', customer: 'Nguyễn Văn X', product: 'CRM Professional', value: 28000000, status: 'Đã thanh toán', date: '12/03/2026' },
      { id: 'ORD-003', customer: 'Công ty XYZ', product: 'AI Analytics', value: 35000000, status: 'Đã thanh toán', date: '10/03/2026' },
      { id: 'ORD-004', customer: 'Trần Thị Y', product: 'CRM Basic', value: 15000000, status: 'Chờ thanh toán', date: '08/03/2026' },
      { id: 'ORD-005', customer: 'Công ty DEF', product: 'Consulting', value: 52000000, status: 'Đã thanh toán', date: '05/03/2026' },
    ],
    totalRevenue: 250000000,
    totalOrders: 55,
    avgOrderValue: 4545454,
    cancelledOrders: 3,
    cancelledPct: 5.5,
  },
  performance: {
    leadsAssigned: 95,
    ordersClosed: 55,
    closeRate: 57.9,
    revenueClosed: 250000000,
  },
  pipeline: [
    { stage: 'Tiếp nhận', count: 15, conversionRate: 100, avgTime: 0, dropRate: 0 },
    { stage: 'Tư vấn', count: 12, conversionRate: 80, avgTime: 1.2, dropRate: 20 },
    { stage: 'Báo giá', count: 8, conversionRate: 66.7, avgTime: 2.5, dropRate: 33.3 },
    { stage: 'Chốt deal', count: 5, conversionRate: 62.5, avgTime: 3.1, dropRate: 37.5 },
  ],
  leadSource: [
    { source: 'Facebook Ads', count: 18, closedCount: 7, conversionRate: 38.9, revenue: 50000000 },
    { source: 'Google Ads', count: 13, closedCount: 5, conversionRate: 38.5, revenue: 35000000 },
    { source: 'Zalo', count: 9, closedCount: 4, conversionRate: 44.4, revenue: 25000000 },
    { source: 'Website', count: 4, closedCount: 1, conversionRate: 25.0, revenue: 10000000 },
    { source: 'Giới thiệu', count: 2, closedCount: 1, conversionRate: 50.0, revenue: 5000000 },
  ],
  customers: {
    total: 28,
    businessCount: 18,
    individualCount: 10,
    newInPeriod: 8,
    avgOrderValue: 8928571,
    topCustomers: [
      { name: 'Công ty ABC', type: 'DN', label: 'VIP', orders: 5, revenue: 125000000, lastOrder: '15/03/2026' },
      { name: 'Công ty DEF', type: 'DN', label: 'Tiềm năng', orders: 3, revenue: 85000000, lastOrder: '05/03/2026' },
      { name: 'Nguyễn Văn X', type: 'CN', label: 'Mới', orders: 2, revenue: 42000000, lastOrder: '12/03/2026' },
      { name: 'Công ty GHI', type: 'DN', label: 'Thường xuyên', orders: 4, revenue: 38000000, lastOrder: '01/03/2026' },
      { name: 'Trần Thị Y', type: 'CN', label: 'Mới', orders: 1, revenue: 15000000, lastOrder: '08/03/2026' },
    ],
  },
  tasks: [
    {
      name: 'Gọi follow-up Công ty ABC',
      relatedName: 'Thị Khánh Hòa Trần',
      relatedType: 'Khách hàng',
      relatedPhone: '968408946',
      type: 'Khách hàng',
      status: 'Chưa làm',
      deadline: '18/03/2026',
      deadlineTime: '08:10',
      priority: 'Cao',
      tags: ['Chưa có nhãn'],
      createdAt: '17/03/2026 11:33',
      overdueDays: 2,
      note: 'Ưu tiên gọi trước 9h sáng, khách đang chờ xác nhận bản demo.',
      description: 'Chốt lịch demo và xác nhận nhu cầu CRM cho giai đoạn 2.',
      assignee: 'Nguyễn Văn An',
    },
    {
      name: 'Gửi báo giá Công ty MNO',
      relatedName: 'Thị Thanh Nguyễn',
      relatedType: 'Khách hàng',
      relatedPhone: '342984868',
      type: 'Khách hàng',
      status: 'Đang làm',
      deadline: '18/03/2026',
      deadlineTime: '08:10',
      priority: 'Cao',
      tags: ['Chưa có nhãn'],
      createdAt: '17/03/2026 11:33',
      overdueDays: 2,
      description: 'Hoàn thiện bảng báo giá bản Enterprise và gửi trong ngày.',
      assignee: 'Nguyễn Văn An',
    },
    {
      name: 'Demo sản phẩm cho KH mới',
      relatedName: 'Nguyễn Quân Ân Cướp Giật',
      relatedType: 'Khách hàng',
      relatedPhone: '832838832',
      type: 'Khách hàng',
      status: 'Đang làm',
      deadline: '18/03/2026',
      deadlineTime: '08:10',
      priority: 'Cao',
      tags: ['Chưa có nhãn'],
      createdAt: '17/03/2026 11:33',
      overdueDays: 2,
      description: 'Demo tính năng automation và chốt bài toán báo cáo.',
      assignee: 'Nguyễn Văn An',
    },
    {
      name: 'Follow up đơn hàng',
      relatedName: 'Thị Ngọc Mai Nguyễn',
      relatedType: 'Khách hàng',
      relatedPhone: '377645186',
      type: 'Khách hàng',
      status: 'Hoàn tất',
      deadline: '18/03/2026',
      deadlineTime: '00:00',
      priority: 'Cao',
      tags: ['Khách tiềm năng'],
      createdAt: '17/03/2026 11:15',
      overdueDays: 0,
      description: 'Đã follow up, khách xác nhận thanh toán trong tuần.',
      assignee: 'Nguyễn Văn An',
    },
    {
      name: 'Meeting online với Công ty PQR',
      relatedName: 'Thị Hương Giang Trịnh',
      relatedType: 'Lead',
      relatedPhone: '904080011',
      type: 'Lead',
      status: 'Hoàn tất',
      deadline: '17/03/2026',
      deadlineTime: '00:00',
      priority: 'Thấp',
      tags: ['Chưa có nhãn'],
      createdAt: '17/03/2026 10:26',
      overdueDays: 0,
      description: 'Meeting online để xác nhận quy mô team sale và nhu cầu tích hợp.',
      assignee: 'Nguyễn Văn An',
    },
    {
      name: 'Cập nhật CRM data',
      relatedName: 'Thị Thùy Dung Vũ',
      relatedType: 'Lead',
      relatedPhone: '945205487',
      type: 'Lead',
      status: 'Đang làm',
      deadline: '17/03/2026',
      deadlineTime: '00:00',
      priority: 'Thấp',
      tags: ['Chưa có nhãn'],
      createdAt: '17/03/2026 10:26',
      overdueDays: 3,
      description: 'Làm sạch thông tin contact và cập nhật lead source.',
      assignee: 'Nguyễn Văn An',
    },
  ],
  kpi: [
    { name: 'Doanh thu', current: 250000000, target: 300000000, pct: 83 },
    { name: 'Leads', current: 95, target: 100, pct: 95 },
    { name: 'Chuyển đổi', current: 58, target: 70, pct: 83 },
    { name: 'Công việc', current: 12, target: 15, pct: 80 },
  ],
}

const employeeOverrides: Record<string, Partial<EmployeeDetail>> = {
  emp_02: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 230000000, totalOrders: 38, avgOrderValue: 6052632 },
    performance: { leadsAssigned: 100, ordersClosed: 38, closeRate: 38.0, revenueClosed: 230000000 },
    customers: { ...baseEmployeeDetail.customers, total: 24, businessCount: 15, individualCount: 9, newInPeriod: 6, avgOrderValue: 9583333 },
    kpi: [
      { name: 'Doanh thu', current: 230000000, target: 300000000, pct: 77 },
      { name: 'Leads', current: 100, target: 110, pct: 91 },
      { name: 'Chuyển đổi', current: 38, target: 55, pct: 69 },
      { name: 'Công việc', current: 11, target: 15, pct: 73 },
    ],
  },
  emp_03: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 200000000, totalOrders: 25, avgOrderValue: 8000000 },
    performance: { leadsAssigned: 85, ordersClosed: 25, closeRate: 29.4, revenueClosed: 200000000 },
    customers: { ...baseEmployeeDetail.customers, total: 19, businessCount: 12, individualCount: 7, newInPeriod: 4, avgOrderValue: 10526315 },
    kpi: [
      { name: 'Doanh thu', current: 200000000, target: 300000000, pct: 67 },
      { name: 'Leads', current: 85, target: 100, pct: 85 },
      { name: 'Chuyển đổi', current: 25, target: 50, pct: 50 },
      { name: 'Công việc', current: 10, target: 15, pct: 67 },
    ],
  },
  emp_04: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 180000000, totalOrders: 25, avgOrderValue: 7200000 },
    performance: { leadsAssigned: 50, ordersClosed: 25, closeRate: 50.0, revenueClosed: 180000000 },
    customers: { ...baseEmployeeDetail.customers, total: 17, businessCount: 11, individualCount: 6, newInPeriod: 4, avgOrderValue: 10588235 },
    kpi: [
      { name: 'Doanh thu', current: 180000000, target: 250000000, pct: 72 },
      { name: 'Leads', current: 50, target: 70, pct: 71 },
      { name: 'Chuyển đổi', current: 25, target: 35, pct: 71 },
      { name: 'Công việc', current: 9, target: 15, pct: 60 },
    ],
  },
  emp_05: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 220000000, totalOrders: 35, avgOrderValue: 6285714 },
    performance: { leadsAssigned: 55, ordersClosed: 35, closeRate: 63.6, revenueClosed: 220000000 },
    customers: { ...baseEmployeeDetail.customers, total: 22, businessCount: 14, individualCount: 8, newInPeriod: 5, avgOrderValue: 10000000 },
    kpi: [
      { name: 'Doanh thu', current: 220000000, target: 250000000, pct: 88 },
      { name: 'Leads', current: 55, target: 70, pct: 79 },
      { name: 'Chuyển đổi', current: 35, target: 40, pct: 88 },
      { name: 'Công việc', current: 13, target: 15, pct: 87 },
    ],
  },
  emp_06: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 120000000, totalOrders: 19, avgOrderValue: 6315789 },
    performance: { leadsAssigned: 45, ordersClosed: 19, closeRate: 42.2, revenueClosed: 120000000 },
    customers: { ...baseEmployeeDetail.customers, total: 14, businessCount: 8, individualCount: 6, newInPeriod: 3, avgOrderValue: 8571428 },
    kpi: [
      { name: 'Doanh thu', current: 120000000, target: 200000000, pct: 60 },
      { name: 'Leads', current: 45, target: 65, pct: 69 },
      { name: 'Chuyển đổi', current: 19, target: 30, pct: 63 },
      { name: 'Công việc', current: 8, target: 15, pct: 53 },
    ],
  },
  emp_07: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 160000000, totalOrders: 22, avgOrderValue: 7272727 },
    performance: { leadsAssigned: 35, ordersClosed: 22, closeRate: 62.9, revenueClosed: 160000000 },
    customers: { ...baseEmployeeDetail.customers, total: 15, businessCount: 10, individualCount: 5, newInPeriod: 4, avgOrderValue: 10666666 },
    kpi: [
      { name: 'Doanh thu', current: 160000000, target: 215000000, pct: 75 },
      { name: 'Leads', current: 35, target: 50, pct: 70 },
      { name: 'Chuyển đổi', current: 22, target: 30, pct: 73 },
      { name: 'Công việc', current: 10, target: 15, pct: 67 },
    ],
  },
  emp_08: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 130000000, totalOrders: 20, avgOrderValue: 6500000 },
    performance: { leadsAssigned: 30, ordersClosed: 20, closeRate: 66.7, revenueClosed: 130000000 },
    customers: { ...baseEmployeeDetail.customers, total: 13, businessCount: 7, individualCount: 6, newInPeriod: 2, avgOrderValue: 10000000 },
    kpi: [
      { name: 'Doanh thu', current: 130000000, target: 205000000, pct: 63 },
      { name: 'Leads', current: 30, target: 45, pct: 67 },
      { name: 'Chuyển đổi', current: 20, target: 28, pct: 71 },
      { name: 'Công việc', current: 9, target: 15, pct: 60 },
    ],
  },
  emp_09: {
    revenue: { ...baseEmployeeDetail.revenue, totalRevenue: 90000000, totalOrders: 16, avgOrderValue: 5625000 },
    performance: { leadsAssigned: 25, ordersClosed: 16, closeRate: 64.0, revenueClosed: 90000000 },
    customers: { ...baseEmployeeDetail.customers, total: 10, businessCount: 6, individualCount: 4, newInPeriod: 2, avgOrderValue: 9000000 },
    kpi: [
      { name: 'Doanh thu', current: 90000000, target: 165000000, pct: 55 },
      { name: 'Leads', current: 25, target: 40, pct: 63 },
      { name: 'Chuyển đổi', current: 16, target: 25, pct: 64 },
      { name: 'Công việc', current: 7, target: 15, pct: 47 },
    ],
  },
}

const detailSectionKeys: DetailSectionKey[] = ['revenue', 'performance', 'pipeline', 'leadSource', 'customers', 'tasks', 'note']
const defaultExpandedSections: DetailSectionKey[] = ['revenue', 'performance', 'pipeline', 'leadSource', 'customers', 'tasks']
const summaryCardGradients = ['from-green-600 to-green-400', 'from-blue-600 to-blue-400', 'from-purple-600 to-purple-400', 'from-teal-600 to-teal-400']
const supportedScopeTypes: EmployeeReportNoteScopeType[] = ['today', 'yesterday', 'this_week', 'this_month', 'this_quarter', 'custom']

const getEmployeeDetail = (employeeId: string): EmployeeDetail => {
  const override = employeeOverrides[employeeId]

  return {
    ...baseEmployeeDetail,
    ...override,
    revenue: { ...baseEmployeeDetail.revenue, ...override?.revenue },
    performance: { ...baseEmployeeDetail.performance, ...override?.performance },
    customers: { ...baseEmployeeDetail.customers, ...override?.customers },
    pipeline: override?.pipeline ?? baseEmployeeDetail.pipeline,
    leadSource: override?.leadSource ?? baseEmployeeDetail.leadSource,
    tasks: override?.tasks ?? baseEmployeeDetail.tasks,
    kpi: override?.kpi ?? baseEmployeeDetail.kpi,
  }
}

const formatCurrencyCompact = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} tỷ`
  if (value >= 1e6) return `${Math.round(value / 1e6)} tr`
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatCurrencyFull = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`

const formatValue = (value: number, format: 'currency' | 'percent' | 'number') => {
  if (format === 'currency') return formatCurrencyCompact(value)
  if (format === 'percent') return `${value}%`
  return value.toLocaleString('vi-VN')
}

const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN')

const getTimeRangeLabel = (timeRange: EmployeeReportNoteScopeType) => {
  switch (timeRange) {
    case 'today':
      return 'Hôm nay'
    case 'yesterday':
      return 'Hôm qua'
    case 'this_week':
      return 'Tuần này'
    case 'this_month':
      return 'Tháng này'
    case 'this_quarter':
      return 'Quý này'
    case 'custom':
      return 'Khoảng tùy chỉnh'
    default:
      return timeRange
  }
}

const getTaskStatusBadge = (status: TaskRow['status']) => {
  const map: Record<TaskRow['status'], string> = {
    'Chưa làm': 'bg-gray-100 text-gray-700',
    'Đang làm': 'bg-blue-100 text-[#3e79f7]',
    'Hoàn tất': 'bg-green-100 text-green-700',
  }
  return map[status]
}

const getScopeQuery = (scopeType: EmployeeReportNoteScopeType) => {
  const params = new URLSearchParams()
  params.set('scopeType', scopeType)
  const bounds = getScopeBounds(scopeType)
  if (bounds.scopeStart) params.set('scopeStart', bounds.scopeStart)
  if (bounds.scopeEnd) params.set('scopeEnd', bounds.scopeEnd)
  return { params, bounds }
}

const renderTextWithLinks = (content: string) => {
  const parts = content.split(/(https?:\/\/[^\s]+)/gi)

  return parts.map((part, index) => {
    if (/^https?:\/\/[^\s]+$/i.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3e79f7] underline break-all"
        >
          {part}
        </a>
      )
    }

    return <span key={`text-${index}`}>{part}</span>
  })
}

const truncateUrl = (url: string, maxLength = 36) => {
  if (url.length <= maxLength) return url
  return `${url.slice(0, maxLength - 3)}...`
}

export default function EmployeeReportTab() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedEmployeeIdForModal, setSelectedEmployeeIdForModal] = useState<string | null>(null)
  const [showEmployeeDetailModal, setShowEmployeeDetailModal] = useState(false)
  const [timeRange, setTimeRange] = useState<EmployeeReportNoteScopeType>('this_month')
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null)
  const [taskDetailTab, setTaskDetailTab] = useState<TaskDetailTab>('overview')
  const [expandedSections, setExpandedSections] = useState<Set<DetailSectionKey>>(new Set(defaultExpandedSections))
  const [currentUser, setCurrentUser] = useState<ReportCurrentUser>(() => getDefaultReportCurrentUser())
  const [employeeNotes, setEmployeeNotes] = useState<EmployeeReportNote[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<EmployeeReportNote | null>(null)
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false)
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  useEffect(() => {
    setCurrentUser(getDefaultReportCurrentUser())
  }, [])

  const departments = [mockOrg]
  const availableTeams = selectedDepartmentId
    ? mockOrg.teams.filter(team => team.departmentId === selectedDepartmentId)
    : mockOrg.teams

  const employeeRows: EmployeeRow[] = useMemo(
    () =>
      mockOrg.teams.flatMap(team =>
        team.employees.map(employee => {
          const detail = getEmployeeDetail(employee.id)
          const comparison = teamSummaryData[team.id]?.comparison.find(item => item.entityId === employee.id)
          const revenueKpi = detail.kpi.find(kpi => kpi.name === 'Doanh thu')

          return {
            id: employee.id,
            name: employee.name,
            avatar: employee.avatar,
            teamId: team.id,
            teamName: team.name,
            departmentId: team.departmentId,
            revenue: comparison?.revenue ?? detail.performance.revenueClosed,
            leadsAssigned: comparison?.leadsAssigned ?? detail.performance.leadsAssigned,
            ordersClosed: comparison?.ordersClosed ?? detail.performance.ordersClosed,
            closeRate: comparison?.closeRate ?? detail.performance.closeRate,
            revenueKpiPct: revenueKpi?.pct ?? comparison?.revenueKpiPct ?? 0,
            revenueKpiTarget: revenueKpi?.target ?? 0,
            completedTasks: detail.tasks.filter(task => task.status === 'Hoàn tất').length,
          }
        }),
      ),
    [],
  )

  const filteredEmployeeRows = employeeRows.filter(employee => {
    const matchesDepartment = !selectedDepartmentId || employee.departmentId === selectedDepartmentId
    const matchesTeam = !selectedTeamId || employee.teamId === selectedTeamId
    return matchesDepartment && matchesTeam
  })

  const aggregateMetrics = filteredEmployeeRows.reduce(
    (accumulator, employee) => {
      accumulator.revenue += employee.revenue
      accumulator.leadsAssigned += employee.leadsAssigned
      accumulator.ordersClosed += employee.ordersClosed
      accumulator.completedTasks += employee.completedTasks
      return accumulator
    },
    {
      revenue: 0,
      leadsAssigned: 0,
      ordersClosed: 0,
      completedTasks: 0,
    },
  )

  const averageCloseRate = aggregateMetrics.leadsAssigned > 0
    ? Number(((aggregateMetrics.ordersClosed / aggregateMetrics.leadsAssigned) * 100).toFixed(1))
    : 0

  const summaryCards = [
    { label: 'Doanh số', value: aggregateMetrics.revenue, format: 'currency' as const, note: 'Tổng doanh số theo bộ lọc' },
    { label: 'Lead giao', value: aggregateMetrics.leadsAssigned, format: 'number' as const, note: 'Tổng lead được giao' },
    { label: 'Tỷ lệ chốt', value: averageCloseRate, format: 'percent' as const, note: 'Tính theo tổng lead và đơn chốt' },
    { label: 'Task hoàn thành', value: aggregateMetrics.completedTasks, format: 'number' as const, note: 'Tổng task đã hoàn tất' },
  ]

  const selectedEmployeeRow = selectedEmployeeIdForModal
    ? employeeRows.find(employee => employee.id === selectedEmployeeIdForModal) ?? null
    : null
  const employeeDetail = selectedEmployeeIdForModal ? getEmployeeDetail(selectedEmployeeIdForModal) : null

  const isCustomScopeWithoutRange = timeRange === 'custom'

  const loadNotes = useCallback(async () => {
    if (!supportedScopeTypes.includes(timeRange)) return
    if (isCustomScopeWithoutRange) {
      setEmployeeNotes([])
      setNotesError('Bộ lọc tùy chỉnh chưa có khoảng ngày nên tạm thời chưa hỗ trợ ghi chú.')
      return
    }

    setNotesLoading(true)
    setNotesError(null)

    try {
      const { params } = getScopeQuery(timeRange)
      const response = await fetch(`/api/reports/employee-notes?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Không tải được ghi chú nhân viên.')
      }

      setEmployeeNotes(Array.isArray(payload.notes) ? payload.notes : [])
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : 'Không tải được ghi chú nhân viên.')
      setEmployeeNotes([])
    } finally {
      setNotesLoading(false)
    }
  }, [isCustomScopeWithoutRange, timeRange])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  const latestNotesByEmployee = useMemo(() => {
    const nextMap = new Map<string, EmployeeReportNote>()

    employeeNotes.forEach(note => {
      if (!nextMap.has(note.employeeId)) {
        nextMap.set(note.employeeId, note)
      }
    })

    return nextMap
  }, [employeeNotes])

  const selectedEmployeeNotes = useMemo(() => {
    if (!selectedEmployeeRow) return []
    return employeeNotes
      .filter(note => note.employeeId === selectedEmployeeRow.id)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
  }, [employeeNotes, selectedEmployeeRow])

  const allSectionsExpanded = detailSectionKeys.every(sectionKey => expandedSections.has(sectionKey))

  const toggleSection = (key: DetailSectionKey) => {
    setExpandedSections(previous => {
      const next = new Set(previous)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAllSections = () => {
    setExpandedSections(allSectionsExpanded ? new Set<DetailSectionKey>() : new Set(detailSectionKeys))
  }

  const closeEmployeeDetail = () => {
    setShowEmployeeDetailModal(false)
    setSelectedEmployeeIdForModal(null)
    setShowTaskDetail(false)
    setSelectedTask(null)
    setTaskDetailTab('overview')
    setEditingNote(null)
    setShowNoteEditor(false)
    setShowDeleteNoteDialog(false)
  }

  const openEmployeeDetail = (employeeId: string) => {
    setSelectedEmployeeIdForModal(employeeId)
    setShowEmployeeDetailModal(true)
    setExpandedSections(new Set(defaultExpandedSections))
    setShowTaskDetail(false)
    setSelectedTask(null)
    setTaskDetailTab('overview')
    setEditingNote(null)
    setShowDeleteNoteDialog(false)
  }

  const handleCreateNote = () => {
    setEditingNote(null)
    setShowNoteEditor(true)
  }

  const handleEditNote = (note: EmployeeReportNote) => {
    setEditingNote(note)
    setShowNoteEditor(true)
  }

  const handleDeleteNote = (note: EmployeeReportNote) => {
    setEditingNote(note)
    setShowDeleteNoteDialog(true)
  }

  const canManageNote = (note: EmployeeReportNote) => {
    return note.createdById === currentUser.id || isManagerRole(currentUser.role)
  }

  const handleSaveNote = async (content: string) => {
    if (!selectedEmployeeRow) return

    if (isCustomScopeWithoutRange) {
      setNotesError('Bộ lọc tùy chỉnh chưa có khoảng ngày nên chưa thể thêm ghi chú.')
      return
    }

    setNoteSubmitting(true)
    setNotesError(null)

    try {
      if (editingNote) {
        const response = await fetch(`/api/reports/employee-notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            currentUser,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.message || 'Không cập nhật được ghi chú.')
        }
      } else {
        const { bounds } = getScopeQuery(timeRange)
        const response = await fetch('/api/reports/employee-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: selectedEmployeeRow.id,
            content,
            scopeType: timeRange,
            scopeStart: bounds.scopeStart,
            scopeEnd: bounds.scopeEnd,
            currentUser,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.message || 'Không tạo được ghi chú.')
        }
      }

      setShowNoteEditor(false)
      setEditingNote(null)
      await loadNotes()
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : 'Không lưu được ghi chú.')
    } finally {
      setNoteSubmitting(false)
    }
  }

  const handleConfirmDeleteNote = async () => {
    if (!editingNote) return

    setNoteSubmitting(true)
    setNotesError(null)

    try {
      const response = await fetch(`/api/reports/employee-notes/${editingNote.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUser }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Không xóa được ghi chú.')
      }

      setShowDeleteNoteDialog(false)
      setEditingNote(null)
      await loadNotes()
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : 'Không xóa được ghi chú.')
    } finally {
      setNoteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo nhân viên</h2>
          <p className="text-gray-600">Phân tích các chỉ số hiệu suất theo bộ lọc hiện tại</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={timeRange}
            onChange={event => setTimeRange(event.target.value as EmployeeReportNoteScopeType)}
            className="rounded-[10px] border border-[#e6ebf1] bg-white px-3 py-2 text-sm focus:border-[#3e79f7] focus:ring-2 focus:ring-[#3e79f7]"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="this_week">Tuần này</option>
            <option value="this_month">Tháng này</option>
            <option value="this_quarter">Quý này</option>
            <option value="custom">Chọn thời gian</option>
          </select>

          <select
            value={selectedDepartmentId}
            onChange={event => {
              setSelectedDepartmentId(event.target.value)
              setSelectedTeamId('')
            }}
            className="rounded-[10px] border border-[#e6ebf1] bg-white px-3 py-2 text-sm focus:border-[#3e79f7] focus:ring-2 focus:ring-[#3e79f7]"
          >
            <option value="">Tất cả phòng</option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTeamId}
            onChange={event => setSelectedTeamId(event.target.value)}
            className="rounded-[10px] border border-[#e6ebf1] bg-white px-3 py-2 text-sm focus:border-[#3e79f7] focus:ring-2 focus:ring-[#3e79f7]"
          >
            <option value="">Tất cả team</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#2dc56a] px-4 py-[8.5px] text-sm font-medium text-white transition-all duration-300 hover:bg-[#04d182]">
            <Download className="h-4 w-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <div
            key={card.label}
            className={`relative rounded-[10px] bg-gradient-to-br px-5 py-4 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl ${summaryCardGradients[index % summaryCardGradients.length]}`}
          >
            <div className="absolute right-2 top-2">
              <Info className="h-3.5 w-3.5 cursor-help text-white/60 hover:text-white" />
            </div>
            <p className="mb-1 text-sm font-medium text-white/90">{card.label}</p>
            <p className="mb-1 text-2xl font-extrabold">{formatValue(card.value, card.format)}</p>
            <p className="text-xs text-white/80">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e6ebf1] bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Danh sách nhân viên</h3>
          <p className="text-sm text-gray-500">Tổng cộng {filteredEmployeeRows.length} nhân viên theo bộ lọc hiện tại</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">STT</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nhân viên</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Doanh số</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Lead được giao</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Đơn chốt</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Tỷ lệ chốt</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Doanh số / KPI</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Task hoàn thành</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ghi chú</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployeeRows.length > 0 ? (
                filteredEmployeeRows.map((employee, index) => {
                  const latestNote = latestNotesByEmployee.get(employee.id)

                  return (
                    <tr key={employee.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base text-blue-600">
                            {employee.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{employee.name}</div>
                            <div className="text-xs text-gray-500">{employee.teamName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrencyFull(employee.revenue)}</td>
                      <td className="px-4 py-3 text-right">{employee.leadsAssigned}</td>
                      <td className="px-4 py-3 text-right">{employee.ordersClosed}</td>
                      <td className="px-4 py-3 text-right">{employee.closeRate}%</td>
                      <td className="px-4 py-3">
                        <div className="min-w-[180px]">
                          <div className="font-semibold text-gray-900">
                            {formatCurrencyCompact(employee.revenue)} / {formatCurrencyCompact(employee.revenueKpiTarget)}
                          </div>
                          <div className="text-xs text-gray-500">{employee.revenueKpiPct}% chỉ tiêu</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{employee.completedTasks}</td>
                      <td className="px-4 py-3">
                        {latestNote ? (
                          <div className="max-w-[240px]">
                            <p className="truncate text-sm text-gray-700" title={latestNote.content}>
                              {latestNote.content}
                            </p>
                            {latestNote.links[0] && (
                              <a
                                href={latestNote.links[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-xs text-[#3e79f7] underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {truncateUrl(latestNote.links[0])}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEmployeeDetail(employee.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-50 text-[#3e79f7] transition-colors hover:bg-blue-100"
                          title={`Xem chi tiết ${employee.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    Không có nhân viên phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEmployeeDetailModal && selectedEmployeeRow && employeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="h-auto max-h-[90vh] w-full overflow-hidden rounded-[10px] bg-white shadow-xl lg:h-[80vh] lg:w-[80vw] lg:max-w-[80vw]">
            <div className="flex items-center justify-between border-b border-[#e6ebf1] p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hiệu suất - {selectedEmployeeRow.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedEmployeeRow.teamName}</p>
              </div>
              <button onClick={closeEmployeeDetail} className="rounded-[10px] p-2 transition-colors hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-88px)] space-y-4 overflow-y-auto p-6 lg:h-[calc(80vh-88px)] lg:max-h-none">
              <div className="flex items-center justify-end">
                <button
                  onClick={toggleAllSections}
                  className="inline-flex items-center justify-center rounded-[10px] border border-[#d7e3f7] bg-[#f5f9ff] px-4 py-2 text-sm font-medium text-[#2457d6] transition-colors hover:bg-[#eaf2ff]"
                >
                  {allSectionsExpanded ? 'Thu gọn' : 'Hiển thị tất cả'}
                </button>
              </div>
              <DetailSection
                title="Doanh số"
                icon={<DollarSign className="h-5 w-5" />}
                sectionKey="revenue"
                expanded={expandedSections.has('revenue')}
                onToggle={toggleSection}
              >
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Tổng doanh số', value: formatCurrencyFull(employeeDetail.revenue.totalRevenue) },
                    { label: 'Số đơn bán', value: employeeDetail.revenue.totalOrders.toLocaleString('vi-VN') },
                    { label: 'Giá trị TB / đơn', value: formatCurrencyFull(employeeDetail.revenue.avgOrderValue) },
                    { label: 'Đơn hủy / chờ', value: `${employeeDetail.revenue.cancelledOrders} (${employeeDetail.revenue.cancelledPct}%)` },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-[10px] bg-gray-50 p-4">
                      <p className="mb-1 text-xs text-gray-500">{metric.label}</p>
                      <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['STT', 'Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'Trạng thái', 'Ngày tạo'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-semibold text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.revenue.orders.map((order, index) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                          <td className="px-3 py-2 font-mono text-blue-600">{order.id}</td>
                          <td className="px-3 py-2">{order.customer}</td>
                          <td className="px-3 py-2">{order.product}</td>
                          <td className="px-3 py-2 font-medium">{formatCurrencyFull(order.value)}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                order.status === 'Đã thanh toán' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailSection>

              <DetailSection
                title="Hiệu suất"
                icon={<Activity className="h-5 w-5" />}
                sectionKey="performance"
                expanded={expandedSections.has('performance')}
                onToggle={toggleSection}
              >
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Tổng lead được giao', value: employeeDetail.performance.leadsAssigned.toLocaleString('vi-VN') },
                    { label: 'Tổng đơn chốt', value: employeeDetail.performance.ordersClosed.toLocaleString('vi-VN') },
                    { label: 'Tỷ lệ chốt TB', value: `${employeeDetail.performance.closeRate}%` },
                    { label: 'Tổng doanh số', value: formatCurrencyCompact(employeeDetail.performance.revenueClosed) },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-[10px] bg-gray-50 p-4">
                      <p className="mb-1 text-xs text-gray-500">{metric.label}</p>
                      <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-[#e6ebf1] bg-gray-50">
                      <tr>
                        {['STT', 'Nguồn', 'Lead được giao', 'Đơn chốt', 'Tỷ lệ chốt', 'Doanh số'].map(header => (
                          <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.leadSource.map((source, index) => (
                        <tr key={`${source.source}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{source.source}</td>
                          <td className="px-4 py-3 text-blue-600">{source.count}</td>
                          <td className="px-4 py-3">{source.closedCount}</td>
                          <td className="px-4 py-3">{source.conversionRate}%</td>
                          <td className="px-4 py-3 font-medium text-blue-600">{formatCurrencyFull(source.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#e6ebf1] bg-gray-50">
                        <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-700">
                          Tổng doanh số:
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-600">
                          {formatCurrencyFull(employeeDetail.leadSource.reduce((sum, source) => sum + source.revenue, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </DetailSection>

              <DetailSection
                title="Quy trình"
                icon={<Target className="h-5 w-5" />}
                sectionKey="pipeline"
                expanded={expandedSections.has('pipeline')}
                onToggle={toggleSection}
              >
                <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                  {employeeDetail.pipeline.map((stage, index) => (
                    <div key={`${stage.stage}-${index}`} className="flex items-center">
                      <div
                        className={`rounded-[10px] px-4 py-2 text-center ${
                          stage.dropRate >= 35 ? 'border-2 border-red-300 bg-red-50' : 'border border-[#c7d9fd] bg-blue-50'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-600">{stage.stage}</p>
                        <p className="text-lg font-bold text-gray-900">{stage.count}</p>
                        {index > 0 && <p className="text-xs text-gray-500">{stage.conversionRate}%</p>}
                      </div>
                      {index < employeeDetail.pipeline.length - 1 && <span className="mx-1 text-gray-400">→</span>}
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['STT', 'Giai đoạn', 'Số lead', 'Tỷ lệ chuyển đổi', 'Thời gian TB (ngày)', 'Tỷ lệ rớt'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-semibold text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.pipeline.map((stage, index) => (
                        <tr key={stage.stage} className={stage.dropRate >= 35 ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                          <td className="px-3 py-2 font-medium">
                            {stage.stage}
                            {stage.dropRate >= 35 && <span className="ml-1 text-xs text-red-500">⚠ Điểm nghẽn</span>}
                          </td>
                          <td className="px-3 py-2">{stage.count}</td>
                          <td className="px-3 py-2">{stage.conversionRate}%</td>
                          <td className="px-3 py-2">{stage.avgTime}</td>
                          <td className="px-3 py-2">{stage.dropRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailSection>

              <DetailSection
                title="Nguồn lead"
                icon={<Zap className="h-5 w-5" />}
                sectionKey="leadSource"
                expanded={expandedSections.has('leadSource')}
                onToggle={toggleSection}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['STT', 'Nguồn', 'Số lead', 'Chất lượng', 'Tỷ lệ chuyển đổi', 'Doanh số đóng góp'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-semibold text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.leadSource.map((source, index) => {
                        const bestRate = Math.max(...employeeDetail.leadSource.map(item => item.conversionRate))

                        return (
                          <tr key={`${source.source}-${index}`} className={source.conversionRate === bestRate ? 'bg-green-50/60' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                            <td className="px-3 py-2 font-medium">{source.source}</td>
                            <td className="px-3 py-2">{source.count}</td>
                            <td className="px-3 py-2">
                              {source.closedCount}
                              {source.conversionRate === bestRate && <span className="ml-1 text-xs text-green-600">★ Tốt nhất</span>}
                            </td>
                            <td className="px-3 py-2">{source.conversionRate}%</td>
                            <td className="px-3 py-2 font-medium text-blue-600">{formatCurrencyFull(source.revenue)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#e6ebf1] bg-gray-50 font-semibold">
                        <td colSpan={5} className="px-3 py-2 text-right">
                          Tổng doanh số:
                        </td>
                        <td className="px-3 py-2 font-bold text-blue-600">
                          {formatCurrencyFull(employeeDetail.leadSource.reduce((sum, source) => sum + source.revenue, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </DetailSection>

              <DetailSection
                title="Khách hàng"
                icon={<Users className="h-5 w-5" />}
                sectionKey="customers"
                expanded={expandedSections.has('customers')}
                onToggle={toggleSection}
              >
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
                  {[
                    { label: 'Tổng khách hàng', value: employeeDetail.customers.total.toLocaleString('vi-VN') },
                    { label: 'KH doanh nghiệp', value: employeeDetail.customers.businessCount.toLocaleString('vi-VN') },
                    { label: 'KH cá nhân', value: employeeDetail.customers.individualCount.toLocaleString('vi-VN') },
                    { label: 'Khách hàng mới', value: employeeDetail.customers.newInPeriod.toLocaleString('vi-VN') },
                    { label: 'GTB / khách hàng', value: formatCurrencyCompact(employeeDetail.customers.avgOrderValue) },
                  ].map(metric => (
                    <div key={metric.label} className="flex items-center justify-between rounded-[10px] bg-gray-50 p-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">{metric.label}</p>
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['STT', 'Tên KH', 'Loại', 'Nhãn', 'Số đơn', 'Doanh số', 'Đơn gần nhất'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-semibold text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.customers.topCustomers.map((customer, index) => (
                        <tr key={`${customer.name}-${index}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                          <td className="px-3 py-2 font-medium">{customer.name}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                customer.type === 'DN' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                              }`}
                            >
                              {customer.type === 'DN' ? 'Doanh nghiệp' : 'Cá nhân'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-[#3e79f7]">{customer.label}</span>
                          </td>
                          <td className="px-3 py-2">{customer.orders}</td>
                          <td className="px-3 py-2 font-medium text-blue-600">{formatCurrencyFull(customer.revenue)}</td>
                          <td className="px-3 py-2 text-gray-500">{customer.lastOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailSection>

              <DetailSection
                title="Công việc"
                icon={<CheckCircle className="h-5 w-5" />}
                sectionKey="tasks"
                expanded={expandedSections.has('tasks')}
                onToggle={toggleSection}
              >
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-6">
                  {[
                    { label: 'Tổng công việc', value: employeeDetail.tasks.length },
                    { label: 'Chưa làm', value: employeeDetail.tasks.filter(task => task.status === 'Chưa làm').length },
                    { label: 'Đang làm', value: employeeDetail.tasks.filter(task => task.status === 'Đang làm').length },
                    { label: 'Hoàn tất', value: employeeDetail.tasks.filter(task => task.status === 'Hoàn tất').length },
                    { label: 'Quá hạn', value: employeeDetail.tasks.filter(task => task.overdueDays > 0 && task.status !== 'Hoàn tất').length },
                    { label: 'Cần ưu tiên', value: employeeDetail.tasks.filter(task => task.priority === 'Cao').length },
                  ].map(metric => (
                    <div key={metric.label} className="flex items-center justify-between rounded-[10px] bg-gray-50 p-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">{metric.label}</p>
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="mb-6 w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['STT', 'Công việc', 'Liên quan', 'Thời hạn', 'Ưu tiên', 'Loại', 'Trạng thái', 'Tags', 'Ngày tạo'].map(header => (
                          <th key={header} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDetail.tasks.map((task, index) => (
                        <tr key={`${task.name}-${index}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => {
                                setSelectedTask(task)
                                setShowTaskDetail(true)
                              }}
                              className="text-left font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {task.name}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm font-medium text-gray-900">{task.relatedName}</div>
                            <div className="text-xs text-gray-500">{task.relatedType}</div>
                            <div className="text-xs text-gray-400">{task.relatedPhone}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <div className="text-sm font-medium text-gray-900">{task.deadline}</div>
                            <div className="text-xs text-gray-500">{task.deadlineTime}</div>
                            {task.overdueDays > 0 && task.status !== 'Hoàn tất' && (
                              <div className="mt-0.5 flex items-center text-xs text-red-500">
                                <Clock className="mr-0.5 h-3 w-3" />
                                Quá hạn {task.overdueDays} ngày
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                task.priority === 'Cao'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'Trung bình'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                task.type === 'Khách hàng' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                              }`}
                            >
                              {task.type}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTaskStatusBadge(task.status)}`}>{task.status}</span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag, tagIndex) => (
                                <span key={`${tag}-${tagIndex}`} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">{task.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailSection>

              <DetailSection title="Ghi chú báo cáo cá nhân"
                icon={<CheckCircle className="h-5 w-5" />}
                sectionKey="note"
                expanded={expandedSections.has('note')}
                onToggle={toggleSection}>
                                <div className="rounded-[12px] border border-[#e6ebf1] bg-[#fafcff] p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Ghi chú báo cáo cá nhân</h4>
                      <p className="text-sm text-gray-500">Hiển thị theo bộ lọc thời gian: {getTimeRangeLabel(timeRange)}</p>
                    </div>
                    <button
                      onClick={handleCreateNote}
                      disabled={isCustomScopeWithoutRange}
                      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#3e79f7] px-4 py-2 text-sm font-medium text-white hover:bg-[#699dff] disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm ghi chú
                    </button>
                  </div>

                  {notesError && (
                    <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {notesError}
                    </div>
                  )}

                  {notesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải ghi chú...
                    </div>
                  ) : selectedEmployeeNotes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEmployeeNotes.map(note => (
                        <div key={note.id} className="rounded-[10px] border border-[#e6ebf1] bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="whitespace-pre-wrap text-sm text-gray-900">{renderTextWithLinks(note.content)}</div>

                              {note.links.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {note.links.map(link => (
                                    <a
                                      key={link}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#3e79f7] hover:bg-blue-100"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {truncateUrl(link, 48)}
                                    </a>
                                  ))}
                                </div>
                              )}

                              <div className="mt-3 text-xs text-gray-500">
                                <span>{note.createdByName}</span>
                                <span className="mx-2">•</span>
                                <span>Tạo: {formatDateTime(note.createdAt)}</span>
                                <span className="mx-2">•</span>
                                <span>Cập nhật: {formatDateTime(note.updatedAt)}</span>
                              </div>
                            </div>

                            {canManageNote(note) && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditNote(note)}
                                  className="rounded-[10px] p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                  title="Chỉnh sửa"
                                >
                                  <PenSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note)}
                                  className="rounded-[10px] p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[10px] border border-dashed border-[#d8e2f0] bg-white px-4 py-10 text-center text-sm text-gray-500">
                      Chưa có ghi chú báo cáo cá nhân trong phạm vi {getTimeRangeLabel(timeRange).toLowerCase()}.
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
      )}

      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[10px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e6ebf1] p-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">{selectedTask.name}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 transition-colors hover:text-blue-600" title="Chỉnh sửa">
                  <PenSquare className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setShowTaskDetail(false)
                    setSelectedTask(null)
                    setTaskDetailTab('overview')
                  }}
                  className="rounded-[10px] p-2 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="border-b border-[#e6ebf1]">
              <nav className="-mb-px flex space-x-8 overflow-x-auto px-6">
                <button
                  onClick={() => setTaskDetailTab('overview')}
                  className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    taskDetailTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-[#e6ebf1] hover:text-gray-700'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Tổng quan</span>
                </button>
                <button
                  onClick={() => setTaskDetailTab('reminders')}
                  className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    taskDetailTab === 'reminders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-[#e6ebf1] hover:text-gray-700'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <span>Nhắc nhở</span>
                </button>
                <button
                  onClick={() => setTaskDetailTab('history')}
                  className={`flex items-center space-x-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    taskDetailTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-[#e6ebf1] hover:text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>Lịch sử</span>
                </button>
              </nav>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              {taskDetailTab === 'overview' && (
                <div className="space-y-6">
                  <div className="rounded-[10px] bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getTaskStatusBadge(selectedTask.status)}`}>{selectedTask.status}</span>
                        {selectedTask.overdueDays > 0 && selectedTask.status !== 'Hoàn tất' && (
                          <span className="flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Quá hạn {selectedTask.overdueDays} ngày
                          </span>
                        )}
                      </div>
                      {selectedTask.status === 'Chưa làm' && (
                        <button className="flex items-center space-x-1 rounded-[10px] bg-[#3e79f7] px-3 py-1 text-sm text-white transition-colors hover:bg-[#699dff]">
                          <span>Bắt đầu</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tiêu đề</label>
                        <div className="text-lg font-medium text-gray-900">{selectedTask.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mô tả</label>
                        <div className="whitespace-pre-wrap text-gray-900">{selectedTask.description || 'Không có mô tả'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Thời hạn</label>
                        <div className={`flex items-center space-x-2 ${selectedTask.overdueDays > 0 && selectedTask.status !== 'Hoàn tất' ? 'text-red-600' : 'text-gray-900'}`}>
                          <Calendar className="h-4 w-4" />
                          <span>
                            {selectedTask.deadlineTime} {selectedTask.deadline}
                          </span>
                          {selectedTask.overdueDays > 0 && selectedTask.status !== 'Hoàn tất' && (
                            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Quá hạn {selectedTask.overdueDays} ngày</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ưu tiên</label>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                            selectedTask.priority === 'Cao'
                              ? 'border-red-200 bg-red-100 text-red-800'
                              : selectedTask.priority === 'Trung bình'
                                ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                                : 'border-green-200 bg-green-100 text-green-800'
                          }`}
                        >
                          {selectedTask.priority}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Người phụ trách</label>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{selectedTask.assignee || 'Nguyễn Văn An'}</span>
                          <span className="text-sm text-gray-500">(Sales)</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Liên quan</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{selectedTask.relatedName}</span>
                          <span className="text-sm text-gray-500">({selectedTask.relatedType})</span>
                        </div>
                        {selectedTask.relatedPhone && (
                          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{selectedTask.relatedPhone}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nhãn</label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedTask.tags.length > 0 ? (
                            selectedTask.tags.map((tag, index) => (
                              <span key={`${tag}-${index}`} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tạo lúc</label>
                        <div className="text-gray-900">{selectedTask.createdAt}</div>
                      </div>
                    </div>
                  </div>

                  {selectedTask.note && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ghi chú nội bộ</label>
                      <div className="mt-1 rounded-[10px] border border-yellow-200 bg-yellow-50 p-3 text-gray-900">{selectedTask.note}</div>
                    </div>
                  )}
                </div>
              )}

              {taskDetailTab === 'reminders' && <div className="py-8 text-center text-gray-500">Chưa có nhắc nhở nào</div>}
              {taskDetailTab === 'history' && <div className="py-8 text-center text-gray-500">Chưa có lịch sử hoạt động</div>}
            </div>
          </div>
        </div>
      )}

      <EmployeeNoteEditorDialog
        isOpen={showNoteEditor}
        employeeName={selectedEmployeeRow?.name || ''}
        scopeLabel={getTimeRangeLabel(timeRange)}
        currentUser={currentUser}
        initialContent={editingNote?.content || ''}
        isSubmitting={noteSubmitting}
        mode={editingNote ? 'edit' : 'create'}
        onClose={() => {
          if (noteSubmitting) return
          setShowNoteEditor(false)
          setEditingNote(null)
        }}
        onSave={handleSaveNote}
      />

      <DeleteNoteDialog
        isOpen={showDeleteNoteDialog}
        isSubmitting={noteSubmitting}
        onClose={() => {
          if (noteSubmitting) return
          setShowDeleteNoteDialog(false)
          setEditingNote(null)
        }}
        onConfirm={handleConfirmDeleteNote}
      />
    </div>
  )
}

function DetailSection({
  title,
  icon,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  title: string
  icon: ReactNode
  sectionKey: DetailSectionKey
  expanded: boolean
  onToggle: (key: DetailSectionKey) => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[#e6ebf1] bg-white shadow-sm">
      <button
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600">{icon}</span>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
        {expanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
      </button>
      {expanded && <div className="border-t border-gray-100 px-6 pb-5 pt-4">{children}</div>}
    </div>
  )
}

function EmployeeNoteEditorDialog({
  isOpen,
  mode,
  employeeName,
  scopeLabel,
  currentUser,
  initialContent,
  isSubmitting,
  onClose,
  onSave,
}: {
  isOpen: boolean
  mode: 'create' | 'edit'
  employeeName: string
  scopeLabel: string
  currentUser: ReportCurrentUser
  initialContent: string
  isSubmitting: boolean
  onClose: () => void
  onSave: (content: string) => Promise<void> | void
}) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent)
    }
  }, [initialContent, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[10px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6ebf1] p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{mode === 'create' ? 'Thêm ghi chú' : 'Chỉnh sửa ghi chú'}</h3>
            <p className="text-sm text-gray-500">
              {employeeName} • {scopeLabel} • {currentUser.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nội dung ghi chú <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={event => setContent(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-[10px] border border-[#e6ebf1] px-3 py-2 focus:border-[#3e79f7] focus:ring-2 focus:ring-[#3e79f7]"
            placeholder="Nhập nội dung ghi chú hoặc dán link báo cáo cá nhân..."
          />
          <p className="mt-2 text-xs text-gray-500">Nếu nội dung có link bắt đầu bằng `http://` hoặc `https://`, hệ thống sẽ tự nhận diện để bấm mở trực tiếp.</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e6ebf1] p-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#e6ebf1] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(content.trim())}
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#3e79f7] px-4 py-2 text-sm font-medium text-white hover:bg-[#699dff] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Lưu ghi chú' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteNoteDialog({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-[10px] bg-white shadow-xl">
        <div className="p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
          <p className="text-sm text-gray-600">Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn tác.</p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#e6ebf1] p-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#e6ebf1] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#ff6b72] px-4 py-2 text-sm font-medium text-white hover:bg-[#d9505c] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
