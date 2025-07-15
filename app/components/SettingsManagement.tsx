'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Settings,
  Users,
  Shield,
  Workflow,
  Palette,
  Globe,
  Facebook,
  MessageSquare,
  Tags,
  UserCog,
  Database,
  Clock,
  Activity,
  History,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  Download,
  Filter,
  MoreHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Monitor,
  Smartphone,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Bell,
  Key,
  RefreshCw,
  ExternalLink,
  Copy,
  QrCode,
  Zap,
  Camera,
  Layers,
  FileText,
  BarChart3,
  Target,
  Star,
  Tag,
  User2,
  ShoppingCart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import CompanyManagement from './CompanyManagement'

// Interfaces
interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  department: string
  team: string
  status: 'active' | 'inactive' | 'locked'
  lastLogin: string
  createdAt: string
  permissions: UserPermissions
  twoFactorEnabled: boolean
  allowedIPs: string[]
  sessionLimit: number
  workingHours: {
    enabled: boolean
    start: string
    end: string
    days: string[]
  }
}

interface UserPermissions {
  leads: {
    view: 'all' | 'team' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    tags: string[]
  }
  deals: {
    view: 'all' | 'team' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    tags: string[]
  }
  customers: {
    view: 'all' | 'team' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    tags: string[]
  }
  reports: {
    view: 'all' | 'team' | 'own' | 'none'
    create: boolean
    export: boolean
    customReports: boolean
  }
  settings: {
    userManagement: boolean
    systemSettings: boolean
    integrations: boolean
    security: boolean
  }
}

interface UserAction {
  id: string
  userId: string
  userName: string
  action: string
  target: string
  targetId: string
  oldValue: any
  newValue: any
  reason: string
  timestamp: string
  ipAddress: string
  userAgent: string
}

interface SalesStage {
  id: string
  name: string
  description: string
  color: string
  order: number
  team?: string
  product?: string
  isActive: boolean
  autoTransition: {
    enabled: boolean
    days: number
    nextStage: string
  }
}

interface OrderStatus {
  id: string
  name: string
  description: string
  color: string
  category: 'payment' | 'delivery' | 'contract' | 'other'
  timeout: {
    enabled: boolean
    days: number
    action: 'notify' | 'auto_change' | 'none'
    nextStatus?: string
  }
  notifications: {
    zalo: boolean
    email: boolean
    app: boolean
  }
  isActive: boolean
}

interface SecuritySettings {
  twoFactorRequired: boolean
  loginAttempts: {
    maxAttempts: number
    lockDuration: number // minutes
  }
  sessionTimeout: number // minutes
  allowedIPs: string[]
  ipRestrictionEnabled: boolean
  encryptionEnabled: boolean
  deviceTrustEnabled: boolean
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expiryDays: number
  }
}

interface IntegrationConfig {
  id: string
  type: 'zalo' | 'facebook'
  name: string
  status: 'connected' | 'disconnected' | 'error'
  config: {
    appId?: string
    token?: string
    webhookUrl?: string
    syncFrequency: number // minutes
    autoTags: string[]
    syncLeads: boolean
    syncMessages: boolean
    syncForms: boolean
  }
  permissions: {
    connect: string[] // user roles
    edit: string[]
    delete: string[]
  }
  lastSync: string
  errorLog: string[]
}

interface CustomTag {
  id: string
  name: string
  color: string
  category: 'lead' | 'customer' | 'deal' | 'task'
  scope: 'global' | 'team' | 'user'
  scopeId?: string
  isDefault: boolean
  autoAssign: {
    enabled: boolean
    conditions: any[]
  }
  createdBy: string
  createdAt: string
}

interface CustomRole {
  id: string
  name: string
  description: string
  permissions: UserPermissions
  isActive: boolean
  createdBy: string
  createdAt: string
  usersCount: number
}

interface DataTemplate {
  id: string
  type: 'lead' | 'deal' | 'customer'
  name: string
  fields: {
    name: string
    type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean'
    required: boolean
    defaultValue: any
    options?: string[]
  }[]
  defaultTags: string[]
  scope: 'global' | 'team' | 'user'
  scopeId?: string
  isActive: boolean
  createdBy: string
  createdAt: string
}

interface SystemLog {
  id: string
  category: 'user' | 'security' | 'integration' | 'system' | 'data'
  action: string
  userId: string
  userName: string
  target: string
  details: any
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface InterfaceSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  logo: {
    url: string
    width: number
    height: number
  }
  favicon: {
    url: string
  }
  companyName: string
  systemName: string
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
  currency: string
  sidebarCollapsed: boolean
  tablePageSize: number
  autoSave: boolean
  customCSS: string
  allowCustomization: boolean
}

interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  flag: string
  isActive: boolean
  progress: number // translation percentage
  lastUpdated: string
}

// Sample Data
const sampleUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'Quản trị viên',
    role: 'admin',
    department: 'IT',
    team: 'Hệ thống',
    status: 'active',
    lastLogin: '2025-06-11T08:30:00',
    createdAt: '2025-01-01T00:00:00',
    twoFactorEnabled: true,
    allowedIPs: [],
    sessionLimit: 3,
    workingHours: {
      enabled: false,
      start: '08:00',
      end: '17:00',
      days: ['1', '2', '3', '4', '5']
    },
    permissions: {
      leads: { view: 'all', create: true, edit: true, delete: true, export: true, tags: [] },
      deals: { view: 'all', create: true, edit: true, delete: true, export: true, tags: [] },
      customers: { view: 'all', create: true, edit: true, delete: true, export: true, tags: [] },
      reports: { view: 'all', create: true, export: true, customReports: true },
      settings: { userManagement: true, systemSettings: true, integrations: true, security: true }
    }
  },
  {
    id: '2',
    username: 'sales01',
    email: 'sales01@company.com',
    fullName: 'Nguyễn Văn An',
    role: 'sales',
    department: 'Sales',
    team: 'Team A',
    status: 'active',
    lastLogin: '2025-06-11T09:15:00',
    createdAt: '2025-02-15T00:00:00',
    twoFactorEnabled: false,
    allowedIPs: [],
    sessionLimit: 2,
    workingHours: {
      enabled: true,
      start: '08:30',
      end: '17:30',
      days: ['1', '2', '3', '4', '5']
    },
    permissions: {
      leads: { view: 'team', create: true, edit: true, delete: false, export: true, tags: ['Tiềm năng'] },
      deals: { view: 'team', create: true, edit: true, delete: false, export: true, tags: [] },
      customers: { view: 'team', create: true, edit: true, delete: false, export: false, tags: [] },
      reports: { view: 'team', create: false, export: false, customReports: false },
      settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
    }
  }
]

const sampleSalesStages: SalesStage[] = [
  {
    id: '1',
    name: 'Tiếp nhận',
    description: 'Lead mới được tiếp nhận từ các kênh',
    color: '#3B82F6',
    order: 1,
    isActive: true,
    autoTransition: { enabled: true, days: 1, nextStage: '2' }
  },
  {
    id: '2',
    name: 'Tư vấn',
    description: 'Tư vấn chi tiết cho khách hàng',
    color: '#F59E0B',
    order: 2,
    isActive: true,
    autoTransition: { enabled: false, days: 3, nextStage: '3' }
  },
  {
    id: '3',
    name: 'Báo giá',
    description: 'Gửi báo giá cho khách hàng',
    color: '#8B5CF6',
    order: 3,
    isActive: true,
    autoTransition: { enabled: false, days: 5, nextStage: '4' }
  },
  {
    id: '4',
    name: 'Chốt Deal',
    description: 'Chốt deal thành công',
    color: '#10B981',
    order: 4,
    isActive: true,
    autoTransition: { enabled: false, days: 0, nextStage: '' }
  }
]

const sampleOrderStatuses: OrderStatus[] = [
  {
    id: '1',
    name: 'Chưa thanh toán',
    description: 'Đơn hàng chưa được thanh toán',
    color: '#EF4444',
    category: 'payment',
    timeout: { enabled: true, days: 3, action: 'notify' },
    notifications: { zalo: true, email: true, app: true },
    isActive: true
  },
  {
    id: '2',
    name: 'Đã thanh toán',
    description: 'Đơn hàng đã được thanh toán',
    color: '#10B981',
    category: 'payment',
    timeout: { enabled: false, days: 0, action: 'none' },
    notifications: { zalo: true, email: false, app: true },
    isActive: true
  }
]

const sampleSecuritySettings: SecuritySettings = {
  twoFactorRequired: false,
  loginAttempts: { maxAttempts: 5, lockDuration: 15 },
  sessionTimeout: 15,
  allowedIPs: [],
  ipRestrictionEnabled: false,
  encryptionEnabled: true,
  deviceTrustEnabled: true,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90
  }
}

const sampleInterfaceSettings: InterfaceSettings = {
  theme: 'light',
  primaryColor: '#3B82F6',
  logo: {
    url: '/logo.png',
    width: 180,
    height: 60
  },
  favicon: {
    url: '/favicon.ico'
  },
  companyName: 'Công ty ABC',
  systemName: 'CRM System',
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1,000.00',
  currency: 'VND',
  sidebarCollapsed: false,
  tablePageSize: 20,
  autoSave: true,
  customCSS: '',
  allowCustomization: true
}

const sampleLanguages: LanguageConfig[] = [
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    isActive: true,
    progress: 100,
    lastUpdated: '2025-06-11T00:00:00'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isActive: true,
    progress: 95,
    lastUpdated: '2025-06-10T00:00:00'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    isActive: false,
    progress: 60,
    lastUpdated: '2025-06-05T00:00:00'
  }
]

const sampleTags: CustomTag[] = [
  {
    id: '1',
    name: 'VIP',
    color: '#F59E0B',
    category: 'customer',
    scope: 'global',
    isDefault: false,
    autoAssign: {
      enabled: true,
      conditions: [
        { field: 'revenue', operator: '>', value: 100000000 }
      ]
    },
    createdBy: 'admin',
    createdAt: '2025-01-15T00:00:00'
  },
  {
    id: '2',
    name: 'Tiềm năng cao',
    color: '#10B981',
    category: 'lead',
    scope: 'global',
    isDefault: true,
    autoAssign: {
      enabled: false,
      conditions: []
    },
    createdBy: 'admin',
    createdAt: '2025-01-15T00:00:00'
  },
  {
    id: '3',
    name: 'Ưu tiên',
    color: '#EF4444',
    category: 'deal',
    scope: 'team',
    scopeId: 'team-a',
    isDefault: false,
    autoAssign: {
      enabled: true,
      conditions: [
        { field: 'amount', operator: '>', value: 50000000 }
      ]
    },
    createdBy: 'sales01',
    createdAt: '2025-02-01T00:00:00'
  },
  {
    id: '4',
    name: 'Khẩn cấp',
    color: '#DC2626',
    category: 'task',
    scope: 'global',
    isDefault: false,
    autoAssign: {
      enabled: false,
      conditions: []
    },
    createdBy: 'admin',
    createdAt: '2025-01-20T00:00:00'
  }
]

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('company')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showStageModal, setShowStageModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  
  // Data states
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [salesStages, setSalesStages] = useState<SalesStage[]>(sampleSalesStages)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>(sampleOrderStatuses)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(sampleSecuritySettings)
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(sampleInterfaceSettings)
  const [languages, setLanguages] = useState<LanguageConfig[]>(sampleLanguages)
  const [tags, setTags] = useState<CustomTag[]>(sampleTags)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'locked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'sales': return 'bg-green-100 text-green-800'
      case 'support': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter logic
  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    if (statusFilter !== 'all' && user.status !== statusFilter) return false
    return true
  })

  // Component: Workflow Management
  const WorkflowManagement = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Quy trình</h2>
            <p className="text-gray-600">Tùy chỉnh giai đoạn bán hàng và trạng thái đơn hàng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Stages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Giai đoạn bán hàng</CardTitle>
                  <CardDescription>Tùy chỉnh quy trình chuyển đổi lead</CardDescription>
                </div>
                <Button onClick={() => setShowStageModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm giai đoạn
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {salesStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <div>
                      <div className="font-medium">{stage.name}</div>
                      <div className="text-sm text-gray-500">{stage.description}</div>
                      {stage.autoTransition.enabled && (
                        <div className="text-xs text-blue-600">
                          Tự chuyển sau {stage.autoTransition.days} ngày
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{stage.order}</Badge>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Statuses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trạng thái đơn hàng</CardTitle>
                  <CardDescription>Quản lý trạng thái và thông báo</CardDescription>
                </div>
                <Button onClick={() => setShowStatusModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm trạng thái
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderStatuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <div>
                      <div className="font-medium">{status.name}</div>
                      <div className="text-sm text-gray-500">{status.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {status.category === 'payment' ? 'Thanh toán' :
                           status.category === 'delivery' ? 'Giao hàng' :
                           status.category === 'contract' ? 'Hợp đồng' : 'Khác'}
                        </Badge>
                        {status.timeout.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Hết hạn: {status.timeout.days} ngày
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {status.notifications.zalo && (
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                      )}
                      {status.notifications.email && (
                        <Mail className="w-3 h-3 text-green-500" />
                      )}
                      {status.notifications.app && (
                        <Bell className="w-3 h-3 text-purple-500" />
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng giai đoạn</p>
                  <p className="text-2xl font-bold">{salesStages.length}</p>
                </div>
                <Workflow className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Giai đoạn hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">
                    {salesStages.filter(s => s.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trạng thái đơn</p>
                  <p className="text-2xl font-bold">{orderStatuses.length}</p>
                </div>
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tự động hóa</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {salesStages.filter(s => s.autoTransition.enabled).length}
                  </p>
                </div>
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Component: Security Settings
  const SecurityManagement = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cài đặt Bảo mật</h2>
            <p className="text-gray-600">Quản lý xác thực, phiên đăng nhập và bảo mật dữ liệu</p>
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Xác thực người dùng</CardTitle>
              <CardDescription>Cài đặt bảo mật đăng nhập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa-required">Bắt buộc 2FA cho Quản lý</Label>
                  <p className="text-sm text-gray-500">Yêu cầu xác thực hai yếu tố</p>
                </div>
                <Switch
                  id="2fa-required"
                  checked={securitySettings.twoFactorRequired}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Giới hạn đăng nhập sai</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={securitySettings.loginAttempts.maxAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      loginAttempts: { ...prev.loginAttempts, maxAttempts: parseInt(e.target.value) }
                    }))}
                    className="w-20"
                  />
                  <span className="flex items-center text-sm text-gray-500">lần, khóa trong</span>
                  <Input
                    type="number"
                    value={securitySettings.loginAttempts.lockDuration}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      loginAttempts: { ...prev.loginAttempts, lockDuration: parseInt(e.target.value) }
                    }))}
                    className="w-20"
                  />
                  <span className="flex items-center text-sm text-gray-500">phút</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thời gian chờ phiên</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value)
                    }))}
                    className="w-20"
                  />
                  <span className="flex items-center text-sm text-gray-500">phút không hoạt động</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Kiểm soát truy cập</CardTitle>
              <CardDescription>Hạn chế IP và thiết bị</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-restriction">Hạn chế IP</Label>
                  <p className="text-sm text-gray-500">Chỉ cho phép IP xác định</p>
                </div>
                <Switch
                  id="ip-restriction"
                  checked={securitySettings.ipRestrictionEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, ipRestrictionEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="device-trust">Tin cậy thiết bị</Label>
                  <p className="text-sm text-gray-500">Ghi nhớ thiết bị đăng nhập</p>
                </div>
                <Switch
                  id="device-trust"
                  checked={securitySettings.deviceTrustEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, deviceTrustEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="encryption">Mã hóa dữ liệu</Label>
                  <p className="text-sm text-gray-500">Mã hóa thông tin nhạy cảm</p>
                </div>
                <Switch
                  id="encryption"
                  checked={securitySettings.encryptionEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, encryptionEnabled: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Danh sách IP được phép</Label>
                <Textarea
                  placeholder="192.168.1.1&#10;10.0.0.0/24&#10;Mỗi IP/subnet một dòng"
                  value={securitySettings.allowedIPs.join('\n')}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    allowedIPs: e.target.value.split('\n').filter(ip => ip.trim())
                  }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Chính sách mật khẩu</CardTitle>
            <CardDescription>Quy định về độ phức tạp mật khẩu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Độ dài tối thiểu</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                    className="w-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Hết hạn sau (ngày)</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.expiryDays}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, expiryDays: parseInt(e.target.value) }
                    }))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="require-uppercase">Yêu cầu chữ hoa</Label>
                  <Switch
                    id="require-uppercase"
                    checked={securitySettings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="require-lowercase">Yêu cầu chữ thường</Label>
                  <Switch
                    id="require-lowercase"
                    checked={securitySettings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require-numbers">Yêu cầu số</Label>
                  <Switch
                    id="require-numbers"
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require-special">Yêu cầu ký tự đặc biệt</Label>
                  <Switch
                    id="require-special"
                    checked={securitySettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Người dùng có 2FA</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.twoFactorEnabled).length}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phiên hoạt động</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.status === 'active').length * 2}
                  </p>
                </div>
                <Monitor className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tài khoản bị khóa</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'locked').length}
                  </p>
                </div>
                <Lock className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mức độ bảo mật</p>
                  <p className="text-2xl font-bold text-purple-600">Cao</p>
                </div>
                <Star className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Component: Interface Management
  const InterfaceManagement = () => {
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [faviconFile, setFaviconFile] = useState<File | null>(null)

    const colorOptions = [
      { name: 'Blue', value: '#3B82F6' },
      { name: 'Green', value: '#10B981' },
      { name: 'Purple', value: '#8B5CF6' },
      { name: 'Red', value: '#EF4444' },
      { name: 'Orange', value: '#F59E0B' },
      { name: 'Pink', value: '#EC4899' },
      { name: 'Indigo', value: '#6366F1' },
      { name: 'Teal', value: '#14B8A6' }
    ]

    const themes = [
      { value: 'light', label: 'Sáng', icon: '☀️' },
      { value: 'dark', label: 'Tối', icon: '🌙' },
      { value: 'auto', label: 'Tự động', icon: '🔄' }
    ]

    const dateFormats = [
      { value: 'DD/MM/YYYY', label: '31/12/2025' },
      { value: 'MM/DD/YYYY', label: '12/31/2025' },
      { value: 'YYYY-MM-DD', label: '2025-12-31' },
      { value: 'DD-MM-YYYY', label: '31-12-2025' }
    ]

    const numberFormats = [
      { value: '1,000.00', label: '1,000.00' },
      { value: '1.000,00', label: '1.000,00' },
      { value: '1 000.00', label: '1 000.00' },
      { value: '1000.00', label: '1000.00' }
    ]

    const currencies = [
      { value: 'VND', label: 'Vietnamese Dong (₫)' },
      { value: 'USD', label: 'US Dollar ($)' },
      { value: 'EUR', label: 'Euro (€)' },
      { value: 'JPY', label: 'Japanese Yen (¥)' }
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Giao diện & Ngôn ngữ</h2>
            <p className="text-gray-600">Tùy chỉnh giao diện và cài đặt ngôn ngữ hệ thống</p>
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme & Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>Tùy chỉnh giao diện hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Selection */}
              <div>
                <Label className="text-sm font-medium">Chủ đề</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {themes.map((theme) => (
                    <Button
                      key={theme.value}
                      variant={interfaceSettings.theme === theme.value ? "default" : "outline"}
                      className="h-12 flex flex-col items-center justify-center"
                      onClick={() => setInterfaceSettings(prev => ({ ...prev, theme: theme.value as any }))}
                    >
                      <span className="text-lg">{theme.icon}</span>
                      <span className="text-xs">{theme.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <Label className="text-sm font-medium">Màu chính</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-12 h-12 rounded-lg border-2 ${
                        interfaceSettings.primaryColor === color.value 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-200 hover:border-gray-400'
                      } transition-all`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setInterfaceSettings(prev => ({ ...prev, primaryColor: color.value }))}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <Label className="text-sm font-medium">Logo công ty</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {interfaceSettings.logo.url ? (
                        <Image 
                          src={interfaceSettings.logo.url} 
                          alt="Logo" 
                          width={64}
                          height={64}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG hoặc SVG. Tối đa 2MB. Khuyến nghị: 180x60px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="company-name">Tên công ty</Label>
                  <Input
                    id="company-name"
                    value={interfaceSettings.companyName}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Nhập tên công ty"
                  />
                </div>
                <div>
                  <Label htmlFor="system-name">Tên hệ thống</Label>
                  <Input
                    id="system-name"
                    value={interfaceSettings.systemName}
                    onChange={(e) => setInterfaceSettings(prev => ({ ...prev, systemName: e.target.value }))}
                    placeholder="Nhập tên hệ thống"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Localization */}
          <Card>
            <CardHeader>
              <CardTitle>Ngôn ngữ & Địa phương</CardTitle>
              <CardDescription>Cài đặt ngôn ngữ và định dạng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selection */}
              <div>
                <Label>Ngôn ngữ chính</Label>
                <Select
                  value={interfaceSettings.language}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                          <span className="text-gray-500">({lang.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div>
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select
                  value={interfaceSettings.timezone}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</SelectItem>
                    <SelectItem value="Asia/Bangkok">GMT+7 (Bangkok)</SelectItem>
                    <SelectItem value="Asia/Tokyo">GMT+9 (Tokyo)</SelectItem>
                    <SelectItem value="America/New_York">GMT-5 (New York)</SelectItem>
                    <SelectItem value="Europe/London">GMT+0 (London)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Format */}
              <div>
                <Label>Định dạng ngày</Label>
                <Select
                  value={interfaceSettings.dateFormat}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, dateFormat: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number Format */}
              <div>
                <Label>Định dạng số</Label>
                <Select
                  value={interfaceSettings.numberFormat}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, numberFormat: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {numberFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div>
                <Label>Đơn vị tiền tệ</Label>
                <Select
                  value={interfaceSettings.currency}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Ngôn ngữ</CardTitle>
            <CardDescription>Quản lý các ngôn ngữ được hỗ trợ trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languages.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <h4 className="font-medium">{lang.nativeName}</h4>
                      <p className="text-sm text-gray-500">{lang.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{lang.progress}%</p>
                      <Progress value={lang.progress} className="w-20" />
                    </div>
                    <Badge variant={lang.isActive ? "default" : "secondary"}>
                      {lang.isActive ? "Đang dùng" : "Tắt"}
                    </Badge>
                    <Switch
                      checked={lang.isActive}
                      onCheckedChange={(checked) => {
                        setLanguages(prev => prev.map(l => 
                          l.code === lang.code ? { ...l, isActive: checked } : l
                        ))
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm ngôn ngữ mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt nâng cao</CardTitle>
            <CardDescription>Các tùy chọn giao diện nâng cao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sidebar-collapsed">Thu gọn thanh bên mặc định</Label>
                  <Switch
                    id="sidebar-collapsed"
                    checked={interfaceSettings.sidebarCollapsed}
                    onCheckedChange={(checked) => 
                      setInterfaceSettings(prev => ({ ...prev, sidebarCollapsed: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Tự động lưu</Label>
                  <Switch
                    id="auto-save"
                    checked={interfaceSettings.autoSave}
                    onCheckedChange={(checked) => 
                      setInterfaceSettings(prev => ({ ...prev, autoSave: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-customization">Cho phép người dùng tùy chỉnh</Label>
                  <Switch
                    id="allow-customization"
                    checked={interfaceSettings.allowCustomization}
                    onCheckedChange={(checked) => 
                      setInterfaceSettings(prev => ({ ...prev, allowCustomization: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="table-page-size">Số dòng trên mỗi trang</Label>
                  <Select
                    value={interfaceSettings.tablePageSize.toString()}
                    onValueChange={(value) => 
                      setInterfaceSettings(prev => ({ ...prev, tablePageSize: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 dòng</SelectItem>
                      <SelectItem value="20">20 dòng</SelectItem>
                      <SelectItem value="50">50 dòng</SelectItem>
                      <SelectItem value="100">100 dòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="mt-6">
              <Label htmlFor="custom-css">CSS tùy chỉnh</Label>
              <Textarea
                id="custom-css"
                value={interfaceSettings.customCSS}
                onChange={(e) => setInterfaceSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                placeholder="/* Nhập CSS tùy chỉnh của bạn */"
                className="mt-2 h-32 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lưu ý: CSS tùy chỉnh có thể ảnh hưởng đến giao diện hệ thống
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const UserManagement = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = !roleFilter || user.role === roleFilter
      const matchesStatus = !statusFilter || user.status === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h2>
            <p className="text-gray-600">Tạo, chỉnh sửa và phân quyền người dùng</p>
          </div>
          <Button onClick={() => setShowUserModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="manager">Quản lý</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Hỗ trợ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                  <SelectItem value="locked">Bị khóa</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Lọc nâng cao
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Phòng ban/Team</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'admin' ? 'Quản trị viên' :
                           user.role === 'manager' ? 'Quản lý' :
                           user.role === 'sales' ? 'Sales' : 'Hỗ trợ'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.department}</div>
                        <div className="text-xs text-gray-500">{user.team}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === 'active' ? 'Hoạt động' :
                         user.status === 'inactive' ? 'Tạm dừng' : 'Bị khóa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(user.lastLogin)}</div>
                    </TableCell>
                    <TableCell>
                      {user.twoFactorEnabled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Bật
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          Tắt
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem lịch sử
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="w-4 h-4 mr-2" />
                            Đặt lại mật khẩu
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.status === 'active' ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Khóa tài khoản
                              </>
                            ) : (
                              <>
                                <Unlock className="w-4 h-4 mr-2" />
                                Mở khóa
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã bật 2FA</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.twoFactorEnabled).length}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online hôm nay</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => {
                      const today = new Date().toDateString()
                      const lastLogin = new Date(u.lastLogin).toDateString()
                      return today === lastLogin
                    }).length}
                  </p>
                </div>
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Component: Integration Management
  const IntegrationManagement = () => {
    const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
      {
        id: '1',
        type: 'zalo',
        name: 'Zalo OA - Công ty ABC',
        status: 'connected',
        config: {
          appId: 'zalo_app_123',
          token: 'zalo_token_***',
          webhookUrl: 'https://api.company.com/webhook/zalo',
          syncFrequency: 5,
          autoTags: ['Zalo OA', 'Tự động'],
          syncLeads: true,
          syncMessages: true,
          syncForms: true
        },
        permissions: {
          connect: ['admin', 'manager'],
          edit: ['admin'],
          delete: ['admin']
        },
        lastSync: '2025-06-11T08:30:00',
        errorLog: []
      },
      {
        id: '2',
        type: 'facebook',
        name: 'Fanpage - Công ty ABC',
        status: 'error',
        config: {
          appId: 'fb_app_456',
          token: 'fb_token_***',
          webhookUrl: 'https://api.company.com/webhook/facebook',
          syncFrequency: 15,
          autoTags: ['Facebook', 'Fanpage'],
          syncLeads: true,
          syncMessages: true,
          syncForms: false
        },
        permissions: {
          connect: ['admin', 'manager'],
          edit: ['admin'],
          delete: ['admin']
        },
        lastSync: '2025-06-10T15:20:00',
        errorLog: ['Token hết hạn', 'Kết nối thất bại']
      }
    ])

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'connected':
          return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'disconnected':
          return <X className="w-5 h-5 text-gray-500" />
        case 'error':
          return <AlertTriangle className="w-5 h-5 text-red-500" />
        default:
          return <RefreshCw className="w-5 h-5 text-blue-500" />
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'connected': return 'bg-green-100 text-green-800'
        case 'disconnected': return 'bg-gray-100 text-gray-800'
        case 'error': return 'bg-red-100 text-red-800'
        default: return 'bg-blue-100 text-blue-800'
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tích hợp Zalo & Facebook</h2>
            <p className="text-gray-600">Kết nối và đồng bộ dữ liệu từ các kênh</p>
          </div>
          <Button onClick={() => setShowIntegrationModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tích hợp
          </Button>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {integration.type === 'zalo' ? (
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    ) : (
                      <Facebook className="w-8 h-8 text-blue-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>
                        {integration.type === 'zalo' ? 'Zalo Official Account' : 'Facebook Fanpage'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' ? 'Đã kết nối' :
                       integration.status === 'disconnected' ? 'Ngắt kết nối' :
                       integration.status === 'error' ? 'Lỗi' : 'Đang kết nối'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sync Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Đồng bộ Leads</span>
                    <Switch checked={integration.config.syncLeads} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Đồng bộ Tin nhắn</span>
                    <Switch checked={integration.config.syncMessages} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Đồng bộ Forms</span>
                    <Switch checked={integration.config.syncForms} />
                  </div>
                </div>

                {/* Sync Frequency */}
                <div className="flex items-center justify-between text-sm">
                  <span>Tần suất đồng bộ</span>
                  <Badge variant="outline">{integration.config.syncFrequency} phút</Badge>
                </div>

                {/* Auto Tags */}
                <div>
                  <div className="text-sm font-medium mb-2">Nhãn tự động</div>
                  <div className="flex flex-wrap gap-1">
                    {integration.config.autoTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Last Sync */}
                <div className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Đồng bộ cuối: {formatDate(integration.lastSync)}
                </div>

                {/* Error Log */}
                {integration.errorLog.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-sm font-medium text-red-800 mb-1">Lỗi gần đây:</div>
                    {integration.errorLog.slice(0, 2).map((error, index) => (
                      <div key={index} className="text-xs text-red-600">{error}</div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Cài đặt
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Đồng bộ
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tích hợp hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">
                    {integrations.filter(i => i.status === 'connected').length}
                  </p>
                </div>
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads hôm nay</p>
                  <p className="text-2xl font-bold text-blue-600">127</p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tin nhắn hôm nay</p>
                  <p className="text-2xl font-bold text-purple-600">456</p>
                </div>
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lỗi cần xử lý</p>
                  <p className="text-2xl font-bold text-red-600">
                    {integrations.reduce((acc, i) => acc + i.errorLog.length, 0)}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn thiết lập nhanh</CardTitle>
            <CardDescription>Các bước cơ bản để kết nối tích hợp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zalo Setup */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Thiết lập Zalo OA</h4>
                </div>
                <ol className="text-sm space-y-2 ml-7">
                  <li>1. Truy cập Zalo OA Dashboard</li>
                  <li>2. Tạo App và lấy App ID</li>
                  <li>3. Cấu hình Webhook URL</li>
                  <li>4. Xác thực bằng QR Code</li>
                  <li>5. Test kết nối và đồng bộ</li>
                </ol>
              </div>

              {/* Facebook Setup */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">Thiết lập Facebook Fanpage</h4>
                </div>
                <ol className="text-sm space-y-2 ml-7">
                  <li>1. Tạo Facebook App</li>
                  <li>2. Cấu hình Messenger API</li>
                  <li>3. Lấy Page Access Token</li>
                  <li>4. Thiết lập Webhook</li>
                  <li>5. Xác thực và test</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Component: Tags Management
  const TagsManagement = () => {
    const [showTagModal, setShowTagModal] = useState(false)
    const [selectedTag, setSelectedTag] = useState<CustomTag | null>(null)
    const [editingTag, setEditingTag] = useState<CustomTag | null>(null)

    const filteredTags = tags.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || tag.category === categoryFilter
      const matchesScope = tagFilter === 'all' || tag.scope === tagFilter
      
      return matchesSearch && matchesCategory && matchesScope
    })

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'lead': return 'bg-blue-100 text-blue-800'
        case 'customer': return 'bg-green-100 text-green-800'
        case 'deal': return 'bg-purple-100 text-purple-800'
        case 'task': return 'bg-orange-100 text-orange-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getScopeColor = (scope: string) => {
      switch (scope) {
        case 'global': return 'bg-indigo-100 text-indigo-800'
        case 'team': return 'bg-cyan-100 text-cyan-800'
        case 'user': return 'bg-pink-100 text-pink-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const handleCreateTag = () => {
      setSelectedTag(null)
      setEditingTag(null)
      setShowTagModal(true)
    }

    const handleEditTag = (tag: CustomTag) => {
      setSelectedTag(tag)
      setEditingTag({ ...tag })
      setShowTagModal(true)
    }

    const handleDeleteTag = (tagId: string) => {
      setTags(prev => prev.filter(t => t.id !== tagId))
    }

    const handleSaveTag = () => {
      if (editingTag) {
        if (selectedTag) {
          // Update existing tag
          setTags(prev => prev.map(t => t.id === selectedTag.id ? editingTag : t))
        } else {
          // Create new tag
          const newTag = {
            ...editingTag,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            createdBy: 'current-user'
          }
          setTags(prev => [...prev, newTag])
        }
      }
      setShowTagModal(false)
      setSelectedTag(null)
      setEditingTag(null)
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Nhãn</h2>
            <p className="text-gray-600">Tạo và quản lý nhãn để phân loại dữ liệu</p>
          </div>
          <Button onClick={handleCreateTag}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo nhãn mới
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm nhãn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="task">Công việc</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Phạm vi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phạm vi</SelectItem>
                  <SelectItem value="global">Toàn cục</SelectItem>
                  <SelectItem value="team">Nhóm</SelectItem>
                  <SelectItem value="user">Cá nhân</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất danh sách
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng số nhãn</p>
                  <p className="text-2xl font-bold text-blue-600">{tags.length}</p>
                </div>
                <Tags className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nhãn toàn cục</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tags.filter(t => t.scope === 'global').length}
                  </p>
                </div>
                <Globe className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tự động gán</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tags.filter(t => t.autoAssign.enabled).length}
                  </p>
                </div>
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nhãn mặc định</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tags.filter(t => t.isDefault).length}
                  </p>
                </div>
                <Star className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Nhãn</CardTitle>
            <CardDescription>Quản lý tất cả nhãn trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{tag.name}</h4>
                        {tag.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Mặc định
                          </Badge>
                        )}
                        {tag.autoAssign.enabled && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Tự động
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(tag.category)}>
                          {tag.category === 'lead' && 'Lead'}
                          {tag.category === 'customer' && 'Khách hàng'}
                          {tag.category === 'deal' && 'Deal'}
                          {tag.category === 'task' && 'Công việc'}
                        </Badge>
                        <Badge className={getScopeColor(tag.scope)}>
                          {tag.scope === 'global' && 'Toàn cục'}
                          {tag.scope === 'team' && 'Nhóm'}
                          {tag.scope === 'user' && 'Cá nhân'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Assignment Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Quy tắc Tự động gán</CardTitle>
            <CardDescription>Cấu hình quy tắc tự động gán nhãn dựa trên điều kiện</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tags.filter(t => t.autoAssign.enabled).map((tag) => (
                <div key={tag.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <h4 className="font-medium">{tag.name}</h4>
                      <Badge className={getCategoryColor(tag.category)}>
                        {tag.category === 'lead' && 'Lead'}
                        {tag.category === 'customer' && 'Khách hàng'}
                        {tag.category === 'deal' && 'Deal'}
                        {tag.category === 'task' && 'Công việc'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {tag.autoAssign.conditions.map((condition: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">{condition.field}</span>
                        <span>{condition.operator}</span>
                        <span className="font-medium">{condition.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {tags.filter(t => t.autoAssign.enabled).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Chưa có quy tắc tự động gán nào</p>
                  <Button variant="outline" className="mt-2" onClick={handleCreateTag}>
                    Tạo quy tắc đầu tiên
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tag Creation/Edit Modal */}
        <Dialog open={showTagModal} onOpenChange={setShowTagModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTag ? 'Chỉnh sửa nhãn' : 'Tạo nhãn mới'}
              </DialogTitle>
              <DialogDescription>
                {selectedTag 
                  ? 'Cập nhật thông tin nhãn'
                  : 'Tạo nhãn mới để phân loại dữ liệu'
                }
              </DialogDescription>
            </DialogHeader>
            
            {editingTag && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tag-name">Tên nhãn</Label>
                  <Input
                    id="tag-name"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Nhập tên nhãn"
                  />
                </div>

                <div>
                  <Label>Màu sắc</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {[
                      '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
                      '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
                    ].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${
                          editingTag.color === color ? 'border-gray-900' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTag(prev => prev ? { ...prev, color } : null)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Loại</Label>
                  <Select
                    value={editingTag.category}
                    onValueChange={(value: any) => setEditingTag(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="customer">Khách hàng</SelectItem>
                      <SelectItem value="deal">Deal</SelectItem>
                      <SelectItem value="task">Công việc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Phạm vi</Label>
                  <Select
                    value={editingTag.scope}
                    onValueChange={(value: any) => setEditingTag(prev => prev ? { ...prev, scope: value } : null)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Toàn cục</SelectItem>
                      <SelectItem value="team">Nhóm</SelectItem>
                      <SelectItem value="user">Cá nhân</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is-default">Nhãn mặc định</Label>
                  <Switch
                    id="is-default"
                    checked={editingTag.isDefault}
                    onCheckedChange={(checked) => 
                      setEditingTag(prev => prev ? { ...prev, isDefault: checked } : null)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-assign">Tự động gán</Label>
                  <Switch
                    id="auto-assign"
                    checked={editingTag.autoAssign.enabled}
                    onCheckedChange={(checked) => 
                      setEditingTag(prev => prev ? { 
                        ...prev, 
                        autoAssign: { ...prev.autoAssign, enabled: checked }
                      } : null)
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveTag}>
                {selectedTag ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Custom Role Management Component - Disabled
  const CustomRoleManagement = () => {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chức năng Vai trò không khả dụng</h3>
          <p className="text-gray-500">Chức năng quản lý vai trò đã được tắt.</p>
        </div>
      </div>
    )
  }



  // Data Template Management Component
  const DataTemplateManagement = () => {
    const [templates, setTemplates] = useState([
      {
        id: 1,
        name: 'Lead Zalo OA',
        type: 'lead',
        description: 'Mẫu cho lead từ Zalo OA',
        defaultValues: {
          source: 'zalo',
          status: 'new',
          tags: ['Zalo OA', 'Tiềm năng'],
          priority: 'medium'
        },
        requiredFields: ['name', 'phone'],
        customFields: [
          { name: 'sở_thích', type: 'text', required: false },
          { name: 'khu_vực', type: 'select', options: ['Hà Nội', 'TP.HCM', 'Đà Nẵng'], required: true }
        ],
        assignedTo: ['team_a', 'team_b'],
        createdAt: '2025-06-01',
        isActive: true
      },
      {
        id: 2,
        name: 'Đơn hàng VIP',
        type: 'order',
        description: 'Mẫu cho đơn hàng khách VIP',
        defaultValues: {
          status: 'pending_contract',
          priority: 'high',
          tags: ['VIP', 'Cao cấp'],
          discount: 10
        },
        requiredFields: ['customer', 'product', 'value'],
        customFields: [
          { name: 'ghi_chú_vip', type: 'textarea', required: true },
          { name: 'hình_thức_thanh_toán', type: 'select', options: ['Chuyển khoản', 'Tiền mặt', 'Thẻ'], required: true }
        ],
        assignedTo: ['vip_team'],
        createdAt: '2025-05-20',
        isActive: true
      },
      {
        id: 3,
        name: 'Khách hàng Doanh nghiệp',
        type: 'customer',
        description: 'Mẫu cho khách hàng doanh nghiệp',
        defaultValues: {
          type: 'business',
          tags: ['Doanh nghiệp', 'B2B'],
          category: 'enterprise'
        },
        requiredFields: ['company_name', 'contact_person', 'email', 'tax_code'],
        customFields: [
          { name: 'quy_mô_công_ty', type: 'select', options: ['Nhỏ (<50)', 'Vừa (50-200)', 'Lớn (>200)'], required: true },
          { name: 'lĩnh_vực', type: 'text', required: true }
        ],
        assignedTo: ['enterprise_team'],
        createdAt: '2025-05-15',
        isActive: true
      }
    ])
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mẫu Dữ liệu</h2>
            <p className="text-gray-600">Tạo và quản lý mẫu dữ liệu chuẩn hóa</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo mẫu mới
          </Button>
        </div>

        {/* Template Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mẫu Lead</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {templates.filter(t => t.type === 'lead').length}
                  </p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mẫu Đơn hàng</p>
                  <p className="text-2xl font-bold text-green-600">
                    {templates.filter(t => t.type === 'order').length}
                  </p>
                </div>
                <ShoppingCart className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mẫu Khách hàng</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {templates.filter(t => t.type === 'customer').length}
                  </p>
                </div>
                <UserCog className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Mẫu</CardTitle>
            <CardDescription>Quản lý tất cả mẫu dữ liệu trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={template.type === 'lead' ? 'default' : template.type === 'order' ? 'secondary' : 'outline'}>
                            {template.type === 'lead' ? 'Lead' : template.type === 'order' ? 'Đơn hàng' : 'Khách hàng'}
                          </Badge>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isActive ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              Tạm dừng
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      
                      {/* Template Details */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Trường bắt buộc:</span>
                          <div className="mt-1">
                            {template.requiredFields.map((field, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Trường tùy chỉnh:</span>
                          <div className="mt-1">
                            {template.customFields.map((field, index) => (
                              <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                {field.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Áp dụng cho:</span>
                          <div className="mt-1">
                            {template.assignedTo.map((team, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Cấu hình
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Xuất mẫu
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê Sử dụng Mẫu</CardTitle>
            <CardDescription>Hiệu quả của các mẫu dữ liệu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Badge variant={template.type === 'lead' ? 'default' : template.type === 'order' ? 'secondary' : 'outline'}>
                      {template.type === 'lead' ? 'Lead' : template.type === 'order' ? 'Đơn hàng' : 'Khách hàng'}
                    </Badge>
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div>Sử dụng: 234 lần</div>
                    <div>Thành công: 89%</div>
                    <div>Cập nhật: {formatDate(template.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access Control Management Component
  const AccessControlManagement = () => {
    const [accessSettings, setAccessSettings] = useState({
      workingHours: {
        enabled: true,
        start: '08:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      afterHours: {
        requireAuth: true,
        allowedRoles: ['admin', 'manager'],
        notificationEnabled: true
      }
    })

    const [userAccessRules, setUserAccessRules] = useState([
      {
        id: 1,
        userId: 1,
        userName: 'Nguyễn Văn An',
        role: 'sales',
        workingHours: { start: '09:00', end: '18:00' },
        allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        allowAfterHours: false,
        ipRestrictions: ['192.168.1.0/24'],
        lastAccess: '2025-06-11T15:30:00',
        status: 'active'
      },
      {
        id: 2,
        userId: 2,
        userName: 'Trần Thị Bình',
        role: 'manager',
        workingHours: { start: '08:00', end: '19:00' },
        allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        allowAfterHours: true,
        ipRestrictions: [],
        lastAccess: '2025-06-11T16:45:00',
        status: 'active'
      }
    ])

    const [accessLogs, setAccessLogs] = useState([
      {
        id: 1,
        userId: 1,
        userName: 'Nguyễn Văn An',
        action: 'login_success',
        timestamp: '2025-06-11T15:30:00',
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        status: 'allowed'
      },
      {
        id: 2,
        userId: 3,
        userName: 'Lê Minh Chánh',
        action: 'login_blocked',
        timestamp: '2025-06-11T19:30:00',
        ip: '192.168.1.101',
        device: 'Firefox/Windows',
        status: 'blocked',
        reason: 'Ngoài giờ làm việc'
      }
    ])

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kiểm soát Truy cập theo Thời gian</h2>
            <p className="text-gray-600">Quản lý quyền truy cập CRM theo thời gian và thiết bị</p>
          </div>
        </div>

        {/* Global Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt Chung</CardTitle>
            <CardDescription>Thiết lập quy tắc truy cập toàn hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Working Hours */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="working-hours">Giới hạn Giờ làm việc</Label>
                  <p className="text-sm text-gray-500">Hạn chế truy cập ngoài giờ làm việc</p>
                </div>
                <Switch
                  id="working-hours"
                  checked={accessSettings.workingHours.enabled}
                  onCheckedChange={(checked) => 
                    setAccessSettings(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, enabled: checked }
                    }))
                  }
                />
              </div>

              {accessSettings.workingHours.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>Giờ bắt đầu</Label>
                    <Input
                      type="time"
                      value={accessSettings.workingHours.start}
                      onChange={(e) => 
                        setAccessSettings(prev => ({ 
                          ...prev, 
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Giờ kết thúc</Label>
                    <Input
                      type="time"
                      value={accessSettings.workingHours.end}
                      onChange={(e) => 
                        setAccessSettings(prev => ({ 
                          ...prev, 
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* After Hours Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="after-hours-auth">Xác thực Ngoài giờ</Label>
                  <p className="text-sm text-gray-500">Yêu cầu xác thực bổ sung khi truy cập ngoài giờ</p>
                </div>
                <Switch
                  id="after-hours-auth"
                  checked={accessSettings.afterHours.requireAuth}
                  onCheckedChange={(checked) => 
                    setAccessSettings(prev => ({ 
                      ...prev, 
                      afterHours: { ...prev.afterHours, requireAuth: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="after-hours-notification">Thông báo Truy cập</Label>
                  <p className="text-sm text-gray-500">Gửi thông báo khi có truy cập ngoài giờ</p>
                </div>
                <Switch
                  id="after-hours-notification"
                  checked={accessSettings.afterHours.notificationEnabled}
                  onCheckedChange={(checked) => 
                    setAccessSettings(prev => ({ 
                      ...prev, 
                      afterHours: { ...prev.afterHours, notificationEnabled: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Access Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quy tắc Truy cập Người dùng</CardTitle>
                <CardDescription>Thiết lập quy tắc riêng cho từng người dùng</CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm quy tắc
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAccessRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{rule.userName}</h3>
                        <p className="text-sm text-gray-500">
                          {rule.role} • Truy cập cuối: {new Date(rule.lastAccess).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Giờ làm việc:</span>
                      <p className="text-gray-600">
                        {rule.workingHours.start} - {rule.workingHours.end}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ngoài giờ:</span>
                      <p className="text-gray-600">
                        {rule.allowAfterHours ? 'Cho phép' : 'Không cho phép'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hạn chế IP:</span>
                      <p className="text-gray-600">
                        {rule.ipRestrictions.length > 0 ? rule.ipRestrictions.join(', ') : 'Không có'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Nhật ký Truy cập</CardTitle>
            <CardDescription>Theo dõi các lần truy cập và vi phạm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      log.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{log.userName}</p>
                      <p className="text-sm text-gray-500">
                        {log.action === 'login_success' ? 'Đăng nhập thành công' : 
                         log.action === 'login_blocked' ? 'Đăng nhập bị chặn' : log.action}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                    <p>{log.ip} • {log.device}</p>
                    {log.reason && <p className="text-red-600">{log.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Activity Log Management Component
  const ActivityLogManagement = () => {
    const [activityLogs, setActivityLogs] = useState([
      {
        id: 1,
        userId: 1,
        userName: 'Nguyễn Văn An',
        userRole: 'sales',
        module: 'leads',
        action: 'create',
        details: 'Tạo lead mới: Trần Thị C',
        entityId: 'lead_123',
        entityType: 'lead',
        timestamp: '2025-06-11T15:30:00',
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        status: 'success'
      },
      {
        id: 2,
        userId: 2,
        userName: 'Trần Thị Bình',
        userRole: 'manager',
        module: 'deals',
        action: 'update',
        details: 'Cập nhật trạng thái deal #456 từ "Đàm phán" thành "Đóng thành công"',
        entityId: 'deal_456',
        entityType: 'deal',
        timestamp: '2025-06-11T14:20:00',
        ip: '192.168.1.101',
        device: 'Firefox/Windows',
        status: 'success'
      },
      {
        id: 3,
        userId: 1,
        userName: 'Nguyễn Văn An',
        userRole: 'sales',
        module: 'customers',
        action: 'export',
        details: 'Xuất danh sách khách hàng (50 records)',
        entityId: null,
        entityType: 'customer',
        timestamp: '2025-06-11T13:45:00',
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        status: 'success'
      },
      {
        id: 4,
        userId: 3,
        userName: 'Lê Minh Chánh',
        userRole: 'sales',
        module: 'reports',
        action: 'view',
        details: 'Xem báo cáo doanh số tháng 6',
        entityId: 'report_789',
        entityType: 'report',
        timestamp: '2025-06-11T12:30:00',
        ip: '192.168.1.102',
        device: 'Safari/MacOS',
        status: 'success'
      },
      {
        id: 5,
        userId: 4,
        userName: 'Phạm Thị Dung',
        userRole: 'admin',
        module: 'users',
        action: 'update_permissions',
        details: 'Cập nhật quyền cho người dùng Nguyễn Văn An',
        entityId: 'user_1',
        entityType: 'user',
        timestamp: '2025-06-11T11:15:00',
        ip: '192.168.1.103',
        device: 'Chrome/Windows',
        status: 'success'
      }
    ])

    const [filterModule, setFilterModule] = useState('all')
    const [filterAction, setFilterAction] = useState('all')
    const [filterUser, setFilterUser] = useState('all')
    const [filterDate, setFilterDate] = useState('')

    const modules = [
      { value: 'all', label: 'Tất cả module' },
      { value: 'leads', label: 'Leads' },
      { value: 'deals', label: 'Deals' },
      { value: 'customers', label: 'Khách hàng' },
      { value: 'reports', label: 'Báo cáo' },
      { value: 'users', label: 'Người dùng' },
      { value: 'settings', label: 'Cài đặt' }
    ]

    const actions = [
      { value: 'all', label: 'Tất cả hành động' },
      { value: 'create', label: 'Tạo mới' },
      { value: 'update', label: 'Cập nhật' },
      { value: 'delete', label: 'Xóa' },
      { value: 'view', label: 'Xem' },
      { value: 'export', label: 'Xuất dữ liệu' },
      { value: 'import', label: 'Nhập dữ liệu' }
    ]

    const filteredLogs = activityLogs.filter(log => {
      const moduleMatch = filterModule === 'all' || log.module === filterModule
      const actionMatch = filterAction === 'all' || log.action === filterAction
      const userMatch = filterUser === 'all' || log.userId.toString() === filterUser
      const dateMatch = !filterDate || new Date(log.timestamp).toDateString() === new Date(filterDate).toDateString()
      
      return moduleMatch && actionMatch && userMatch && dateMatch
    })

    const getActionIcon = (action: string) => {
      switch (action) {
        case 'create': return <Plus className="w-4 h-4 text-green-600" />
        case 'update': return <Edit2 className="w-4 h-4 text-blue-600" />
        case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />
        case 'view': return <Eye className="w-4 h-4 text-gray-600" />
        case 'export': return <Download className="w-4 h-4 text-purple-600" />
        case 'import': return <Upload className="w-4 h-4 text-orange-600" />
        default: return <Activity className="w-4 h-4 text-gray-600" />
      }
    }

    const getModuleIcon = (module: string) => {
      switch (module) {
        case 'leads': return <Users className="w-4 h-4 text-blue-600" />
        case 'deals': return <Target className="w-4 h-4 text-green-600" />
        case 'customers': return <UserCog className="w-4 h-4 text-purple-600" />
        case 'reports': return <BarChart3 className="w-4 h-4 text-orange-600" />
        case 'users': return <User2 className="w-4 h-4 text-gray-600" />
        case 'settings': return <Settings className="w-4 h-4 text-gray-600" />
        default: return <Activity className="w-4 h-4 text-gray-600" />
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nhật ký Hoạt động Người dùng</h2>
            <p className="text-gray-600">Theo dõi và kiểm soát mọi hoạt động trong hệ thống</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất nhật ký
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Lọc nâng cao
            </Button>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng hoạt động</p>
                  <p className="text-2xl font-bold text-blue-600">{activityLogs.length}</p>
                </div>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activityLogs.filter(log => 
                      new Date(log.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(activityLogs.map(log => log.userId)).size}
                  </p>
                </div>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Module phổ biến</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {activityLogs.reduce((acc, log) => {
                      acc[log.module] = (acc[log.module] || 0) + 1
                      return acc
                    }, {} as any) && Object.entries(activityLogs.reduce((acc, log) => {
                      acc[log.module] = (acc[log.module] || 0) + 1
                      return acc
                    }, {} as any)).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Lọc nhật ký theo các tiêu chí</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Module</Label>
                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.value} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hành động</Label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Người dùng</Label>
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    {Array.from(new Set(activityLogs.map(log => ({ id: log.userId, name: log.userName }))))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày</Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Nhật ký Hoạt động ({filteredLogs.length})</CardTitle>
            <CardDescription>Danh sách chi tiết các hoạt động trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getModuleIcon(log.module)}
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Module: {log.module}</span>
                        <span>IP: {log.ip}</span>
                        <span>Thiết bị: {log.device}</span>
                        {log.entityId && <span>ID: {log.entityId}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có nhật ký</h3>
                <p className="text-gray-500">Không tìm thấy hoạt động nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // System History Management Component
  const SystemHistoryManagement = () => {
    const [systemHistory, setSystemHistory] = useState([
      {
        id: 1,
        category: 'user_management',
        action: 'create_user',
        details: 'Tạo tài khoản người dùng mới: Nguyễn Văn E',
        performedBy: 'Phạm Thị Dung',
        performedByRole: 'admin',
        timestamp: '2025-06-11T16:30:00',
        affectedEntities: ['user_5'],
        changes: {
          before: null,
          after: {
            name: 'Nguyễn Văn E',
            role: 'sales',
            email: 'nguyenvane@company.com',
            status: 'active'
          }
        },
        ip: '192.168.1.103',
        status: 'success'
      },
      {
        id: 2,
        category: 'permissions',
        action: 'update_role_permissions',
        details: 'Cập nhật quyền cho vai trò "Sales": thêm quyền xuất báo cáo',
        performedBy: 'Phạm Thị Dung',
        performedByRole: 'admin',
        timestamp: '2025-06-11T15:45:00',
        affectedEntities: ['role_sales'],
        changes: {
          before: { reports: { export: false } },
          after: { reports: { export: true } }
        },
        ip: '192.168.1.103',
        status: 'success'
      },
      {
        id: 3,
        category: 'security',
        action: 'enable_2fa',
        details: 'Kích hoạt xác thực 2 yếu tố cho toàn hệ thống',
        performedBy: 'Phạm Thị Dung',
        performedByRole: 'admin',
        timestamp: '2025-06-11T14:20:00',
        affectedEntities: ['system_security'],
        changes: {
          before: { twoFactorEnabled: false },
          after: { twoFactorEnabled: true }
        },
        ip: '192.168.1.103',
        status: 'success'
      },
      {
        id: 4,
        category: 'workflow',
        action: 'create_stage',
        details: 'Tạo giai đoạn mới trong quy trình sales: "Tư vấn chi tiết"',
        performedBy: 'Trần Thị Bình',
        performedByRole: 'manager',
        timestamp: '2025-06-11T13:15:00',
        affectedEntities: ['sales_workflow'],
        changes: {
          before: { stages: 4 },
          after: { stages: 5, newStage: 'Tư vấn chi tiết' }
        },
        ip: '192.168.1.101',
        status: 'success'
      },
      {
        id: 5,
        category: 'integration',
        action: 'connect_zalo_oa',
        details: 'Kết nối Zalo OA mới: VileLead Official',
        performedBy: 'Phạm Thị Dung',
        performedByRole: 'admin',
        timestamp: '2025-06-11T12:00:00',
        affectedEntities: ['zalo_integration'],
        changes: {
          before: { connectedAccounts: 1 },
          after: { connectedAccounts: 2, newAccount: 'VileLead Official' }
        },
        ip: '192.168.1.103',
        status: 'success'
      },
      {
        id: 6,
        category: 'interface',
        action: 'update_theme',
        details: 'Thay đổi theme hệ thống từ Light sang Dark',
        performedBy: 'Nguyễn Văn An',
        performedByRole: 'sales',
        timestamp: '2025-06-11T11:30:00',
        affectedEntities: ['user_interface'],
        changes: {
          before: { theme: 'light' },
          after: { theme: 'dark' }
        },
        ip: '192.168.1.100',
        status: 'success'
      }
    ])

    const [filterCategory, setFilterCategory] = useState('all')
    const [filterPerformer, setFilterPerformer] = useState('all')
    const [filterDateRange, setFilterDateRange] = useState('')

    const categories = [
      { value: 'all', label: 'Tất cả danh mục', icon: Settings },
      { value: 'user_management', label: 'Quản lý người dùng', icon: Users },
      { value: 'permissions', label: 'Phân quyền', icon: Shield },
      { value: 'security', label: 'Bảo mật', icon: Lock },
      { value: 'workflow', label: 'Quy trình', icon: Workflow },
      { value: 'integration', label: 'Tích hợp', icon: Zap },
      { value: 'interface', label: 'Giao diện', icon: Monitor }
    ]

    const filteredHistory = systemHistory.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory
      const performerMatch = filterPerformer === 'all' || item.performedBy === filterPerformer
      const dateMatch = !filterDateRange || new Date(item.timestamp).toDateString() === new Date(filterDateRange).toDateString()
      
      return categoryMatch && performerMatch && dateMatch
    })

    const getCategoryIcon = (category: string) => {
      const categoryObj = categories.find(c => c.value === category)
      const IconComponent = categoryObj?.icon || Settings
      return <IconComponent className="w-4 h-4" />
    }

    const getCategoryColor = (category: string) => {
      const colors = {
        user_management: 'text-blue-600 bg-blue-100',
        permissions: 'text-green-600 bg-green-100',
        security: 'text-red-600 bg-red-100',
        workflow: 'text-purple-600 bg-purple-100',
        integration: 'text-orange-600 bg-orange-100',
        interface: 'text-gray-600 bg-gray-100'
      }
      return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100'
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lịch sử Hệ thống</h2>
            <p className="text-gray-600">Theo dõi tất cả thay đổi cấu hình và cài đặt hệ thống</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất lịch sử
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng thay đổi</p>
                  <p className="text-2xl font-bold text-blue-600">{systemHistory.length}</p>
                </div>
                <History className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                  <p className="text-2xl font-bold text-green-600">
                    {systemHistory.filter(item => 
                      new Date(item.timestamp).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin thực hiện</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {systemHistory.filter(item => item.performedByRole === 'admin').length}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Thành công</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {systemHistory.filter(item => item.status === 'success').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Lọc lịch sử theo danh mục và người thực hiện</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Danh mục</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Người thực hiện</Label>
                <Select value={filterPerformer} onValueChange={setFilterPerformer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    {Array.from(new Set(systemHistory.map(item => item.performedBy)))
                      .map((performer) => (
                        <SelectItem key={performer} value={performer}>
                          {performer}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày</Label>
                <Input
                  type="date"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Dòng thời gian Lịch sử ({filteredHistory.length})</CardTitle>
            <CardDescription>Theo dõi chi tiết các thay đổi hệ thống theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline line */}
                  {index !== filteredHistory.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {categories.find(c => c.value === item.category)?.label || item.category}
                          </Badge>
                          <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                            {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mt-2">{item.details}</h3>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Thực hiện bởi:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span>{item.performedBy}</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.performedByRole}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Đối tượng bị ảnh hưởng:</span>
                          <div className="mt-1">
                            {item.affectedEntities.map((entity, index) => (
                              <Badge key={index} variant="outline" className="mr-1 text-xs">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Changes Details */}
                      {item.changes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Chi tiết thay đổi:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-red-600">Trước:</span>
                              <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                {item.changes.before ? JSON.stringify(item.changes.before, null, 2) : 'Không có'}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium text-green-600">Sau:</span>
                              <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(item.changes.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        IP: {item.ip}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch sử</h3>
                <p className="text-gray-500">Không tìm thấy thay đổi nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          <p className="text-gray-600">Quản lý cấu hình và bảo mật hệ thống CRM</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất cấu hình
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="company">Công ty</TabsTrigger>
          <TabsTrigger value="workflow">Quy trình</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="interface">Giao diện</TabsTrigger>
          <TabsTrigger value="integrations">Tích hợp</TabsTrigger>
          <TabsTrigger value="tags">Nhãn</TabsTrigger>
          <TabsTrigger value="templates">Mẫu dữ liệu</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <CompanyManagement />
        </TabsContent>

        {/* Other tabs content will be implemented */}
        <TabsContent value="workflow" className="mt-6">
          <WorkflowManagement />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityManagement />
        </TabsContent>

        <TabsContent value="interface" className="mt-6">
          <InterfaceManagement />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationManagement />
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <TagsManagement />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <DataTemplateManagement />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityLogManagement />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SystemHistoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
