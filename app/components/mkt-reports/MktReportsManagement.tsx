'use client'

import {
  BarChart3,
  Database,
  Facebook,
  FileText,
  Flag,
  Monitor,
  TrendingUp,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import OverviewTab from './OverviewTab'
import FacebookAccountsTab from './FacebookAccountsTab'
import FanpagesTab from './FanpagesTab'
import CollectedUidsTab from './CollectedUidsTab'
import PostsCommentsTab from './PostsCommentsTab'
import DailyReportsTab from './DailyReportsTab'
import MachinesTab from './MachinesTab'
import AccountDetailDialog from './AccountDetailDialog'
import FanpageDetailDialog from './FanpageDetailDialog'
import AddMachineDialog from './AddMachineDialog'
import { MainTabButton, StatusBadge, SubTabButton } from './shared'
import { useMktReports } from './useMktReports'

const tabItems = [
  { id: 'overview', label: 'Tổng quan', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'accounts', label: 'Tài khoản FB', icon: <Facebook className="h-4 w-4" /> },
  { id: 'fanpages', label: 'Fanpage', icon: <Flag className="h-4 w-4" /> },
  { id: 'uids', label: 'UID Thu thập', icon: <Database className="h-4 w-4" /> },
  { id: 'posts-comments', label: 'Bài đăng & Bình luận', icon: <FileText className="h-4 w-4" /> },
  { id: 'daily', label: 'Báo cáo Theo Ngày', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'machines', label: 'Quản lý Máy', icon: <Monitor className="h-4 w-4" /> },
] as const

export default function MktReportsManagement() {
  const controller = useMktReports()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3353]">Báo cáo MKT</h1>
          <p className="mt-1 text-base text-[#72849a]">
            Tổng hợp hoạt động tài khoản Facebook từ MKT Care · Post · Page · UID
          </p>
        </div>

        <div className="self-start rounded-full border border-[#e6ebf1] bg-white px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-[#98a5b3]">
            <span className="h-2 w-2 rounded-full bg-[#2dc56a]" />
            Đồng bộ mỗi 15 phút
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-wrap gap-2">
          <SubTabButton active={controller.period === 'today'} label="Hôm nay" onClick={() => controller.setPeriod('today')} />
          <SubTabButton active={controller.period === 'this_week'} label="Tuần này" onClick={() => controller.setPeriod('this_week')} />
          <SubTabButton active={controller.period === 'this_month'} label="Tháng này" onClick={() => controller.setPeriod('this_month')} />
          <SubTabButton active={controller.period === 'last_month'} label="Tháng trước" onClick={() => controller.setPeriod('last_month')} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={controller.globalSoftware} onValueChange={value => controller.setGlobalSoftware(value as typeof controller.globalSoftware)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả phần mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phần mềm</SelectItem>
              <SelectItem value="mkt-care">MKT Care</SelectItem>
              <SelectItem value="mkt-post">MKT Post</SelectItem>
              <SelectItem value="mkt-page">MKT Page</SelectItem>
              <SelectItem value="mkt-uid">MKT UID</SelectItem>
            </SelectContent>
          </Select>

          <Select value={controller.globalEmployee} onValueChange={controller.setGlobalEmployee}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tất cả nhân viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhân viên</SelectItem>
              {controller.employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-b border-[#e6ebf1]">
        <nav className="flex flex-wrap gap-6">
          {tabItems.map(item => (
            <MainTabButton
              key={item.id}
              active={controller.activeTab === item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => controller.setActiveTab(item.id)}
            />
          ))}
        </nav>
      </div>

      <div>
        {controller.activeTab === 'overview' ? <OverviewTab controller={controller} /> : null}
        {controller.activeTab === 'accounts' ? <FacebookAccountsTab controller={controller} /> : null}
        {controller.activeTab === 'fanpages' ? <FanpagesTab controller={controller} /> : null}
        {controller.activeTab === 'uids' ? <CollectedUidsTab controller={controller} /> : null}
        {controller.activeTab === 'posts-comments' ? <PostsCommentsTab controller={controller} /> : null}
        {controller.activeTab === 'daily' ? <DailyReportsTab controller={controller} /> : null}
        {controller.activeTab === 'machines' ? <MachinesTab controller={controller} /> : null}
      </div>

      <AccountDetailDialog controller={controller} />
      <FanpageDetailDialog controller={controller} />
      <AddMachineDialog controller={controller} />
    </div>
  )
}
