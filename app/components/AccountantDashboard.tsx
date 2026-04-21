'use client'

import React, { useState } from 'react'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  AlertTriangle,
  Calendar,
  FileText,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'

export default function AccountantDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')

  // Mock data for financial overview
  const financialMetrics = {
    totalRevenue: 245000000, // 245M VND
    totalInvoices: 156,
    paidInvoices: 124,
    unpaidInvoices: 32,
    overdueInvoices: 8,
    totalPaid: 198000000, // 198M VND
    totalUnpaid: 47000000, // 47M VND
    avgPaymentTime: 12, // days
    paymentRate: 80.8, // %
    monthlyGrowth: 15.2 // %
  }

  const recentInvoices = [
    {
      id: 1,
      number: 'INV-2025-156',
      customer: 'Công ty TNHH ABC',
      amount: 15000000,
      status: 'paid',
      dueDate: '2025-06-20',
      paidDate: '2025-06-18'
    },
    {
      id: 2,
      number: 'INV-2025-157',
      customer: 'Trần Thị B',
      amount: 8500000,
      status: 'overdue',
      dueDate: '2025-06-15',
      paidDate: null
    },
    {
      id: 3,
      number: 'INV-2025-158',
      customer: 'Công ty XYZ',
      amount: 22000000,
      status: 'pending',
      dueDate: '2025-07-01',
      paidDate: null
    }
  ]

  const paymentMethods = [
    { method: 'Chuyển khoản', amount: 156000000, percentage: 78.8 },
    { method: 'Tiền mặt', amount: 28000000, percentage: 14.1 },
    { method: 'Thẻ tín dụng', amount: 12000000, percentage: 6.1 },
    { method: 'Ví điện tử', amount: 2000000, percentage: 1.0 }
  ]

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' ₫'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán'
      case 'pending': return 'Chờ thanh toán'
      case 'overdue': return 'Quá hạn'
      default: return status
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Kế toán</h1>
          <p className="text-gray-600">Tổng quan tài chính và quản lý công nợ</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-[#e6ebf1] rounded-[10px] focus:ring-2 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
          >
            <option value="thisWeek">Tuần này</option>
            <option value="thisMonth">Tháng này</option>
            <option value="thisQuarter">Quý này</option>
            <option value="thisYear">Năm này</option>
          </select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(financialMetrics.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{financialMetrics.monthlyGrowth}%</span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã thu</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialMetrics.totalPaid)}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">{financialMetrics.paidInvoices}/{financialMetrics.totalInvoices} hóa đơn</span>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chưa thu</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(financialMetrics.totalUnpaid)}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">{financialMetrics.unpaidInvoices} hóa đơn</span>
              </div>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">{financialMetrics.overdueInvoices}</p>
              <div className="flex items-center mt-1">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">Cần xử lý</span>
              </div>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Payment Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất thu hồi</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{financialMetrics.paymentRate}%</div>
              <div className="text-sm text-gray-600">Tỷ lệ thu hồi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{financialMetrics.avgPaymentTime}</div>
              <div className="text-sm text-gray-600">Ngày TB thu hồi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-gray-600">Thanh toán đúng hạn</div>
            </div>
          </div>

          {/* Payment Timeline Chart Placeholder */}
          <div className="h-48 bg-gray-50 rounded-[10px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Biểu đồ doanh thu theo thời gian</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
          
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{method.method}</span>
                    <span className="text-sm text-gray-500">{method.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#3e79f7] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatCurrency(method.amount)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#e6ebf1]">
            <div className="flex items-center justify-center">
              <PieChart className="w-8 h-8 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Chi tiết phân tích</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hóa đơn gần đây</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{invoice.number}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{invoice.customer}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-green-600">{formatCurrency(invoice.amount)}</span>
                    <span className="text-xs text-gray-500">Hạn: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Tasks */}
        <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Công việc cần xử lý</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              5 việc
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 rounded-[10px] border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium text-red-900">8 hóa đơn quá hạn thanh toán</div>
                <div className="text-sm text-red-700">Cần gửi nhắc nhở hoặc xử lý nợ xấu</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-yellow-50 rounded-[10px] border border-yellow-100">
              <Calendar className="w-5 h-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium text-yellow-900">15 hóa đơn sắp đến hạn</div>
                <div className="text-sm text-yellow-700">Trong vòng 7 ngày tới</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 rounded-[10px] border border-blue-100">
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">Báo cáo tài chính tháng</div>
                <div className="text-sm text-[#3e79f7]">Cần hoàn thành trước ngày 30/6</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 rounded-[10px] border border-green-100">
              <CreditCard className="w-5 h-5 text-green-600 mr-3" />
              <div className="flex-1">
                <div className="font-medium text-green-900">24 thanh toán cần xác nhận</div>
                <div className="text-sm text-green-700">Đối soát và ghi sổ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-[10px] transition-colors">
            <Receipt className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Tạo hóa đơn</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-[10px] transition-colors">
            <CreditCard className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Ghi nhận TT</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-[10px] transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Báo cáo</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-[10px] transition-colors">
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Nợ quá hạn</span>
          </button>
        </div>
      </div>
    </div>
  )
}
