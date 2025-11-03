'use client'

import { useState } from 'react'
import { 
  Filter, X, Calendar, DollarSign, Activity, AlertTriangle, 
  TrendingUp, Clock, Mail, Phone, MessageCircle, Users
} from 'lucide-react'

interface FilterProps {
  onFilterChange: (filters: CustomerFilters) => void
  initialFilters?: CustomerFilters
}

export interface CustomerFilters {
  // Behavioral filters
  daysSinceLastInteraction?: { min?: number; max?: number }
  engagementScore?: { min?: number; max?: number }
  churnRisk?: { min?: number; max?: number }
  upsellScore?: { min?: number; max?: number }
  
  // Financial filters
  totalValue?: { min?: number; max?: number }
  avgOrderValue?: { min?: number; max?: number }
  dealCount?: { min?: number; max?: number }
  
  // Date filters
  joinDateRange?: { start?: string; end?: string }
  lastPurchaseRange?: { start?: string; end?: string }
  
  // Interaction type filters
  hasInteractionTypes?: string[]
  excludeInteractionTypes?: string[]
  
  // Special segments
  isVIP?: boolean
  isAtRisk?: boolean
  needsRemarketing?: boolean
  hasUpcomingEvents?: boolean
}

export default function CustomerFilters({ onFilterChange, initialFilters = {} }: FilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters)

  const updateFilter = (key: keyof CustomerFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && 
      (typeof value === 'object' ? Object.keys(value).length > 0 : true)
    ).length
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          <span>Bộ lọc nâng cao</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-4 h-4" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="card p-6 space-y-6">
          {/* Behavioral Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Hành vi khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày không tương tác
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    className="input-field"
                    value={filters.daysSinceLastInteraction?.min || ''}
                    onChange={(e) => updateFilter('daysSinceLastInteraction', {
                      ...filters.daysSinceLastInteraction,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    className="input-field"
                    value={filters.daysSinceLastInteraction?.max || ''}
                    onChange={(e) => updateFilter('daysSinceLastInteraction', {
                      ...filters.daysSinceLastInteraction,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm tương tác (0-100)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.engagementScore?.min || ''}
                    onChange={(e) => updateFilter('engagementScore', {
                      ...filters.engagementScore,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.engagementScore?.max || ''}
                    onChange={(e) => updateFilter('engagementScore', {
                      ...filters.engagementScore,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rủi ro rời bỏ (%)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.churnRisk?.min || ''}
                    onChange={(e) => updateFilter('churnRisk', {
                      ...filters.churnRisk,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.churnRisk?.max || ''}
                    onChange={(e) => updateFilter('churnRisk', {
                      ...filters.churnRisk,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm upsell (0-100)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.upsellScore?.min || ''}
                    onChange={(e) => updateFilter('upsellScore', {
                      ...filters.upsellScore,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    min="0"
                    max="100"
                    className="input-field"
                    value={filters.upsellScore?.max || ''}
                    onChange={(e) => updateFilter('upsellScore', {
                      ...filters.upsellScore,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Thông tin tài chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng giá trị (VNĐ)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    className="input-field"
                    value={filters.totalValue?.min || ''}
                    onChange={(e) => updateFilter('totalValue', {
                      ...filters.totalValue,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    className="input-field"
                    value={filters.totalValue?.max || ''}
                    onChange={(e) => updateFilter('totalValue', {
                      ...filters.totalValue,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị đơn hàng TB
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    className="input-field"
                    value={filters.avgOrderValue?.min || ''}
                    onChange={(e) => updateFilter('avgOrderValue', {
                      ...filters.avgOrderValue,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    className="input-field"
                    value={filters.avgOrderValue?.max || ''}
                    onChange={(e) => updateFilter('avgOrderValue', {
                      ...filters.avgOrderValue,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng deals
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    min="0"
                    className="input-field"
                    value={filters.dealCount?.min || ''}
                    onChange={(e) => updateFilter('dealCount', {
                      ...filters.dealCount,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    min="0"
                    className="input-field"
                    value={filters.dealCount?.max || ''}
                    onChange={(e) => updateFilter('dealCount', {
                      ...filters.dealCount,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Bộ lọc thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tham gia
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="input-field"
                    value={filters.joinDateRange?.start || ''}
                    onChange={(e) => updateFilter('joinDateRange', {
                      ...filters.joinDateRange,
                      start: e.target.value || undefined
                    })}
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={filters.joinDateRange?.end || ''}
                    onChange={(e) => updateFilter('joinDateRange', {
                      ...filters.joinDateRange,
                      end: e.target.value || undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày mua hàng cuối
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="input-field"
                    value={filters.lastPurchaseRange?.start || ''}
                    onChange={(e) => updateFilter('lastPurchaseRange', {
                      ...filters.lastPurchaseRange,
                      start: e.target.value || undefined
                    })}
                  />
                  <input
                    type="date"
                    className="input-field"
                    value={filters.lastPurchaseRange?.end || ''}
                    onChange={(e) => updateFilter('lastPurchaseRange', {
                      ...filters.lastPurchaseRange,
                      end: e.target.value || undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Special Segments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Phân khúc đặc biệt
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={filters.isAtRisk || false}
                  onChange={(e) => updateFilter('isAtRisk', e.target.checked ? true : undefined)}
                />
                <span className="text-sm text-gray-700">Có nguy cơ rời bỏ</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={filters.needsRemarketing || false}
                  onChange={(e) => updateFilter('needsRemarketing', e.target.checked ? true : undefined)}
                />
                <span className="text-sm text-gray-700">Cần remarketing</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={filters.hasUpcomingEvents || false}
                  onChange={(e) => updateFilter('hasUpcomingEvents', e.target.checked ? true : undefined)}
                />
                <span className="text-sm text-gray-700">Có sự kiện sắp tới</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
