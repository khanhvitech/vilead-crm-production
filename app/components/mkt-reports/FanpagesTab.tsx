'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { MetricCard, PeriodSelect, StatusBadge, TableActionButton } from './shared'

export default function FanpagesTab({ controller }: { controller: MktReportsController }) {
  const {
    filteredFanpages,
    fanpageFilters,
    setFanpageFilters,
    employees,
    exportFanpages,
    getEmployeeName,
    openFanpageDetail,
    fanpageFollowerNetChange,
  } = controller

  const totals = filteredFanpages.reduce(
    (acc, fanpage) => {
      acc.follower += fanpage.follower
      acc.newFollower += fanpage.newFollower
      acc.unfollow += fanpage.unfollow
      acc.reactions += fanpage.reactions
      return acc
    },
    { follower: 0, newFollower: 0, unfollow: 0, reactions: 0 }
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <PeriodSelect
            value={fanpageFilters.period}
            onChange={value => setFanpageFilters(current => ({ ...current, period: value }))}
          />

          <Select
            value={fanpageFilters.software}
            onValueChange={value => setFanpageFilters(current => ({ ...current, software: value as typeof current.software }))}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Tất cả phần mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phần mềm</SelectItem>
              <SelectItem value="mkt-page">MKT Page</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={fanpageFilters.employeeId}
            onValueChange={value => setFanpageFilters(current => ({ ...current, employeeId: value }))}
          >
            <SelectTrigger className="w-[180px]">
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

          <Select
            value={fanpageFilters.status}
            onValueChange={value => setFanpageFilters(current => ({ ...current, status: value as typeof current.status }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="restricted">Bị hạn chế</SelectItem>
              <SelectItem value="deleted">Xóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={exportFanpages}>
          <Download className="h-4 w-4" />
          Xuất
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Page hoạt động" value={filteredFanpages.filter(item => item.status === 'active').length} tone="success" />
        <MetricCard
          title="Tổng follower"
          value={totals.follower.toLocaleString('vi-VN')}
          hint={`${fanpageFollowerNetChange >= 0 ? '+' : ''}${fanpageFollowerNetChange} net hôm nay`}
          hintTone={fanpageFollowerNetChange >= 0 ? 'success' : 'danger'}
        />
        <MetricCard title="Follower mới" value={totals.newFollower} tone="success" />
        <MetricCard title="Unfollow" value={Math.abs(totals.unfollow)} tone="danger" />
        <MetricCard title="Reaction nhận về" value={totals.reactions} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên Page</TableHead>
            <TableHead>Page ID</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Follower</TableHead>
            <TableHead>Mới</TableHead>
            <TableHead>Unfollow</TableHead>
            <TableHead>Bài đăng</TableHead>
            <TableHead>Reaction</TableHead>
            <TableHead>Bình luận</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Hoạt động cuối</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFanpages.map((fanpage, index) => (
            <TableRow key={fanpage.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium text-[#1a3353]">{fanpage.name}</TableCell>
              <TableCell className="text-[#98a5b3]">{fanpage.pageId}</TableCell>
              <TableCell><StatusBadge kind="fanpage" value={fanpage.status} /></TableCell>
              <TableCell className="font-medium text-[#1a3353]">{fanpage.follower.toLocaleString('vi-VN')}</TableCell>
              <TableCell className="text-[#2dc56a]">+{fanpage.newFollower}</TableCell>
              <TableCell className="text-[#ff6b72]">{fanpage.unfollow}</TableCell>
              <TableCell>{fanpage.posts}</TableCell>
              <TableCell>{fanpage.reactions}</TableCell>
              <TableCell>{fanpage.comments}</TableCell>
              <TableCell>{getEmployeeName(fanpage.employeeId)}</TableCell>
              <TableCell className="text-[#98a5b3]">{fanpage.lastActivity}</TableCell>
              <TableCell>
                <TableActionButton onClick={() => openFanpageDetail(fanpage)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
