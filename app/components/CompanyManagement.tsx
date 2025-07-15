'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Edit,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Target,
  DollarSign,
  Filter,
  Download,
  Settings,
  MoreVertical,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Interfaces
interface Employee {
  id: number
  name: string
  email: string
  phone: string
  position: string
  department: string
  departmentId: number
  teamId: number
  teamName: string
  hireDate: string
  officialDate: string // Ngày lên chính thức
  salary: number
  status: 'active' | 'inactive' | 'probation'
  performance: number
  avatar?: string
}

interface Department {
  id: number
  name: string
  description: string
  managerId: number
  managerName: string
  employeeCount: number
  budget: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface Team {
  id: number
  name: string
  departmentId: number
  departmentName: string
  leaderId: number
  leaderName: string
  memberCount: number
  description: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
}

interface RolePermissions {
  leads: {
    view: 'all' | 'team' | 'department' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  deals: {
    view: 'all' | 'team' | 'department' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  customers: {
    view: 'all' | 'team' | 'department' | 'own' | 'none'
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  reports: {
    view: 'all' | 'team' | 'department' | 'own' | 'none'
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

interface Role {
  id: number
  name: string
  description: string
  permissions: RolePermissions
  assignedUsers: number
  departmentIds: number[]
  teamIds: number[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// Sample Data
const sampleEmployees: Employee[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@company.com",
    phone: "0901234567",
    position: "Sales Manager",
    department: "Kinh doanh",
    departmentId: 1,
    teamId: 1,
    teamName: "Sales Team A",
    hireDate: "2023-01-15",
    officialDate: "2023-04-15",
    salary: 25000000,
    status: "active",
    performance: 92,
    avatar: "/avatars/an.jpg"
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "tran.thi.binh@company.com",
    phone: "0901234568",
    position: "Sales Director",
    department: "Kinh doanh",
    departmentId: 1,
    teamId: 2,
    teamName: "Sales Team B",
    hireDate: "2022-03-20",
    officialDate: "2022-06-20",
    salary: 35000000,
    status: "active",
    performance: 88,
    avatar: "/avatars/binh.jpg"
  },
  {
    id: 3,
    name: "Lê Minh Chánh",
    email: "le.minh.chanh@company.com",
    phone: "0901234569",
    position: "Marketing Specialist",
    department: "Marketing",
    departmentId: 2,
    teamId: 3,
    teamName: "Marketing Team",
    hireDate: "2023-06-10",
    officialDate: "2023-09-10",
    salary: 18000000,
    status: "active",
    performance: 85
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "pham.thi.dung@company.com",
    phone: "0901234570",
    position: "HR Manager",
    department: "Nhân sự",
    departmentId: 3,
    teamId: 4,
    teamName: "HR Team",
    hireDate: "2022-11-05",
    officialDate: "2023-02-05",
    salary: 22000000,
    status: "active",
    performance: 90
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    email: "hoang.van.em@company.com",
    phone: "0901234571",
    position: "Junior Developer",
    department: "Công nghệ",
    departmentId: 4,
    teamId: 5,
    teamName: "Dev Team",
    hireDate: "2024-01-20",
    officialDate: "2024-04-20",
    salary: 15000000,
    status: "probation",
    performance: 78
  }
]

const sampleDepartments: Department[] = [
  {
    id: 1,
    name: "Phòng Kinh doanh",
    description: "Phụ trách bán hàng và phát triển khách hàng",
    managerId: 2,
    managerName: "Trần Thị Bình",
    employeeCount: 8,
    budget: 500000000,
    status: "active",
    createdAt: "2022-01-01"
  },
  {
    id: 2,
    name: "Phòng Marketing",
    description: "Phụ trách marketing và truyền thông",
    managerId: 3,
    managerName: "Lê Minh Chánh",
    employeeCount: 4,
    budget: 200000000,
    status: "active",
    createdAt: "2022-01-01"
  },
  {
    id: 3,
    name: "Phòng Nhân sự",
    description: "Quản lý nhân sự và tuyển dụng",
    managerId: 4,
    managerName: "Phạm Thị Dung",
    employeeCount: 3,
    budget: 150000000,
    status: "active",
    createdAt: "2022-01-01"
  },
  {
    id: 4,
    name: "Phòng Công nghệ",
    description: "Phát triển và bảo trì hệ thống",
    managerId: 5,
    managerName: "Hoàng Văn Em",
    employeeCount: 6,
    budget: 300000000,
    status: "active",
    createdAt: "2022-01-01"
  }
]

const sampleTeams: Team[] = [
  {
    id: 1,
    name: "Sales Team A",
    departmentId: 1,
    departmentName: "Phòng Kinh doanh",
    leaderId: 1,
    leaderName: "Nguyễn Văn An",
    memberCount: 4,
    description: "Nhóm bán hàng khu vực miền Bắc",
    status: "active",
    createdAt: "2022-01-15"
  },
  {
    id: 2,
    name: "Sales Team B",
    departmentId: 1,
    departmentName: "Phòng Kinh doanh",
    leaderId: 2,
    leaderName: "Trần Thị Bình",
    memberCount: 4,
    description: "Nhóm bán hàng khu vực miền Nam",
    status: "active",
    createdAt: "2022-02-01"
  },
  {
    id: 3,
    name: "Marketing Team",
    departmentId: 2,
    departmentName: "Phòng Marketing",
    leaderId: 3,
    leaderName: "Lê Minh Chánh",
    memberCount: 4,
    description: "Nhóm marketing tổng thể",
    status: "active",
    createdAt: "2022-03-01"
  }
]

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "CRM Pro",
    description: "Phần mềm CRM chuyên nghiệp cho doanh nghiệp vừa và nhỏ",
    price: 2000000,
    status: "active",
    createdAt: "2023-01-01"
  },
  {
    id: 2,
    name: "CRM Enterprise",
    description: "Phần mềm CRM doanh nghiệp với đầy đủ tính năng nâng cao",
    price: 5000000,
    status: "active",
    createdAt: "2023-02-01"
  },
  {
    id: 3,
    name: "Marketing Suite",
    description: "Bộ công cụ marketing tự động và quản lý chiến dịch",
    price: 1500000,
    status: "active",
    createdAt: "2023-03-01"
  }
]

const sampleRoles: Role[] = [
  {
    id: 1,
    name: "Quản trị viên",
    description: "Quyền hạn cao nhất, quản lý toàn bộ hệ thống",
    permissions: {
      leads: { view: 'all', create: true, edit: true, delete: true, export: true },
      deals: { view: 'all', create: true, edit: true, delete: true, export: true },
      customers: { view: 'all', create: true, edit: true, delete: true, export: true },
      reports: { view: 'all', create: true, export: true, customReports: true },
      settings: { userManagement: true, systemSettings: true, integrations: true, security: true }
    },
    assignedUsers: 2,
    departmentIds: [1, 2, 3, 4],
    teamIds: [1, 2, 3],
    status: "active",
    createdAt: "2023-01-01",
    updatedAt: "2025-01-10"
  },
  {
    id: 2,
    name: "Trưởng phòng Sales",
    description: "Quản lý nhóm sales với quyền hạn mở rộng",
    permissions: {
      leads: { view: 'department', create: true, edit: true, delete: false, export: true },
      deals: { view: 'department', create: true, edit: true, delete: false, export: true },
      customers: { view: 'department', create: true, edit: true, delete: false, export: false },
      reports: { view: 'department', create: true, export: true, customReports: true },
      settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
    },
    assignedUsers: 3,
    departmentIds: [1],
    teamIds: [1, 2],
    status: "active",
    createdAt: "2023-02-15",
    updatedAt: "2025-01-08"
  },
  {
    id: 3,
    name: "Nhân viên Marketing",
    description: "Tập trung vào lead generation và marketing campaigns",
    permissions: {
      leads: { view: 'all', create: true, edit: true, delete: false, export: true },
      deals: { view: 'none', create: false, edit: false, delete: false, export: false },
      customers: { view: 'own', create: false, edit: false, delete: false, export: false },
      reports: { view: 'own', create: false, export: false, customReports: false },
      settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
    },
    assignedUsers: 4,
    departmentIds: [2],
    teamIds: [3],
    status: "active",
    createdAt: "2023-03-01",
    updatedAt: "2025-01-05"
  },
  {
    id: 4,
    name: "Nhân viên Sales",
    description: "Nhân viên bán hàng với quyền hạn cơ bản",
    permissions: {
      leads: { view: 'team', create: true, edit: true, delete: false, export: false },
      deals: { view: 'team', create: true, edit: true, delete: false, export: false },
      customers: { view: 'own', create: true, edit: true, delete: false, export: false },
      reports: { view: 'own', create: false, export: false, customReports: false },
      settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
    },
    assignedUsers: 8,
    departmentIds: [1],
    teamIds: [1, 2],
    status: "active",
    createdAt: "2023-04-01",
    updatedAt: "2024-12-20"
  },
  {
    id: 5,
    name: "Hỗ trợ khách hàng",
    description: "Chăm sóc và hỗ trợ khách hàng",
    permissions: {
      leads: { view: 'none', create: false, edit: false, delete: false, export: false },
      deals: { view: 'none', create: false, edit: false, delete: false, export: false },
      customers: { view: 'all', create: false, edit: true, delete: false, export: false },
      reports: { view: 'none', create: false, export: false, customReports: false },
      settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
    },
    assignedUsers: 3,
    departmentIds: [3],
    teamIds: [4],
    status: "active",
    createdAt: "2023-05-01",
    updatedAt: "2024-11-15"
  }
]

export default function CompanyManagement() {
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Modal states for quick actions
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showOfficialDateModal, setShowOfficialDateModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false)
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showRoleDetailModal, setShowRoleDetailModal] = useState(false)
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false)
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees)
  const [departments, setDepartments] = useState<Department[]>(sampleDepartments)
  const [teams, setTeams] = useState<Team[]>(sampleTeams)
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [roles, setRoles] = useState<Role[]>(sampleRoles)

  // Role filter states
  const [roleViewFilter, setRoleViewFilter] = useState<'all' | 'department' | 'team'>('all')
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('')

  // Form data for quick actions
  const [newPosition, setNewPosition] = useState('')
  const [newDepartmentId, setNewDepartmentId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newOfficialDate, setNewOfficialDate] = useState('')
  const [newSalary, setNewSalary] = useState('')

  // Edit form data
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({})

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Ngừng hoạt động</Badge>
      case 'probation':
        return <Badge className="bg-yellow-100 text-yellow-800">Thử việc</Badge>
      case 'discontinued':
        return <Badge className="bg-gray-100 text-gray-800">Ngừng sản xuất</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Filter functions
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (roleViewFilter === 'department' && selectedDepartmentFilter) {
      return role.departmentIds.includes(parseInt(selectedDepartmentFilter))
    }
    
    if (roleViewFilter === 'team' && selectedTeamFilter) {
      return role.teamIds.includes(parseInt(selectedTeamFilter))
    }
    
    return true
  })

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    if (!selectedEmployee) return

    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        switch (action) {
          case 'position':
            return { ...emp, position: newPosition }
          case 'department':
            const dept = sampleDepartments.find(d => d.id === parseInt(newDepartmentId))
            return { 
              ...emp, 
              departmentId: parseInt(newDepartmentId),
              department: dept?.name || emp.department
            }
          case 'status':
            return { ...emp, status: newStatus as Employee['status'] }
          case 'officialDate':
            return { ...emp, officialDate: newOfficialDate }
          case 'salary':
            return { ...emp, salary: parseInt(newSalary) }
          default:
            return emp
        }
      }
      return emp
    })

    setEmployees(updatedEmployees)
    
    // Reset form data and close modals
    setNewPosition('')
    setNewDepartmentId('')
    setNewStatus('')
    setNewOfficialDate('')
    setNewSalary('')
    setShowPositionModal(false)
    setShowDepartmentModal(false)
    setShowStatusModal(false)
    setShowOfficialDateModal(false)
    setShowSalaryModal(false)
    setSelectedEmployee(null)
  }

  const handleEditEmployee = () => {
    if (!selectedEmployee) return

    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        return { ...emp, ...editFormData }
      }
      return emp
    })

    setEmployees(updatedEmployees)
    setEditFormData({})
    setShowEditModal(false)
    setSelectedEmployee(null)
  }

  // Add new handlers
  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newId = Math.max(...employees.map(e => e.id), 0) + 1
    const newEmployee: Employee = {
      ...employeeData,
      id: newId
    }
    setEmployees([...employees, newEmployee])
    setShowAddEmployeeModal(false)
  }

  const handleAddDepartment = (departmentData: Omit<Department, 'id'>) => {
    const newId = Math.max(...departments.map(d => d.id), 0) + 1
    const newDepartment: Department = {
      ...departmentData,
      id: newId
    }
    setDepartments([...departments, newDepartment])
    setShowAddDepartmentModal(false)
  }

  const handleAddTeam = (teamData: Omit<Team, 'id'>) => {
    const newId = Math.max(...teams.map(t => t.id), 0) + 1
    const newTeam: Team = {
      ...teamData,
      id: newId
    }
    setTeams([...teams, newTeam])
    setShowAddTeamModal(false)
  }

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    const newProduct: Product = {
      ...productData,
      id: newId
    }
    setProducts([...products, newProduct])
    setShowAddProductModal(false)
  }

  const handleAddRole = (roleData: Omit<Role, 'id'>) => {
    const newId = Math.max(...roles.map(r => r.id), 0) + 1
    const newRole: Role = {
      ...roleData,
      id: newId
    }
    setRoles([...roles, newRole])
    setShowAddRoleModal(false)
  }

  const handleEditRole = (roleData: Partial<Role>) => {
    if (!selectedRole) return

    const updatedRoles = roles.map(role => {
      if (role.id === selectedRole.id) {
        return { ...role, ...roleData, updatedAt: new Date().toISOString().split('T')[0] }
      }
      return role
    })

    setRoles(updatedRoles)
    setShowEditRoleModal(false)
    setSelectedRole(null)
  }

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      setRoles(roles.filter(role => role.id !== roleId))
    }
  }

  // Edit handlers for Department, Team, Product
  const handleEditDepartment = (departmentData: Partial<Department>) => {
    if (!selectedDepartment) return

    const updatedDepartments = departments.map(dept => {
      if (dept.id === selectedDepartment.id) {
        return { ...dept, ...departmentData, updatedAt: new Date().toISOString().split('T')[0] }
      }
      return dept
    })

    setDepartments(updatedDepartments)
    setShowEditDepartmentModal(false)
    setSelectedDepartment(null)
  }

  const handleEditTeam = (teamData: Partial<Team>) => {
    if (!selectedTeam) return

    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeam.id) {
        return { ...team, ...teamData, updatedAt: new Date().toISOString().split('T')[0] }
      }
      return team
    })

    setTeams(updatedTeams)
    setShowEditTeamModal(false)
    setSelectedTeam(null)
  }

  const handleEditProduct = (productData: Partial<Product>) => {
    if (!selectedProduct) return

    const updatedProducts = products.map(product => {
      if (product.id === selectedProduct.id) {
        return { ...product, ...productData, updatedAt: new Date().toISOString().split('T')[0] }
      }
      return product
    })

    setProducts(updatedProducts)
    setShowEditProductModal(false)
    setSelectedProduct(null)
  }

  // Add Form Components
  const AddEmployeeForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: Omit<Employee, 'id'>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      position: '',
      departmentId: '',
      department: '',
      teamId: 1,
      teamName: 'Default Team',
      hireDate: new Date().toISOString().split('T')[0],
      officialDate: '',
      salary: 0,
      status: 'probation' as Employee['status'],
      performance: 0
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.email || !formData.departmentId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const dept = departments.find(d => d.id === parseInt(formData.departmentId))
      onSubmit({
        ...formData,
        departmentId: parseInt(formData.departmentId),
        department: dept?.name || '',
        salary: Number(formData.salary),
        performance: Number(formData.performance)
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Họ tên *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập họ tên"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="0901234567"
            />
          </div>
          <div>
            <Label htmlFor="position">Vị trí</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Nhập vị trí công việc"
            />
          </div>
          <div>
            <Label htmlFor="department">Phòng ban *</Label>
            <Select value={formData.departmentId} onValueChange={(value) => {
              const dept = departments.find(d => d.id === parseInt(value))
              setFormData({
                ...formData, 
                departmentId: value,
                department: dept?.name || ''
              })
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salary">Lương (VND)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="hireDate">Ngày vào làm</Label>
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="officialDate">Ngày chính thức</Label>
            <Input
              id="officialDate"
              type="date"
              value={formData.officialDate}
              onChange={(e) => setFormData({...formData, officialDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Employee['status']})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                <SelectItem value="probation">Thử việc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="performance">Hiệu suất (%)</Label>
            <Input
              id="performance"
              type="number"
              min="0"
              max="100"
              value={formData.performance}
              onChange={(e) => setFormData({...formData, performance: Number(e.target.value)})}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Thêm nhân viên
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const AddDepartmentForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: Omit<Department, 'id'>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      managerId: '',
      managerName: '',
      employeeCount: 0,
      budget: 0,
      status: 'active' as Department['status'],
      createdAt: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.managerId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const manager = employees.find(emp => emp.id === parseInt(formData.managerId))
      onSubmit({
        ...formData,
        managerId: parseInt(formData.managerId),
        managerName: manager?.name || '',
        budget: Number(formData.budget)
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="deptName">Tên phòng ban *</Label>
          <Input
            id="deptName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên phòng ban"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả chức năng phòng ban"
          />
        </div>
        <div>
          <Label htmlFor="manager">Trưởng phòng *</Label>
          <Select value={formData.managerId} onValueChange={(value) => {
            const manager = employees.find(emp => emp.id === parseInt(value))
            setFormData({
              ...formData, 
              managerId: value,
              managerName: manager?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trưởng phòng" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} - {emp.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budget">Ngân sách (VND)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="deptStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Department['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Thêm phòng ban
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const AddTeamForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: Omit<Team, 'id'>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      departmentId: '',
      departmentName: '',
      leaderId: '',
      leaderName: '',
      memberCount: 0,
      description: '',
      status: 'active' as Team['status'],
      createdAt: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.departmentId || !formData.leaderId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const dept = departments.find(d => d.id === parseInt(formData.departmentId))
      const leader = employees.find(emp => emp.id === parseInt(formData.leaderId))
      onSubmit({
        ...formData,
        departmentId: parseInt(formData.departmentId),
        departmentName: dept?.name || '',
        leaderId: parseInt(formData.leaderId),
        leaderName: leader?.name || ''
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="teamName">Tên nhóm *</Label>
          <Input
            id="teamName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên nhóm"
            required
          />
        </div>
        <div>
          <Label htmlFor="teamDepartment">Phòng ban *</Label>
          <Select value={formData.departmentId} onValueChange={(value) => {
            const dept = departments.find(d => d.id === parseInt(value))
            setFormData({
              ...formData, 
              departmentId: value,
              departmentName: dept?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="teamLeader">Trưởng nhóm *</Label>
          <Select value={formData.leaderId} onValueChange={(value) => {
            const leader = employees.find(emp => emp.id === parseInt(value))
            setFormData({
              ...formData, 
              leaderId: value,
              leaderName: leader?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trưởng nhóm" />
            </SelectTrigger>
            <SelectContent>
              {employees.filter(emp => 
                formData.departmentId ? emp.departmentId === parseInt(formData.departmentId) : true
              ).map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} - {emp.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="teamDescription">Mô tả</Label>
          <Input
            id="teamDescription"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả nhiệm vụ và chức năng nhóm"
          />
        </div>
        <div>
          <Label htmlFor="teamStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Team['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Thêm nhóm
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const AddProductForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: Omit<Product, 'id'>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      status: 'active' as Product['status'],
      createdAt: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || formData.price <= 0) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="productName">Tên sản phẩm *</Label>
          <Input
            id="productName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>
        <div>
          <Label htmlFor="productDescription">Mô tả sản phẩm</Label>
          <Input
            id="productDescription"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả chi tiết về sản phẩm"
          />
        </div>
        <div>
          <Label htmlFor="productPrice">Giá sản phẩm (VND) *</Label>
          <Input
            id="productPrice"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="productStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Product['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              <SelectItem value="discontinued">Ngừng sản xuất</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Thêm sản phẩm
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const AddRoleForm = ({ onSubmit, onCancel, initialData }: {
    onSubmit: (data: Omit<Role, 'id'>) => void
    onCancel: () => void
    initialData?: Role
  }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || '',
      description: initialData?.description || '',
      permissions: initialData?.permissions || {
        leads: { view: 'own' as const, create: false, edit: false, delete: false, export: false },
        deals: { view: 'own' as const, create: false, edit: false, delete: false, export: false },
        customers: { view: 'own' as const, create: false, edit: false, delete: false, export: false },
        reports: { view: 'own' as const, create: false, export: false, customReports: false },
        settings: { userManagement: false, systemSettings: false, integrations: false, security: false }
      },
      assignedUsers: initialData?.assignedUsers || 0,
      departmentIds: initialData?.departmentIds || [] as number[],
      teamIds: initialData?.teamIds || [] as number[],
      status: (initialData?.status as Role['status']) || 'active' as Role['status'],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    })

    // Reset form data when initialData changes
    useEffect(() => {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description,
          permissions: initialData.permissions,
          assignedUsers: initialData.assignedUsers,
          departmentIds: initialData.departmentIds,
          teamIds: initialData.teamIds,
          status: initialData.status,
          createdAt: initialData.createdAt,
          updatedAt: new Date().toISOString().split('T')[0]
        })
      }
    }, [initialData])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.description) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      onSubmit(formData)
    }

    const handlePermissionChange = (
      module: keyof RolePermissions, 
      permission: string, 
      value: any
    ) => {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...prev.permissions[module],
            [permission]: value
          }
        }
      }))
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roleName">Tên vai trò *</Label>
            <Input
              id="roleName"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập tên vai trò"
              required
            />
          </div>
          <div>
            <Label htmlFor="roleStatus">Trạng thái</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Role['status']})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="roleDescription">Mô tả *</Label>
          <Input
            id="roleDescription"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả vai trò và trách nhiệm"
            required
          />
        </div>

        <div>
          <Label>Phòng ban áp dụng</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {departments.map((dept) => (
              <label key={dept.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.departmentIds.includes(dept.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        departmentIds: [...prev.departmentIds, dept.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        departmentIds: prev.departmentIds.filter(id => id !== dept.id)
                      }))
                    }
                  }}
                />
                <span className="text-sm">{dept.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Nhóm áp dụng</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {teams.map((team) => (
              <label key={team.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.teamIds.includes(team.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        teamIds: [...prev.teamIds, team.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        teamIds: prev.teamIds.filter(id => id !== team.id)
                      }))
                    }
                  }}
                />
                <span className="text-sm">{team.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Phân quyền</h3>
          
          {/* Leads Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Quyền xem</Label>
                <Select 
                  value={formData.permissions.leads.view} 
                  onValueChange={(value) => handlePermissionChange('leads', 'view', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không xem</SelectItem>
                    <SelectItem value="own">Chỉ của mình</SelectItem>
                    <SelectItem value="team">Cùng nhóm</SelectItem>
                    <SelectItem value="department">Cùng phòng ban</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.leads.create}
                    onChange={(e) => handlePermissionChange('leads', 'create', e.target.checked)}
                  />
                  <span>Tạo mới</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.leads.edit}
                    onChange={(e) => handlePermissionChange('leads', 'edit', e.target.checked)}
                  />
                  <span>Chỉnh sửa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.leads.delete}
                    onChange={(e) => handlePermissionChange('leads', 'delete', e.target.checked)}
                  />
                  <span>Xóa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.leads.export}
                    onChange={(e) => handlePermissionChange('leads', 'export', e.target.checked)}
                  />
                  <span>Xuất dữ liệu</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Deals Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Quyền xem</Label>
                <Select 
                  value={formData.permissions.deals.view} 
                  onValueChange={(value) => handlePermissionChange('deals', 'view', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không xem</SelectItem>
                    <SelectItem value="own">Chỉ của mình</SelectItem>
                    <SelectItem value="team">Cùng nhóm</SelectItem>
                    <SelectItem value="department">Cùng phòng ban</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.deals.create}
                    onChange={(e) => handlePermissionChange('deals', 'create', e.target.checked)}
                  />
                  <span>Tạo mới</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.deals.edit}
                    onChange={(e) => handlePermissionChange('deals', 'edit', e.target.checked)}
                  />
                  <span>Chỉnh sửa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.deals.delete}
                    onChange={(e) => handlePermissionChange('deals', 'delete', e.target.checked)}
                  />
                  <span>Xóa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.deals.export}
                    onChange={(e) => handlePermissionChange('deals', 'export', e.target.checked)}
                  />
                  <span>Xuất dữ liệu</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Customers Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Quyền xem</Label>
                <Select 
                  value={formData.permissions.customers.view} 
                  onValueChange={(value) => handlePermissionChange('customers', 'view', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không xem</SelectItem>
                    <SelectItem value="own">Chỉ của mình</SelectItem>
                    <SelectItem value="team">Cùng nhóm</SelectItem>
                    <SelectItem value="department">Cùng phòng ban</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.customers.create}
                    onChange={(e) => handlePermissionChange('customers', 'create', e.target.checked)}
                  />
                  <span>Tạo mới</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.customers.edit}
                    onChange={(e) => handlePermissionChange('customers', 'edit', e.target.checked)}
                  />
                  <span>Chỉnh sửa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.customers.delete}
                    onChange={(e) => handlePermissionChange('customers', 'delete', e.target.checked)}
                  />
                  <span>Xóa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.customers.export}
                    onChange={(e) => handlePermissionChange('customers', 'export', e.target.checked)}
                  />
                  <span>Xuất dữ liệu</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Reports & Settings */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Báo cáo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Quyền xem</Label>
                  <Select 
                    value={formData.permissions.reports.view} 
                    onValueChange={(value) => handlePermissionChange('reports', 'view', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không xem</SelectItem>
                      <SelectItem value="own">Chỉ của mình</SelectItem>
                      <SelectItem value="team">Cùng nhóm</SelectItem>
                      <SelectItem value="department">Cùng phòng ban</SelectItem>
                      <SelectItem value="all">Tất cả</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports.create}
                      onChange={(e) => handlePermissionChange('reports', 'create', e.target.checked)}
                    />
                    <span>Tạo báo cáo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports.export}
                      onChange={(e) => handlePermissionChange('reports', 'export', e.target.checked)}
                    />
                    <span>Xuất báo cáo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.reports.customReports}
                      onChange={(e) => handlePermissionChange('reports', 'customReports', e.target.checked)}
                    />
                    <span>Báo cáo tùy chỉnh</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cài đặt hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.settings.userManagement}
                    onChange={(e) => handlePermissionChange('settings', 'userManagement', e.target.checked)}
                  />
                  <span>Quản lý người dùng</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.settings.systemSettings}
                    onChange={(e) => handlePermissionChange('settings', 'systemSettings', e.target.checked)}
                  />
                  <span>Cài đặt hệ thống</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.settings.integrations}
                    onChange={(e) => handlePermissionChange('settings', 'integrations', e.target.checked)}
                  />
                  <span>Tích hợp</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.settings.security}
                    onChange={(e) => handlePermissionChange('settings', 'security', e.target.checked)}
                  />
                  <span>Bảo mật</span>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            {initialData ? 'Cập nhật vai trò' : 'Tạo vai trò'}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  // Edit Form Components
  const EditDepartmentForm = ({ onSubmit, onCancel, initialData }: {
    onSubmit: (data: Partial<Department>) => void
    onCancel: () => void
    initialData: Department
  }) => {
    const [formData, setFormData] = useState({
      name: initialData.name,
      description: initialData.description,
      managerId: initialData.managerId.toString(),
      managerName: initialData.managerName,
      budget: initialData.budget,
      status: initialData.status
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.managerId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const manager = employees.find(emp => emp.id === parseInt(formData.managerId))
      onSubmit({
        ...formData,
        managerId: parseInt(formData.managerId),
        managerName: manager?.name || '',
        budget: Number(formData.budget)
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="deptName">Tên phòng ban *</Label>
          <Input
            id="deptName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên phòng ban"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả chức năng phòng ban"
          />
        </div>
        <div>
          <Label htmlFor="manager">Trưởng phòng *</Label>
          <Select value={formData.managerId} onValueChange={(value) => {
            const manager = employees.find(emp => emp.id === parseInt(value))
            setFormData({
              ...formData, 
              managerId: value,
              managerName: manager?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trưởng phòng" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} - {emp.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budget">Ngân sách (VND)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="deptStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Department['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Cập nhật phòng ban
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const EditTeamForm = ({ onSubmit, onCancel, initialData }: {
    onSubmit: (data: Partial<Team>) => void
    onCancel: () => void
    initialData: Team
  }) => {
    const [formData, setFormData] = useState({
      name: initialData.name,
      description: initialData.description,
      departmentId: initialData.departmentId.toString(),
      departmentName: initialData.departmentName,
      leaderId: initialData.leaderId.toString(),
      leaderName: initialData.leaderName,
      status: initialData.status
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.departmentId || !formData.leaderId) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      const department = departments.find(dept => dept.id === parseInt(formData.departmentId))
      const leader = employees.find(emp => emp.id === parseInt(formData.leaderId))
      
      onSubmit({
        ...formData,
        departmentId: parseInt(formData.departmentId),
        departmentName: department?.name || '',
        leaderId: parseInt(formData.leaderId),
        leaderName: leader?.name || ''
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="teamName">Tên nhóm *</Label>
          <Input
            id="teamName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên nhóm"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả chức năng nhóm"
          />
        </div>
        <div>
          <Label htmlFor="department">Phòng ban *</Label>
          <Select value={formData.departmentId} onValueChange={(value) => {
            const department = departments.find(dept => dept.id === parseInt(value))
            setFormData({
              ...formData, 
              departmentId: value,
              departmentName: department?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="leader">Trưởng nhóm *</Label>
          <Select value={formData.leaderId} onValueChange={(value) => {
            const leader = employees.find(emp => emp.id === parseInt(value))
            setFormData({
              ...formData, 
              leaderId: value,
              leaderName: leader?.name || ''
            })
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trưởng nhóm" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} - {emp.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="teamStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Team['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Cập nhật nhóm
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const EditProductForm = ({ onSubmit, onCancel, initialData }: {
    onSubmit: (data: Partial<Product>) => void
    onCancel: () => void
    initialData: Product
  }) => {
    const [formData, setFormData] = useState({
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      status: initialData.status
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }
      
      onSubmit({
        ...formData,
        price: Number(formData.price)
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="productName">Tên sản phẩm *</Label>
          <Input
            id="productName"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Mô tả sản phẩm</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Mô tả chi tiết về sản phẩm"
          />
        </div>
        <div>
          <Label htmlFor="price">Giá sản phẩm (VND)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="productStatus">Trạng thái</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Product['status']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="discontinued">Ngừng sản xuất</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Cập nhật sản phẩm
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const EmployeeManagement = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h2>
          <p className="text-gray-600">Quản lý thông tin và hiệu suất nhân viên</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất danh sách
          </Button>
          <Button size="sm" onClick={() => setShowAddEmployeeModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Employee Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Ngày vào</TableHead>
              <TableHead>Ngày chính thức</TableHead>
              <TableHead>Lương</TableHead>
              <TableHead>Hiệu suất</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <p className="text-xs text-gray-400">{employee.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{employee.position}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.department}</p>
                    <p className="text-sm text-gray-500">{employee.teamName}</p>
                  </div>
                </TableCell>
                <TableCell>{formatDate(employee.hireDate)}</TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">
                    {formatDate(employee.officialDate)}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(employee.salary)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${employee.performance}%` }}
                      />
                    </div>
                    <span className="text-sm">{employee.performance}%</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thông tin</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setShowDetailModal(true)
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setEditFormData(employee)
                        setShowEditModal(true)
                      }}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Thao tác nhanh</DropdownMenuLabel>
                      
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setNewPosition(employee.position)
                        setShowPositionModal(true)
                      }}>
                        <Users className="mr-2 h-4 w-4" />
                        Chuyển vị trí
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setNewDepartmentId(employee.departmentId.toString())
                        setShowDepartmentModal(true)
                      }}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Chuyển phòng ban
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setNewStatus(employee.status)
                        setShowStatusModal(true)
                      }}>
                        <Target className="mr-2 h-4 w-4" />
                        Thay đổi trạng thái
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setNewOfficialDate(employee.officialDate)
                        setShowOfficialDateModal(true)
                      }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Cập nhật ngày chính thức
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee)
                        setNewSalary(employee.salary.toString())
                        setShowSalaryModal(true)
                      }}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Điều chỉnh lương
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )

  const DepartmentManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Phòng ban</h2>
          <p className="text-gray-600">Quản lý các phòng ban trong công ty</p>
        </div>
        <Button size="sm" onClick={() => setShowAddDepartmentModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm phòng ban
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dept.name}
                  {getStatusBadge(dept.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedDepartment(dept)
                      setShowEditDepartmentModal(true)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
                          setDepartments(departments.filter(d => d.id !== dept.id))
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{dept.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Trưởng phòng:</span>
                  <span className="font-medium">{dept.managerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Số nhân viên:</span>
                  <span className="font-medium">{dept.employeeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Ngân sách:</span>
                  <span className="font-medium">{formatCurrency(dept.budget)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const TeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Nhóm</h2>
          <p className="text-gray-600">Quản lý các nhóm làm việc</p>
        </div>
        <Button size="sm" onClick={() => setShowAddTeamModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhóm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {team.name}
                  {getStatusBadge(team.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedTeam(team)
                      setShowEditTeamModal(true)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa nhóm này?')) {
                          setTeams(teams.filter(t => t.id !== team.id))
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{team.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Phòng ban:</span>
                  <span className="font-medium">{team.departmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Trưởng nhóm:</span>
                  <span className="font-medium">{team.leaderName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Số thành viên:</span>
                  <span className="font-medium">{team.memberCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ProductManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h2>
          <p className="text-gray-600">Quản lý danh mục sản phẩm</p>
        </div>
        <Button size="sm" onClick={() => setShowAddProductModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.name}
                  {getStatusBadge(product.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedProduct(product)
                      setShowEditProductModal(true)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                          setProducts(products.filter(p => p.id !== product.id))
                        }
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Giá sản phẩm:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const RoleManagement = () => {
    const getPermissionBadge = (level: string) => {
      switch (level) {
        case 'all':
          return <Badge className="bg-green-100 text-green-800">Tất cả</Badge>
        case 'department':
          return <Badge className="bg-blue-100 text-blue-800">Phòng ban</Badge>
        case 'team':
          return <Badge className="bg-yellow-100 text-yellow-800">Nhóm</Badge>
        case 'own':
          return <Badge className="bg-gray-100 text-gray-800">Cá nhân</Badge>
        case 'none':
          return <Badge className="bg-red-100 text-red-800">Không có</Badge>
        default:
          return <Badge variant="outline">{level}</Badge>
      }
    }

    const getDepartmentNames = (departmentIds: number[]) => {
      return departmentIds.map(id => 
        departments.find(d => d.id === id)?.name || 'N/A'
      ).join(', ')
    }

    const getTeamNames = (teamIds: number[]) => {
      return teamIds.map(id => 
        teams.find(t => t.id === id)?.name || 'N/A'
      ).join(', ')
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Vai trò</h2>
            <p className="text-gray-600">Phân quyền và quản lý vai trò người dùng</p>
          </div>
          <Button size="sm" onClick={() => setShowAddRoleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm vai trò
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={roleViewFilter} onValueChange={(value: 'all' | 'department' | 'team') => setRoleViewFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Xem theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="department">Theo phòng ban</SelectItem>
              <SelectItem value="team">Theo nhóm</SelectItem>
            </SelectContent>
          </Select>
          
          {roleViewFilter === 'department' && (
            <Select value={selectedDepartmentFilter} onValueChange={setSelectedDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {roleViewFilter === 'team' && (
            <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn nhóm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả nhóm</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        setSelectedRole(role)
                        setShowRoleDetailModal(true)
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedRole(role)
                        setShowEditRoleModal(true)
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa vai trò
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between">
                  <CardDescription>{role.description}</CardDescription>
                  {getStatusBadge(role.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Permissions Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quyền hạn:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Leads:</span>
                      {getPermissionBadge(role.permissions.leads.view)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deals:</span>
                      {getPermissionBadge(role.permissions.deals.view)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Khách hàng:</span>
                      {getPermissionBadge(role.permissions.customers.view)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Báo cáo:</span>
                      {getPermissionBadge(role.permissions.reports.view)}
                    </div>
                  </div>
                </div>

                {/* Department and Team Info */}
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Phòng ban: </span>
                    <span className="text-sm text-gray-600">
                      {role.departmentIds.length > 0 ? getDepartmentNames(role.departmentIds) : 'Tất cả'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Nhóm: </span>
                    <span className="text-sm text-gray-600">
                      {role.teamIds.length > 0 ? getTeamNames(role.teamIds) : 'Tất cả'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {role.assignedUsers} người dùng
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Cập nhật: {formatDate(role.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Ma trận Phân quyền</CardTitle>
            <CardDescription>Tổng quan quyền hạn của các vai trò</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Vai trò</th>
                    <th className="text-center py-2">Leads</th>
                    <th className="text-center py-2">Deals</th>
                    <th className="text-center py-2">Khách hàng</th>
                    <th className="text-center py-2">Báo cáo</th>
                    <th className="text-center py-2">Cài đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="border-b">
                      <td className="py-2 font-medium">{role.name}</td>
                      <td className="text-center py-2">
                        {getPermissionBadge(role.permissions.leads.view)}
                      </td>
                      <td className="text-center py-2">
                        {getPermissionBadge(role.permissions.deals.view)}
                      </td>
                      <td className="text-center py-2">
                        {getPermissionBadge(role.permissions.customers.view)}
                      </td>
                      <td className="text-center py-2">
                        {getPermissionBadge(role.permissions.reports.view)}
                      </td>
                      <td className="text-center py-2">
                        {(role.permissions.settings.userManagement || 
                          role.permissions.settings.systemSettings || 
                          role.permissions.settings.integrations || 
                          role.permissions.settings.security) ? 
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : 
                          <X className="w-4 h-4 text-red-500 mx-auto" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Công ty</h1>
        <p className="text-gray-600">Quản lý thông tin công ty, nhân viên và tổ chức</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="departments">Phòng ban</TabsTrigger>
          <TabsTrigger value="teams">Nhóm</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="roles">Vai trò</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="teams">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>
      </Tabs>

      {/* Quick Action Modals */}
      {/* Position Modal */}
      <Dialog open={showPositionModal} onOpenChange={setShowPositionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển vị trí</DialogTitle>
            <DialogDescription>
              Thay đổi vị trí cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="position">Vị trí mới</Label>
              <Input
                id="position"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="Nhập vị trí mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPositionModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleQuickAction('position')}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Modal */}
      <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển phòng ban</DialogTitle>
            <DialogDescription>
              Chuyển phòng ban cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="department">Phòng ban mới</Label>
              <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {sampleDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepartmentModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleQuickAction('department')}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi trạng thái</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Trạng thái mới</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  <SelectItem value="probation">Thử việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleQuickAction('status')}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Date Modal */}
      <Dialog open={showOfficialDateModal} onOpenChange={setShowOfficialDateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật ngày chính thức</DialogTitle>
            <DialogDescription>
              Cập nhật ngày lên chính thức cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="officialDate">Ngày chính thức</Label>
              <Input
                id="officialDate"
                type="date"
                value={newOfficialDate}
                onChange={(e) => setNewOfficialDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfficialDateModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleQuickAction('officialDate')}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Modal */}
      <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh lương</DialogTitle>
            <DialogDescription>
              Điều chỉnh lương cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="salary">Lương mới (VND)</Label>
              <Input
                id="salary"
                type="number"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="Nhập mức lương mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSalaryModal(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleQuickAction('salary')}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết nhân viên</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Thông tin cá nhân</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Thông tin công việc</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{selectedEmployee.teamName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">Ngày vào: {formatDate(selectedEmployee.hireDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">Ngày chính thức: {formatDate(selectedEmployee.officialDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Thông tin lương</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{formatCurrency(selectedEmployee.salary)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Hiệu suất</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${selectedEmployee.performance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{selectedEmployee.performance}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho nhân viên: {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Họ tên</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-position">Vị trí</Label>
              <Input
                id="edit-position"
                value={editFormData.position || ''}
                onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-department">Phòng ban</Label>
              <Select 
                value={editFormData.departmentId?.toString() || ''} 
                onValueChange={(value) => {
                  const dept = sampleDepartments.find(d => d.id === parseInt(value))
                  setEditFormData({
                    ...editFormData, 
                    departmentId: parseInt(value),
                    department: dept?.name || ''
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {sampleDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-salary">Lương</Label>
              <Input
                id="edit-salary"
                type="number"
                value={editFormData.salary || ''}
                onChange={(e) => setEditFormData({...editFormData, salary: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="edit-hire-date">Ngày vào làm</Label>
              <Input
                id="edit-hire-date"
                type="date"
                value={editFormData.hireDate || ''}
                onChange={(e) => setEditFormData({...editFormData, hireDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-official-date">Ngày chính thức</Label>
              <Input
                id="edit-official-date"
                type="date"
                value={editFormData.officialDate || ''}
                onChange={(e) => setEditFormData({...editFormData, officialDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select 
                value={editFormData.status || ''} 
                onValueChange={(value) => setEditFormData({...editFormData, status: value as Employee['status']})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  <SelectItem value="probation">Thử việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-performance">Hiệu suất (%)</Label>
              <Input
                id="edit-performance"
                type="number"
                min="0"
                max="100"
                value={editFormData.performance || ''}
                onChange={(e) => setEditFormData({...editFormData, performance: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditEmployee}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog open={showAddEmployeeModal} onOpenChange={setShowAddEmployeeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để thêm nhân viên mới vào công ty
            </DialogDescription>
          </DialogHeader>
          <AddEmployeeForm onSubmit={handleAddEmployee} onCancel={() => setShowAddEmployeeModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={showAddDepartmentModal} onOpenChange={setShowAddDepartmentModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm phòng ban mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo phòng ban mới trong công ty
            </DialogDescription>
          </DialogHeader>
          <AddDepartmentForm onSubmit={handleAddDepartment} onCancel={() => setShowAddDepartmentModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Team Modal */}
      <Dialog open={showAddTeamModal} onOpenChange={setShowAddTeamModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm nhóm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo nhóm làm việc mới
            </DialogDescription>
          </DialogHeader>
          <AddTeamForm onSubmit={handleAddTeam} onCancel={() => setShowAddTeamModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để thêm sản phẩm mới vào danh mục
            </DialogDescription>
          </DialogHeader>
          <AddProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddProductModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Role Modal */}
      <Dialog open={showAddRoleModal} onOpenChange={setShowAddRoleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo vai trò mới</DialogTitle>
            <DialogDescription>
              Tạo vai trò mới với phân quyền chi tiết
            </DialogDescription>
          </DialogHeader>
          <AddRoleForm onSubmit={handleAddRole} onCancel={() => setShowAddRoleModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Role Detail Modal */}
      <Dialog open={showRoleDetailModal} onOpenChange={setShowRoleDetailModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết vai trò</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedRole.name}</h3>
                  <p className="text-gray-600">{selectedRole.description}</p>
                </div>
                {getStatusBadge(selectedRole.status)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Thông tin cơ bản</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Người dùng được gán:</span>
                      <span>{selectedRole.assignedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày tạo:</span>
                      <span>{formatDate(selectedRole.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cập nhật cuối:</span>
                      <span>{formatDate(selectedRole.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Phạm vi áp dụng</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Phòng ban: </span>
                      <span>
                        {selectedRole.departmentIds.length > 0 
                          ? selectedRole.departmentIds.map(id => 
                              departments.find(d => d.id === id)?.name || 'N/A'
                            ).join(', ')
                          : 'Tất cả phòng ban'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Nhóm: </span>
                      <span>
                        {selectedRole.teamIds.length > 0 
                          ? selectedRole.teamIds.map(id => 
                              teams.find(t => t.id === id)?.name || 'N/A'
                            ).join(', ')
                          : 'Tất cả nhóm'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Chi tiết phân quyền</h4>
                <div className="space-y-4">
                  {/* Leads Permissions */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Leads</h5>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Xem: </span>
                        <Badge variant="outline">{selectedRole.permissions.leads.view}</Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Tạo: </span>
                        {selectedRole.permissions.leads.create ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Sửa: </span>
                        {selectedRole.permissions.leads.edit ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Xóa: </span>
                        {selectedRole.permissions.leads.delete ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Xuất: </span>
                        {selectedRole.permissions.leads.export ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                    </div>
                  </div>

                  {/* Deals Permissions */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Deals</h5>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Xem: </span>
                        <Badge variant="outline">{selectedRole.permissions.deals.view}</Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Tạo: </span>
                        {selectedRole.permissions.deals.create ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Sửa: </span>
                        {selectedRole.permissions.deals.edit ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Xóa: </span>
                        {selectedRole.permissions.deals.delete ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                      <div>
                        <span className="text-gray-500">Xuất: </span>
                        {selectedRole.permissions.deals.export ? 
                          <CheckCircle className="w-4 h-4 text-green-500 inline" /> : 
                          <X className="w-4 h-4 text-red-500 inline" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowRoleDetailModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và phân quyền cho vai trò: {selectedRole?.name}
            </DialogDescription>
          </DialogHeader>
          <AddRoleForm 
            onSubmit={handleEditRole} 
            onCancel={() => setShowEditRoleModal(false)} 
            initialData={selectedRole || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={showEditDepartmentModal} onOpenChange={setShowEditDepartmentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin phòng ban: {selectedDepartment?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <EditDepartmentForm 
              onSubmit={handleEditDepartment} 
              onCancel={() => setShowEditDepartmentModal(false)}
              initialData={selectedDepartment}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog open={showEditTeamModal} onOpenChange={setShowEditTeamModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nhóm: {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <EditTeamForm 
              onSubmit={handleEditTeam} 
              onCancel={() => setShowEditTeamModal(false)}
              initialData={selectedTeam}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditProductModal} onOpenChange={setShowEditProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sản phẩm: {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <EditProductForm 
              onSubmit={handleEditProduct} 
              onCancel={() => setShowEditProductModal(false)}
              initialData={selectedProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}