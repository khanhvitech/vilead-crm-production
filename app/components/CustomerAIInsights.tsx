'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, TrendingUp, AlertTriangle, Target, Star, MessageCircle,
  Brain, Lightbulb, Send, Calendar, DollarSign, Users, 
  CheckCircle, XCircle, RefreshCw, Eye, Bell, Gift
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'optimization' | 'prediction'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: 'engagement' | 'retention' | 'upsell' | 'acquisition'
  customerId?: number
  customerName?: string
  recommendations: string[]
  metrics?: {
    currentValue: number
    projectedValue: number
    timeframe: string
  }
  createdAt: string
  status: 'new' | 'reviewing' | 'applied' | 'dismissed'
}

interface CustomerAIInsightsProps {
  customers: any[]
}

export default function CustomerAIInsights({ customers }: CustomerAIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [filterType, setFilterType] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [showInsightModal, setShowInsightModal] = useState(false)

  useEffect(() => {
    // Generate AI insights based on customer data
    const generateInsights = () => {
      const newInsights: AIInsight[] = []

      // Churn Risk Insights
      const highRiskCustomers = customers.filter(c => c.churnRisk >= 70)
      if (highRiskCustomers.length > 0) {
        newInsights.push({
          id: 'churn-risk-1',
          type: 'risk',
          priority: 'high',
          title: `${highRiskCustomers.length} khách hàng có nguy cơ rời bỏ cao`,
          description: `Phát hiện ${highRiskCustomers.length} khách hàng với điểm rủi ro ≥70%. Cần hành động ngay để giữ chân khách hàng.`,
          confidence: 89,
          impact: 'high',
          category: 'retention',
          recommendations: [
            'Gọi điện trực tiếp trong vòng 24h',
            'Gửi ưu đãi đặc biệt giảm 20-30%',
            'Lên lịch meeting để hiểu vấn đề',
            'Chuyển giao cho Account Manager senior'
          ],
          metrics: {
            currentValue: highRiskCustomers.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0),
            projectedValue: highRiskCustomers.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0) * 0.6,
            timeframe: '3 tháng'
          },
          createdAt: new Date().toISOString(),
          status: 'new'
        })
      }

      // Upsell Opportunities
      const upsellCandidates = customers.filter(c => c.upsellScore >= 75 && c.status === 'active')
      if (upsellCandidates.length > 0) {
        newInsights.push({
          id: 'upsell-opp-1',
          type: 'opportunity',
          priority: 'high',
          title: `${upsellCandidates.length} cơ hội upsell tiềm năng cao`,
          description: `Có ${upsellCandidates.length} khách hàng với điểm upsell ≥75, thời điểm lý tưởng để chào bán gói cao cấp.`,
          confidence: 82,
          impact: 'high',
          category: 'upsell',
          recommendations: [
            'Chuẩn bị proposal gói Premium/Enterprise',
            'Phân tích nhu cầu cụ thể của từng khách hàng',
            'Lên lịch demo sản phẩm nâng cao',
            'Cung cấp case study thành công tương tự'
          ],
          metrics: {
            currentValue: upsellCandidates.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0),
            projectedValue: upsellCandidates.reduce((sum, c) => sum + parseInt(c.totalValue.replace(/,/g, '')), 0) * 1.4,
            timeframe: '2 tháng'
          },
          createdAt: new Date().toISOString(),
          status: 'new'
        })
      }

      // Engagement Optimization
      const lowEngagementCustomers = customers.filter(c => c.engagementScore < 40 && c.status === 'active')
      if (lowEngagementCustomers.length > 0) {
        newInsights.push({
          id: 'engagement-opt-1',
          type: 'optimization',
          priority: 'medium',
          title: `Tối ưu engagement cho ${lowEngagementCustomers.length} khách hàng`,
          description: `${lowEngagementCustomers.length} khách hàng có điểm tương tác thấp (<40). Cần cải thiện chiến lược communication.`,
          confidence: 76,
          impact: 'medium',
          category: 'engagement',
          recommendations: [
            'Personalize nội dung email theo sở thích',
            'Thay đổi thời gian gửi email (A/B test)',
            'Tạo nội dung interactive (survey, poll)',
            'Gửi tin nhắn qua kênh ưa thích của khách hàng'
          ],
          createdAt: new Date().toISOString(),
          status: 'new'
        })
      }

      // VIP Potential
      const vipCandidates = customers.filter(c => 
        c.engagementScore >= 80 && 
        parseInt(c.totalValue.replace(/,/g, '')) >= 500000000 && 
        c.status !== 'vip'
      )
      if (vipCandidates.length > 0) {
        newInsights.push({
          id: 'vip-potential-1',
          type: 'opportunity',
          priority: 'medium',
          title: `${vipCandidates.length} ứng viên VIP tiềm năng`,
          description: `Phát hiện ${vipCandidates.length} khách hàng đủ điều kiện lên hạng VIP (engagement ≥80, value ≥500M).`,
          confidence: 85,
          impact: 'medium',
          category: 'retention',
          recommendations: [
            'Đánh giá chi tiết profile khách hàng',
            'Chuẩn bị gói ưu đãi VIP',
            'Gửi thư mời tham gia chương trình VIP',
            'Assign Account Manager chuyên biệt'
          ],
          createdAt: new Date().toISOString(),
          status: 'new'
        })
      }

      // Seasonal Opportunity
      newInsights.push({
        id: 'seasonal-1',
        type: 'prediction',
        priority: 'medium',
        title: 'Dự báo tăng trưởng Q3: +25% conversion',
        description: 'AI dự đoán Q3 sẽ có tăng trưởng mạnh dựa trên pattern lịch sử và xu hướng thị trường.',
        confidence: 73,
        impact: 'high',
        category: 'acquisition',
        recommendations: [
          'Chuẩn bị inventory và nhân sự cho Q3',
          'Tăng budget marketing 30-40%',
          'Launch campaign sớm từ cuối Q2',
          'Optimize landing page và funnel'
        ],
        metrics: {
          currentValue: 1200000000,
          projectedValue: 1500000000,
          timeframe: 'Q3 2024'
        },
        createdAt: new Date().toISOString(),
        status: 'new'
      })

      return newInsights
    }

    setInsights(generateInsights())
  }, [customers])

  const filteredInsights = insights.filter(insight => {
    const matchesType = !filterType || insight.type === filterType
    const matchesPriority = !filterPriority || insight.priority === filterPriority
    const matchesStatus = !filterStatus || insight.status === filterStatus
    return matchesType && matchesPriority && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4" />
      case 'risk':
        return <AlertTriangle className="w-4 h-4" />
      case 'optimization':
        return <Target className="w-4 h-4" />
      case 'prediction':
        return <Brain className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-100'
      case 'risk':
        return 'text-red-600 bg-red-100'
      case 'optimization':
        return 'text-blue-600 bg-blue-100'
      case 'prediction':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-[#e6ebf1]'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleInsightAction = (insightId: string, action: 'apply' | 'dismiss' | 'review') => {
    setInsights(insights.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: action === 'apply' ? 'applied' : action === 'dismiss' ? 'dismissed' : 'reviewing' }
        : insight
    ))
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B VNĐ`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M VNĐ`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K VNĐ`
    return `${value} VNĐ`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            AI Customer Insights
          </h2>
          <p className="text-gray-600">Insights và khuyến nghị thông minh dựa trên AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-[10px] hover:bg-primary-700">
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới insights</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Tổng insights</div>
              <div className="text-2xl font-bold text-primary-600">{insights.length}</div>
            </div>
            <Brain className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ưu tiên cao</div>
              <div className="text-2xl font-bold text-red-600">
                {insights.filter(i => i.priority === 'high').length}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Cơ hội</div>
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.type === 'opportunity').length}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Độ tin cậy TB</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả loại</option>
            <option value="opportunity">Cơ hội</option>
            <option value="risk">Rủi ro</option>
            <option value="optimization">Tối ưu</option>
            <option value="prediction">Dự báo</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả mức độ</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="applied">Đã áp dụng</option>
            <option value="dismissed">Đã bỏ qua</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Hiển thị {filteredInsights.length} / {insights.length} insights
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(insight.type)}`}>
                  {getTypeIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}>
                      {insight.priority === 'high' ? 'Cao' : insight.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>{insight.confidence}% tin cậy</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  
                  {/* Metrics */}
                  {insight.metrics && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-[10px]">
                      <div>
                        <div className="text-xs text-gray-500">Giá trị hiện tại</div>
                        <div className="font-medium text-gray-900">{formatCurrency(insight.metrics.currentValue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Dự kiến</div>
                        <div className="font-medium text-green-600">{formatCurrency(insight.metrics.projectedValue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Thời gian</div>
                        <div className="font-medium text-gray-900">{insight.metrics.timeframe}</div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Khuyến nghị:</div>
                    <ul className="space-y-1">
                      {insight.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                      {insight.recommendations.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{insight.recommendations.length - 3} khuyến nghị khác...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                  Impact: {insight.impact === 'high' ? 'Cao' : insight.impact === 'medium' ? 'Trung bình' : 'Thấp'}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedInsight(insight)
                      setShowInsightModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {insight.status === 'new' && (
                    <>
                      <button 
                        onClick={() => handleInsightAction(insight.id, 'apply')}
                        className="px-3 py-1 bg-[#2dc56a] text-white text-sm rounded hover:bg-[#04d182]"
                      >
                        Áp dụng
                      </button>
                      <button 
                        onClick={() => handleInsightAction(insight.id, 'dismiss')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Bỏ qua
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Detail Modal */}
      {showInsightModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e6ebf1]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(selectedInsight.type)}`}>
                    {getTypeIcon(selectedInsight.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedInsight.title}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedInsight.priority)}`}>
                        Ưu tiên {selectedInsight.priority === 'high' ? 'Cao' : selectedInsight.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      <span className="text-sm text-gray-500">{selectedInsight.confidence}% độ tin cậy</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInsightModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả chi tiết</h3>
                  <p className="text-gray-600">{selectedInsight.description}</p>
                </div>

                {selectedInsight.metrics && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics & Dự báo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card p-4">
                        <div className="text-sm text-gray-600">Giá trị hiện tại</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(selectedInsight.metrics.currentValue)}
                        </div>
                      </div>
                      <div className="card p-4">
                        <div className="text-sm text-gray-600">Dự kiến</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedInsight.metrics.projectedValue)}
                        </div>
                      </div>
                      <div className="card p-4">
                        <div className="text-sm text-gray-600">ROI dự kiến</div>
                        <div className="text-2xl font-bold text-blue-600">
                          +{Math.round(((selectedInsight.metrics.projectedValue - selectedInsight.metrics.currentValue) / selectedInsight.metrics.currentValue) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Plan</h3>
                  <div className="space-y-3">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-[10px]">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{rec}</p>
                        </div>
                        <button className="text-sm text-primary-600 hover:text-primary-700">
                          Tạo task
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e6ebf1] bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Tạo lúc: {new Date(selectedInsight.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      handleInsightAction(selectedInsight.id, 'dismiss')
                      setShowInsightModal(false)
                    }}
                    className="px-4 py-2 border border-[#e6ebf1] rounded-[10px] hover:bg-gray-50"
                  >
                    Bỏ qua
                  </button>
                  <button className="px-4 py-2 bg-[#3e79f7] text-white rounded-[10px] hover:bg-[#699dff]">
                    Tạo campaign
                  </button>
                  <button 
                    onClick={() => {
                      handleInsightAction(selectedInsight.id, 'apply')
                      setShowInsightModal(false)
                    }}
                    className="px-4 py-2 bg-[#2dc56a] text-white rounded-[10px] hover:bg-[#04d182]"
                  >
                    Áp dụng ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
