'use client'

import { useState, useMemo } from 'react'
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, Users, DollarSign,
  Activity, AlertTriangle, Target, Calendar, MessageCircle, Mail,
  Phone, Clock, Star, Eye, RefreshCw, Download, Filter
} from 'lucide-react'

interface CustomerAnalyticsProps {
  customers: any[]
}

interface AnalyticsMetric {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

interface ChartData {
  name: string
  value: number
  color: string
}

export default function CustomerAnalytics({ customers }: CustomerAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('engagement')

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'vip').length
    const atRiskCustomers = customers.filter(c => c.status === 'at-risk' || c.churnRisk >= 60).length
    const vipCustomers = customers.filter(c => c.status === 'vip').length
    
    const totalValue = customers.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0)
    const avgEngagement = customers.reduce((sum, c) => sum + c.engagementScore, 0) / customers.length
    const avgChurnRisk = customers.reduce((sum, c) => sum + c.churnRisk, 0) / customers.length
    const avgResponseTime = customers.reduce((sum, c) => sum + c.responseTime, 0) / customers.length

    const needRemrketing = customers.filter(c => 
      c.daysSinceLastInteraction > 30 || c.churnRisk > 50 || c.engagementScore < 40
    ).length

    return {
      totalCustomers,
      activeCustomers,
      atRiskCustomers,
      vipCustomers,
      totalValue,
      avgEngagement: Math.round(avgEngagement),
      avgChurnRisk: Math.round(avgChurnRisk),
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      needRemrketing,
      retentionRate: Math.round((activeCustomers / totalCustomers) * 100),
      customerGrowth: 12, // Mock data
      revenuePerCustomer: Math.round(totalValue / totalCustomers)
    }
  }, [customers])

  const metrics: AnalyticsMetric[] = [
    {
      label: 'Tổng khách hàng',
      value: analytics.totalCustomers,
      change: 8.2,
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-primary-600'
    },
    {
      label: 'Khách hàng hoạt động',
      value: analytics.activeCustomers,
      change: 5.1,
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Khách hàng VIP',
      value: analytics.vipCustomers,
      change: 12.3,
      trend: 'up',
      icon: <Star className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      label: 'Có nguy cơ rời bỏ',
      value: analytics.atRiskCustomers,
      change: -3.2,
      trend: 'down',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600'
    },
    {
      label: 'Tổng doanh thu',
      value: `${(analytics.totalValue / 1000000000).toFixed(1)}B VNĐ`,
      change: 15.7,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Doanh thu/Khách',
      value: `${(analytics.revenuePerCustomer / 1000000).toFixed(1)}M VNĐ`,
      change: 7.4,
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'Tỷ lệ giữ chân',
      value: `${analytics.retentionRate}%`,
      change: 2.1,
      trend: 'up',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Cần remarketing',
      value: analytics.needRemrketing,
      change: -8.5,
      trend: 'down',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-orange-600'
    }
  ]

  // Status distribution data
  const statusData: ChartData[] = [
    { name: 'Hoạt động', value: customers.filter(c => c.status === 'active').length, color: '#10B981' },
    { name: 'VIP', value: customers.filter(c => c.status === 'vip').length, color: '#8B5CF6' },
    { name: 'Có nguy cơ', value: customers.filter(c => c.status === 'at-risk').length, color: '#EF4444' },
    { name: 'Không hoạt động', value: customers.filter(c => c.status === 'inactive').length, color: '#6B7280' }
  ]

  // Engagement score distribution
  const engagementData: ChartData[] = [
    { name: 'Cao (70-100)', value: customers.filter(c => c.engagementScore >= 70).length, color: '#10B981' },
    { name: 'Trung bình (40-69)', value: customers.filter(c => c.engagementScore >= 40 && c.engagementScore < 70).length, color: '#F59E0B' },
    { name: 'Thấp (0-39)', value: customers.filter(c => c.engagementScore < 40).length, color: '#EF4444' }
  ]

  // Churn risk distribution
  const churnRiskData: ChartData[] = [
    { name: 'Rủi ro cao (≥60%)', value: customers.filter(c => c.churnRisk >= 60).length, color: '#EF4444' },
    { name: 'Rủi ro trung bình (30-59%)', value: customers.filter(c => c.churnRisk >= 30 && c.churnRisk < 60).length, color: '#F59E0B' },
    { name: 'Rủi ro thấp (<30%)', value: customers.filter(c => c.churnRisk < 30).length, color: '#10B981' }
  ]

  // Industry distribution
  const industryData: ChartData[] = [
    { name: 'Công nghệ', value: customers.filter(c => c.industry === 'Công nghệ').length, color: '#3B82F6' },
    { name: 'IT Services', value: customers.filter(c => c.industry === 'IT Services').length, color: '#8B5CF6' },
    { name: 'Sản xuất', value: customers.filter(c => c.industry === 'Sản xuất').length, color: '#F97316' },
    { name: 'Tư vấn', value: customers.filter(c => c.industry === 'Tư vấn').length, color: '#10B981' },
    { name: 'Bán lẻ', value: customers.filter(c => c.industry === 'Bán lẻ').length, color: '#EC4899' }
  ]

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  const renderChart = (data: ChartData[], title: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600">Phân tích chi tiết về hành vi và hiệu suất khách hàng</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-[#e6ebf1] rounded-[10px] hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-[10px] hover:bg-primary-700">
            <RefreshCw className="w-4 h-4" />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                  <span className="text-sm text-gray-600">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                {metric.change && (
                  <div className={`flex items-center space-x-1 mt-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span className="text-xs font-medium">
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderChart(statusData, 'Phân bố theo trạng thái')}
        {renderChart(engagementData, 'Phân bố điểm tương tác')}
        {renderChart(churnRiskData, 'Phân bố rủi ro rời bỏ')}
        {renderChart(industryData, 'Phân bố theo ngành')}
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Hiệu suất tương tác
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tỷ lệ mở email trung bình</span>
                <span className="font-medium">
                  {Math.round(customers.reduce((sum, c) => sum + c.emailOpenRate, 0) / customers.length)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#3e79f7] h-2 rounded-full" 
                  style={{ 
                    width: `${Math.round(customers.reduce((sum, c) => sum + c.emailOpenRate, 0) / customers.length)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tỷ lệ click trung bình</span>
                <span className="font-medium">
                  {Math.round(customers.reduce((sum, c) => sum + c.clickRate, 0) / customers.length)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#2dc56a] h-2 rounded-full" 
                  style={{ 
                    width: `${Math.round(customers.reduce((sum, c) => sum + c.clickRate, 0) / customers.length)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Thời gian phản hồi TB</span>
                <span className="font-medium">{analytics.avgResponseTime} giờ</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(analytics.avgResponseTime * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Cơ hội kinh doanh
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-[10px] p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Upsell Potential</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.upsellScore >= 70).length}
              </div>
              <div className="text-sm text-green-600">khách hàng có tiềm năng cao</div>
            </div>
            
            <div className="bg-blue-50 border border-[#c7d9fd] rounded-[10px] p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">VIP Candidates</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {customers.filter(c => c.engagementScore >= 80 && c.status !== 'vip').length}
              </div>
              <div className="text-sm text-blue-600">ứng viên VIP tiềm năng</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-[10px] p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Recovery Potential</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatValue(customers.filter(c => c.churnRisk >= 50)
                  .reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0))} VNĐ
              </div>
              <div className="text-sm text-orange-600">giá trị có thể recover</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Xu hướng theo thời gian
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
              <div>
                <div className="font-medium text-gray-900">Khách hàng mới</div>
                <div className="text-sm text-gray-500">Tuần này</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">+{analytics.customerGrowth}</div>
                <div className="text-xs text-green-600">↑ 15.2%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
              <div>
                <div className="font-medium text-gray-900">Churn Rate</div>
                <div className="text-sm text-gray-500">Tháng này</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{100 - analytics.retentionRate}%</div>
                <div className="text-xs text-green-600">↓ 2.1%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]">
              <div>
                <div className="font-medium text-gray-900">Revenue Growth</div>
                <div className="text-sm text-gray-500">So với tháng trước</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">+18.5%</div>
                <div className="text-xs text-green-600">↑ Tăng mạnh</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Insights & Khuyến nghị
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Cảnh báo</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              {analytics.atRiskCustomers} khách hàng có nguy cơ rời bỏ cao, 
              cần chăm sóc khẩn cấp.
            </p>
            <button className="text-sm bg-[#ff6b72] text-white px-3 py-1 rounded hover:bg-[#d9505c]">
              Xem chi tiết
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Cơ hội</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              {customers.filter(c => c.upsellScore >= 70).length} khách hàng 
              có tiềm năng upsell cao.
            </p>
            <button className="text-sm bg-[#2dc56a] text-white px-3 py-1 rounded hover:bg-[#04d182]">
              Tạo campaign
            </button>
          </div>

          <div className="bg-blue-50 border border-[#c7d9fd] rounded-[10px] p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Tối ưu</span>
            </div>
            <p className="text-sm text-[#3e79f7] mb-3">
              Tỷ lệ mở email trung bình {Math.round(customers.reduce((sum, c) => sum + c.emailOpenRate, 0) / customers.length)}%, 
              có thể cải thiện nội dung.
            </p>
            <button className="text-sm bg-[#3e79f7] text-white px-3 py-1 rounded hover:bg-[#699dff]">
              Xem gợi ý
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
