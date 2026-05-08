'use client'

import { Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { StatusBadge, TableActionButton } from './shared'

export default function FacebookAccountsTab({ controller }: { controller: MktReportsController }) {
  const {
    accountSearch,
    setAccountSearch,
    accountStatusFilter,
    setAccountStatusFilter,
    accountSoftwareFilter,
    setAccountSoftwareFilter,
    globalEmployee,
    setGlobalEmployee,
    employees,
    filteredAccounts,
    accountStatusCounts,
    exportAccounts,
    getEmployeeName,
    openAccountDetail,
  } = controller

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a5b3]" />
            <Input
              value={accountSearch}
              onChange={event => setAccountSearch(event.target.value)}
              placeholder="Tìm UID hoặc tên tài khoản..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={accountStatusFilter} onValueChange={value => setAccountStatusFilter(value as typeof accountStatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="die">Die</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Select value={globalEmployee} onValueChange={setGlobalEmployee}>
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

          <Select value={accountSoftwareFilter} onValueChange={value => setAccountSoftwareFilter(value as typeof accountSoftwareFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả phần mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phần mềm</SelectItem>
              <SelectItem value="mkt-care">MKT-CARE</SelectItem>
              <SelectItem value="mkt-post">MKT-POST</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportAccounts}>
            <Download className="h-4 w-4" />
            Xuất
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="facebook" value="live" count={accountStatusCounts.live} />
        <StatusBadge kind="facebook" value="die" count={accountStatusCounts.die} />
        <StatusBadge kind="facebook" value="checkpoint" count={accountStatusCounts.checkpoint} />
        <StatusBadge kind="facebook" value="inactive" count={accountStatusCounts.inactive} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên tài khoản</TableHead>
            <TableHead>UID</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Phần mềm</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Hành động cuối</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccounts.map((account, index) => (
            <TableRow key={account.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium text-[#1a3353]">{account.name}</TableCell>
              <TableCell className="text-[#98a5b3]">{account.uid}</TableCell>
              <TableCell><StatusBadge kind="facebook" value={account.status} /></TableCell>
              <TableCell><StatusBadge kind="software" value={account.software} /></TableCell>
              <TableCell>{getEmployeeName(account.employeeId)}</TableCell>
              <TableCell>{account.lastAction}</TableCell>
              <TableCell className="text-[#98a5b3]">{account.lastActiveLabel}</TableCell>
              <TableCell>
                <TableActionButton onClick={() => openAccountDetail(account)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
