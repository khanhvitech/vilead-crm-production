'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  Target,
  UserCheck,
  Workflow,
  X,
  Megaphone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  isOpen?: boolean
  onClose?: () => void
  userRole?: string
  onRoleChange?: (role: string) => void
}

const getMenuItemsByRole = (userRole: string = 'sale') => {
  const allMenuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Tổng quan',
      tooltip: 'Tổng quan: Dashboard theo vai trò',
      roles: ['admin', 'ceo', 'leader', 'sale', 'accountant'],
      disabled: false,
    },
    {
      id: 'sales',
      icon: Target,
      label: 'Hoạt động bán hàng',
      tooltip: 'Hoạt động bán hàng: Quản lý tổng thể Lead và Deal',
      roles: ['admin', 'ceo', 'leader', 'sale'],
      disabled: false,
    },
    {
      id: 'customers',
      icon: UserCheck,
      label: 'Chăm sóc Khách hàng',
      tooltip: 'Chăm sóc Khách hàng: Thông tin và lịch sử khách hàng',
      roles: ['admin', 'ceo', 'leader', 'sale', 'accountant'],
      disabled: false,
    },
    {
      id: 'orders',
      icon: ShoppingCart,
      label: 'Quản lý Đơn hàng',
      tooltip: 'Quản lý Đơn hàng: Trạng thái và hóa đơn',
      roles: ['admin', 'ceo', 'leader', 'sale', 'accountant'],
      disabled: false,
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      label: 'Quản lý Công việc',
      tooltip: 'Quản lý Công việc: Task và tiến độ',
      roles: ['admin', 'ceo', 'leader', 'sale'],
      disabled: false,
    },
    {
      id: 'kpi',
      icon: BarChart3,
      label: 'Quản lý KPI',
      tooltip: 'Quản lý KPI: Thiết lập và theo dõi chỉ số hiệu suất',
      roles: ['admin', 'ceo', 'leader'],
      disabled: false,
    },
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat đa kênh',
      tooltip: 'Chat đa kênh: Tin nhắn và hội thoại với khách hàng',
      roles: ['admin', 'ceo', 'leader', 'sale'],
      disabled: false,
    },
    {
      id: 'email-marketing',
      icon: Megaphone,
      label: 'Chiến dịch Marketing',
      tooltip: 'Chiến dịch Marketing: Email và ZBS Marketing',
      roles: ['admin', 'leader', 'sale'],
      disabled: false,
    },
    {
      id: 'automation',
      icon: Workflow,
      label: 'Automation',
      tooltip: 'Automation: Luồng tin nhắn và kịch bản chăm sóc',
      roles: ['admin', 'leader', 'sale'],
      disabled: false,
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Báo cáo',
      tooltip: 'Báo cáo: Doanh số, hiệu suất và KPIs',
      roles: ['admin', 'ceo', 'leader', 'accountant'],
      disabled: false,
    },
    {
      id: 'mkt-reports',
      icon: BarChart3,
      label: 'Báo cáo MKT',
      tooltip: 'Báo cáo MKT: Tài khoản Facebook, Fanpage, UID và máy',
      roles: ['admin', 'ceo', 'leader'],
      disabled: false,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Cài đặt',
      tooltip: 'Cài đặt: Hệ thống, tích hợp và quản lý công ty',
      roles: ['admin'],
      disabled: false,
    },
  ]

  return allMenuItems.filter(item => item.roles.includes(userRole))
}

export default function VileadSidebar({
  currentView,
  setCurrentView,
  isOpen = true,
  onClose,
  userRole: propUserRole,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState(propUserRole || 'admin')

  const menuItems = getMenuItemsByRole(userRole)

  useEffect(() => {
    if (propUserRole && propUserRole !== userRole) {
      setUserRole(propUserRole)
    }
  }, [propUserRole, userRole])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          {!isCollapsed && (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-sm font-bold text-white">V</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ViLead CRM</h1>
                  <p className="text-xs text-gray-500">
                    {userRole === 'admin'
                      ? 'Admin Dashboard'
                      : userRole === 'ceo'
                        ? 'CEO Dashboard'
                        : userRole === 'leader'
                          ? 'Leader Sale Dashboard'
                          : userRole === 'accountant'
                            ? 'Kế toán Dashboard'
                            : 'Sale Dashboard'}
                  </p>
                </div>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn('hidden lg:flex', isCollapsed && 'mx-auto')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const isDisabled = item.disabled

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isDisabled) {
                    setCurrentView(item.id)
                  }
                }}
                disabled={isDisabled}
                className={cn(
                  'group flex w-full items-center space-x-3 rounded-lg p-3 transition-all duration-200',
                  isDisabled ? 'cursor-not-allowed opacity-50 text-gray-400' : 'cursor-pointer',
                  !isDisabled && isActive
                    ? 'border border-blue-100 bg-blue-50 text-blue-600 shadow-sm'
                    : !isDisabled
                      ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-gray-400'
                )}
                title={isCollapsed ? item.tooltip : undefined}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center',
                    isDisabled
                      ? 'text-gray-400'
                      : isActive
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {!isCollapsed && (
                  <span
                    className={cn(
                      'flex-1 truncate text-left text-sm font-medium',
                      isDisabled && 'text-gray-400'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
