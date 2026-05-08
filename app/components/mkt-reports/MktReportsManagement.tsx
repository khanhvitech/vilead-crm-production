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
import { MainTabButton } from './shared'
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
