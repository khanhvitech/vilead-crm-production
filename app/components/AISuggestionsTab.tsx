'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bot, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

interface Lead {
  id: number
  name: string
  phone: string
  email: string
  source: string
  region: string
  product: string
  tags: string[]
  content: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost'
  stage: string
  notes: string
  assignedTo: string
  value: number
  lastContactedAt: string | null
  createdAt: string
  updatedAt: string
  type: 'lead'
  company?: string
}

interface Deal {
  id: number
  name: string
  customer: string
  contact: string
  value: string
  stage: 'discovery' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedClose: string
  createdAt: string
  lastActivity: string
  owner: string
  leadId?: number
  orderId?: number
}

interface AISuggestion {
  id: string
  type: 'lead' | 'deal' | 'general' | 'task' | 'follow-up'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  reason: string
  actionItems: string[]
  confidence: number
  relatedItemId?: number
  createdAt: string
  isRead: boolean
  category: 'optimization' | 'opportunity' | 'risk' | 'follow-up' | 'insight'
}

interface AISuggestionsTabProps {
  leads: Lead[]
  deals: Deal[]
  onSuggestionAction?: (suggestionId: string, action: string) => void
}

export default function AISuggestionsTab({ leads, deals, onSuggestionAction }: AISuggestionsTabProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [activeView, setActiveView] = useState<'suggestions' | 'chat'>('suggestions')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'optimization' | 'opportunity' | 'risk' | 'follow-up' | 'insight'>('all')
  const [chatMessages, setChatMessages] = useState<Array<{id: string, message: string, isUser: boolean, timestamp: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate AI suggestions based on leads and deals data
  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions: AISuggestion[] = []

      // Analyze leads for follow-up opportunities
      leads.forEach(lead => {
        const daysSinceLastContact = lead.lastContactedAt 
          ? Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))

        // High-value lead not contacted recently
        if (lead.value > 50000000 && daysSinceLastContact > 3 && lead.status !== 'converted') {
          newSuggestions.push({
            id: `lead-follow-${lead.id}`,
            type: 'follow-up',
            priority: 'high',
            title: `Follow-up khẩn: ${lead.name}`,
            description: `Lead có giá trị cao (${(lead.value / 1000000).toFixed(0)}M VND) chưa được liên hệ trong ${daysSinceLastContact} ngày`,
            reason: 'Lead có giá trị cao cần được ưu tiên follow-up để tránh mất cơ hội',
            actionItems: [
              'Gọi điện trực tiếp trong 24h',
              'Gửi email cá nhân hóa với proposal chi tiết',
              'Lên lịch demo sản phẩm',
              'Kết nối qua LinkedIn'
            ],
            confidence: 85,
            relatedItemId: lead.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'opportunity'
          })
        }

        // Lead stuck in qualification stage
        if (lead.status === 'qualified' && daysSinceLastContact > 7) {
          newSuggestions.push({
            id: `lead-stuck-${lead.id}`,
            type: 'lead',
            priority: 'medium',
            title: `Lead đang kẹt: ${lead.name}`,
            description: `Lead đã ở trạng thái qualified quá ${daysSinceLastContact} ngày mà không có tiến triển`,
            reason: 'Cần hành động để đẩy lead chuyển sang giai đoạn tiếp theo',
            actionItems: [
              'Tái đánh giá nhu cầu khách hàng',
              'Gửi thêm thông tin giá trị sản phẩm',
              'Đề xuất buổi tư vấn miễn phí',
              'Xem xét điều chỉnh chiến lược tiếp cận'
            ],
            confidence: 70,
            relatedItemId: lead.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'risk'
          })
        }

        // New lead needs immediate attention
        if (lead.status === 'new' && daysSinceLastContact < 1) {
          newSuggestions.push({
            id: `lead-new-${lead.id}`,
            type: 'task',
            priority: 'high',
            title: `Lead mới cần liên hệ: ${lead.name}`,
            description: `Lead mới từ ${lead.source} có tiềm năng ${lead.tags.includes('hot') ? 'cao' : 'trung bình'}`,
            reason: 'Lead mới cần được liên hệ trong 24h để tăng tỷ lệ chuyển đổi',
            actionItems: [
              'Gọi điện xác nhận thông tin trong 2h',
              'Gửi email chào mừng và giới thiệu công ty',
              'Đánh giá và phân loại lead',
              'Lên kế hoạch follow-up'
            ],
            confidence: 90,
            relatedItemId: lead.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'follow-up'
          })
        }
      })

      // Analyze deals for optimization opportunities
      deals.forEach(deal => {
        const daysUntilExpectedClose = Math.floor((new Date(deal.expectedClose).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        // Deal close to expected close date but still in negotiation
        if (deal.stage === 'negotiation' && daysUntilExpectedClose < 7 && daysUntilExpectedClose > 0) {
          newSuggestions.push({
            id: `deal-urgent-${deal.id}`,
            type: 'deal',
            priority: 'high',
            title: `Deal sắp đến hạn: ${deal.name}`,
            description: `Deal có giá trị ${deal.value} sẽ đến hạn trong ${daysUntilExpectedClose} ngày`,
            reason: 'Cần đẩy nhanh quá trình đàm phán để đạt target tháng',
            actionItems: [
              'Liên hệ trực tiếp decision maker',
              'Đưa ra ưu đãi có thời hạn',
              'Lên lịch cuộc họp đóng deal',
              'Chuẩn bị backup plan nếu không thành công'
            ],
            confidence: 88,
            relatedItemId: deal.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'opportunity'
          })
        }

        // Deal with high probability but stuck
        if (deal.probability > 70 && deal.stage === 'proposal') {
          newSuggestions.push({
            id: `deal-high-prob-${deal.id}`,
            type: 'deal',
            priority: 'medium',
            title: `Deal khả năng cao cần đẩy: ${deal.name}`,
            description: `Deal có xác suất ${deal.probability}% nhưng vẫn ở giai đoạn proposal`,
            reason: 'Deal có khả năng thành công cao cần được ưu tiên để đóng nhanh',
            actionItems: [
              'Schedule follow-up call với khách hàng',
              'Xem xét điều chỉnh proposal',
              'Đưa ra timeline rõ ràng',
              'Tạo urgency với limited-time offer'
            ],
            confidence: 75,
            relatedItemId: deal.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'optimization'
          })
        }
      })

      // General insights
      const hotLeads = leads.filter(lead => lead.tags.includes('hot'))
      
      if (hotLeads.length > 0) {
        newSuggestions.push({
          id: 'general-hot-leads',
          type: 'general',
          priority: 'medium',
          title: `Có ${hotLeads.length} hot leads cần ưu tiên`,
          description: `Bạn có ${hotLeads.length} leads được đánh dấu "hot" với tổng giá trị ${(hotLeads.reduce((sum, lead) => sum + lead.value, 0) / 1000000).toFixed(0)}M VND`,
          reason: 'Hot leads có tỷ lệ chuyển đổi cao hơn 3x so với leads thường',
          actionItems: [
            'Ưu tiên liên hệ các hot leads trước',
            'Phân bổ sales expert để handle',
            'Tạo campaign riêng cho hot leads',
            'Monitor progress hàng ngày'
          ],
          confidence: 95,
          createdAt: new Date().toISOString(),
          isRead: false,
          category: 'insight'
        })
      }

      setSuggestions(newSuggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }))
    }

    generateSuggestions()
  }, [leads, deals])

  const handleSuggestionAction = (suggestionId: string, action: string) => {
    // Mark suggestion as read
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, isRead: true } : s
    ))
    
    // Call parent callback if provided
    if (onSuggestionAction) {
      onSuggestionAction(suggestionId, action)
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || isProcessing) return

    const userMessage = {
      id: Date.now().toString(),
      message: chatInput,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsProcessing(true)

    // Simulate AI response (in real app, this would be an API call)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        message: generateAIResponse(chatInput),
        isUser: false,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsProcessing(false)
    }, 1500)
  }

  const generateAIResponse = (input: string): string => {
    const responses = [
      `Dựa trên dữ liệu hiện tại, tôi thấy bạn có ${leads.filter(l => l.status === 'new').length} leads mới cần được liên hệ trong 24h tới. Bạn có muốn tôi ưu tiên theo giá trị hay theo thời gian tạo?`,
      `Tôi phân tích thấy ${deals.filter(d => d.probability > 70).length} deals có khả năng đóng cao. Bạn nên tập trung vào deals nào trước?`,
      `Về ${input.toLowerCase()}, tôi khuyên bạn nên xem xét các yếu tố: timing, budget của khách hàng, và mức độ cấp thiết của nhu cầu. Bạn có muốn tôi phân tích chi tiết hơn không?`,
      `Từ pattern data, tôi thấy leads từ ${leads[0]?.source || 'website'} có tỷ lệ chuyển đổi cao nhất. Bạn có muốn tối ưu hóa chiến lược marketing cho kênh này?`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Handle refresh suggestions
  const handleRefreshSuggestions = async () => {
    setIsRefreshing(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Re-trigger the useEffect to generate new suggestions
      const generateSuggestions = () => {
        const newSuggestions: AISuggestion[] = []

        // Analyze leads for follow-up opportunities
        leads.forEach(lead => {
          const daysSinceLastContact = lead.lastContactedAt 
            ? Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))

          // High-value lead not contacted recently
          if (lead.value > 50000000 && daysSinceLastContact > 3 && lead.status !== 'converted') {
            newSuggestions.push({
              id: `lead-follow-${lead.id}-${Date.now()}`, // Add timestamp to make unique
              type: 'follow-up',
              priority: 'high',
              title: `Follow-up khẩn: ${lead.name}`,
              description: `Lead có giá trị cao (${(lead.value / 1000000).toFixed(0)}M VND) chưa được liên hệ trong ${daysSinceLastContact} ngày`,
              reason: 'Lead có giá trị cao cần được ưu tiên follow-up để tránh mất cơ hội',
              actionItems: [
                'Gọi điện trực tiếp trong 24h',
                'Gửi email cá nhân hóa với proposal chi tiết',
                'Lên lịch demo sản phẩm',
                'Kết nối qua LinkedIn'
              ],
              confidence: 85,
              relatedItemId: lead.id,
              createdAt: new Date().toISOString(),
              isRead: false,
              category: 'opportunity'
            })
          }

          // Lead stuck in qualification stage
          if (lead.status === 'qualified' && daysSinceLastContact > 7) {
            newSuggestions.push({
              id: `lead-stuck-${lead.id}-${Date.now()}`,
              type: 'lead',
              priority: 'medium',
              title: `Lead đang kẹt: ${lead.name}`,
              description: `Lead đã ở trạng thái qualified quá ${daysSinceLastContact} ngày mà không có tiến triển`,
              reason: 'Cần hành động để đẩy lead chuyển sang giai đoạn tiếp theo',
              actionItems: [
                'Tái đánh giá nhu cầu khách hàng',
                'Gửi thêm thông tin giá trị sản phẩm',
                'Đề xuất buổi tư vấn miễn phí',
                'Xem xét điều chỉnh chiến lược tiếp cận'
              ],
              confidence: 70,
              relatedItemId: lead.id,
              createdAt: new Date().toISOString(),
              isRead: false,
              category: 'risk'
            })
          }

          // New lead needs immediate attention
          if (lead.status === 'new' && daysSinceLastContact < 1) {
            newSuggestions.push({
              id: `lead-new-${lead.id}-${Date.now()}`,
              type: 'task',
              priority: 'high',
              title: `Lead mới cần liên hệ: ${lead.name}`,
              description: `Lead mới từ ${lead.source} có tiềm năng ${lead.tags.includes('hot') ? 'cao' : 'trung bình'}`,
              reason: 'Lead mới cần được liên hệ trong 24h để tăng tỷ lệ chuyển đổi',
              actionItems: [
                'Gọi điện xác nhận thông tin trong 2h',
                'Gửi email chào mừng và giới thiệu công ty',
                'Đánh giá và phân loại lead',
                'Lên kế hoạch follow-up'
              ],
              confidence: 90,
              relatedItemId: lead.id,
              createdAt: new Date().toISOString(),
              isRead: false,
              category: 'follow-up'
            })
          }
        })

        // Analyze deals for optimization opportunities
        deals.forEach(deal => {
          const daysUntilExpectedClose = Math.floor((new Date(deal.expectedClose).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          
          // Deal close to expected close date but still in negotiation
          if (deal.stage === 'negotiation' && daysUntilExpectedClose < 7 && daysUntilExpectedClose > 0) {
            newSuggestions.push({
              id: `deal-urgent-${deal.id}-${Date.now()}`,
              type: 'deal',
              priority: 'high',
              title: `Deal sắp đến hạn: ${deal.name}`,
              description: `Deal có giá trị ${deal.value} sẽ đến hạn trong ${daysUntilExpectedClose} ngày`,
              reason: 'Cần đẩy nhanh quá trình đàm phán để đạt target tháng',
              actionItems: [
                'Liên hệ trực tiếp decision maker',
                'Đưa ra ưu đãi có thời hạn',
                'Lên lịch cuộc họp đóng deal',
                'Chuẩn bị backup plan nếu không thành công'
              ],
              confidence: 88,
              relatedItemId: deal.id,
              createdAt: new Date().toISOString(),
              isRead: false,
              category: 'opportunity'
            })
          }

          // Deal with high probability but stuck
          if (deal.probability > 70 && deal.stage === 'proposal') {
            newSuggestions.push({
              id: `deal-high-prob-${deal.id}-${Date.now()}`,
              type: 'deal',
              priority: 'medium',
              title: `Deal khả năng cao cần đẩy: ${deal.name}`,
              description: `Deal có xác suất ${deal.probability}% nhưng vẫn ở giai đoạn proposal`,
              reason: 'Deal có khả năng thành công cao cần được ưu tiên để đóng nhanh',
              actionItems: [
                'Schedule follow-up call với khách hàng',
                'Xem xét điều chỉnh proposal',
                'Đưa ra timeline rõ ràng',
                'Tạo urgency với limited-time offer'
              ],
              confidence: 75,
              relatedItemId: deal.id,
              createdAt: new Date().toISOString(),
              isRead: false,
              category: 'optimization'
            })
          }
        })

        // General insights
        const hotLeads = leads.filter(lead => lead.tags.includes('hot'))
        
        if (hotLeads.length > 0) {
          newSuggestions.push({
            id: `general-hot-leads-${Date.now()}`,
            type: 'general',
            priority: 'medium',
            title: `Có ${hotLeads.length} hot leads cần ưu tiên`,
            description: `Bạn có ${hotLeads.length} leads được đánh dấu "hot" với tổng giá trị ${(hotLeads.reduce((sum, lead) => sum + lead.value, 0) / 1000000).toFixed(0)}M VND`,
            reason: 'Hot leads có tỷ lệ chuyển đổi cao hơn 3x so với leads thường',
            actionItems: [
              'Ưu tiên liên hệ các hot leads trước',
              'Phân bổ sales expert để handle',
              'Tạo campaign riêng cho hot leads',
              'Monitor progress hàng ngày'
            ],
            confidence: 95,
            createdAt: new Date().toISOString(),
            isRead: false,
            category: 'insight'
          })
        }

        setSuggestions(newSuggestions.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }))
      }

      generateSuggestions()
      setIsRefreshing(false)
    }, 2000) // 2 second delay to simulate API call
  }

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(suggestion => {
    const priorityMatch = priorityFilter === 'all' || suggestion.priority === priorityFilter
    const categoryMatch = categoryFilter === 'all' || suggestion.category === categoryFilter
    return priorityMatch && categoryMatch
  })

  const unreadCount = suggestions.filter(s => !s.isRead).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[10px] border border-[#e6ebf1] shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-[10px]">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng gợi ý</p>
              <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-[10px] border border-[#e6ebf1] shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-[10px]">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ưu tiên cao</p>
              <p className="text-2xl font-bold text-gray-900">{suggestions.filter(s => s.priority === 'high').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-[10px] border border-[#e6ebf1] shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-[10px]">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cơ hội</p>
              <p className="text-2xl font-bold text-gray-900">{suggestions.filter(s => s.category === 'opportunity').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-[10px] border border-[#e6ebf1] shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-[10px]">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chưa đọc</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[10px] shadow-sm border border-[#e6ebf1]">
        {/* Header with tabs */}
        <div className="border-b border-[#e6ebf1] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveView('suggestions')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'suggestions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Gợi ý AI ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'chat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat với AI
              </button>
            </div>
            
            {activeView === 'suggestions' && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefreshSuggestions}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-[10px] transition-colors ${
                    isRefreshing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#3e79f7] text-white hover:bg-[#699dff]'
                  }`}
                  title="Cập nhật gợi ý từ AI"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Đang cập nhật...' : 'Cập nhật gợi ý'}</span>
                </button>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 border border-[#e6ebf1] rounded-[10px] text-sm focus:ring-2 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
                >
                  <option value="all">Tất cả độ ưu tiên</option>
                  <option value="high">Cao</option>
                  <option value="medium">Vừa</option>
                  <option value="low">Thấp</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-3 py-2 border border-[#e6ebf1] rounded-[10px] text-sm focus:ring-2 focus:ring-[#3e79f7] focus:border-[#3e79f7]"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="opportunity">Cơ hội</option>
                  <option value="risk">Rủi ro</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="optimization">Tối ưu</option>
                  <option value="insight">Thông tin</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'suggestions' ? (
            <div className="space-y-4">
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có gợi ý nào</h3>
                  <p className="text-gray-500">AI đang phân tích dữ liệu để tạo gợi ý mới.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border rounded-[10px] p-4 transition-all duration-200 hover:shadow-md ${
                        suggestion.isRead ? 'bg-gray-50 border-[#e6ebf1]' : 'bg-white border-[#c7d9fd] shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-[10px] ${
                            suggestion.priority === 'high' ? 'bg-red-100' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {suggestion.category === 'opportunity' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                             suggestion.category === 'risk' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                             suggestion.category === 'follow-up' ? <Clock className="w-4 h-4 text-blue-600" /> :
                             suggestion.category === 'optimization' ? <Target className="w-4 h-4 text-purple-600" /> :
                             <Lightbulb className="w-4 h-4 text-yellow-600" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.priority === 'high' 
                                  ? 'bg-red-100 text-red-700' 
                                  : suggestion.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {suggestion.priority === 'high' ? 'Cao' : 
                                 suggestion.priority === 'medium' ? 'Vừa' : 'Thấp'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{suggestion.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{suggestion.confidence}%</span>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Lý do:</h4>
                        <p className="text-sm text-gray-700">{suggestion.reason}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Hành động gợi ý:</h4>
                        <ul className="space-y-1">
                          {suggestion.actionItems.map((item, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[#e6ebf1]">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                            className="bg-[#3e79f7] text-white px-4 py-2 rounded-[10px] hover:bg-[#699dff] transition-colors text-sm font-medium"
                          >
                            Thực hiện ngay
                          </button>
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'dismiss')}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-[10px] hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            Bỏ qua
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'like')}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Hữu ích"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSuggestionAction(suggestion.id, 'dislike')}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Không hữu ích"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat Tab */
            <div className="h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Hỏi AI về sales</h3>
                    <p className="text-gray-500">Ví dụ: &quot;Lead nào tôi nên ưu tiên?&quot;</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-[10px] ${
                          msg.isUser
                            ? 'bg-[#3e79f7] text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-[10px] rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Hỏi AI về sales..."
                  className="flex-1 px-4 py-3 border border-[#e6ebf1] rounded-[10px] focus:ring-2 focus:ring-[#3e79f7] focus:border-[#3e79f7] outline-none"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isProcessing}
                  className="bg-[#3e79f7] text-white px-6 py-3 rounded-[10px] hover:bg-[#699dff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
