'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MktReportsController } from './useMktReports'
import { MetricCard, PeriodSelect, overviewChartColors } from './shared'

export default function OverviewTab({ controller }: { controller: MktReportsController }) {
  const { overviewStats, overviewTrend, overviewFilters, setOverviewFilters, employees } = controller

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodSelect
          value={overviewFilters.period}
          onChange={value => setOverviewFilters(current => ({ ...current, period: value }))}
        />

        <Select
          value={overviewFilters.software}
          onValueChange={value => setOverviewFilters(current => ({ ...current, software: value as typeof current.software }))}
        >
          <SelectTrigger className="w-[170px]">
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

        <Select
          value={overviewFilters.employeeId}
          onValueChange={value => setOverviewFilters(current => ({ ...current, employeeId: value }))}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Tất cả nhân viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhân viên</SelectItem>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Tình trạng tài khoản profile</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Tổng UID" value={15} hint="+2 so hôm qua" />
          <MetricCard title="Live" value={overviewStats.liveCount} hint="+1 so hôm qua" tone="success" />
          <MetricCard title="Die" value={overviewStats.dieCount} hint="-1 so hôm qua" tone="danger" />
          <MetricCard title="Checkpoint" value={overviewStats.checkpointCount} hint="+0 so hôm qua" tone="warning" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Hoạt động profile</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Tin nhắn" value={overviewStats.messageCount} hint="-11 so hôm qua" />
          <MetricCard title="Bài đăng" value={overviewStats.postCount} hint="-4 so hôm qua" />
          <MetricCard title="Like" value={overviewStats.likeCount} hint="+30 so hôm qua" tone="success" />
          <MetricCard title="Bình luận" value={overviewStats.commentCount} hint="+17 so hôm qua" />
          <MetricCard title="UID lấy được" value={overviewStats.totalUidCount} hint="+42 so hôm qua" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#98a5b3]">Fanpage - hôm nay</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="Page hoạt động" value={overviewStats.activeFanpageCount} hint="+0 so hôm nay" tone="success" />
          <MetricCard title="Tổng follower" value={overviewStats.totalFollower.toLocaleString('vi-VN')} hint="+113 mới hôm nay" />
          <MetricCard title="Bài đăng Page" value={overviewStats.fanpagePostCount} hint="+2 so hôm qua" />
          <MetricCard title="Reaction nhận về" value={overviewStats.inboundReactionCount} />
          <MetricCard title="Bình luận nhận về" value={overviewStats.inboundCommentCount} />
        </div>
      </section>

      <Card className="border-[#eef2f6] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Xu hướng tài khoản & hoạt động</CardTitle>
          <span className="text-sm text-[#98a5b3]">Hôm nay</span>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overviewTrend}>
                <CartesianGrid stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="live" fill={overviewChartColors.live} radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="die" fill={overviewChartColors.die} radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="messages" stroke={overviewChartColors.messages} strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="posts" stroke={overviewChartColors.posts} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
