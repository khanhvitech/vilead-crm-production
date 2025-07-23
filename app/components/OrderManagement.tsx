'use client'

import { useState, useEffect } from 'react'
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
  FileText,
  MessageSquare,
  Tag,
  Upload,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  Send,
  AlertTriangle,
  History,
  Zap,
  ShoppingCart,
  Package,
  CreditCard,
  Bell,
  Settings,
  X,
  Check
} from 'lucide-react'

import CreateOrderModal from './CreateOrderModal'
import OrderDetailModal from './OrderDetailModal'

// Interfaces
interface Customer {
  id: number
  name: string
  phone: string
  email: string
  company?: string
  type: 'lead' | 'customer'
}

interface Product {
  id: number
  name: string
  code: string
  basePrice: number
  variants: ProductVariant[]
  category: string
  description: string
}

interface ProductVariant {
  id: number
  name: string
  price: number
  description: string
}

interface OrderItem {
  id: number
  productId: number
  product: Product
  variantId?: number
  variant?: ProductVariant
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

interface Invoice {
  id: number
  number: string
  date: string
  totalAmount: number
  tax?: number
  fileUrl?: string
  fileType?: 'pdf' | 'image' | 'link'
  status: 'draft' | 'issued' | 'paid'
}

interface OrderNote {
  id: number
  content: string
  type: 'customer_request' | 'internal' | 'system'
  createdAt: string
  createdBy: string
  isEditable: boolean
}

interface ZaloMessage {
  id: number
  content: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  sender: string
  tag?: string
  isRead: boolean
}

interface OrderHistory {
  id: number
  action: 'created' | 'status_changed' | 'invoice_added' | 'note_added' | 'refunded' | 'cancelled'
  timestamp: string
  performedBy: string
  oldValue?: string
  newValue?: string
  reason?: string
  details?: string
}

interface Reminder {
  id: number
  type: 'payment' | 'contract' | 'custom'
  schedule: number // hours
  maxAttempts: number
  template: string
  isActive: boolean
}

interface Order {
  id: number
  orderNumber: string
  customerId: number
  customer: Customer
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded'
  paymentMethod: 'cash' | 'transfer' | 'installment' | 'momo' | 'custom'
  notes: OrderNote[]
  invoices: Invoice[]
  tags: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  history: OrderHistory[]
  zaloMessages: ZaloMessage[]
  deadline?: string
  remindersSent: number
  isVip: boolean
  upsellSuggestions?: Product[]
  crosssellSuggestions?: Product[]
}

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reminders'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    timeRange: '',
    search: '',
    tags: [] as string[]
  })
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sample data
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      company: 'ABC Corp',
      type: 'customer'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0902345678',
      email: 'tranthib@email.com',
      type: 'lead'
    }
  ])

  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Gói Tư Vấn CRM',
      code: 'CRM-001',
      basePrice: 5000000,
      category: 'Tư vấn',
      description: 'Gói tư vấn triển khai CRM cho doanh nghiệp',
      variants: [
        { id: 1, name: 'Cơ bản', price: 5000000, description: 'Tư vấn cơ bản 10 giờ' },
        { id: 2, name: 'Nâng cao', price: 8000000, description: 'Tư vấn nâng cao 20 giờ' },
        { id: 3, name: 'Cao cấp', price: 12000000, description: 'Tư vấn cao cấp 40 giờ' }
      ]
    },
    {
      id: 2,
      name: 'Phần Mềm ERP',
      code: 'ERP-001',
      basePrice: 15000000,
      category: 'Phần mềm',
      description: 'Hệ thống quản lý tài nguyên doanh nghiệp',
      variants: [
        { id: 4, name: 'Starter', price: 15000000, description: 'Dành cho 5-10 người dùng' },
        { id: 5, name: 'Professional', price: 25000000, description: 'Dành cho 10-50 người dùng' },
        { id: 6, name: 'Enterprise', price: 50000000, description: 'Dành cho 50+ người dùng' }
      ]
    }
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      orderNumber: 'DH20250611001',
      customerId: 1,
      customer: customers[0],
      items: [
        {
          id: 1,
          productId: 1,
          product: products[0],
          variantId: 2,
          variant: products[0].variants[1],
          quantity: 1,
          unitPrice: 8000000,
          totalPrice: 8000000,
          notes: 'Khách yêu cầu tư vấn online'
        }
      ],
      subtotal: 8000000,
      discount: 800000,
      tax: 720000,
      total: 7920000,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      paymentMethod: 'transfer',
      notes: [
        {
          id: 1,
          content: 'Khách hàng yêu cầu gửi hợp đồng qua Zalo',
          type: 'customer_request',
          createdAt: '2025-06-11T10:30:00',
          createdBy: 'Nguyễn Sales',
          isEditable: true
        }
      ],
      invoices: [],
      tags: ['VIP', 'Khẩn cấp'],
      createdAt: '2025-06-11T09:00:00',
      createdBy: 'Nguyễn Sales Manager',
      updatedAt: '2025-06-11T10:30:00',
      history: [],
      zaloMessages: [
        {
          id: 1,
          content: 'Chào anh, em muốn mua gói tư vấn CRM nâng cao',
          direction: 'incoming',
          timestamp: '2025-06-11T09:00:00',
          sender: 'Nguyễn Văn A',
          isRead: true
        }
      ],
      deadline: '2025-06-14T23:59:59',
      remindersSent: 0,
      isVip: true,
      upsellSuggestions: [products[0]], // Gói cao cấp
      crosssellSuggestions: [products[1]] // ERP
    }
  ])

  // Keyboard shortcuts and effects
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault()
            const filteredOrders = orders.filter(order => {
              if (filters.status && order.status !== filters.status) return false
              if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false
              if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                if (!order.orderNumber.toLowerCase().includes(searchLower) &&
                    !order.customer.name.toLowerCase().includes(searchLower) &&
                    !order.customer.phone.includes(searchLower)) return false
              }
              return true
            })
            if (filteredOrders.length > 0) {
              setSelectedOrders(filteredOrders.map(order => order.id))
            }
            break
          case 'Escape':
            setSelectedOrders([])
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [orders, filters])

  // Clear selection when filters change
  useEffect(() => {
    setSelectedOrders([])
  }, [filters])

  // Helper functions
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Nháp'
      case 'pending': return 'Chờ xác nhận'
      case 'confirmed': return 'Đã xác nhận'
      case 'processing': return 'Đang xử lý'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      case 'refunded': return 'Đã hoàn'
      default: return status
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'unpaid': return 'Chưa thanh toán'
      case 'partial': return 'Thanh toán một phần'
      case 'paid': return 'Đã thanh toán'
      case 'refunded': return 'Đã hoàn tiền'
      default: return status
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'khẩn cấp':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'chờ ký hợp đồng':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'thanh toán trễ':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Quá hạn'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`
    return `Còn ${hours} giờ`
  }

  // Overview Metrics
  const getOverviewMetrics = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid').length
    const overdueOrders = orders.filter(o => o.deadline && new Date(o.deadline) < new Date()).length
    const vipOrders = orders.filter(o => o.isVip).length
    const completedOrders = orders.filter(o => o.status === 'completed').length

    return {
      totalOrders,
      totalRevenue,
      unpaidOrders,
      overdueOrders,
      vipOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    }
  }

  // Handle create order
  const handleCreateOrder = (orderData: any) => {
    const newOrder: Order = {
      id: Date.now(),
      ...orderData,
      customer: customers.find(c => c.id === parseInt(orderData.customerId))!,
      history: [{
        id: Date.now(),
        action: 'created',
        timestamp: new Date().toISOString(),
        performedBy: 'Nguyễn Sales Manager',
        details: `Tạo đơn hàng ${orderData.orderNumber}`
      }],
      remindersSent: 0,
      createdBy: 'Nguyễn Sales Manager'
    }

    setOrders(prev => [...prev, newOrder])
    setNotification({
      message: `Đơn hàng ${orderData.orderNumber} đã được tạo thành công!`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle bulk operations
  const handleBulkOperation = async (operation: string) => {
    if (selectedOrders.length === 0) return
    
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (operation) {
        case 'mark_paid':
          setOrders(prev => prev.map(order => 
            selectedOrders.includes(order.id) 
              ? { ...order, paymentStatus: 'paid' as const }
              : order
          ))
          setNotification({
            message: `Đã đánh dấu ${selectedOrders.length} đơn hàng là đã thanh toán`,
            type: 'success'
          })
          break
        case 'mark_completed':
          setOrders(prev => prev.map(order => 
            selectedOrders.includes(order.id) 
              ? { ...order, status: 'completed' as const }
              : order
          ))
          setNotification({
            message: `Đã hoàn thành ${selectedOrders.length} đơn hàng`,
            type: 'success'
          })
          break
        case 'send_reminder':
          setOrders(prev => prev.map(order => 
            selectedOrders.includes(order.id) 
              ? { ...order, remindersSent: order.remindersSent + 1 }
              : order
          ))
          setNotification({
            message: `Đã gửi nhắc nhở thanh toán cho ${selectedOrders.length} đơn hàng`,
            type: 'success'
          })
          break
        case 'export':
          exportOrdersToCSV(orders.filter(order => selectedOrders.includes(order.id)))
          break
      }
      setSelectedOrders([])
      setShowBulkActions(false)
    } catch (error) {
      setNotification({
        message: 'Có lỗi xảy ra khi thực hiện thao tác',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Export to CSV
  const exportOrdersToCSV = (ordersToExport: Order[]) => {
    const headers = ['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày tạo']
    const rows = ordersToExport.map(order => [
      order.orderNumber,
      order.customer.name,
      order.total.toString(),
      getStatusText(order.status),
      getPaymentStatusText(order.paymentStatus),
      new Date(order.createdAt).toLocaleDateString('vi-VN')
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `don-hang-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    setNotification({
      message: `Đã xuất ${ordersToExport.length} đơn hàng`,
      type: 'success'
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // Filter orders
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (filters.status && order.status !== filters.status) return false
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!order.orderNumber.toLowerCase().includes(searchLower) &&
            !order.customer.name.toLowerCase().includes(searchLower) &&
            !order.customer.phone.includes(searchLower)) return false
      }
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => order.tags.includes(tag))) return false
      }
      if (filters.timeRange) {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        switch (filters.timeRange) {
          case 'today':
            if (orderDate.toDateString() !== today.toDateString()) return false
            break
          case 'yesterday':
            if (orderDate.toDateString() !== yesterday.toDateString()) return false
            break
          case 'thisWeek':
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() - today.getDay())
            if (orderDate < weekStart) return false
            break
          case 'thisMonth':
            if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false
            break
        }
      }
      return true
    })
  }

  const metrics = getOverviewMetrics()

  // Render functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 border border-blue-100 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.totalOrders}</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 border border-green-100 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Tổng doanh thu</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white p-6 border border-red-100 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Chưa thanh toán</div>
              <div className="text-2xl font-bold text-red-600">{metrics.unpaidOrders}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 border border-purple-100 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Khách VIP</div>
              <div className="text-2xl font-bold text-purple-600">{metrics.vipOrders}</div>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng cần chú ý</h3>
          <div className="space-y-3">
            {orders.filter(o => o.paymentStatus === 'unpaid' || (o.deadline && new Date(o.deadline) < new Date())).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">{order.customer.name}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {order.deadline && new Date(order.deadline) < new Date() && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Quá hạn
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Đơn mới được tạo</div>
                <div className="text-xs text-gray-500">DH20250611001 - 2 giờ trước</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Thanh toán thành công</div>
                <div className="text-xs text-gray-500">DH20250610005 - 4 giờ trước</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Nhắc thanh toán lần 2</div>
                <div className="text-xs text-gray-500">DH20250609003 - 6 giờ trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Products Management
  const renderProductsManagement = () => {
    // Calculate product performance
    const productPerformance = products.map(product => {
      const productOrders = orders.filter(order => 
        order.items.some(item => item.productId === product.id)
      )
      
      const totalQuantity = productOrders.reduce((sum, order) => 
        sum + order.items.filter(item => item.productId === product.id)
          .reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      )
      
      const totalRevenue = productOrders.reduce((sum, order) => 
        sum + order.items.filter(item => item.productId === product.id)
          .reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
      )

      const avgOrderValue = productOrders.length > 0 ? totalRevenue / productOrders.length : 0
      
      return {
        ...product,
        orderCount: productOrders.length,
        totalQuantity,
        totalRevenue,
        avgOrderValue,
        conversionRate: Math.random() * 100 // Mock data
      }
    })

    return (
      <div className="space-y-6">
        {/* Product Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tổng sản phẩm</div>
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 border border-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Doanh thu sản phẩm</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(productPerformance.reduce((sum, p) => sum + p.totalRevenue, 0))}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-6 border border-purple-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Sản phẩm bán chạy</div>
                <div className="text-lg font-bold text-purple-600">
                  {productPerformance.sort((a, b) => b.totalQuantity - a.totalQuantity)[0]?.name || 'N/A'}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-white p-6 border border-orange-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tỷ lệ chuyển đổi TB</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(productPerformance.reduce((sum, p) => sum + p.conversionRate, 0) / productPerformance.length).toFixed(1)}%
                </div>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Hiệu suất Sản phẩm</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4 inline mr-2" />
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GT TB/Đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tỷ lệ chuyển đổi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPerformance.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code} • {product.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.orderCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.totalQuantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.totalRevenue)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.avgOrderValue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(product.conversionRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{product.conversionRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Variants Performance */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hiệu suất theo Phiên bản</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{product.name}</h4>
                  <div className="space-y-2">
                    {product.variants.map(variant => {
                      const variantOrders = orders.filter(order => 
                        order.items.some(item => item.variantId === variant.id)
                      )
                      const variantRevenue = variantOrders.reduce((sum, order) => 
                        sum + order.items.filter(item => item.variantId === variant.id)
                          .reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
                      )
                      
                      return (
                        <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{variant.name}</div>
                            <div className="text-xs text-gray-500">{formatCurrency(variant.price)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{variantOrders.length} đơn</div>
                            <div className="text-xs text-gray-500">{formatCurrency(variantRevenue)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Reminders Management  
  const renderRemindersManagement = () => {
    // Get overdue orders
    const overdueOrders = orders.filter(order => 
      order.paymentStatus === 'unpaid' && 
      order.deadline && 
      new Date(order.deadline) < new Date()
    )

    // Get upcoming payment reminders (next 7 days)
    const upcomingReminders = orders.filter(order => 
      order.paymentStatus === 'unpaid' && 
      order.deadline && 
      new Date(order.deadline) > new Date() &&
      new Date(order.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )

    // Get orders that have been reminded multiple times
    const multipleReminders = orders.filter(order => order.remindersSent >= 2)

    return (
      <div className="space-y-6">
        {/* Header Explanation */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quản lý Nhắc thanh toán</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Tính năng này giúp bạn tự động gửi nhắc thanh toán đến <strong>khách hàng</strong> (qua email/SMS) 
            và thông báo cho <strong>người phụ trách</strong> để theo dõi các đơn hàng chưa thanh toán.
          </p>
        </div>

        {/* Reminder Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-white p-6 border border-red-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Đơn quá hạn</div>
                <div className="text-2xl font-bold text-red-600">{overdueOrders.length}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-white p-6 border border-yellow-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Sắp đến hạn</div>
                <div className="text-2xl font-bold text-yellow-600">{upcomingReminders.length}</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-6 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Đã nhắc nhiều lần</div>
                <div className="text-2xl font-bold text-blue-600">{multipleReminders.length}</div>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 border border-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tổng lần nhắc</div>
                <div className="text-2xl font-bold text-green-600">
                  {orders.reduce((sum, order) => sum + order.remindersSent, 0)}
                </div>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác hàng loạt</h3>
          
          {/* Explanation for Payment Reminders */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">💡 Về tính năng nhắc thanh toán</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Khi gửi nhắc thanh toán, hệ thống sẽ tự động gửi thông báo đến <strong>cả hai bên</strong>:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span><strong>Khách hàng:</strong> Nhận email/SMS nhắc thanh toán với chi tiết đơn hàng và hướng dẫn thanh toán</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    <span><strong>Người phụ trách:</strong> Nhận thông báo để theo dõi và liên hệ khách hàng nếu cần</span>
                  </li>
                </ul>
                <div className="mt-2 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 inline-block">
                  ⏰ Lưu ý: Tránh gửi nhắc liên tục để không làm phiền khách hàng
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleBulkOperation('send_reminder')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              title="Gửi nhắc thanh toán cho khách hàng và thông báo cho người phụ trách"
            >
              <Send className="w-4 h-4" />
              <span>Gửi nhắc thanh toán tất cả</span>
            </button>
            <button 
              onClick={() => handleBulkOperation('mark_paid')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Đánh dấu đã thanh toán</span>
            </button>
            <button 
              onClick={() => exportOrdersToCSV(overdueOrders)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Xuất danh sách quá hạn</span>
            </button>
          </div>
        </div>

        {/* Overdue Orders */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800">Đơn hàng quá hạn thanh toán</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quá hạn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lần nhắc</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-red-600">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">
                        {order.deadline && Math.ceil((new Date().getTime() - new Date(order.deadline).getTime()) / (1000 * 60 * 60 * 24))} ngày
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.remindersSent >= 3 ? 'bg-red-100 text-red-800' :
                        order.remindersSent >= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.remindersSent} lần
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setOrders(prev => prev.map(o => 
                              o.id === order.id ? { ...o, remindersSent: o.remindersSent + 1 } : o
                            ))
                            setNotification({
                              message: `Đã gửi nhắc nhở cho đơn ${order.orderNumber}`,
                              type: 'success'
                            })
                            setTimeout(() => setNotification(null), 3000)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                          title="Gửi nhắc nhở"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors" 
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setOrders(prev => prev.map(o => 
                              o.id === order.id ? { ...o, paymentStatus: 'paid' as const } : o
                            ))
                            setNotification({
                              message: `Đã đánh dấu đơn ${order.orderNumber} là đã thanh toán`,
                              type: 'success'
                            })
                            setTimeout(() => setNotification(null), 3000)
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors" 
                          title="Đánh dấu đã thanh toán"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <h3 className="text-lg font-semibold text-yellow-800">Đơn hàng sắp đến hạn thanh toán</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Còn lại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingReminders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-yellow-600">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-yellow-600">
                        {order.deadline && calculateTimeRemaining(order.deadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setOrders(prev => prev.map(o => 
                              o.id === order.id ? { ...o, remindersSent: o.remindersSent + 1 } : o
                            ))
                            setNotification({
                              message: `Đã gửi nhắc nhở sớm cho đơn ${order.orderNumber}`,
                              type: 'success'
                            })
                            setTimeout(() => setNotification(null), 3000)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                          title="Gửi nhắc nhở sớm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors" 
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderOrders = () => (
    <div className="space-y-4">
      {/* Header and filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quản lý Đơn hàng</h2>
        
        {/* Inline Filters */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng theo mã, khách hàng..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            {/* Payment Status Filter */}
            <select 
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Tình trạng thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partial">Thanh toán một phần</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
            
            {/* Time Filter */}
            <select 
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="thisWeek">Tuần này</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
            </select>
            
            {/* Clear Filters Button */}
            {(filters.status || filters.paymentStatus || filters.timeRange || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', paymentStatus: '', timeRange: '', search: '', tags: [] })}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
            
            {/* Create Order Button */}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Hiển thị {getFilteredOrders().length} trong tổng {orders.length} đơn hàng
          {(filters.status || filters.paymentStatus || filters.timeRange || filters.search) && (
            <span className="ml-1 text-blue-600">(đã lọc)</span>
          )}
        </span>
        <div className="flex items-center space-x-4">
          {selectedOrders.length > 0 && (
            <span className="text-blue-600 font-medium">
              Đã chọn {selectedOrders.length} đơn hàng
            </span>
          )}
          <div className="text-xs text-gray-500">
            Phím tắt: Ctrl+A (chọn tất cả), Esc (bỏ chọn)
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedOrders.length} đơn hàng
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBulkOperation('mark_paid')}
                disabled={isLoading}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Đánh dấu đã thanh toán</span>
              </button>
              <button
                onClick={() => handleBulkOperation('mark_completed')}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Hoàn thành</span>
              </button>
              <button
                onClick={() => handleBulkOperation('send_reminder')}
                disabled={isLoading}
                className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Gửi nhắc nhở</span>
              </button>
              <button
                onClick={() => handleBulkOperation('export')}
                disabled={isLoading}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Xuất CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === getFilteredOrders().length && getFilteredOrders().length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(getFilteredOrders().map(order => order.id))
                      } else {
                        setSelectedOrders([])
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Thanh toán</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Thời hạn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Nhãn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredOrders().map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(prev => [...prev, order.id])
                        } else {
                          setSelectedOrders(prev => prev.filter(id => id !== order.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      {order.isVip && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          <Target className="w-3 h-3 mr-1" />
                          VIP
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div>
                      <div className="font-medium text-gray-900">{order.items[0]?.product.name}</div>
                      {order.items.length > 1 && (
                        <div className="text-sm text-gray-500">+{order.items.length - 1} sản phẩm khác</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{formatCurrency(order.total)}</div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                    {order.deadline ? (
                      <div className={`text-sm ${new Date(order.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                        {calculateTimeRemaining(order.deadline)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {order.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded border ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                      {order.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{order.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Gửi tin nhắn">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {getFilteredOrders().length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(filters.status || filters.paymentStatus || filters.timeRange || filters.search) 
                  ? 'Không tìm thấy đơn hàng phù hợp' 
                  : 'Chưa có đơn hàng nào'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {(filters.status || filters.paymentStatus || filters.timeRange || filters.search)
                  ? 'Hãy thử điều chỉnh bộ lọc để tìm kiếm đơn hàng khác'
                  : 'Tạo đơn hàng đầu tiên để bắt đầu quản lý'
                }
              </p>
              {(filters.status || filters.paymentStatus || filters.timeRange || filters.search) ? (
                <button
                  onClick={() => setFilters({ status: '', paymentStatus: '', timeRange: '', search: '', tags: [] })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa tất cả bộ lọc
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đơn hàng đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <p className="text-gray-600">Quản lý đơn hàng, thanh toán và theo dõi lịch sử</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Tổng quan', icon: <Activity className="w-4 h-4" /> },
              { id: 'orders', name: 'Đơn hàng', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'products', name: 'Sản phẩm', icon: <Package className="w-4 h-4" /> },
              { id: 'reminders', name: 'Nhắc thanh toán', icon: <Bell className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'products' && renderProductsManagement()}
          {activeTab === 'reminders' && renderRemindersManagement()}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateOrderModal
          isOpen={showCreateModal}
          customers={customers}
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateOrder}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={true}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(orderId, updates) => {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o))
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}