'use client'

import { Monitor, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { PeriodSelect, StatusBadge } from './shared'

export default function MachinesTab({ controller }: { controller: MktReportsController }) {
  const {
    machineFilters,
    setMachineFilters,
    employees,
    filteredMachines,
    getEmployeeName,
    setShowAddMachineDialog,
    removeMachine,
  } = controller

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#e6ebf1] bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <PeriodSelect
            value={machineFilters.period}
            onChange={value => setMachineFilters(current => ({ ...current, period: value }))}
            className="w-[150px]"
          />

          <Select
            value={machineFilters.software}
            onValueChange={value => setMachineFilters(current => ({ ...current, software: value as typeof current.software }))}
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
            value={machineFilters.employeeId}
            onValueChange={value => setMachineFilters(current => ({ ...current, employeeId: value }))}
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

          <div className="ml-auto">
            <Button onClick={() => setShowAddMachineDialog(true)}>
              <Plus className="h-4 w-4" />
              Thêm máy
            </Button>
          </div>
        </div>
      </div>

      <div className="text-lg font-medium text-[#1a3353]">{filteredMachines.length} máy đã kết nối</div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên máy</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Phần mềm đang cài</TableHead>
            <TableHead>Lần sync cuối</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMachines.map((machine, index) => (
            <TableRow key={machine.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium text-[#1a3353]">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-[#98a5b3]" />
                  {machine.machineName}
                </div>
              </TableCell>
              <TableCell>{getEmployeeName(machine.employeeId)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {machine.installedSoftware.map(software => (
                    <StatusBadge key={software} kind="software" value={software} />
                  ))}
                </div>
              </TableCell>
              <TableCell>{machine.lastSync}</TableCell>
              <TableCell>
                <StatusBadge kind="machine" value={machine.status} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => removeMachine(machine.id)}>
                  <Trash2 className="h-4 w-4 text-[#ff6b72]" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
