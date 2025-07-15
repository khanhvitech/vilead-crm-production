'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  Package, 
  Plus, 
  Search, 
  Edit2, 
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
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  category: string
  price: number
  cost: number
  profit: number
  stock: number
  sold: number
  status: 'active' | 'inactive' | 'discontinued'
  description: string
  createdAt: string
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
    category: "Software",
    price: 2000000,
    cost: 800000,
    profit: 1200000,
    stock: 100,
    sold: 45,
    status: "active",
    description: "Phần mềm CRM chuyên nghiệp",
    createdAt: "2023-01-01"
  },
  {
    id: 2,
    name: "CRM Enterprise",
    category: "Software",
    price: 5000000,
    cost: 2000000,
    profit: 3000000,
    stock: 50,
    sold: 12,
    status: "active",
    description: "Phần mềm CRM doanh nghiệp",
    createdAt: "2023-02-01"
  },
  {
    id: 3,
    name: "Marketing Suite",
    category: "Software",
    price: 1500000,
    cost: 600000,
    profit: 900000,
    stock: 75,
    sold: 28,
    status: "active",
    description: "Bộ công cụ marketing tự động",
    createdAt: "2023-03-01"
  }
]

export default function CompanyManagement() {
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Modal states for quick actions
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showOfficialDateModal, setShowOfficialDateModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees)

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

  const filteredDepartments = sampleDepartments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeams = sampleTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <Button size="sm">
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
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm phòng ban
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {dept.name}
                {getStatusBadge(dept.status)}
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
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhóm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {team.name}
                {getStatusBadge(team.status)}
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
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {product.name}
                {getStatusBadge(product.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Danh mục:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Giá bán:</span>
                  <span className="font-medium">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Lợi nhuận:</span>
                  <span className="font-medium text-green-600">{formatCurrency(product.profit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tồn kho:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Đã bán:</span>
                  <span className="font-medium">{product.sold}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Công ty</h1>
        <p className="text-gray-600">Quản lý thông tin công ty, nhân viên và tổ chức</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="departments">Phòng ban</TabsTrigger>
          <TabsTrigger value="teams">Nhóm</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
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
    </div>
  )
}
