'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  Filter, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Brain,
  Target,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface DashboardFiltersProps {
  onFilterChange?: (filters: any) => void
}

export default function EnhancedDashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [timeFilter, setTimeFilter] = useState('thisMonth')
  const [compareTimeFilter, setCompareTimeFilter] = useState('lastMonth')
  const [teamFilter, setTeamFilter] = useState('')
  const [viewType, setViewType] = useState('all') // 'all', 'department', 'team', 'individual'
  const [productFilter, setProductFilter] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [showCustomDateModal, setShowCustomDateModal] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showLeadsList, setShowLeadsList] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showRevenueReport, setShowRevenueReport] = useState(false)

  const handleTimeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDateModal(true)
    } else {
      setTimeFilter(value)
      notifyFilterChange({ time: value, compareTime: compareTimeFilter, team: teamFilter, viewType: viewType, product: productFilter })
    }
  }

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setTimeFilter('custom')
      setShowCustomDateModal(false)
      notifyFilterChange({ 
        time: 'custom', 
        customStartDate, 
        customEndDate, 
        compareTime: compareTimeFilter, 
        team: teamFilter, 
        viewType: viewType,
        product: productFilter 
      })
    }
  }

  const formatCustomDateDisplay = () => {
    if (timeFilter === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate).toLocaleDateString('vi-VN')
      const endDate = new Date(customEndDate).toLocaleDateString('vi-VN')
      return `${startDate} - ${endDate}`
    }
    return ''
  }

  const getFilterOptions = () => {
    switch (viewType) {
      case 'department':
        return [
          { value: 'phong_kinh_doanh', label: 'Phòng Kinh doanh' },
          { value: 'phong_marketing', label: 'Phòng Marketing' },
          { value: 'phong_cskh', label: 'Phòng CSKH' },
          { value: 'phong_ke_toan', label: 'Phòng Kế toán' },
        ]
      case 'team':
        return [
          { value: 'team_sales_1', label: 'Team Sales 1' },
          { value: 'team_sales_2', label: 'Team Sales 2' },
          { value: 'team_marketing_digital', label: 'Team Marketing Digital' },
          { value: 'team_marketing_content', label: 'Team Marketing Content' },
          { value: 'team_cskh_online', label: 'Team CSKH Online' },
          { value: 'team_cskh_offline', label: 'Team CSKH Offline' },
        ]
      case 'individual':
        return [
          { value: 'nguyen_van_a', label: 'Nguyễn Văn A' },
          { value: 'tran_thi_b', label: 'Trần Thị B' },
          { value: 'le_van_c', label: 'Lê Văn C' },
          { value: 'pham_thi_d', label: 'Phạm Thị D' },
          { value: 'hoang_van_e', label: 'Hoàng Văn E' },
          { value: 'vu_thi_f', label: 'Vũ Thị F' },
        ]
      default:
        return []
    }
  }

  const handleCompareTimeChange = (value: string) => {
    setCompareTimeFilter(value)
    notifyFilterChange({ time: timeFilter, compareTime: value, team: teamFilter, viewType: viewType, product: productFilter })
  }

  const handleTeamChange = (value: string) => {
    setTeamFilter(value)
    notifyFilterChange({ time: timeFilter, compareTime: compareTimeFilter, team: value, viewType: viewType, product: productFilter })
  }

  const handleViewTypeChange = (value: string) => {
    setViewType(value)
    setTeamFilter('') // Reset team filter when changing view type
    notifyFilterChange({ time: timeFilter, compareTime: compareTimeFilter, team: '', viewType: value, product: productFilter })
  }

  const handleProductChange = (value: string) => {
    setProductFilter(value)
    notifyFilterChange({ time: timeFilter, compareTime: compareTimeFilter, team: teamFilter, product: value })
  }

  const notifyFilterChange = (filters: any) => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  // Sample AI insights data
  const aiInsights = [
    {
      type: 'positive',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Tăng trưởng mạnh',
      message: 'Leads từ Facebook tăng 45% so với tháng trước. Nên tăng ngân sách quảng cáo Facebook.',
      priority: 'high'
    },
    {
      type: 'warning',
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Cần chú ý',
      message: 'Tỷ lệ chuyển đổi từ Zalo giảm 12%. Kiểm tra chất lượng nội dung.',
      priority: 'medium'
    },
    {
      type: 'suggestion',
      icon: <Target className="w-4 h-4" />,
      title: 'Gợi ý tối ưu',
      message: 'Nhóm A có tỷ lệ chốt cao nhất (68%). Nên áp dụng phương pháp này cho nhóm khác.',
      priority: 'medium'
    }
  ]

  // Sample comparison data
  const comparisonData = [
    { metric: 'Doanh thu', current: '2.8 tỷ', previous: '2.5 tỷ', change: 12.0, trend: 'up' },
    { metric: 'Leads mới', current: '245', previous: '230', change: 6.5, trend: 'up' },
    { metric: 'Tỷ lệ chuyển đổi', current: '23.5%', previous: '25.1%', change: -6.4, trend: 'down' },
    { metric: 'Đơn hàng', current: '56', previous: '48', change: 16.7, trend: 'up' }
  ]

  return (
    <div className="mb-6 space-y-4">
      {/* Main Filters - Hidden */}
      {/*
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-[10px] shadow-sm border border-[#e6ebf1]">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Thời gian:</label>
            <div className="relative">
              <select 
                value={timeFilter}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="appearance-none bg-gray-50 border border-[#e6ebf1] text-gray-700 py-1.5 px-3 pr-8 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#3e79f7] focus:border-transparent text-sm"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="last7days">7 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="thisQuarter">Quý này</option>
                <option value="thisYear">Năm nay</option>
                <option value="custom">Tùy chọn</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            {timeFilter === 'custom' && customStartDate && customEndDate && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {formatCustomDateDisplay()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <select 
                value={viewType}
                onChange={(e) => handleViewTypeChange(e.target.value)}
                className="border border-[#e6ebf1] rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
              >
                <option value="all">Toàn bộ</option>
                <option value="department">Theo phòng ban</option>
                <option value="team">Theo team</option>
                <option value="individual">Theo cá nhân</option>
              </select>
              
              {viewType !== 'all' && (
                <select 
                  value={teamFilter}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="border border-[#e6ebf1] rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
                >
                  <option value="">Tất cả {viewType === 'department' ? 'phòng ban' : viewType === 'team' ? 'team' : 'nhân viên'}</option>
                  {getFilterOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="hidden"
          >
            <Filter className="w-4 h-4" />
            <span>Lọc nâng cao</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-200 shadow-sm ${
              showComparison 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105' 
                : 'bg-white border-2 border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${showComparison ? 'animate-pulse' : ''}`} />
            <span className="relative">
              📊 So sánh
              {showComparison && (
                <span className="absolute -top-1 -right-6 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2dc56a]"></span>
                </span>
              )}
            </span>
          </button>
          
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`group relative flex items-center gap-3 px-6 py-3 rounded-[10px] text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg ${
              showAIInsights 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 text-purple-700 hover:border-purple-300 hover:from-purple-100 hover:to-indigo-100'
            }`}
          >
            {!showAIInsights && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  4 gợi ý
                </div>
              </div>
            )}
            <div className={`p-2 rounded-[10px] transition-all duration-200 ${
              showAIInsights 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600'
            }`}>
              <Brain className={`w-5 h-5 transition-all duration-200 ${
                showAIInsights 
                  ? 'text-white' 
                  : 'text-white'
              }`} />
            </div>
            <div className="flex flex-col">
              <span className="relative flex items-center gap-2">
                🤖 AI Phân tích thông minh
                {!showAIInsights && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#2dc56a] rounded-full"></div>
                    <span className="text-xs font-normal opacity-75">Live</span>
                  </div>
                )}
              </span>
              {!showAIInsights && (
                <span className="text-xs opacity-75 font-normal">
                  23 leads • 3 quá hạn • 18.5% conversion
                </span>
              )}
            </div>
            {showAIInsights && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>
      </div>
      */}

      {/* Comparison Panel */}
      {showComparison && (
        <div className="bg-white border border-[#e6ebf1] rounded-[10px] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              So sánh hiệu suất
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">So với:</span>
              <select 
                value={compareTimeFilter}
                onChange={(e) => handleCompareTimeChange(e.target.value)}
                className="border border-[#e6ebf1] rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
              >
                <option value="lastMonth">Tháng trước</option>
                <option value="lastQuarter">Quý trước</option>
                <option value="lastYear">Năm trước</option>
                <option value="sameMonthLastYear">Cùng kỳ năm trước</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {comparisonData.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{item.metric}</span>
                  <div className={`flex items-center text-sm font-medium ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(item.change)}%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{item.current}</span>
                  <span className="text-sm text-gray-500">{item.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="mt-8">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[10px] mr-3 shadow-lg">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            🤖 Gợi ý từ AI
            <div className="inline-flex items-center rounded-full border px-3 py-1 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-3 text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm">
              <div className="w-2 h-2 bg-[#2dc56a] rounded-full animate-pulse mr-2"></div>
              Live AI
            </div>
          </h3>
          <div className="space-y-3 mb-6">
            {/* Leads hot chưa liên hệ */}
            <div className="bg-white border border-red-200 hover:border-red-300 rounded-[10px] p-4 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">Ưu tiên gọi 23 leads hot</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 text-xs animate-pulse">
                      🔥 KHẨN CẤP
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Dựa trên thống kê: 23 leads hot chưa liên hệ (+15% từ tuần trước). Bắt đầu với 5 leads có điểm số cao nhất.</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center space-x-1 bg-red-100 rounded-full px-2 py-1">
                      <Target className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-700 font-bold">23 leads</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-100 rounded-full px-2 py-1">
                      <Brain className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700 font-bold">98% tin cậy</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 rounded-full px-2 py-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700 font-bold">Impact cao</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Thời gian dự kiến: <span className="font-medium">2-3 giờ</span></div>
                    <button 
                      onClick={() => setShowLeadsList(true)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 bg-red-500 hover:bg-[#ff6b72] text-white"
                    >
                      Xem danh sách
                      <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Khách hàng cần liên hệ lại */}
            <div className="bg-white border border-orange-200 hover:border-orange-300 rounded-[10px] p-4 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">Follow-up 3 khách hàng quá hạn</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-orange-100 text-orange-700 border-orange-300 text-xs">
                      ⚡ ƯU TIÊN CAO
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Trong 12 khách hàng cần follow-up, có 3 khách đã quá hạn liên hệ. Gửi email cá nhân hóa để duy trì mối quan hệ.</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center space-x-1 bg-orange-100 rounded-full px-2 py-1">
                      <Calendar className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-orange-700 font-bold">3 quá hạn</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-100 rounded-full px-2 py-1">
                      <Brain className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700 font-bold">92% tin cậy</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-100 rounded-full px-2 py-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-[#3e79f7] font-bold">Giữ chân KH</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Thời gian dự kiến: <span className="font-medium">1 giờ</span></div>
                    <button 
                      onClick={() => setShowEmailComposer(true)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Soạn email
                      <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tỷ lệ chuyển đổi */}
            <div className="bg-white border border-green-200 hover:border-green-300 rounded-[10px] p-4 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                      <path d="M3 3v18h18"></path>
                      <path d="M18 17V9"></path>
                      <path d="M13 17V5"></path>
                      <path d="M8 17v-3"></path>
                    </svg>
                  </div>
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-[#2dc56a] rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">Tỷ lệ chuyển đổi tăng 18.5%</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-green-100 text-green-700 border-green-300 text-xs">
                      📈 TÍCH CỰC
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Tỷ lệ chuyển đổi tháng này đạt 18.5% (+2.3% so với tháng trước). Tập trung vào các kênh có ROI cao nhất.</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center space-x-1 bg-green-100 rounded-full px-2 py-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700 font-bold">+2.3%</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-100 rounded-full px-2 py-1">
                      <Brain className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700 font-bold">95% tin cậy</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-100 rounded-full px-2 py-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-[#3e79f7] font-bold">Trend tốt</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Thời gian dự kiến: <span className="font-medium">30 phút</span></div>
                    <button 
                      onClick={() => setShowAnalytics(true)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-green-300 text-green-600 hover:bg-green-50"
                    >
                      Phân tích
                      <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doanh thu dự kiến */}
            <div className="bg-white border border-[#c7d9fd] hover:border-blue-300 rounded-[10px] p-4 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                      <line x1="12" x2="12" y1="2" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900">Doanh thu dự kiến 2.4M VNĐ</h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-blue-100 text-[#3e79f7] border-blue-300 text-xs">
                      💰 TIẾN ĐỘ TỐT
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Đã hoàn thành 85% mục tiêu doanh thu tháng này. Tập trung vào 5 deals lớn nhất để đạt 100% mục tiêu.</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center space-x-1 bg-blue-100 rounded-full px-2 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-blue-600">
                        <line x1="12" x2="12" y1="2" y2="22"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      <span className="text-xs text-[#3e79f7] font-bold">85% mục tiêu</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-100 rounded-full px-2 py-1">
                      <Brain className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700 font-bold">90% tin cậy</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 rounded-full px-2 py-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-700 font-bold">On track</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Thời gian dự kiến: <span className="font-medium">1 giờ</span></div>
                    <button 
                      onClick={() => setShowRevenueReport(true)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Xem báo cáo
                      <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights thông minh */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-[10px] p-4">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-600 mr-2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
                <h5 className="text-sm font-semibold text-purple-900">Insight thông minh</h5>
              </div>
              <p className="text-sm text-purple-700">Leads từ Facebook Ads có tỷ lệ chuyển đổi cao nhất (24.3%). Nên tăng ngân sách cho kênh này.</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-[10px] p-4">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-cyan-600 mr-2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <h5 className="text-sm font-semibold text-cyan-900">Hiệu suất team</h5>
              </div>
              <p className="text-sm text-cyan-700">Team đang hoạt động tốt với 92% leads được liên hệ trong 24h. Duy trì nhịp độ này.</p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white border border-[#e6ebf1] rounded-[10px] p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc nâng cao</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lead Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái Lead</label>
              <select className="w-full border border-[#e6ebf1] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]">
                <option value="">Tất cả</option>
                <option value="new">Mới</option>
                <option value="contacted">Đã liên hệ</option>
                <option value="qualified">Đủ điều kiện</option>
                <option value="proposal">Đề xuất</option>
                <option value="negotiation">Đàm phán</option>
                <option value="closed_won">Thành công</option>
                <option value="closed_lost">Thất bại</option>
              </select>
            </div>

            {/* Lead Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn Lead</label>
              <select className="w-full border border-[#e6ebf1] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]">
                <option value="">Tất cả</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google Ads</option>
                <option value="zalo">Zalo</option>
                <option value="website">Website</option>
                <option value="referral">Giới thiệu</option>
                <option value="phone">Điện thoại</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Revenue Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị đơn hàng</label>
              <select className="w-full border border-[#e6ebf1] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3e79f7] focus:border-[#3e79f7]">
                <option value="">Tất cả</option>
                <option value="0-10m">0 - 10 triệu</option>
                <option value="10m-50m">10 - 50 triệu</option>
                <option value="50m-100m">50 - 100 triệu</option>
                <option value="100m-500m">100 - 500 triệu</option>
                <option value="500m+">Trên 500 triệu</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={() => setShowAdvancedFilters(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button className="px-4 py-2 bg-[#3e79f7] text-white text-sm rounded-[10px] hover:bg-[#699dff] transition-colors">
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Custom Date Picker Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn khoảng thời gian tùy chỉnh</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full border border-[#e6ebf1] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3e79f7] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full border border-[#e6ebf1] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3e79f7] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setShowCustomDateModal(false)
                  setTimeFilter('thisMonth') // Reset to default if cancelled
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleCustomDateSubmit}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-[#3e79f7] text-white text-sm rounded-[10px] hover:bg-[#699dff] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads List Modal */}
      {showLeadsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                📋 Danh sách leads cần liên hệ ưu tiên
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">67 leads</span>
              </h3>
              <button 
                onClick={() => setShowLeadsList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-[10px]">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <span className="font-medium text-yellow-800">Cảnh báo thời gian phản hồi</span>
              </div>
              <p className="text-sm text-yellow-700">Các leads này đã quá 2 giờ chưa được liên hệ. Tỷ lệ chuyển đổi sẽ giảm 50% nếu không xử lý ngay.</p>
            </div>

            <div className="overflow-y-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Lead</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nguồn</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Thời gian nhận</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Độ ưu tiên</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Điểm chất lượng</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Nguyễn Văn A', phone: '0901234567', source: 'Facebook', time: '3.2h', priority: 'Cao', quality: '9.2', email: 'nguyenvana@email.com' },
                    { name: 'Trần Thị B', phone: '0912345678', source: 'Website', time: '2.8h', priority: 'Cao', quality: '8.9', email: 'tranthib@email.com' },
                    { name: 'Lê Văn C', phone: '0923456789', source: 'Zalo', time: '2.5h', priority: 'Trung bình', quality: '7.8', email: 'levanc@email.com' },
                    { name: 'Phạm Thị D', phone: '0934567890', source: 'Google Ads', time: '2.1h', priority: 'Cao', quality: '9.0', email: 'phamthid@email.com' },
                    { name: 'Hoàng Văn E', phone: '0945678901', source: 'Referral', time: '4.1h', priority: 'Rất cao', quality: '9.5', email: 'hoangvane@email.com' },
                  ].map((lead, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{lead.name}</span>
                          <span className="text-sm text-gray-500">{lead.phone}</span>
                          <span className="text-xs text-gray-400">{lead.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          parseFloat(lead.time) > 3 ? 'text-red-600' : 
                          parseFloat(lead.time) > 2 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {lead.time} trước
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lead.priority === 'Rất cao' ? 'bg-red-100 text-red-800' :
                          lead.priority === 'Cao' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${
                            parseFloat(lead.quality) >= 9 ? 'text-green-600' :
                            parseFloat(lead.quality) >= 8 ? 'text-blue-600' : 'text-yellow-600'
                          }`}>
                            {lead.quality}
                          </span>
                          <span className="text-gray-400">/10</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="px-3 py-1 bg-[#2dc56a] hover:bg-[#2dc56a] text-white text-xs rounded transition-colors">
                            📞 Gọi ngay
                          </button>
                          <button className="px-3 py-1 bg-blue-500 hover:bg-[#3e79f7] text-white text-xs rounded transition-colors">
                            💬 SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Hiển thị 5 trong số 67 leads. Sắp xếp theo độ ưu tiên.
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowLeadsList(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Đóng
                </button>
                <button className="px-4 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff] transition-colors">
                  Xuất Excel
                </button>
                <button className="px-4 py-2 bg-[#2dc56a] text-white rounded-[10px] hover:bg-[#04d182] transition-colors">
                  Phân bổ hàng loạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] p-6 w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                📧 Soạn email follow-up
                <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">12 khách hàng</span>
              </h3>
              <button 
                onClick={() => setShowEmailComposer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 p-3 rounded-[10px] border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-medium text-orange-800">Email template được AI tối ưu</span>
                </div>
                <p className="text-sm text-orange-700">AI đã phân tích lịch sử tương tác và tạo email cá nhân hóa cho từng khách hàng.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề email</label>
                  <input 
                    type="text" 
                    defaultValue="🎯 Cập nhật quan trọng cho [Tên khách hàng] - Ưu đãi đặc biệt"
                    className="w-full border border-[#e6ebf1] rounded-[10px] px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
                  <select className="w-full border border-[#e6ebf1] rounded-[10px] px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option>Cao - Gửi ngay</option>
                    <option>Trung bình - Gửi trong ngày</option>
                    <option>Thấp - Gửi trong tuần</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung email</label>
                <textarea 
                  rows={8}
                  defaultValue={`Chào [Tên khách hàng],

Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Qua việc phân tích nhu cầu của bạn, chúng tôi có một số cập nhật quan trọng:

✅ Sản phẩm [Tên sản phẩm] hiện có ưu đãi đặc biệt 15% (chỉ áp dụng đến cuối tháng)
✅ Chúng tôi đã chuẩn bị demo cá nhân hóa dựa trên yêu cầu của bạn
✅ Đội ngũ kỹ thuật sẵn sàng hỗ trợ setup miễn phí

Bạn có 15 phút để trao đổi trực tiếp không? Tôi tin rằng giải pháp này sẽ giúp [công ty/dự án] của bạn tiết kiệm đáng kể chi phí và thời gian.

Trân trọng,
[Tên sales]`}
                  className="w-full border border-[#e6ebf1] rounded-[10px] px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  📊 Tỷ lệ mở email dự kiến: <span className="font-semibold text-green-600">78%</span> | 
                  Click rate: <span className="font-semibold text-blue-600">23%</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowEmailComposer(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-[10px] hover:bg-orange-600 transition-colors">
                    📧 Gửi ngay (12 emails)
                  </button>
                  <button className="px-4 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff] transition-colors">
                    ⏰ Lên lịch gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] p-6 w-full max-w-5xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                📈 Phân tích tỷ lệ chuyển đổi chi tiết
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+18.5%</span>
              </h3>
              <button 
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-[10px] border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">📊 Kênh conversion cao nhất</h4>
                  <div className="space-y-2">
                    {[
                      { channel: 'Facebook Ads', rate: '24.3%', trend: '+3.2%', leads: 156 },
                      { channel: 'Google Ads', rate: '21.7%', trend: '+1.8%', leads: 134 },
                      { channel: 'Website Organic', rate: '19.2%', trend: '+2.1%', leads: 98 },
                      { channel: 'Referral', rate: '31.5%', trend: '+5.4%', leads: 43 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium text-sm">{item.channel}</div>
                          <div className="text-xs text-gray-500">{item.leads} leads</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{item.rate}</div>
                          <div className="text-xs text-green-500">{item.trend}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-[10px] border border-[#c7d9fd]">
                  <h4 className="font-semibold text-blue-800 mb-3">⏱️ Conversion theo thời gian</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trong 24h đầu</span>
                      <span className="font-bold text-blue-600">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trong 3 ngày</span>
                      <span className="font-bold text-blue-600">73%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trong 1 tuần</span>
                      <span className="font-bold text-blue-600">89%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sau 1 tuần</span>
                      <span className="font-bold text-gray-500">11%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-[10px] border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">🎯 Gợi ý tối ưu</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border-l-4 border-green-400">
                      <div className="font-medium text-sm text-green-800">Tăng budget Referral</div>
                      <div className="text-xs text-green-600">Conversion rate cao nhất (31.5%) nhưng volume thấp</div>
                    </div>
                    <div className="p-2 bg-white rounded border-l-4 border-[#699dff]">
                      <div className="font-medium text-sm text-blue-800">Tối ưu Facebook Ads</div>
                      <div className="text-xs text-blue-600">Volume cao nhưng có thể cải thiện chất lượng leads</div>
                    </div>
                    <div className="p-2 bg-white rounded border-l-4 border-orange-400">
                      <div className="font-medium text-sm text-orange-800">Follow-up nhanh hơn</div>
                      <div className="text-xs text-orange-600">45% conversion trong 24h đầu</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-6">
              <div className="text-sm text-gray-600">
                Dữ liệu cập nhật: 5 phút trước | Độ tin cậy: <span className="font-semibold text-green-600">95%</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAnalytics(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Đóng
                </button>
                <button className="px-4 py-2 bg-[#2dc56a] text-white rounded-[10px] hover:bg-[#04d182] transition-colors">
                  📊 Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report Modal */}
      {showRevenueReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                💰 Báo cáo doanh thu chi tiết
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">2.4M VNĐ</span>
              </h3>
              <button 
                onClick={() => setShowRevenueReport(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-blue-50 p-4 rounded-[10px] border border-[#c7d9fd]">
                  <h4 className="font-semibold text-blue-800 mb-3">📈 Tiến độ mục tiêu tháng</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Đã đạt được</span>
                        <span className="text-sm font-bold text-blue-600">2.4M / 2.8M VNĐ</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#3e79f7] h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">85% hoàn thành</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-lg font-bold text-green-600">0.4M</div>
                        <div className="text-xs text-gray-500">Còn lại</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-lg font-bold text-blue-600">5 ngày</div>
                        <div className="text-xs text-gray-500">Thời hạn</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-[10px] border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">🎯 Top 5 deals lớn nhất</h4>
                  <div className="space-y-2">
                    {[
                      { company: 'Công ty TNHH ABC', value: '180M', probability: '90%', stage: 'Closing' },
                      { company: 'Doanh nghiệp XYZ', value: '120M', probability: '75%', stage: 'Negotiation' },
                      { company: 'Startup DEF', value: '85M', probability: '60%', stage: 'Proposal' },
                      { company: 'Tập đoàn GHI', value: '95M', probability: '85%', stage: 'Demo' },
                      { company: 'Company JKL', value: '70M', probability: '50%', stage: 'Discovery' },
                    ].map((deal, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium text-sm">{deal.company}</div>
                          <div className="text-xs text-gray-500">{deal.stage}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{deal.value}</div>
                          <div className="text-xs text-blue-600">{deal.probability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-[10px] border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">🔮 Dự báo AI</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border">
                      <div className="text-sm font-medium text-green-800">Khả năng đạt mục tiêu</div>
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-xs text-green-500">Dựa trên pipeline hiện tại</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="text-sm font-medium text-blue-800">Doanh thu dự kiến</div>
                      <div className="text-lg font-bold text-blue-600">2.75M VNĐ</div>
                      <div className="text-xs text-blue-500">±0.2M (độ tin cậy 90%)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-[10px] border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-3">⚡ Hành động ưu tiên</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border-l-4 border-red-400">
                      <div className="font-medium text-sm text-red-800">Urgency: Deal ABC 180M</div>
                      <div className="text-xs text-red-600">Closing trong 2 ngày</div>
                    </div>
                    <div className="p-2 bg-white rounded border-l-4 border-orange-400">
                      <div className="font-medium text-sm text-orange-800">Follow-up: Deal XYZ</div>
                      <div className="text-xs text-orange-600">Scheduled demo tomorrow</div>
                    </div>
                    <div className="p-2 bg-white rounded border-l-4 border-[#699dff]">
                      <div className="font-medium text-sm text-blue-800">Nurture: 3 deals nhỏ</div>
                      <div className="text-xs text-blue-600">Tổng 65M backup plans</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-[10px] border border-[#e6ebf1]">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Thống kê nhanh</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Deals active:</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg deal size:</span>
                      <span className="font-bold">104M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Close rate:</span>
                      <span className="font-bold text-green-600">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales cycle:</span>
                      <span className="font-bold">21 ngày</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-6">
              <div className="text-sm text-gray-600">
                Cập nhật realtime | Độ chính xác dự báo: <span className="font-semibold text-green-600">90%</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRevenueReport(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    setShowRevenueReport(false)
                    // Navigate to detailed reports page
                    window.location.href = '/reports/detailed'
                  }}
                  className="px-4 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff] transition-colors"
                >
                  � Xem báo cáo chi tiết
                </button>
                <button className="px-4 py-2 bg-[#2dc56a] text-white rounded-[10px] hover:bg-[#04d182] transition-colors">
                  📊 Xuất báo cáo Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
