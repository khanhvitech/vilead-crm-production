'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import type { MktReportsController } from './useMktReports'
import { FilterChip, MetricCard, PeriodSelect, StatusBadge } from './shared'

export default function CollectedUidsTab({ controller }: { controller: MktReportsController }) {
  const {
    uidFilters,
    setUidFilters,
    employees,
    totalScans,
    totalUidCount,
    uidSourceSummary,
    filteredUidCollections,
    exportUids,
    exportUidRecord,
    getEmployeeName,
    uidTableFooterSummary,
  } = controller

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1.15fr_1.2fr_1.7fr]">
        <MetricCard title="Tổng lượt quét hôm nay" value={totalScans} />
        <MetricCard title="Tổng UID thu được" value={totalUidCount.toLocaleString('vi-VN')} hint="+143 so hôm qua" tone="success" />
        <div className="grid gap-2 sm:grid-cols-2">
          {uidSourceSummary.map(item => (
            <Card key={item.label} className="border-[#eef2f6] shadow-none">
              <CardContent className="space-y-2 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#98a5b3]">{item.label}</div>
                <div className="text-3xl font-bold text-[#1a3353]">{item.value.toLocaleString('vi-VN')}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-[#eef2f6] shadow-none">
          <CardContent className="p-4">
            <div className="mb-4 text-sm font-semibold text-[#1a3353]">UID theo nguồn</div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uidSourceSummary} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 15 }}>
                  <CartesianGrid stroke="#eef2f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fill: '#72849a', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3e79f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelect
            value={uidFilters.period}
            onChange={value => setUidFilters(current => ({ ...current, period: value }))}
          />

          <Select
            value={uidFilters.employeeId}
            onValueChange={value => setUidFilters(current => ({ ...current, employeeId: value }))}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Tất cả NV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả NV</SelectItem>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={uidFilters.source}
            onValueChange={value => setUidFilters(current => ({ ...current, source: value as typeof current.source }))}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Tất cả nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="friends">Bạn bè</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-[#72849a]">
            {totalScans} lượt - {totalUidCount.toLocaleString('vi-VN')} UID
          </div>
          <Button variant="outline" onClick={exportUids}>
            <Download className="h-4 w-4" />
            Xuất tất cả
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {uidSourceSummary.map(item => (
          <FilterChip key={item.label} label={`${item.label}: ${item.value.toLocaleString('vi-VN')} UID`} />
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Loại quét</TableHead>
            <TableHead>Đối tượng quét</TableHead>
            <TableHead>Số UID</TableHead>
            <TableHead>Tài khoản quét</TableHead>
            <TableHead>UID tài khoản</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUidCollections.map((record, index) => (
            <TableRow key={record.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell><StatusBadge kind="uid-source" value={record.source} /></TableCell>
              <TableCell className="font-medium text-[#1a3353]">{record.targetName}</TableCell>
              <TableCell className="font-semibold text-[#3e79f7]">{record.uidCount}</TableCell>
              <TableCell>{record.scannerAccount}</TableCell>
              <TableCell className="text-[#98a5b3]">{record.scannerUid}</TableCell>
              <TableCell>{getEmployeeName(record.employeeId)}</TableCell>
              <TableCell>{record.time}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => exportUidRecord(record)}>
                  <Download className="h-4 w-4" />
                  Xuất ({record.uidCount})
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 rounded-[10px] border border-[#e6ebf1] bg-white px-4 py-3 text-sm text-[#72849a] sm:flex-row sm:items-center sm:justify-between">
        <div>
          {uidTableFooterSummary.totalScans} lượt quét · tổng {uidTableFooterSummary.totalUidCount.toLocaleString('vi-VN')} UID
        </div>
        <Button variant="outline" onClick={exportUids}>
          <Download className="h-4 w-4" />
          Xuất toàn bộ {uidTableFooterSummary.totalUidCount.toLocaleString('vi-VN')} UID
        </Button>
      </div>
    </div>
  )
}
