'use client'

import { Monitor, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { MktReportsController } from './useMktReports'
import { StatusBadge } from './shared'

export default function MachinesTab({ controller }: { controller: MktReportsController }) {
  const { filteredMachines, getEmployeeName, setShowAddMachineDialog, removeMachine } = controller

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium text-[#1a3353]">{filteredMachines.length} máy đã kết nối</div>
        <Button onClick={() => setShowAddMachineDialog(true)}>
          <Plus className="h-4 w-4" />
          Thêm máy
        </Button>
      </div>

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
              <TableCell><StatusBadge kind="machine" value={machine.status} /></TableCell>
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
